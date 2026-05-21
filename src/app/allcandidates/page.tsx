"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface Candidate {
  id: string;
  usn: string;
  name: string;
  email: string;
  phone: string;
  collegeName: string;
  branch: string;
  createdAt: string;
}

interface Submission {
  candidateId: string;
  score: number;
  total: number;
  percentage: number;
  submittedAt: string;
}

interface CandidateWithResults extends Candidate {
  submission?: Submission;
}

export default function AllCandidatesPage() {
  const [candidatesWithResults, setCandidatesWithResults] = useState<CandidateWithResults[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all candidates
        const candidatesRes = await fetch("/api/candidate");
        if (!candidatesRes.ok) throw new Error("Failed to fetch candidates");
        const candidates: Candidate[] = await candidatesRes.json();

        // Fetch all submissions/results
        const submissionsRes = await fetch("/api/results/all");
        if (!submissionsRes.ok) throw new Error("Failed to fetch results");
        const submissions: Submission[] = await submissionsRes.json();

        // Combine candidates with their submission data
        const combined = candidates.map((candidate) => ({
          ...candidate,
          submission: submissions.find((sub) => sub.candidateId === candidate.id),
        }));

        setCandidatesWithResults(combined);
        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-lg font-semibold text-slate-900">Loading candidates...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center text-red-600">
          <p className="text-lg font-semibold">Error: {error}</p>
        </div>
      </div>
    );
  }

  const handleExportCSV = () => {
    const headers = [
      "USN",
      "Candidate Name",
      "Email",
      "Phone",
      "College Name",
      "Branch",
      "Score",
      "Total",
      "Percentage",
      "Status",
      "Submitted Date",
      "Registration Date",
    ];

    const csvContent = [
      headers.join(","),
      ...candidatesWithResults.map((candidate) =>
        [
          `"${candidate.usn}"`,
          `"${candidate.name}"`,
          `"${candidate.email}"`,
          `"${candidate.phone}"`,
          `"${candidate.collegeName}"`,
          `"${candidate.branch}"`,
          candidate.submission?.score ?? "Not Attempted",
          candidate.submission?.total ?? "-",
          candidate.submission?.percentage ?? "-",
          candidate.submission?.percentage && candidate.submission.percentage >= 40 ? "PASS" : candidate.submission ? "FAIL" : "Not Attempted",
          candidate.submission ? new Date(candidate.submission.submittedAt).toLocaleString() : "-",
          new Date(candidate.createdAt).toLocaleString(),
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    const fileName = `candidates-results-${new Date().toISOString().split("T")[0]}.csv`;
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">All Candidates & Results</h1>
              <p className="mt-2 text-sm text-slate-600">
                Total Candidates: <span className="font-semibold">{candidatesWithResults.length}</span>
              </p>
            </div>
            {candidatesWithResults.length > 0 && (
              <Button
                onClick={handleExportCSV}
                className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Export to CSV
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {candidatesWithResults.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
            <p className="text-lg text-slate-600">No candidates registered yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                    USN
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                    Candidate Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                    College
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                    Branch
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                    Percentage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                    Submitted Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {candidatesWithResults.map((candidate) => (
                  <tr key={candidate.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                      {candidate.usn}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">{candidate.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{candidate.email}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{candidate.phone}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {candidate.collegeName}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">{candidate.branch}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                      {candidate.submission ? (
                        <span className="text-blue-600">
                          {candidate.submission.score}/{candidate.submission.total}
                        </span>
                      ) : (
                        <span className="text-gray-500">Not Attempted</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                      {candidate.submission ? (
                        <span>{candidate.submission.percentage}%</span>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold">
                      {candidate.submission ? (
                        candidate.submission.percentage >= 40 ? (
                          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                            PASS
                          </span>
                        ) : (
                          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                            FAIL
                          </span>
                        )
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {candidate.submission ? (
                        new Date(candidate.submission.submittedAt).toLocaleString()
                      ) : (
                        <span className="text-gray-500">Not Submitted</span>
                      )}
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
