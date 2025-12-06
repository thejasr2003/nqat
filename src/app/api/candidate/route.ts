import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { candidateSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const validatedData = candidateSchema.parse(body);

    const candidate = await prisma.candidate.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        altPhone: validatedData.altPhone || null,
        usn: validatedData.usn,
        collegeName: validatedData.collegeName,
        passoutBatch: validatedData.passoutBatch,
        branch: validatedData.branch,
        sem: validatedData.sem,
        cgpa: validatedData.cgpa,
      },
    });

    return NextResponse.json({
      candidateId: candidate.id,
      message: "Candidate created successfully",
    });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to create candidate" },
      { status: 400 }
    );
  }
}
