import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const submissions = await prisma.submission.findMany({
      where: {
        longAnswers: {
          some: {},
        },
      },
      include: {
        candidate: {
          select: {
            name: true,
            email: true,
          },
        },
        test: {
          select: {
            title: true,
            questions: {
              select: { id: true },
            },
            numericQuestions: {
              select: { marks: true },
            },
            wordBlankQuestions: {
              select: { marks: true },
            },
          },
        },
        longAnswers: {
          select: {
            id: true,
            isCorrect: true,
          },
        },
      },
      orderBy: {
        submittedAt: "desc",
      },
    });

    const response = submissions.map((submission) => ({
      id: submission.id,
      candidateName: submission.candidate.name,
      email: submission.candidate.email,
      testTitle: submission.test.title,
      submittedAt: submission.submittedAt,
      objectiveScore: submission.objectiveScore,
      objectiveTotal: submission.test.questions.length * 2 +
        submission.test.numericQuestions.reduce((sum, q) => sum + q.marks, 0) +
        submission.test.wordBlankQuestions.reduce((sum, q) => sum + q.marks, 0),
      manualStatus: submission.longAnswers.every((answer) => answer.isCorrect !== null)
        ? "Completed"
        : "Pending",
    }));

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching long answer submissions:", error);
    return NextResponse.json({ error: "Failed to fetch submissions" }, { status: 500 });
  }
}
