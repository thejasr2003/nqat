"use client";

import React, { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { TabSwitchWarning } from "@/components/TabSwitchWarning";
import { SubmitConfirmation } from "@/components/SubmitConfirmation";
import { useMalpracticeWarning, useTest } from "@/hooks/useTest";
import { ForceSubmitModal } from "@/components/test/ForceSubmitModal";

type QuestionType = "MCQ" | "NUMERIC" | "WORD_BLANK" | "LONG_ANSWER";

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

interface LongAnswerQuestion extends BaseQuestion {
  type: "LONG_ANSWER";
}

type Question = MCQQuestion | NumericQuestion | WordBlankQuestion | LongAnswerQuestion;
type AnswerRecord = Record<string, string | string[]>;

function TestContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const candidateId = searchParams.get("candidateId");

  const { warningCount, isTerminated, addWarning, markCompleted, forceSubmitReason } =
    useMalpracticeWarning();
  const [malpracticeAutoSubmitted, setMalpracticeAutoSubmitted] = useState<boolean | null>(null);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerRecord>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>("");
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showSubmitConfirmation, setShowSubmitConfirmation] = useState(false);
  const [malpracticeConfirmationShown, setMalpracticeConfirmationShown] = useState(false);
  const [confirmationMode, setConfirmationMode] = useState<"submit" | "leave" | "malpractice_limit">("submit");

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
    if (question.type === "LONG_ANSWER") {
      return typeof answer === "string" && answer.trim().length > 0;
    }
    return typeof answer === "string" && answer.trim().length > 0;
  };

  const validateBeforeSubmit = useCallback(() => {
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
  }, [answers, questions]);

  // Protect route: redirect if assessment already submitted
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const alreadySubmitted = window.localStorage.getItem("assessment_submitted") === "true";
    if (alreadySubmitted) {
      router.replace("/result");
    }
  }, [router]);

  // Fetch questions once on mount
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch("/api/questions");
        if (!response.ok) throw new Error("Failed to fetch questions");
        const data = await response.json();
        setQuestions(data);
        setLoading(false);
      } catch {
        setError("Failed to load questions");
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  // Define handleSubmit first so it's available for other hooks
  const submitTest = useCallback(
    async ({
      bypassValidation = false,
      preserveMalpractice = false,
    }: {
      bypassValidation?: boolean;
      preserveMalpractice?: boolean;
    } = {}) => {
      if (submitting || hasSubmitted) {
        console.log("submitTest skipped because already submitting or submitted", {
          submitting,
          hasSubmitted,
        });
        return false;
      }

      if (!bypassValidation && !validateBeforeSubmit()) {
        console.log("submitTest validation failed");
        return false;
      }

      if (!candidateId) {
        setError("Candidate ID is required to submit the test.");
        return false;
      }

      setSubmitting(true);
      setError("");
      console.log("Submit started", { candidateId, preserveMalpractice, answersCount: Object.keys(answers || {}).length });
      console.log("Submitting assessment...", { candidateId, preserveMalpractice });

      let success = false;

      try {
        console.log("Calling submit API", {
          url: "/api/test/submit",
          candidateId,
          answersCount: Object.keys(answers || {}).length,
        });

        const objectiveAnswers: Record<string, string | string[]> = {};
        const longAnswers: Record<string, string> = {};

        questions.forEach((question) => {
          const answer = answers[question.id];
          if (question.type === "LONG_ANSWER") {
            if (typeof answer === "string" && answer.trim().length > 0) {
              longAnswers[question.id] = answer.trim();
            }
            return;
          }

          if (typeof answer === "string" && answer.trim().length > 0) {
            objectiveAnswers[question.id] = answer.trim();
          } else if (Array.isArray(answer)) {
            objectiveAnswers[question.id] = answer;
          }
        });

        const response = await fetch("/api/test/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            candidateId,
            testId: "main-test",
            answers: objectiveAnswers,
            longAnswers,
          }),
        });

        console.log("Submission response status:", response.status);

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Submission error response:", errorData);
          setError(errorData.error || "Submission failed");
          return false;
        }

        const resultData = await response.json();
        console.log("Submission success response:", resultData);

        if (!preserveMalpractice) {
          markCompleted();
        }

        if (preserveMalpractice) {
          localStorage.setItem("assessment_malpractice_auto_submitted", "true");
          setMalpracticeAutoSubmitted(true);
        }

        // Mark assessment as submitted and clean up session data
        localStorage.setItem("assessment_submitted", "true");
        localStorage.removeItem("testEndTime");
        localStorage.removeItem("assessment_timer_expired");
        localStorage.removeItem("assessment_force_submit");
        localStorage.removeItem("assessment_submit_reason");
        localStorage.removeItem("assessment_warning_count");
        localStorage.removeItem("assessment_malpractice_logs");

        setHasSubmitted(true);
        success = true;
        console.log("Submit successful", {
          candidateId,
          preserveMalpractice,
          responseData: resultData,
        });
        const destination = "/result";
        console.log("Redirecting to result page", destination);
        setSubmitting(false);
        try {
          const pushResult = await router.push(destination);
          console.log("router.push completed", destination, { pushResult });
          if (typeof window !== "undefined" && window.location.pathname !== destination) {
            console.warn("router.push did not navigate, falling back to window.location.href", {
              currentPath: window.location.pathname,
              destination,
            });
            window.location.href = destination;
          }
        } catch (err) {
          console.error("router.push failed:", err);
          if (typeof window !== "undefined") {
            console.log("Falling back to window.location.href", destination);
            window.location.href = destination;
          }
        }
        return true;
      } catch (error) {
        console.error("Submission exception:", error);
        setError("Submission failed");
        setSubmitting(false);
        return false;
      } finally {
        if (!success) {
          setSubmitting(false);
        }
      }
    },
    [answers, candidateId, hasSubmitted, markCompleted, router, submitting, validateBeforeSubmit]
  );

  const { timeRemaining, isExpired, formattedTime, totalTime } = useTest({
    totalQuestions: questions.length > 0 ? questions.length : undefined,
  });

  useEffect(() => {
    if (isTerminated) {
      setShowWarningModal(false);
      router.replace("/result?status=terminated");
    }
  }, [isTerminated, router]);

  useEffect(() => {
    if (isExpired) {
      setShowWarningModal(false);
      setShowSubmitConfirmation(false);
      return;
    }

    if (forceSubmitReason === "malpractice_limit") {
      setShowWarningModal(false);
      setConfirmationMode("malpractice_limit");
      if (!malpracticeConfirmationShown) {
        setShowSubmitConfirmation(true);
        setMalpracticeConfirmationShown(true);
      }
      return;
    }

    if (!isTerminated && warningCount > 0 && warningCount < 3) {
      setShowWarningModal(true);
      setShowSubmitConfirmation(false);
      setMalpracticeConfirmationShown(false);
      return;
    }

    setShowWarningModal(false);
    if (warningCount < 3) {
      setShowSubmitConfirmation(false);
    }
  }, [forceSubmitReason, isExpired, isTerminated, warningCount, malpracticeConfirmationShown]);

  // Auto-submit on termination removed. We now only prompt the user
  // to submit when malpractice limit is reached. This prevents
  // automatic termination and gives the user a chance to confirm.

  useEffect(() => {
    if (typeof window === "undefined") return;

    setMalpracticeAutoSubmitted(
      window.localStorage.getItem("assessment_malpractice_auto_submitted") === "true"
    );
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        addWarning("visibility_change");
      }
    };

    const handleBlur = () => {
      addWarning("window_blur");
    };

    const handleFullscreenChange = () => {
      const fullscreenElement =
        document.fullscreenElement ||
        (document as Document & { webkitFullscreenElement?: Element | null }).webkitFullscreenElement ||
        (document as Document & { mozFullScreenElement?: Element | null }).mozFullScreenElement;

      if (!fullscreenElement) {
        addWarning("fullscreen_exit");
      }
    };

    const handlePageHide = () => {
      addWarning("page_hide");
    };

    window.addEventListener("blur", handleBlur);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, [addWarning]);

  // Handle submit button click - show confirmation
  const handleSubmitClick = () => {
    if (isExpired || forceSubmitReason) {
      return;
    }

    setConfirmationMode("submit");
    setShowSubmitConfirmation(true);
  };

  // Handle confirmation - proceed with submission
  const handleConfirmSubmit = async () => {
    console.log("Maximum warning submit clicked", { confirmationMode });
    console.log("Actual submit function called");
    console.log("handleConfirmSubmit calling submitTest", { confirmationMode });
    let result = false;

    if (confirmationMode === "malpractice_limit") {
      result = await submitTest({ bypassValidation: true, preserveMalpractice: true });
    } else if (confirmationMode === "leave") {
      result = await submitTest({ bypassValidation: true, preserveMalpractice: false });
    } else {
      result = await submitTest();
    }

    if (result) {
      setShowSubmitConfirmation(false);
      console.log("handleConfirmSubmit: submitTest returned success", { result });
    }
  };

  // Handle cancel - close confirmation
  const handleCancelSubmit = () => {
    setShowSubmitConfirmation(false);
  };

  const isForceSubmitActive = Boolean(forceSubmitReason) || isExpired;

  const handleForceSubmit = useCallback(() => {
    console.log("handleForceSubmit invoked", { forceSubmitReason });
    if (forceSubmitReason === "malpractice_limit") {
      void submitTest({ bypassValidation: true, preserveMalpractice: true });
      return;
    }

    void submitTest({ bypassValidation: true, preserveMalpractice: false });
  }, [forceSubmitReason, submitTest]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const currentUrl = window.location.href;
    window.history.pushState({ isTestPage: true }, "", currentUrl);

    const handlePopState = () => {
      if (hasSubmitted || submitting) return;

      setConfirmationMode("leave");
      setShowSubmitConfirmation(true);
      window.history.pushState({ isTestPage: true }, "", currentUrl);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [hasSubmitted, submitting]);

  if (!candidateId) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
        <div className="text-center">
          <div className="mb-2 text-4xl">⚠️</div>
          <p className="text-sm font-medium text-red-600 dark:text-red-400">Invalid test access</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
        <div className="text-center">
          <div className="mb-3 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600 mx-auto"></div>
          <p className="text-sm text-slate-600 dark:text-slate-300">Loading questions...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  const handleNext = () => {
    if (isForceSubmitActive || currentIndex >= questions.length - 1) {
      return;
    }

    setCurrentIndex(currentIndex + 1);
  };

  const handlePrev = () => {
    if (isForceSubmitActive || currentIndex <= 0) {
      return;
    }

    setCurrentIndex(currentIndex - 1);
  };

  const answeredCount = questions.filter(isQuestionAnswered).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <div className="mx-auto w-full max-w-4xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                Assessment
              </h1>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">
                Question {currentIndex + 1} of {questions.length} • {answeredCount} answered
              </p>
            </div>

            <div className="text-right">
              <p className="mb-1 text-xs text-slate-500 dark:text-slate-300">Time Remaining</p>
              <div
                className={`text-2xl font-semibold font-mono ${
                  timeRemaining < 300 ? "text-red-600 dark:text-red-400" : "text-slate-900 dark:text-slate-50"
                }`}
              >
                {formattedTime}
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1 w-full bg-slate-200 dark:bg-slate-700">
          <div
            className={`h-1 transition-all duration-300 ${
              timeRemaining < 300 ? "bg-red-500" : "bg-slate-400 dark:bg-slate-300"
            }`}
            style={{
              width: `${
                totalTime > 0 ? ((timeRemaining / totalTime) * 100).toFixed(1) : 0
              }%`,
            }}
          />
        </div>

        {/* Question Navigator */}
        <div className="w-full border-t border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900">
          <div className="mx-auto w-full max-w-4xl overflow-x-auto px-6 py-3">
            <div className="flex min-w-max gap-2">
              {questions.map((q, idx) => {
                const isActive = idx === currentIndex;
                const isAnswered = isQuestionAnswered(q);

                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      if (!isForceSubmitActive) {
                        setCurrentIndex(idx);
                      }
                    }}
                    disabled={isForceSubmitActive}
                    className={`flex h-8 w-8 items-center justify-center rounded border text-xs font-medium transition-all disabled:opacity-50 ${
                      isActive
                        ? "border-slate-900 bg-slate-900 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900"
                        : isAnswered
                        ? "border-slate-200 bg-slate-100 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                        : "border-slate-300 bg-white text-slate-600 hover:border-slate-400 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-300 dark:hover:border-slate-500"
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
          <div className="mb-6 rounded border border-red-300 bg-red-50 p-4 text-sm text-red-800 dark:border-red-700 dark:bg-red-950/40 dark:text-red-200">
            {error}
          </div>
        )}

        {/* Question Container */}
        {currentQuestion && (
          <div className="mb-8">
            {/* Question Number and Status */}
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                Question {currentIndex + 1}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-400">
                {isQuestionAnswered(currentQuestion) ? "Answered" : "Not answered"}
              </span>
            </div>

            {/* Question Text - Only show for non-word-blank questions */}
            {currentQuestion.type !== "WORD_BLANK" && (
              <h2 className="mb-6 break-words whitespace-pre-wrap text-xl font-semibold leading-relaxed text-slate-900 dark:text-slate-50">
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
                        className={`flex cursor-pointer items-start gap-4 rounded border p-4 transition-all ${
                          selected
                            ? "border-slate-400 bg-slate-50 dark:border-slate-500 dark:bg-slate-800"
                            : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600"
                        }`}
                      >
                        <input
                          type="radio"
                          name={currentQuestion.id}
                          value={key}
                          checked={selected}
                          disabled={isForceSubmitActive}
                          onChange={() => {
                            if (isForceSubmitActive) {
                              return;
                            }

                            setAnswers((prev) => ({
                              ...prev,
                              [currentQuestion.id]: key,
                            }));
                          }}
                          className="mt-0.5 h-5 w-5 cursor-pointer accent-slate-900 dark:accent-slate-100"
                        />
                        <div className="flex-1">
                          <div className="flex items-baseline gap-2">
                            <span className="text-sm font-medium text-slate-500 dark:text-slate-300">
                              {String.fromCharCode(65 + idx)}.
                            </span>
                            <span className="break-words text-sm leading-relaxed text-slate-900 dark:text-slate-50">
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
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                    Enter your answer
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    disabled={isForceSubmitActive}
                    value={typeof answers[currentQuestion.id] === "string" ? (answers[currentQuestion.id] as string) : ""}
                    onChange={(event) => {
                      if (isForceSubmitActive) {
                        return;
                      }

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
                    className="w-full border-0 border-b-2 border-slate-200 bg-transparent px-0 py-2 text-base text-slate-900 transition-colors placeholder:text-slate-400 focus:border-b-slate-400 focus:outline-none dark:border-slate-700 dark:text-slate-50 dark:placeholder:text-slate-500 dark:focus:border-b-slate-300"
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
                        <p className="text-base leading-relaxed text-slate-900 dark:text-slate-50">
                          {segments.map((segment, idx) => (
                            <span key={idx}>
                              <span>{segment}</span>
                              {idx < blankCount && (
                                <input
                                  type="text"
                                  disabled={isForceSubmitActive}
                                  value={blankValues[idx] ?? ""}
                                  onChange={(event) => {
                                    if (isForceSubmitActive) {
                                      return;
                                    }

                                    const nextValues = Array.from({ length: blankCount }, (_, i) => blankValues[i] ?? "");
                                    nextValues[idx] = event.target.value;
                                    setAnswers((prev) => ({
                                      ...prev,
                                      [currentQuestion.id]: nextValues,
                                    }));
                                  }}
                                  className="inline-block mx-1 w-32 border-0 border-b-2 border-slate-300 bg-transparent px-2 py-1 text-base text-slate-900 transition-colors placeholder:text-slate-400 focus:border-b-slate-900 focus:outline-none dark:border-slate-600 dark:text-slate-50 dark:placeholder:text-slate-500 dark:focus:border-b-slate-300"
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

              {currentQuestion.type === "LONG_ANSWER" && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                    Enter your answer
                  </label>
                  <textarea
                    disabled={isForceSubmitActive}
                    value={typeof answers[currentQuestion.id] === "string" ? (answers[currentQuestion.id] as string) : ""}
                    onChange={(event) => {
                      if (isForceSubmitActive) {
                        return;
                      }

                      setAnswers((prev) => ({
                        ...prev,
                        [currentQuestion.id]: event.target.value,
                      }));
                    }}
                    rows={6}
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
                    placeholder="Type your long answer here..."
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-8">
          <Button
            onClick={handlePrev}
            disabled={currentIndex === 0 || isForceSubmitActive}
            variant="outline"
            className="h-10 flex-1 border-slate-300 text-slate-900 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-800"
          >
            Previous
          </Button>

          {currentIndex === questions.length - 1 ? (
            <Button
              onClick={handleSubmitClick}
              disabled={submitting || isForceSubmitActive}
              className="h-10 flex-1 bg-slate-900 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
            >
              {submitting ? "Submitting..." : "Submit"}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={isForceSubmitActive}
              className="h-10 flex-1 bg-slate-900 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
            >
              Next
            </Button>
          )}
        </div>

        {/* Malpractice Status */}
        {warningCount > 0 && (
          <div className="mt-6 rounded border-l-4 border-l-amber-500 bg-amber-50 p-3 text-sm text-amber-800 dark:border-l-amber-400 dark:bg-amber-950/40 dark:text-amber-200">
            <span className="font-medium">Malpractice warning: {warningCount}/3</span>
            <p className="mt-1">
              Multiple violations will require you to submit your assessment. Please submit now to save your answers.
            </p>
          </div>
        )}
      </main>

      {/* Tab Switch Warning Modal */}
      <TabSwitchWarning
        warningCount={warningCount}
        isVisible={showWarningModal}
        onClose={() => setShowWarningModal(false)}
      />

      {/* Submit Confirmation Modal */}
      <SubmitConfirmation
        isVisible={showSubmitConfirmation}
        onConfirm={handleConfirmSubmit}
        onCancel={handleCancelSubmit}
        isSubmitting={submitting}
        showCancelButton={confirmationMode !== "malpractice_limit"}
        title={
          confirmationMode === "leave"
            ? "Leave Test?"
            : confirmationMode === "malpractice_limit"
            ? "Maximum Warnings Reached"
            : isExpired
            ? "Time's Up!"
            : "Submit Test?"
        }
        message={
          confirmationMode === "leave"
            ? "You are about to go back to registration. Submit your answers now to save your progress."
            : confirmationMode === "malpractice_limit"
            ? "You have switched tabs multiple times. You must submit the assessment to continue."
            : isExpired
            ? "The timer has expired. Submit your test now to record your responses."
            : "Are you sure you want to submit your test? You won't be able to change your answers after submission."
        }
      />

      {/* Force Submit Modal */}
      <ForceSubmitModal
        open={isExpired || forceSubmitReason === "timer_expired"}
        reason="timer_expired"
        onSubmit={handleForceSubmit}
        isSubmitting={submitting}
      />
    </div>
  );
}

export default function TestPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
          <div className="text-center">
            <div className="mb-3 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600 mx-auto"></div>
            <p className="text-sm text-slate-600 dark:text-slate-300">Loading test...</p>
          </div>
        </div>
      }
    >
      <TestContent />
    </Suspense>
  );
}
