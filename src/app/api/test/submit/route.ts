import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { testSubmitSchema } from "@/lib/validations";
import { evaluateAnswer, fetchTestQuestions } from "@/lib/questionHelpers";

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

    const questions = await fetchTestQuestions(validatedData.testId);

    let score = 0;
    for (const question of questions) {
      const userAnswer = validatedData.answers[question.id];
      score += evaluateAnswer(question, userAnswer);
    }

    const totalMarks = questions.reduce((sum, question) => sum + question.marks, 0);

    await prisma.submission.create({
      data: {
        testId: validatedData.testId,
        candidateId: validatedData.candidateId,
        answers: validatedData.answers,
        score,
      },
    });

    return NextResponse.json({
      score,
      total: totalMarks,
      percentage: totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0,
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
