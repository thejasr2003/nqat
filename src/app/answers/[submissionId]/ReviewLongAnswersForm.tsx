"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface LongAnswerQuestionData {
  id: string;
  answerText: string;
  isCorrect: boolean | null;
  awardedMarks: number;
  question: {
    questionText: string;
    marks: number;
  };
}

interface ReviewLongAnswersFormProps {
  submissionId: string;
  objectiveScore: number;
  longAnswers: LongAnswerQuestionData[];
}

interface ReviewState {
  answerId: string;
  isCorrect: boolean;
  awardedMarks: number;
  maxMarks: number;
}

export default function ReviewLongAnswersForm({
  submissionId,
  objectiveScore,
  longAnswers,
}: ReviewLongAnswersFormProps) {
  const router = useRouter();
  const [reviews, setReviews] = useState<ReviewState[]>(
    longAnswers.map((answer) => ({
      answerId: answer.id,
      isCorrect: answer.isCorrect === true,
      awardedMarks: answer.isCorrect === true ? answer.awardedMarks : 0,
      maxMarks: answer.question.marks,
    }))
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const longAnswerScore = useMemo(
    () => reviews.reduce((sum, review) => sum + review.awardedMarks, 0),
    [reviews]
  );

  const totalScore = objectiveScore + longAnswerScore;

  const updateReview = (answerId: string, isCorrect: boolean, maxMarks: number) => {
    setReviews((current) =>
      current.map((review) =>
        review.answerId === answerId
          ? {
              ...review,
              isCorrect,
              awardedMarks: isCorrect ? maxMarks : 0,
            }
          : review
      )
    );
  };

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/api/answers/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          submissionId,
          reviews: reviews.map(({ answerId, isCorrect, awardedMarks }) => ({
            answerId,
            isCorrect,
            awardedMarks,
          })),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to submit review");
      }

      setMessage("Review submitted successfully.");
      setTimeout(() => {
        router.push("/answers");
      }, 800);
    } catch (err: any) {
      setError(err.message || "Failed to submit review");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-8 rounded-lg bg-white p-6 shadow-sm">
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-slate-800">
          <p className="text-xs uppercase tracking-wide text-slate-500">Objective score</p>
          <p className="mt-2 text-2xl font-semibold">{objectiveScore}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-slate-800">
          <p className="text-xs uppercase tracking-wide text-slate-500">Long answer score</p>
          <p className="mt-2 text-2xl font-semibold">{longAnswerScore}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-slate-800">
          <p className="text-xs uppercase tracking-wide text-slate-500">Final total</p>
          <p className="mt-2 text-2xl font-semibold">{totalScore}</p>
        </div>
      </div>

      {message && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">
          {message}
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {longAnswers.map((answer) => {
          const review = reviews.find((item) => item.answerId === answer.id);
          const selectedIsCorrect = review?.isCorrect ?? false;
          const awardedMarks = review?.awardedMarks ?? 0;

          return (
            <div key={answer.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="max-w-3xl">
                  <p className="text-sm text-slate-500">Question</p>
                  <p className="mt-1 text-base font-medium text-slate-900">{answer.question.questionText}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500">Max marks</p>
                  <p className="mt-1 font-semibold text-slate-900">{answer.question.marks}</p>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-sm text-slate-500">Submitted answer</p>
                <div className="mt-2 max-h-96 overflow-auto whitespace-pre-wrap break-words rounded-xl bg-white p-4 text-sm text-slate-900 shadow-sm">
                  {answer.answerText}
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Mark as</p>
                  <div className="mt-3 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => updateReview(answer.id, true, answer.question.marks)}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                        selectedIsCorrect
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      Correct
                    </button>
                    <button
                      type="button"
                      onClick={() => updateReview(answer.id, false, answer.question.marks)}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                        !selectedIsCorrect
                          ? "bg-red-600 text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      Wrong
                    </button>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Awarded marks</p>
                  <p className="mt-2 text-xl font-semibold text-slate-900">{awardedMarks}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-600">
          Click submit when review is complete for all long answer questions.
        </p>
        <Button
          onClick={handleSubmit}
          disabled={saving}
          className="h-11 rounded-xl bg-slate-900 px-6 text-sm font-semibold text-white shadow-sm hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {saving ? "Submitting review..." : "Submit Review"}
        </Button>
      </div>
    </div>
  );
}
