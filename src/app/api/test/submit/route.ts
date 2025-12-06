import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { testSubmitSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const validatedData = testSubmitSchema.parse(body);

    // Check if candidate already submitted
    const existingSubmission = await prisma.submission.findUnique({
      where: {
        testId_candidateId: {
          testId: validatedData.testId,
          candidateId: validatedData.candidateId,
        },
      },
    });

    if (existingSubmission) {
      return NextResponse.json(
        { error: "You have already submitted this test" },
        { status: 400 }
      );
    }

    // Fetch all questions for the test
    const questions = await prisma.question.findMany({
      where: { testId: validatedData.testId },
    });

    // Calculate score
    let score = 0;
    for (const question of questions) {
      const userAnswer = validatedData.answers[question.id];
      if (userAnswer === question.answer) {
        score++;
      }
    }

    // Create submission
    const submission = await prisma.submission.create({
      data: {
        testId: validatedData.testId,
        candidateId: validatedData.candidateId,
        answers: validatedData.answers,
        score: score,
      },
    });

    return NextResponse.json({
      score: score,
      total: questions.length,
      percentage: Math.round((score / questions.length) * 100),
      message: "Test submitted successfully",
    });
  } catch (error: any) {
    console.error("Submission error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to submit test" },
      { status: 400 }
    );
  }
}
