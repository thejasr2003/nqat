import { NextResponse } from "next/server";
import { fetchTestQuestions } from "@/lib/questionHelpers";

export async function GET() {
  try {
    const questions = await fetchTestQuestions("main-test");
    return NextResponse.json(questions);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch questions" },
      { status: 500 }
    );
  }
}
