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
      },
      orderBy: {
        submittedAt: "desc",
      },
    });

    const results = submissions.map((submission) => ({
      id: submission.id,
      candidateId: submission.candidateId,
      candidateName: submission.candidate.name,
      email: submission.candidate.email,
      phone: submission.candidate.phone,
      usn: submission.candidate.usn,
      collegeName: submission.candidate.collegeName,
      branch: submission.candidate.branch,
      score: submission.score,
      total: submission.testId === "main-test" ? 25 : 25, // Default to 25 questions
      percentage: submission.testId === "main-test" ? Math.round((submission.score / 25) * 100) : 0,
      submittedAt: submission.submittedAt,
      status: submission.score >= 30 ? "selected" : "rejected",
    }));

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error fetching results:", error);
    return NextResponse.json(
      { error: "Failed to fetch results" },
      { status: 500 }
    );
  }
}
