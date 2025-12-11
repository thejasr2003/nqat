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

    // Handle unique constraint violations (Prisma)
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

    // Validation errors from Zod
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    const msg = String(error?.message || "Unknown error");

    // Detect Prisma / DB connectivity errors reported by Turbopack/runtime
    const isDbDown = /cannot fetch data from service|fetch failed|ECONNREFUSED|Turbopack|prisma/i.test(msg);

    // User-friendly messages
    if (isDbDown) {
      const userMessage = "Check Your Network. Please try again .";
      const payload: any = { error: userMessage };

      // Include internal error only in non-production for diagnostics
      if (process.env.NODE_ENV !== "production") payload.internal = msg;

      return NextResponse.json(payload, { status: 502 });
    }

    // Fallback: unknown error
    const userMessage = "Failed to create candidate. Please try again.";
    const payload: any = { error: userMessage };
    if (process.env.NODE_ENV !== "production") payload.internal = msg;

    return NextResponse.json(payload, { status: 500 });
  }
}
