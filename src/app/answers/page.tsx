"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface SubmissionRow {
  id: string;
  candidateName: string;
  email: string;
  testTitle: string;
  submittedAt: string;
  objectiveScore: number;
  objectiveTotal: number;
  manualStatus: "Pending" | "Completed";
}

export default function AnswersPage() {
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const response = await fetch("/api/answers/list");
        if (!response.ok) throw new Error("Failed to fetch submissions");
        const data = await response.json();
        setSubmissions(data);
      } catch (err: any) {
        setError(err.message || "Failed to load answers");
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-900">
        <p className="text-base font-semibold">Loading submissions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-red-700">
        <p className="text-base font-semibold">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Long Answer Review</h1>
            <p className="text-sm text-slate-600">
              Submitted attempts containing at least one long answer question.
            </p>
          </div>
        </div>

        {submissions.length === 0 ? (
          <div className="rounded-lg bg-white p-8 shadow-sm">
            <p className="text-base text-slate-700">No submissions found for review.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-3">Candidate</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Test</th>
                  <th className="px-6 py-3">Submitted</th>
                  <th className="px-6 py-3">Objective Score</th>
                  <th className="px-6 py-3">Manual Status</th>
                  <th className="px-6 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {submissions.map((submission) => (
                  <tr key={submission.id}>
                    <td className="px-6 py-4 text-slate-900">{submission.candidateName}</td>
                    <td className="px-6 py-4 text-slate-500">{submission.email}</td>
                    <td className="px-6 py-4 text-slate-500">{submission.testTitle}</td>
                    <td className="px-6 py-4 text-slate-500">{new Date(submission.submittedAt).toLocaleString()}</td>
                    <td className="px-6 py-4 text-slate-900">
                      {submission.objectiveScore}/{submission.objectiveTotal}
                    </td>
                    <td className="px-6 py-4 text-slate-900">{submission.manualStatus}</td>
                    <td className="px-6 py-4">
                      <Link href={`/answers/${submission.id}`}>
                        <Button className="h-10 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white shadow-sm hover:bg-slate-700">
                          Review
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
