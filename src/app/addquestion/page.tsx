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
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-xl font-semibold text-gray-900">Add Question</h1>
          <p className="text-xs text-gray-500 mt-0.5">Create MCQ questions for assessment</p>
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

        {/* Main Layout: Form + Instructions Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Form Card - Takes 2 columns */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <form onSubmit={handleSubmit} className="p-5 space-y-5">
                {/* Question */}
                <div className="space-y-1.5">
                  <Label htmlFor="question" className="text-xs font-medium text-gray-700">
                    Question <span className="text-red-500">*</span>
                  </Label>
                  <textarea
                    id="question"
                    name="question"
                    value={formData.question}
                    onChange={handleChange}
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
                        value={formData[opt as keyof typeof formData]}
                        onChange={handleChange}
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
                    value={formData.answer}
                    onChange={handleChange}
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
                  {loading ? "Adding..." : "Add Question"}
                </Button>
              </form>
            </div>
          </div>

          {/* Instructions Sidebar - Takes 1 column */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Instructions</h3>
              <ul className="text-xs text-gray-600 space-y-2">
                <li>• Enter clear question text</li>
                <li>• Provide 4 distinct options</li>
                <li>• Select correct answer</li>
                <li>• All questions added to main-test</li>
                <li>• Each question carry 2 point</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
