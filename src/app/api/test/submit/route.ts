import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { testSubmitSchema } from "@/lib/validations";
import { evaluateAnswer, fetchTestQuestions } from "@/lib/questionHelpers";

function getRawQuestionId(prefixedId: string) {
  return prefixedId.replace(/^(mcq_|num_|wb_|la_)/, "");
}

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

    let objectiveScore = 0;
    for (const question of questions) {
      if (question.type === "LONG_ANSWER") continue;
      const userAnswer = validatedData.answers[question.id];
      objectiveScore += evaluateAnswer(question, userAnswer);
    }

    const objectiveTotal = questions
      .filter((question) => question.type !== "LONG_ANSWER")
      .reduce((sum, question) => sum + question.marks, 0);

    const submission = await prisma.submission.create({
      data: {
        testId: validatedData.testId,
        candidateId: validatedData.candidateId,
        answers: validatedData.answers,
        score: objectiveScore,
        objectiveScore,
      },
    });

    const longAnswers = validatedData.longAnswers ?? {};
    const longAnswerRecords = Object.entries(longAnswers)
      .filter(([, answerText]) => answerText && answerText.trim().length > 0)
      .map(([questionId, answerText]) => ({
        submissionId: submission.id,
        questionId: getRawQuestionId(questionId),
        candidateId: validatedData.candidateId,
        answerText: answerText.trim(),
      }));

    if (longAnswerRecords.length > 0) {
      await prisma.longAnswerAnswer.createMany({
        data: longAnswerRecords,
      });
    }

    return NextResponse.json({
      score: objectiveScore,
      total: objectiveTotal,
      percentage: objectiveTotal > 0 ? Math.round((objectiveScore / objectiveTotal) * 100) : 0,
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
