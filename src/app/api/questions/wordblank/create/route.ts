import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { wordBlankQuestionSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = wordBlankQuestionSchema.parse(body);

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

    const question = await prisma.wordBlankQuestion.create({
      data: {
        testId: test.id,
        paragraph: validatedData.paragraph.trim(),
        correctAnswers: validatedData.correctAnswers.map((answer) => answer.trim()),
        marks: validatedData.marks,
      },
    });

    return NextResponse.json({
      questionId: question.id,
      message: "Word blank question created successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create word blank question" },
      { status: 400 }
    );
  }
}
