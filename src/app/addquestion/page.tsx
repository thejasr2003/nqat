"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { questionSchema, numericQuestionSchema, wordBlankQuestionSchema } from "@/lib/validations";

type QuestionType = "mcq" | "numeric" | "wordblank";

export default function AddQuestionPage() {
  const [activeTab, setActiveTab] = useState<QuestionType>("mcq");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // MCQ Form Data
  const [mcqFormData, setMcqFormData] = useState({
    question: "",
    option1: "",
    option2: "",
    option3: "",
    option4: "",
    answer: "option1",
  });

  // Numeric Form Data
  const [numericFormData, setNumericFormData] = useState({
    questionText: "",
    correctAnswer: "",
  });

  // Word Blank Form Data
  const [wordBlankFormData, setWordBlankFormData] = useState({
    paragraph: "",
    answers: "",
  });

  const handleMcqChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setMcqFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleNumericChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNumericFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleWordBlankChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setWordBlankFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleMcqSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setSuccess("");

    try {
      questionSchema.parse(mcqFormData);

      const response = await fetch("/api/questions/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mcqFormData),
      });

      if (!response.ok) {
        const error = await response.json();
        setErrors({ submit: error.error });
        setLoading(false);
        return;
      }

      setSuccess("MCQ question added successfully!");
      setMcqFormData({
        question: "",
        option1: "",
        option2: "",
        option3: "",
        option4: "",
        answer: "option1",
      });

      setTimeout(() => setSuccess(""), 3000);
      setLoading(false);
    } catch (error: any) {
      if (error.errors) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err: any) => {
          newErrors[err.path[0]] = err.message;
        });
        setErrors(newErrors);
      } else {
        setErrors({ submit: error.message });
      }
      setLoading(false);
    }
  };

  const handleNumericSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setSuccess("");

    try {
      const parsedInput = {
        questionText: numericFormData.questionText,
        correctAnswer: numericFormData.correctAnswer,
      };
      numericQuestionSchema.parse(parsedInput);

      const response = await fetch("/api/questions/numeric/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsedInput),
      });

      if (!response.ok) {
        const payload = await response.json();
        setErrors({ submit: payload.error });
        setLoading(false);
        return;
      }

      setSuccess("Numeric question added successfully!");
      setNumericFormData({ questionText: "", correctAnswer: "" });
      setTimeout(() => setSuccess(""), 3500);
      setLoading(false);
    } catch (error: any) {
      if (error.errors) {
        const next: Record<string, string> = {};
        error.errors.forEach((err: any) => {
          next[err.path[0]] = err.message;
        });
        setErrors(next);
      } else {
        setErrors({ submit: error.message || "Failed to save question" });
      }
      setLoading(false);
    }
  };

  const handleWordBlankSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setSuccess("");

    try {
      const answersArray = wordBlankFormData.answers
        .split(",")
        .map((answer) => answer.trim())
        .filter((answer) => answer.length > 0);

      const parsedInput = {
        paragraph: wordBlankFormData.paragraph,
        correctAnswers: answersArray,
      };

      wordBlankQuestionSchema.parse(parsedInput);

      const response = await fetch("/api/questions/wordblank/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsedInput),
      });

      if (!response.ok) {
        const payload = await response.json();
        setErrors({ submit: payload.error });
        setLoading(false);
        return;
      }

      setSuccess("Word blank question added successfully!");
      setWordBlankFormData({ paragraph: "", answers: "" });
      setTimeout(() => setSuccess(""), 3500);
      setLoading(false);
    } catch (error: any) {
      if (error.errors) {
        const next: Record<string, string> = {};
        error.errors.forEach((err: any) => {
          next[err.path[0]] = err.message;
        });
        setErrors(next);
      } else {
        setErrors({ submit: error.message || "Failed to save question" });
      }
      setLoading(false);
    }
  };

  const tabs = [
    { id: "mcq" as QuestionType, label: "MCQ Question", description: "Multiple choice questions" },
    { id: "numeric" as QuestionType, label: "Numeric Question", description: "Questions with numeric answers" },
    { id: "wordblank" as QuestionType, label: "Word Blank Question", description: "Fill in the blanks questions" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-xl font-semibold text-gray-900">Add Question</h1>
          <p className="text-xs text-gray-500 mt-0.5">Create questions for assessment</p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <a
              href="/addnumericquestion"
              className="rounded-full bg-blue-50 px-3 py-1 text-blue-700 hover:bg-blue-100"
            >
              Add Numeric Question
            </a>
            <a
              href="/addwordblankquestion"
              className="rounded-full bg-blue-50 px-3 py-1 text-blue-700 hover:bg-blue-100"
            >
              Add Word Blank Question
            </a>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            {tabs.find(tab => tab.id === activeTab)?.description}
          </p>
        </div>

        {/* Alerts */}
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            {success}
          </div>
        )}

        {errors.submit && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {errors.submit}
          </div>
        )}

        {/* Tab Content */}
        {activeTab === "mcq" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* MCQ Form Card - Takes 2 columns */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <form onSubmit={handleMcqSubmit} className="p-5 space-y-5">
                  {/* Question */}
                  <div className="space-y-1.5">
                    <Label htmlFor="question" className="text-xs font-medium text-gray-700">
                      Question <span className="text-red-500">*</span>
                    </Label>
                    <textarea
                      id="question"
                      name="question"
                      value={mcqFormData.question}
                      onChange={handleMcqChange}
                      placeholder="Enter your question"
                      rows={3}
                      className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.question ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.question && (
                      <p className="text-xs text-red-600">{errors.question}</p>
                    )}
                  </div>

                  {/* Options */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {["option1", "option2", "option3", "option4"].map((opt, idx) => (
                      <div key={opt} className="space-y-1.5">
                        <Label htmlFor={opt} className="text-xs font-medium text-gray-700">
                          Option {idx + 1} <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id={opt}
                          name={opt}
                          value={mcqFormData[opt as keyof typeof mcqFormData]}
                          onChange={handleMcqChange}
                          placeholder={`Option ${idx + 1}`}
                          className={`h-9 text-sm ${
                            errors[opt] ? "border-red-500" : ""
                          }`}
                        />
                        {errors[opt] && (
                          <p className="text-xs text-red-600">{errors[opt]}</p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Correct Answer */}
                  <div className="space-y-1.5">
                    <Label htmlFor="answer" className="text-xs font-medium text-gray-700">
                      Correct Answer <span className="text-red-500">*</span>
                    </Label>
                    <select
                      id="answer"
                      name="answer"
                      value={mcqFormData.answer}
                      onChange={handleMcqChange}
                      className="w-full h-9 rounded-md border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="option1">Option 1</option>
                      <option value="option2">Option 2</option>
                      <option value="option3">Option 3</option>
                      <option value="option4">Option 4</option>
                    </select>
                    {errors.answer && (
                      <p className="text-xs text-red-600">{errors.answer}</p>
                    )}
                  </div>

                  {/* Test Info */}
                  <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
                    <p className="text-xs text-blue-700">
                      <span className="font-medium">Test ID:</span> main-test
                    </p>
                  </div>

                  {/* Submit */}
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-9 text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium"
                  >
                    {loading ? "Adding..." : "Add MCQ Question"}
                  </Button>
                </form>
              </div>
            </div>

            {/* Instructions Sidebar - Takes 1 column */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">MCQ Instructions</h3>
                <ul className="text-xs text-gray-600 space-y-2">
                  <li>• Enter clear question text</li>
                  <li>• Provide 4 distinct options</li>
                  <li>• Select correct answer</li>
                  <li>• All questions added to main-test</li>
                  <li>• Each question carries 2 points</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === "numeric" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <form onSubmit={handleNumericSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="questionText" className="text-xs font-medium text-gray-700">
                    Question <span className="text-red-500">*</span>
                  </Label>
                  <textarea
                    id="questionText"
                    name="questionText"
                    value={numericFormData.questionText}
                    onChange={handleNumericChange}
                    rows={4}
                    className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.questionText ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter the numeric question prompt"
                  />
                  {errors.questionText && (
                    <p className="text-xs text-red-600">{errors.questionText}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="correctAnswer" className="text-xs font-medium text-gray-700">
                    Correct Answer <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="correctAnswer"
                    name="correctAnswer"
                    type="number"
                    value={numericFormData.correctAnswer}
                    onChange={handleNumericChange}
                    placeholder="e.g. 42"
                    className={`h-9 text-sm ${errors.correctAnswer ? "border-red-500" : ""}`}
                  />
                  {errors.correctAnswer && (
                    <p className="text-xs text-red-600">{errors.correctAnswer}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-10 bg-blue-600 text-white font-medium hover:bg-blue-700"
                >
                  {loading ? "Adding..." : "Add Numeric Question"}
                </Button>
              </form>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">Numeric Question Notes</h2>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Use a clear numeric prompt.</li>
                <li>• Only one numeric answer is accepted.</li>
                <li>• Example: "What is 2 + 2?"</li>
                <li>• Correct answer will be matched exactly.</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === "wordblank" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <form onSubmit={handleWordBlankSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="paragraph" className="text-xs font-medium text-gray-700">
                    Paragraph <span className="text-red-500">*</span>
                  </Label>
                  <textarea
                    id="paragraph"
                    name="paragraph"
                    value={wordBlankFormData.paragraph}
                    onChange={handleWordBlankChange}
                    rows={4}
                    className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.paragraph ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter a paragraph with blank spaces (use __ or ___ for blanks)"
                  />
                  {errors.paragraph && (
                    <p className="text-xs text-red-600">{errors.paragraph}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="answers" className="text-xs font-medium text-gray-700">
                    Answers <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="answers"
                    name="answers"
                    value={wordBlankFormData.answers}
                    onChange={handleWordBlankChange}
                    placeholder="Enter answers separated by commas"
                    className={`h-9 text-sm ${errors.correctAnswers ? "border-red-500" : ""}`}
                  />
                  {errors.correctAnswers && (
                    <p className="text-xs text-red-600">{errors.correctAnswers}</p>
                  )}
                  <p className="text-xs text-slate-500">
                    Example: is, library
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-10 bg-blue-600 text-white font-medium hover:bg-blue-700"
                >
                  {loading ? "Adding..." : "Add Word Blank Question"}
                </Button>
              </form>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">Word Blank Guidelines</h2>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Use __ or ___ to indicate blank spaces in your paragraph</li>
                <li>• Provide comma-separated answers in the correct order</li>
                <li>• No extra spaces in answer values; they will be trimmed</li>
                <li>• Example paragraph: "React __ a JS ___"</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
