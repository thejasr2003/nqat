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
    console.error("Candidate creation error:", error);
    
    if (error.code === "P2002") {
      const field = error.meta?.target?.[0];
      
      if (field === "email") {
        return NextResponse.json(
          { error: "This email is already registered. Please use a different email." },
          { status: 400 }
        );
      } else if (field === "usn") {
        return NextResponse.json(
          { error: "This USN is already registered. Please check your USN." },
          { status: 400 }
        );
      } else {
        return NextResponse.json(
          { error: `This ${field} is already registered.` },
          { status: 400 }
        );
      }
    }

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to create candidate" },
      { status: 400 }
    );
  }
}
