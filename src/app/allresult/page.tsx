"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface CandidateResult {
  id: string;
  candidateId: string;
  candidateName: string;
  email: string;
  phone: string;
  usn: string;
  collegeName: string;
  branch: string;
  score: number;
  total: number;
  percentage: number;
  submittedAt: string;
  status: "selected" | "rejected";
}

export default function AllResultsPage() {
  const [results, setResults] = useState<CandidateResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<"all" | "selected" | "rejected">("all");

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await fetch("/api/results/all");
        if (!response.ok) throw new Error("Failed to fetch results");
        const data = await response.json();
        // Update status based on score >= 40
        const updatedResults = data.map((result: CandidateResult) => ({
          ...result,
          status: result.score >= 40 ? "selected" : "rejected",
        }));
        setResults(updatedResults);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load results");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  const filteredResults = results.filter((result) => {
    if (filterStatus === "all") return true;
    return result.status === filterStatus;
  });

  const selectedCount = results.filter((r) => r.status === "selected").length;
  const rejectedCount = results.filter((r) => r.status === "rejected").length;

  const exportToExcel = () => {
    // Get the data to export based on current filter
    const dataToExport = filterStatus === "all" 
      ? results 
      : filterStatus === "selected"
      ? results.filter((r) => r.status === "selected")
      : results.filter((r) => r.status === "rejected");

    // Create CSV content
    const headers = [
      "Candidate Name",
      "USN",
      "Email",
      "Phone",
      "College",
      "Branch",
      "Score",
      "Total",
      "Percentage",
      "Status",
      "Submitted Date",
    ];

    const csvContent = [
      headers.join(","),
      ...dataToExport.map((result) =>
        [
          `"${result.candidateName}"`,
          `"${result.usn}"`,
          `"${result.email}"`,
          `"${result.phone}"`,
          `"${result.collegeName}"`,
          `"${result.branch}"`,
          result.score,
          result.total,
          result.percentage,
          result.status.toUpperCase(),
          new Date(result.submittedAt).toLocaleString(),
        ].join(",")
      ),
    ].join("\n");

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    const fileName = `assessment-results-${filterStatus}-${new Date().toISOString().split("T")[0]}.csv`;
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.style.visibility = "hidden";
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mb-3 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600 mx-auto"></div>
          <p className="text-sm text-slate-600">Loading results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white shadow-sm sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-900">Assessment Results</h1>
            <Link href="/">
              <Button variant="outline">Back to Home</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8">
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Stats Section */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-600 mb-2">Total Candidates</p>
            <p className="text-3xl font-bold text-slate-900">{results.length}</p>
          </div>
          <div className="rounded-lg border border-green-200 bg-green-50 p-6 shadow-sm">
            <p className="text-sm text-green-600 font-semibold mb-2">✓ Selected (≥50)</p>
            <p className="text-3xl font-bold text-green-700">{selectedCount}</p>
          </div>
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 shadow-sm">
            <p className="text-sm text-red-600 font-semibold mb-2">✗ Rejected (score below 50)</p>
            <p className="text-3xl font-bold text-red-700">{rejectedCount}</p>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterStatus === "all"
                ? "bg-slate-900 text-white"
                : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            All ({results.length})
          </button>
          <button
            onClick={() => setFilterStatus("selected")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterStatus === "selected"
                ? "bg-green-600 text-white"
                : "bg-white border border-green-200 text-green-700 hover:bg-green-50"
            }`}
          >
            Selected ({selectedCount})
          </button>
          <button
            onClick={() => setFilterStatus("rejected")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterStatus === "rejected"
                ? "bg-red-600 text-white"
                : "bg-white border border-red-200 text-red-700 hover:bg-red-50"
            }`}
          >
            Rejected ({rejectedCount})
          </button>
        </div>

        {/* Export Section */}
        <div className="mb-6 p-4 rounded-lg bg-blue-50 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-1">Export Candidates</h3>
              <p className="text-sm text-blue-700">
                {filterStatus === "all" 
                  ? `${results.length} total candidate(s)` 
                  : `${filteredResults.length} ${filterStatus} candidate(s)`} ready to export
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  const dataToExport = filteredResults.length > 0 ? filteredResults : results;
                  const headers = [
                    "Candidate Name",
                    "USN",
                    "Email",
                    "Phone",
                    "College",
                    "Branch",
                    "Score",
                    "Total",
                    "Percentage",
                    "Status",
                    "Submitted Date",
                  ];

                  const csvContent = [
                    headers.join(","),
                    ...dataToExport.map((result) =>
                      [
                        `"${result.candidateName}"`,
                        `"${result.usn}"`,
                        `"${result.email}"`,
                        `"${result.phone}"`,
                        `"${result.collegeName}"`,
                        `"${result.branch}"`,
                        result.score,
                        result.total,
                        result.percentage,
                        result.status.toUpperCase(),
                        new Date(result.submittedAt).toLocaleString(),
                      ].join(",")
                    ),
                  ].join("\n");

                  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
                  const link = document.createElement("a");
                  const url = URL.createObjectURL(blob);
                  const fileName = `candidates-${filterStatus}-${new Date().toISOString().split("T")[0]}.csv`;
                  link.setAttribute("href", url);
                  link.setAttribute("download", fileName);
                  link.style.visibility = "hidden";
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 16v-4m0 0V8m0 4h4m-4 0H8m4-8a8 8 0 100 16 8 8 0 000-16z" />
                </svg>
                Export Filtered
              </button>
              <button
                onClick={() => {
                  const dataToExport = results;
                  const headers = [
                    "Candidate Name",
                    "USN",
                    "Email",
                    "Phone",
                    "College",
                    "Branch",
                    "Score",
                    "Total",
                    "Percentage",
                    "Status",
                    "Submitted Date",
                  ];

                  const csvContent = [
                    headers.join(","),
                    ...dataToExport.map((result) =>
                      [
                        `"${result.candidateName}"`,
                        `"${result.usn}"`,
                        `"${result.email}"`,
                        `"${result.phone}"`,
                        `"${result.collegeName}"`,
                        `"${result.branch}"`,
                        result.score,
                        result.total,
                        result.percentage,
                        result.status.toUpperCase(),
                        new Date(result.submittedAt).toLocaleString(),
                      ].join(",")
                    ),
                  ].join("\n");

                  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
                  const link = document.createElement("a");
                  const url = URL.createObjectURL(blob);
                  const fileName = `all-candidates-${new Date().toISOString().split("T")[0]}.csv`;
                  link.setAttribute("href", url);
                  link.setAttribute("download", fileName);
                  link.style.visibility = "hidden";
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="px-6 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export All
              </button>
            </div>
          </div>
        </div>

        {/* Results Table */}
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
          {filteredResults.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <p className="text-lg">No results found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold text-slate-900">Candidate</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-900">USN</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-900">Email</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-900">College</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-900">Branch</th>
                    <th className="px-6 py-3 text-center font-semibold text-slate-900">Score</th>
                    <th className="px-6 py-3 text-center font-semibold text-slate-900">Percentage</th>
                    <th className="px-6 py-3 text-center font-semibold text-slate-900">Status</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-900">Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResults.map((result) => (
                    <tr key={result.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">{result.candidateName}</td>
                      <td className="px-6 py-4 text-slate-600 text-sm font-mono">{result.usn}</td>
                      <td className="px-6 py-4 text-slate-600 text-xs">{result.email}</td>
                      <td className="px-6 py-4 text-slate-600 text-sm">{result.collegeName}</td>
                      <td className="px-6 py-4 text-slate-600 text-sm">{result.branch}</td>
                      <td className="px-6 py-4 text-center font-semibold text-slate-900">
                        {result.score}/{result.total}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`font-semibold ${
                          result.percentage >= 80 ? "text-green-600" :
                          result.percentage >= 60 ? "text-blue-600" :
                          "text-orange-600"
                        }`}>
                          {result.percentage}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                          result.status === "selected"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}>
                          {result.status === "selected" ? (
                            <>✓ Selected</>
                          ) : (
                            <>✗ Rejected</>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {new Date(result.submittedAt).toLocaleDateString()} {new Date(result.submittedAt).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Export Info */}
        <div className="mt-8 p-4 rounded-lg bg-blue-50 border border-blue-200">
          <p className="text-sm text-blue-700">
            <strong>Note:</strong> Candidates with a score of 40 or above are marked as "Selected". 
            Candidates below 40 are marked as "Rejected".
          </p>
        </div>
      </div>
    </div>
  );
}
