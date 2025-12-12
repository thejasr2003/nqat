"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { TabSwitchWarning } from "@/components/TabSwitchWarning";
import { useTest } from "@/hooks/useTest";

interface Question {
  id: string;
  question: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
}

function TestContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const candidateId = searchParams.get("candidateId");

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>("");
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showWarning, setShowWarning] = useState(false);

  // Fetch questions once on mount
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch("/api/questions");
        if (!response.ok) throw new Error("Failed to fetch questions");
        const data = await response.json();
        setQuestions(data);
        setLoading(false);
      } catch (err) {
        setError("Failed to load questions");
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  // Define handleSubmit first so it's available for other hooks
  const handleSubmit = async () => {
    if (submitting || hasSubmitted) return;

    setSubmitting(true);
    try {
      const response = await fetch("/api/test/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateId,
          testId: "main-test",
          answers,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || "Submission failed");
        setSubmitting(false);
        return;
      }

      const result = await response.json();
      localStorage.removeItem("testEndTime");
      router.push(`/result`);
    } catch (err: any) {
      setError(err.message || "Submission failed");
      setSubmitting(false);
    }
  };

  // Use dynamic timer (1 minute per question)
  const { timeRemaining, isExpired, formattedTime, totalTime } = useTest({
    totalQuestions: questions.length > 0 ? questions.length : undefined,
  });

  // Auto-submit ONLY when timer expires (with guard to prevent multiple submissions)
  useEffect(() => {
    if (isExpired && questions.length > 0 && !submitting && !hasSubmitted) {
      setHasSubmitted(true);
      handleSubmit();
    }
  }, [isExpired, submitting, hasSubmitted]);

  // Tab Switch Detection - Auto-submit on 3rd violation
  useEffect(() => {
    let warningTimeout: NodeJS.Timeout;

    const detectTabSwitch = () => {
      setTabSwitchCount((prev) => {
        const newCount = prev + 1;

        // Show warning for violations 1 and 2
        if (newCount < 3) {
          setShowWarning(true);
          // Auto-close warning after 5 seconds
          warningTimeout = setTimeout(() => {
            setShowWarning(false);
          }, 5000);
        } 
        // Auto-submit on 3rd violation
        else if (newCount >= 3) {
          setShowWarning(true);
          // Submit after brief delay
          warningTimeout = setTimeout(() => {
            setHasSubmitted(true);
            handleSubmit();
          }, 1500);
        }

        return newCount;
      });
    };

    // Detect when tab becomes hidden
    const handleVisibilityChange = () => {
      if (document.hidden) {
        detectTabSwitch();
      }
    };

    // Detect when window loses focus
    const handleWindowBlur = () => {
      detectTabSwitch();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      clearTimeout(warningTimeout);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, [submitting, hasSubmitted, handleSubmit]);

  if (!candidateId) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mb-2 text-4xl">⚠️</div>
          <p className="text-sm font-medium text-red-600">Invalid test access</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mb-3 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600 mx-auto"></div>
          <p className="text-sm text-slate-600">Loading questions...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  const handleAnswerSelect = (option: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: option,
    }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      {/* Compact Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-sm w-full">
        <div className="mx-auto w-full max-w-5xl px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left: Title & Progress */}
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-sm font-semibold text-slate-900">
                  Online Assessment
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Question {currentIndex + 1} of {questions.length}
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-xs text-slate-600">
                <span className="font-medium">{answeredCount}</span>
                <span className="text-slate-400">/</span>
                <span className="text-slate-400">{questions.length} answered</span>
              </div>
            </div>

            {/* Right: Timer */}
            <div className="text-right">
              <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                Time Left
              </p>
              <div
                className={`mt-0.5 text-xl font-mono font-bold tabular-nums ${
                  timeRemaining < 300 ? "text-red-600" : "text-blue-600"
                }`}
              >
                {formattedTime}
              </div>
            </div>
          </div>
        </div>

        {/* Slim Progress Bar */}
        <div className="h-0.5 w-full bg-slate-100">
          <div
            className={`h-0.5 transition-all duration-300 ${
              timeRemaining < 300 ? "bg-red-500" : "bg-blue-500"
            }`}
            style={{
              width: `${
                totalTime > 0 ? ((timeRemaining / totalTime) * 100).toFixed(1) : 0
              }%`,
            }}
          />
        </div>

        {/* Question Navigator Pills - Scrollable */}
        <div className="border-t border-slate-100 bg-slate-50/50 w-full">
          <div className="mx-auto w-full max-w-5xl px-4 py-2 overflow-x-auto scrollbar-hide">
            <div className="flex gap-1.5 min-w-max">
              {questions.map((q, idx) => {
                const isActive = idx === currentIndex;
                const isAnswered = !!answers[q.id];

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-blue-600 text-white shadow-sm ring-2 ring-blue-600 ring-offset-1"
                        : isAnswered
                        ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                        : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                    }`}
                    title={`Question ${idx + 1}${isAnswered ? " (Answered)" : ""}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto w-full max-w-3xl px-4 py-5">
        {error && (
          <div className="mb-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm">
            <span className="text-lg">⚠️</span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-red-900">Error</p>
              <p className="mt-0.5 text-red-700 break-words">{error}</p>
            </div>
          </div>
        )}

        {/* Question Card */}
        {currentQuestion && (
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm w-full">
            {/* Question Header */}
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="inline-flex items-center rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                Q{currentIndex + 1}
              </span>
              <span className="text-xs text-slate-400">
                {answers[currentQuestion.id] ? "✓ Answered" : "Not answered"}
              </span>
            </div>

            {/* Question Text */}
            <h2 className="mb-5 text-base font-semibold leading-relaxed text-slate-900 sm:text-lg break-words whitespace-pre-wrap">
              {currentQuestion.question}
            </h2>

            {/* Options */}
            <div className="space-y-2">
              {["option1", "option2", "option3", "option4"].map((optionKey, idx) => {
                const option = optionKey as keyof Question;
                const selected = answers[currentQuestion.id] === optionKey;

                return (
                  <label
                    key={optionKey}
                    className={`group flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-all w-full ${
                      selected
                        ? "border-blue-500 bg-blue-50 shadow-sm"
                        : "border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name={currentQuestion.id}
                      value={optionKey}
                      checked={selected}
                      onChange={() => handleAnswerSelect(optionKey)}
                      className="mt-0.5 h-4 w-4 flex-shrink-0 cursor-pointer accent-blue-600"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span
                          className={`text-xs font-semibold flex-shrink-0 ${
                            selected ? "text-blue-700" : "text-slate-500"
                          }`}
                        >
                          {String.fromCharCode(65 + idx)}.
                        </span>
                        <span
                          className={`text-sm leading-relaxed break-words ${
                            selected ? "text-slate-900 font-medium" : "text-slate-700"
                          }`}
                        >
                          {currentQuestion[option]}
                        </span>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-4 flex gap-2 w-full">
          <Button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            variant="outline"
            className="flex-1 h-10 text-sm font-medium disabled:opacity-50"
          >
            ← Previous
          </Button>

          {currentIndex === questions.length - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 h-10 bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit Test"}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              className="flex-1 h-10 bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Next →
            </Button>
          )}
        </div>

        {/* Footer Hint */}
        <p className="mt-4 text-center text-xs text-slate-400">
          Review all questions before final submission
        </p>

        {/* Tab Switch Violation Counter */}
        {tabSwitchCount > 0 && (
          <div className={`mt-4 p-3 rounded-lg border-l-4 font-semibold text-sm ${
            tabSwitchCount === 1 ? "bg-yellow-50 border-l-yellow-500 text-yellow-800" :
            tabSwitchCount === 2 ? "bg-orange-50 border-l-orange-500 text-orange-800" :
            "bg-red-50 border-l-red-600 text-red-800"
          }`}>
            Tab Switch Violations: {tabSwitchCount} / 3
          </div>
        )}
      </main>

      {/* Tab Switch Warning Modal */}
      <TabSwitchWarning
        isVisible={showWarning}
        violationCount={tabSwitchCount}
        onClose={() => setShowWarning(false)}
      />
    </div>
  );
}

export default function TestPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-slate-50">
          <div className="text-center">
            <div className="mb-3 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600 mx-auto"></div>
            <p className="text-sm text-slate-600">Loading test...</p>
          </div>
        </div>
      }
    >
      <TestContent />
    </Suspense>
  );
}
