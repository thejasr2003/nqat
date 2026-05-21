import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { numericQuestionSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = numericQuestionSchema.parse(body);

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

    const question = await prisma.numericQuestion.create({
      data: {
        testId: test.id,
        questionText: validatedData.questionText.trim(),
        correctAnswer: validatedData.correctAnswer,
        marks: validatedData.marks,
      },
    });

    return NextResponse.json({
      questionId: question.id,
      message: "Numeric question created successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create numeric question" },
      { status: 400 }
    );
  }
}
