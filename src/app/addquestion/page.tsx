"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { questionSchema } from "@/lib/validations";

export default function AddQuestionPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    question: "",
    option1: "",
    option2: "",
    option3: "",
    option4: "",
    answer: "option1",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setSuccess("");

    try {
      questionSchema.parse(formData);

      const response = await fetch("/api/questions/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        setErrors({ submit: error.error });
        setLoading(false);
        return;
      }

      setSuccess("Question added successfully!");
      setFormData({
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

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Add Question</h1>
            <p className="text-gray-600 mt-2">
              Add new MCQ questions to the assessment test
            </p>
          </div>

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md text-green-700">
              ✓ {success}
            </div>
          )}

          {errors.submit && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
              {errors.submit}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Question */}
            <div className="space-y-2">
              <Label htmlFor="question">Question *</Label>
              <textarea
                id="question"
                name="question"
                value={formData.question}
                onChange={handleChange}
                placeholder="Enter the question"
                rows={4}
                className={`flex w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                  errors.question ? "border-red-500" : "border-input"
                }`}
              />
              {errors.question && (
                <p className="text-red-500 text-sm">{errors.question}</p>
              )}
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {["option1", "option2", "option3", "option4"].map((opt) => (
                <div key={opt} className="space-y-2">
                  <Label htmlFor={opt}>
                    Option {opt.replace("option", "")} *
                  </Label>
                  <Input
                    id={opt}
                    name={opt}
                    value={formData[opt as keyof typeof formData]}
                    onChange={handleChange}
                    placeholder={`Enter option ${opt.replace("option", "")}`}
                    className={
                      errors[opt] ? "border-red-500" : ""
                    }
                  />
                  {errors[opt] && (
                    <p className="text-red-500 text-sm">{errors[opt]}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Correct Answer */}
            <div className="space-y-2">
              <Label htmlFor="answer">Correct Answer *</Label>
              <select
                id="answer"
                name="answer"
                value={formData.answer}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="option1">Option 1</option>
                <option value="option2">Option 2</option>
                <option value="option3">Option 3</option>
                <option value="option4">Option 4</option>
              </select>
              {errors.answer && (
                <p className="text-red-500 text-sm">{errors.answer}</p>
              )}
            </div>

            {/* Hidden Test ID Info */}
            <div className="bg-blue-50 p-4 rounded-md">
              <p className="text-sm text-blue-700">
                <strong>Test ID:</strong> main-test (fixed)
              </p>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? "Adding Question..." : "Add Question"}
            </Button>
          </form>

          {/* Instructions */}
          <div className="mt-8 pt-8 border-t">
            <h3 className="font-semibold text-gray-900 mb-4">Instructions:</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Fill in the question text carefully</li>
              <li>• Provide 4 distinct options</li>
              <li>• Select the correct answer option</li>
              <li>• All questions are added to the "main-test"</li>
              <li>• Maximum 25 questions per test</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
