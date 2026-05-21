import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * DELETE /api/candidate/delete?id={candidateId|usn}
 * Deletes a candidate and all their submissions
 * Can search by candidateId or USN
 * Questions are NOT deleted
 */
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const identifier = searchParams.get("id");

    if (!identifier) {
      return NextResponse.json(
        { error: "Candidate ID or USN is required" },
        { status: 400 }
      );
    }

    // Try to find candidate by ID first, then by USN
    let candidate = await prisma.candidate.findUnique({
      where: { id: identifier },
    });

    if (!candidate) {
      // Try finding by USN
      candidate = await prisma.candidate.findUnique({
        where: { usn: identifier },
      });
    }

    if (!candidate) {
      return NextResponse.json(
        { error: "Candidate not found with provided ID or USN" },
        { status: 404 }
      );
    }

    // Delete all submissions for this candidate
    const deletedSubmissions = await prisma.submission.deleteMany({
      where: {
        candidateId: candidate.id,
      },
    });

    // Delete the candidate
    const deletedCandidate = await prisma.candidate.delete({
      where: {
        id: candidate.id,
      },
    });

    return NextResponse.json({
      message: "Candidate deleted successfully",
      candidate: {
        id: deletedCandidate.id,
        name: deletedCandidate.name,
        email: deletedCandidate.email,
        usn: deletedCandidate.usn,
      },
      submissionsDeleted: deletedSubmissions.count,
    });
  } catch (error: any) {
    console.error("Error deleting candidate:", error);

    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Candidate not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to delete candidate" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/candidate?action=deleteAll
 * Deletes ALL candidates and their submissions
 * Questions are NOT deleted
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get("action");

  if (action === "deleteAll") {
    try {
      // Delete all submissions first
      const deletedSubmissions = await prisma.submission.deleteMany({});

      // Delete all candidates
      const deletedCandidates = await prisma.candidate.deleteMany({});

      return NextResponse.json({
        message: "All candidates and submissions deleted successfully",
        candidatesDeleted: deletedCandidates.count,
        submissionsDeleted: deletedSubmissions.count,
      });
    } catch (error: any) {
      console.error("Error deleting all candidates:", error);
      return NextResponse.json(
        { error: error.message || "Failed to delete candidates" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json(
    { error: "Invalid action. Use ?action=deleteAll" },
    { status: 400 }
  );
}
