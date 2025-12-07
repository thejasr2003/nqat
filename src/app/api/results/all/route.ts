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
          },
        },
      },
      orderBy: {
        submittedAt: "desc",
      },
    });

    const results = submissions.map((submission) => {
      // Calculate total marks based on actual number of questions
      // Each question = 2 marks
      const questionCount = submission.test.questions.length;
      const totalMarks = questionCount * 2;
      
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
        percentage: Math.round((submission.score / totalMarks) * 100),
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
