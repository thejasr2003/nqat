import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ReviewLongAnswersForm from "./ReviewLongAnswersForm";

interface AnswerPageProps {
  params: Promise<{
    submissionId: string;
  }>;
}

export default async function AnswerSubmissionPage({ params }: AnswerPageProps) {
  const { submissionId } = await params;

  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: {
      candidate: {
        select: {
          name: true,
          email: true,
        },
      },
      test: {
        select: {
          title: true,
        },
      },
      longAnswers: {
        include: {
          question: {
            select: {
              questionText: true,
              marks: true,
            },
          },
        },
      },
    },
  });

  if (!submission) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Long Answer Review</h1>
            <p className="text-sm text-slate-600">
              Review long answers for submission {submission.id}.
            </p>
          </div>
          <Link href="/answers" className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">
            Back to list
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500">Candidate</p>
            <h2 className="mt-2 text-lg font-semibold text-slate-900">{submission.candidate.name}</h2>
            <p className="mt-1 text-sm text-slate-600">{submission.candidate.email}</p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500">Test</p>
            <h2 className="mt-2 text-lg font-semibold text-slate-900">{submission.test.title}</h2>
            <p className="mt-1 text-sm text-slate-600">Submitted: {submission.submittedAt.toISOString()}</p>
            <p className="mt-3 text-sm text-slate-700">Objective score: {submission.objectiveScore}</p>
          </div>
        </div>

        <ReviewLongAnswersForm
          submissionId={submission.id}
          objectiveScore={submission.objectiveScore}
          longAnswers={submission.longAnswers}
        />
      </div>
    </div>
  );
}
