"use client";

import { ChangeEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { numericQuestionSchema } from "@/lib/validations";

export default function AddNumericQuestionPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    questionText: "",
    correctAnswer: "",
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setSuccess("");

    try {
      const parsedInput = {
        questionText: formData.questionText,
        correctAnswer: formData.correctAnswer,
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
      setFormData({ questionText: "", correctAnswer: "" });
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

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-4 flex flex-col gap-2">
          <h1 className="text-xl font-semibold text-gray-900">Add Numeric Question</h1>
          <p className="text-sm text-gray-500">Create a numeric question for the assessment.</p>
        </div>

        {success && (
          <div className="mb-4 rounded-lg bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-700">
            {success}
          </div>
        )}

        {errors.submit && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
            {errors.submit}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="questionText" className="text-xs font-medium text-gray-700">
                  Question <span className="text-red-500">*</span>
                </Label>
                <textarea
                  id="questionText"
                  name="questionText"
                  value={formData.questionText}
                  onChange={handleChange}
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
                  value={formData.correctAnswer}
                  onChange={handleChange}
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
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Quick Notes</h2>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Use a clear numeric prompt.</li>
              <li>• Only one numeric answer is accepted.</li>
              <li>• Example: "What is 2 + 2?"</li>
              <li>• Correct answer will be matched exactly.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}