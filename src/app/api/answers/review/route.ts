import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const reviewSchema = z.object({
  submissionId: z.string().min(1),
  reviews: z.array(
    z.object({
      answerId: z.string().min(1),
      isCorrect: z.boolean(),
      awardedMarks: z.number().int().min(0),
    })
  ),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = reviewSchema.parse(body);

    const submission = await prisma.submission.findUnique({
      where: { id: validated.submissionId },
      include: {
        longAnswers: {
          include: {
            question: {
              select: {
                marks: true,
              },
            },
          },
        },
      },
    });

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    const answerMap = new Map(
      submission.longAnswers.map((answer) => [answer.id, answer.question.marks])
    );

    const invalidReview = validated.reviews.find((review) => !answerMap.has(review.answerId));
    if (invalidReview) {
      return NextResponse.json(
        { error: "One or more review answers do not belong to the submission" },
        { status: 400 }
      );
    }

    const invalidMarks = validated.reviews.find((review) => {
      const maxMarks = answerMap.get(review.answerId) ?? 0;
      return review.awardedMarks > maxMarks;
    });

    if (invalidMarks) {
      return NextResponse.json(
        { error: "Awarded marks cannot exceed the question maximum" },
        { status: 400 }
      );
    }

    const updatedLongAnswers = await prisma.$transaction(
      validated.reviews.map((review) =>
        prisma.longAnswerAnswer.update({
          where: { id: review.answerId },
          data: {
            isCorrect: review.isCorrect,
            awardedMarks: review.isCorrect ? review.awardedMarks : 0,
            reviewedAt: new Date(),
          },
        })
      )
    );

    const longAnswerScore = updatedLongAnswers.reduce(
      (sum, answer) => sum + answer.awardedMarks,
      0
    );

    await prisma.submission.update({
      where: { id: validated.submissionId },
      data: {
        score: submission.objectiveScore + longAnswerScore,
      },
    });

    return NextResponse.json({
      submissionId: validated.submissionId,
      longAnswerScore,
      totalScore: submission.objectiveScore + longAnswerScore,
      message: "Long answers reviewed successfully",
    });
  } catch (error: any) {
    console.error("Review submission error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to review submission" },
      { status: 400 }
    );
  }
}
