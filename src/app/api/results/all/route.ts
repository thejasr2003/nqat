import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const submissions = await prisma.submission.findMany({
      include: {
        candidate: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            usn: true,
            collegeName: true,
            branch: true,
          },
        },
        test: {
          select: {
            id: true,
            questions: {
              select: {
                id: true,
              },
            },
            numericQuestions: {
              select: {
                id: true,
                marks: true,
              },
            },
            wordBlankQuestions: {
              select: {
                id: true,
                marks: true,
              },
            },
          },
        },
      },
      orderBy: {
        submittedAt: "desc",
      },
    });

    const results = submissions.map((submission) => {
      const totalMarks = submission.test.questions.length * 2 +
        submission.test.numericQuestions.reduce((sum, question) => sum + question.marks, 0) +
        submission.test.wordBlankQuestions.reduce((sum, question) => sum + question.marks, 0);

      return {
        id: submission.id,
        candidateId: submission.candidateId,
        candidateName: submission.candidate.name,
        email: submission.candidate.email,
        phone: submission.candidate.phone,
        usn: submission.candidate.usn,
        collegeName: submission.candidate.collegeName,
        branch: submission.candidate.branch,
        score: submission.score,
        total: totalMarks,
        percentage: totalMarks > 0 ? Math.round((submission.score / totalMarks) * 100) : 0,
        submittedAt: submission.submittedAt,
        status: submission.score >= 30 ? "selected" : "rejected",
      };
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error fetching results:", error);
    return NextResponse.json(
      { error: "Failed to fetch results" },
      { status: 500 }
    );
  }
}
