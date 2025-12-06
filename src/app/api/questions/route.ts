import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const questions = await prisma.question.findMany({
      where: {
        testId: "main-test",
      },
      select: {
        id: true,
        question: true,
        option1: true,
        option2: true,
        option3: true,
        option4: true,
      },
    });

    return NextResponse.json(questions);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch questions" },
      { status: 500 }
    );
  }
}
