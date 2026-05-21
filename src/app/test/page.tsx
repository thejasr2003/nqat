"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { TabSwitchWarning } from "@/components/TabSwitchWarning";
import { SubmitConfirmation } from "@/components/SubmitConfirmation";
import { useTest } from "@/hooks/useTest";

type QuestionType = "MCQ" | "NUMERIC" | "WORD_BLANK";

interface BaseQuestion {
  id: string;
  type: QuestionType;
  question: string;
  marks: number;
}

interface MCQQuestion extends BaseQuestion {
  type: "MCQ";
  options: {
    option1: string;
    option2: string;
    option3: string;
    option4: string;
  };
}

interface NumericQuestion extends BaseQuestion {
  type: "NUMERIC";
}

interface WordBlankQuestion extends BaseQuestion {
  type: "WORD_BLANK";
}

type Question = MCQQuestion | NumericQuestion | WordBlankQuestion;
type AnswerRecord = Record<string, string | string[]>;

function TestContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const candidateId = searchParams.get("candidateId");

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerRecord>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>("");
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [showSubmitConfirmation, setShowSubmitConfirmation] = useState(false);

  const getBlankCount = (text: string) => (text.match(/_{2,}/g) || []).length;

  const isBlankComplete = (value: unknown, blankCount: number) => {
    return (
      Array.isArray(value) &&
      value.length === blankCount &&
      value.every((item) => item?.toString().trim().length > 0)
    );
  };

  const isQuestionAnswered = (question: Question) => {
    const answer = answers[question.id];
    if (question.type === "WORD_BLANK") {
      const blankCount = getBlankCount(question.question);
      return isBlankComplete(answer, blankCount);
    }
    return typeof answer === "string" && answer.trim().length > 0;
  };

  const validateBeforeSubmit = () => {
    for (const question of questions) {
      if (question.type !== "WORD_BLANK") continue;
      const answer = answers[question.id];
      const blankCount = getBlankCount(question.question);
      if (Array.isArray(answer) && !isBlankComplete(answer, blankCount)) {
        setError("Please fill every blank before submitting this question.");
        return false;
      }
    }
    return true;
  };

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
    if (!validateBeforeSubmit()) return;

    if (!candidateId) {
      setError("Candidate ID is required to submit the test.");
      return;
    }

    setSubmitting(true);
    setError("");
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

      localStorage.removeItem("testEndTime");
      router.replace(`/result`);
    } catch (err: any) {
      setError(err.message || "Submission failed");
      setSubmitting(false);
    }
  };

  // Handle submit button click - show confirmation
  const handleSubmitClick = () => {
    setShowSubmitConfirmation(true);
  };

  // Handle confirmation - proceed with submission
  const handleConfirmSubmit = () => {
    setShowSubmitConfirmation(false);
    setHasSubmitted(true);
    handleSubmit();
  };

  // Handle cancel - close confirmation
  const handleCancelSubmit = () => {
    setShowSubmitConfirmation(false);
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

  const answeredCount = questions.filter(isQuestionAnswered).length;

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white w-full">
        <div className="mx-auto w-full max-w-4xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-slate-900">
                Assessment
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Question {currentIndex + 1} of {questions.length} • {answeredCount} answered
              </p>
            </div>

            <div className="text-right">
              <p className="text-xs text-slate-500 mb-1">Time Remaining</p>
              <div
                className={`text-2xl font-semibold font-mono ${
                  timeRemaining < 300 ? "text-red-600" : "text-slate-900"
                }`}
              >
                {formattedTime}
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1 w-full bg-slate-200">
          <div
            className={`h-1 transition-all duration-300 ${
              timeRemaining < 300 ? "bg-red-500" : "bg-slate-400"
            }`}
            style={{
              width: `${
                totalTime > 0 ? ((timeRemaining / totalTime) * 100).toFixed(1) : 0
              }%`,
            }}
          />
        </div>

        {/* Question Navigator */}
        <div className="bg-slate-50 border-t border-slate-200 w-full">
          <div className="mx-auto w-full max-w-4xl px-6 py-3 overflow-x-auto">
            <div className="flex gap-2 min-w-max">
              {questions.map((q, idx) => {
                const isActive = idx === currentIndex;
                const isAnswered = isQuestionAnswered(q);

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`flex h-8 w-8 items-center justify-center text-xs font-medium transition-all rounded border ${
                      isActive
                        ? "bg-slate-900 text-white border-slate-900"
                        : isAnswered
                        ? "bg-slate-100 text-slate-900 border-slate-200"
                        : "bg-white text-slate-600 border-slate-300 hover:border-slate-400"
                    }`}
                    title={`Question ${idx + 1}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto w-full max-w-4xl px-6 py-8">
        {error && (
          <div className="mb-6 p-4 rounded border border-red-300 bg-red-50 text-red-800 text-sm">
            {error}
          </div>
        )}

        {/* Question Container */}
        {currentQuestion && (
          <div className="mb-8">
            {/* Question Number and Status */}
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Question {currentIndex + 1}
              </span>
              <span className="text-xs text-slate-400">
                {isQuestionAnswered(currentQuestion) ? "Answered" : "Not answered"}
              </span>
            </div>

            {/* Question Text - Only show for non-word-blank questions */}
            {currentQuestion.type !== "WORD_BLANK" && (
              <h2 className="mb-6 text-xl font-semibold text-slate-900 leading-relaxed break-words whitespace-pre-wrap">
                {currentQuestion.question}
              </h2>
            )}

            {/* Answer Section */}
            <div className="space-y-4">
              {/* MCQ */}
              {currentQuestion.type === "MCQ" && (
                <div className="space-y-3">
                  {Object.entries(currentQuestion.options).map(([key, text], idx) => {
                    const selected = answers[currentQuestion.id] === key;
                    return (
                      <label
                        key={key}
                        className={`flex items-start gap-4 p-4 border rounded cursor-pointer transition-all ${
                          selected
                            ? "border-slate-400 bg-slate-50"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name={currentQuestion.id}
                          value={key}
                          checked={selected}
                          onChange={() =>
                            setAnswers((prev) => ({
                              ...prev,
                              [currentQuestion.id]: key,
                            }))
                          }
                          className="mt-0.5 h-5 w-5 cursor-pointer accent-slate-900"
                        />
                        <div className="flex-1">
                          <div className="flex items-baseline gap-2">
                            <span className="text-sm font-medium text-slate-500">
                              {String.fromCharCode(65 + idx)}.
                            </span>
                            <span className="text-sm text-slate-900 leading-relaxed break-words">
                              {text}
                            </span>
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}

              {/* Numeric */}
              {currentQuestion.type === "NUMERIC" && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Enter your answer
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={typeof answers[currentQuestion.id] === "string" ? (answers[currentQuestion.id] as string) : ""}
                    onChange={(event) => {
                      const value = event.target.value;
                      const normalized = value.replace(/[^0-9.-]/g, "");
                      setAnswers((prev) => ({
                        ...prev,
                        [currentQuestion.id]: normalized,
                      }));
                    }}
                    onKeyDown={(event) => {
                      if (["e", "E", "+"].includes(event.key)) {
                        event.preventDefault();
                      }
                    }}
                    className="w-full px-0 py-2 text-base text-slate-900 border-0 border-b-2 border-slate-200 focus:border-b-slate-400 focus:outline-none transition-colors bg-transparent"
                    placeholder="0"
                  />
                </div>
              )}

              {/* Word Blank */}
              {currentQuestion.type === "WORD_BLANK" && (
                <div>
                  {(() => {
                    const segments = currentQuestion.question.split(/_{2,}/);
                    const blankCount = Math.max(segments.length - 1, 0);
                    const blankValues = Array.isArray(answers[currentQuestion.id])
                      ? (answers[currentQuestion.id] as string[])
                      : Array(blankCount).fill("");

                    return (
                      <div className="space-y-4">
                        <p className="text-slate-900 leading-relaxed text-base">
                          {segments.map((segment, idx) => (
                            <span key={idx}>
                              <span>{segment}</span>
                              {idx < blankCount && (
                                <input
                                  type="text"
                                  value={blankValues[idx] ?? ""}
                                  onChange={(event) => {
                                    const nextValues = Array.from({ length: blankCount }, (_, i) => blankValues[i] ?? "");
                                    nextValues[idx] = event.target.value;
                                    setAnswers((prev) => ({
                                      ...prev,
                                      [currentQuestion.id]: nextValues,
                                    }));
                                  }}
                                  className="inline-block mx-1 px-2 py-1 text-base text-slate-900 border-0 border-b-2 border-slate-300 focus:border-b-slate-900 focus:outline-none transition-colors bg-transparent w-32"
                                  placeholder=""
                                />
                              )}
                            </span>
                          ))}
                        </p>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-8">
          <Button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            variant="outline"
            className="flex-1 h-10 text-sm font-medium disabled:opacity-50 border-slate-300 text-slate-900 hover:bg-slate-50"
          >
            Previous
          </Button>

          {currentIndex === questions.length - 1 ? (
            <Button
              onClick={handleSubmitClick}
              disabled={submitting}
              className="flex-1 h-10 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit"}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              className="flex-1 h-10 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800"
            >
              Next
            </Button>
          )}
        </div>

        {/* Violation Counter */}
        {tabSwitchCount > 0 && (
          <div className={`mt-6 p-3 text-sm rounded border-l-4 ${
            tabSwitchCount === 1 ? "bg-amber-50 border-l-amber-500 text-amber-800" :
            tabSwitchCount === 2 ? "bg-orange-50 border-l-orange-500 text-orange-800" :
            "bg-red-50 border-l-red-600 text-red-800"
          }`}>
            <span className="font-medium">Tab Switch Violation: {tabSwitchCount}/3</span>
          </div>
        )}
      </main>

      {/* Tab Switch Warning Modal */}
      <TabSwitchWarning
        isVisible={showWarning}
        violationCount={tabSwitchCount}
        onClose={() => setShowWarning(false)}
      />

      {/* Submit Confirmation Modal */}
      <SubmitConfirmation
        isVisible={showSubmitConfirmation}
        onConfirm={handleConfirmSubmit}
        onCancel={handleCancelSubmit}
        isSubmitting={submitting}
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
