import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { questionSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const validatedData = questionSchema.parse(body);

    // Ensure the test exists, or create it
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

    const question = await prisma.question.create({
      data: {
        testId: "main-test",
        question: validatedData.question,
        option1: validatedData.option1,
        option2: validatedData.option2,
        option3: validatedData.option3,
        option4: validatedData.option4,
        answer: validatedData.answer,
      },
    });

    return NextResponse.json({
      questionId: question.id,
      message: "Question created successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create question" },
      { status: 400 }
    );
  }
}
