import { NextRequest, NextResponse } from "next/server";
import { fetchTestQuestions, getPublicQuestions, shuffleArray } from "@/lib/questionHelpers";

export async function GET(req: NextRequest) {
  try {
    const questions = await fetchTestQuestions("main-test");
    const publicQuestions = getPublicQuestions(questions);
    const shuffledQuestions = shuffleArray(publicQuestions);
    return NextResponse.json(shuffledQuestions);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch questions" },
      { status: 500 }
    );
  }
}
