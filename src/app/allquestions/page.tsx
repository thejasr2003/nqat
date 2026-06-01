"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type QuestionType = "MCQ" | "NUMERIC" | "WORD_BLANK";

interface BaseQuestion {
  id: string;
  type: QuestionType;
  question: string;
  questionImage?: string;
  correctAnswer?: string | number | string[];
}

interface MCQQuestion extends BaseQuestion {
  type: "MCQ";
  options: {
    option1: string;
    option2: string;
    option3: string;
    option4: string;
  };
  correctAnswer: string;
}

interface NumericQuestion extends BaseQuestion {
  type: "NUMERIC";
  correctAnswer: number;
}

interface WordBlankQuestion extends BaseQuestion {
  type: "WORD_BLANK";
  correctAnswer: string[];
}

type Question = MCQQuestion | NumericQuestion | WordBlankQuestion;

const formatCorrectAnswer = (question: Question) => {
  if (question.type === "MCQ") {
    return typeof question.correctAnswer === "string" && question.correctAnswer.trim().length > 0
      ? question.correctAnswer
      : "No answer set";
  }

  if (question.type === "NUMERIC") {
    return typeof question.correctAnswer === "number" ? String(question.correctAnswer) : "No answer set";
  }

  if (!Array.isArray(question.correctAnswer)) {
    return "No answer set";
  }

  if (question.correctAnswer.length === 0) {
    return "No answer set";
  }

  return question.correctAnswer.join(", ");
};

const getMCQCorrectLabel = (question: MCQQuestion) => {
  const optionMap = {
    option1: "A",
    option2: "B",
    option3: "C",
    option4: "D",
  } as const;

  if (typeof question.correctAnswer !== "string" || question.correctAnswer.trim().length === 0) {
    return "No answer set";
  }

  const entry = Object.entries(question.options).find(
    ([, option]) => option === question.correctAnswer
  );

  if (!entry) {
    return question.correctAnswer;
  }

  return `${optionMap[entry[0] as keyof typeof optionMap]}: ${question.correctAnswer}`;
};

export default function AllQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch("/api/questions/all");
        if (!response.ok) throw new Error("Failed to fetch questions");
        const data = await response.json();
        setQuestions(data);
        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-lg font-semibold text-slate-900">Loading questions...</p>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">All Questions</h1>
          <p className="mt-2 text-lg text-gray-600">
            Total Questions: <span className="font-semibold">{questions.length}</span>
          </p>
        </div>

        {questions.length === 0 ? (
          <div className="rounded-lg bg-white p-8 text-center shadow-lg">
            <p className="text-lg text-gray-600">No questions added yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((question, index) => (
              <div
                key={question.id}
                className="rounded-lg bg-white shadow-md transition-all hover:shadow-lg"
              >
                <div
                  onClick={() =>
                    setExpandedId(expandedId === question.id ? null : question.id)
                  }
                  className="cursor-pointer p-5 hover:bg-slate-50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-blue-600">
                        Question {index + 1}
                      </p>
                      <h3 className="mt-2 whitespace-pre-wrap text-base font-semibold text-gray-900">
                        {question.question}
                      </h3>
                    </div>
                    <button className="ml-4 text-2xl text-gray-400 transition-transform">
                      {expandedId === question.id ? "−" : "+"}
                    </button>
                  </div>
                </div>

                {expandedId === question.id && (
                  <div className="border-t border-gray-200 p-5">
                    {question.questionImage && (
                      <div className="mb-5 rounded-lg border border-gray-200 bg-gray-50 p-4">
                        <p className="mb-3 text-sm font-medium text-gray-700">
                          Question Image:
                        </p>
                        <img
                          src={question.questionImage}
                          alt="Question visual"
                          className="max-w-full rounded-md"
                        />
                      </div>
                    )}

                    {question.type === "MCQ" && (
                      <div className="mb-5 space-y-3">
                        <p className="text-sm font-medium text-gray-700">Options:</p>
                        {[
                          { key: "option1", label: "A", value: question.options.option1 },
                          { key: "option2", label: "B", value: question.options.option2 },
                          { key: "option3", label: "C", value: question.options.option3 },
                          { key: "option4", label: "D", value: question.options.option4 },
                        ].map((opt) => (
                          <div
                            key={opt.key}
                            className="rounded-lg border border-gray-200 bg-gray-50 p-3"
                          >
                            <p className="text-sm font-semibold text-gray-700">
                              {opt.label}. {opt.value}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                      <p className="text-sm font-semibold text-emerald-700">Correct Answer</p>
                      <p className="mt-2 text-sm text-emerald-900">
                        {question.type === "MCQ"
                          ? getMCQCorrectLabel(question)
                          : formatCorrectAnswer(question)}
                      </p>
                    </div>

                    {question.type === "NUMERIC" && (
                      <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
                        <p className="text-sm font-medium text-slate-700">Numeric Question</p>
                        <p className="mt-2 text-sm text-slate-600">Answer is a single numeric value.</p>
                      </div>
                    )}

                    {question.type === "WORD_BLANK" && (
                      <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
                        <p className="text-sm font-medium text-slate-700">Word Blank Question</p>
                        <p className="mt-2 text-sm text-slate-600">
                          This question contains {Math.max((question.question.match(/_{2,}/g) || []).length, 0)} blank(s).
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {questions.length > 0 && (
          <div className="mt-8 flex justify-end">
            <Button
              onClick={() => {
                const csvContent = [
                  [
                    "Question No",
                    "Question",
                    "Type",
                    "Correct Answer",
                    "Option A",
                    "Option B",
                    "Option C",
                    "Option D",
                  ].join(","),
                  ...questions.map((q, idx) => {
                    const optionA = q.type === "MCQ" ? q.options.option1 : "";
                    const optionB = q.type === "MCQ" ? q.options.option2 : "";
                    const optionC = q.type === "MCQ" ? q.options.option3 : "";
                    const optionD = q.type === "MCQ" ? q.options.option4 : "";
                    const correctAnswer =
                      q.type === "MCQ"
                        ? getMCQCorrectLabel(q)
                        : formatCorrectAnswer(q);

                    return [
                      idx + 1,
                      `"${q.question.replace(/"/g, '""')}"`,
                      q.type,
                      `"${correctAnswer.replace(/"/g, '""')}"`,
                      `"${optionA}"`,
                      `"${optionB}"`,
                      `"${optionC}"`,
                      `"${optionD}"`,
                    ].join(",");
                  }),
                ].join("\n");

                const blob = new Blob([csvContent], {
                  type: "text/csv;charset=utf-8;",
                });
                const link = document.createElement("a");
                const url = URL.createObjectURL(blob);
                link.setAttribute("href", url);
                link.setAttribute(
                  "download",
                  `questions-${new Date().toISOString().split("T")[0]}.csv`
                );
                link.style.visibility = "hidden";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4V4"
                />
              </svg>
              Export to CSV
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
