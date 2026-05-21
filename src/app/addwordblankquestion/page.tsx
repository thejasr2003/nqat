"use client";

import { ChangeEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { wordBlankQuestionSchema } from "@/lib/validations";

export default function AddWordBlankQuestionPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    paragraph: "",
    answers: "",
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
      const answersArray = formData.answers
        .split(",")
        .map((answer) => answer.trim())
        .filter((answer) => answer.length > 0);

      const parsedInput = {
        paragraph: formData.paragraph,
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
      setFormData({ paragraph: "", answers: "" });
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
          <h1 className="text-xl font-semibold text-gray-900">Add Word Blank Question</h1>
          <p className="text-sm text-gray-500">Create a paragraph question with multiple blanks.</p>
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
                <Label htmlFor="paragraph" className="text-xs font-medium text-gray-700">
                  Paragraph <span className="text-red-500">*</span>
                </Label>
                <textarea
                  id="paragraph"
                  name="paragraph"
                  value={formData.paragraph}
                  onChange={handleChange}
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
                  value={formData.answers}
                  onChange={handleChange}
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
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Guidelines</h2>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Use __ or ___ to indicate blank spaces in your paragraph</li>
              <li>• Provide comma-separated answers in the correct order.</li>
              <li>• No extra spaces in answer values; they will be trimmed.</li>
              <li>• Example paragraph: "React __ a JS ___"</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
