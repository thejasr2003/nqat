import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { longAnswerQuestionSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = longAnswerQuestionSchema.parse(body);

    let test = await prisma.test.findUnique({
      where: { id: "main-test" },
    });

    if (!test) {
      test = await prisma.test.create({
        data: {
          id: "main-test",
          title: "Main Assessment Test",
        },
      });
    }

    const question = await prisma.longAnswerQuestion.create({
      data: {
        testId: test.id,
        questionText: validatedData.questionText.trim(),
        marks: validatedData.marks,
      },
    });

    return NextResponse.json({
      questionId: question.id,
      message: "Long answer question created successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create long answer question" },
      { status: 400 }
    );
  }
}
