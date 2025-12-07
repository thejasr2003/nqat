"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { candidateSchema } from "@/lib/validations";

export default function DetailsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    altPhone: "",
    usn: "",
    collegeName: "",
    passoutBatch: "",
    branch: "",
    sem: "1",
    cgpa: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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

    try {
      const data = {
        ...formData,
        sem: parseInt(formData.sem),
        cgpa: parseFloat(formData.cgpa),
      };

      // Validate using Zod schema
      const validationResult = candidateSchema.safeParse(data);
      
      if (!validationResult.success) {
        const newErrors: Record<string, string> = {};
        validationResult.error.issues.forEach((issue: any) => {
          const fieldName = issue.path[0];
          newErrors[fieldName] = issue.message;
        });
        setErrors(newErrors);
        setLoading(false);
        return;
      }

      const response = await fetch("/api/candidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        setErrors({ submit: error.error });
        setLoading(false);
        return;
      }

      const result = await response.json();
      router.push(`/test?candidateId=${result.candidateId}`);
    } catch (error: any) {
      setErrors({ submit: error.message || "An error occurred. Please try again." });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl px-6 py-4 lg:px-8">
          <h1 className="text-lg font-semibold tracking-tight text-slate-900">
            Assessment Registration
          </h1>
          <p className="mt-0.5 text-xs text-slate-600">
            Fill in your details to start the assessment
          </p>
        </div>
      </header>

      {/* Main Form */}
      <main className="mx-auto w-full max-w-5xl px-6 py-6 lg:px-8">
        <div className="rounded-xl border border-slate-200/60 bg-white p-6 shadow-sm lg:p-8">
          {errors.submit && (
            <div className="mb-5 rounded-lg border-l-4 border-red-500 bg-red-50 p-3">
              <div className="flex items-start gap-2">
                <svg className="h-4 w-4 flex-shrink-0 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-xs font-medium text-red-800">{errors.submit}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <fieldset className="space-y-4">
              <legend className="text-sm font-semibold text-slate-900">
                Personal Information
              </legend>

              <div className="grid gap-4 md:grid-cols-2">
                {/* Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs font-medium text-slate-700">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className={`h-9 text-sm ${errors.name ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? "name-error" : undefined}
                  />
                  {errors.name && (
                    <p id="name-error" className="text-xs text-red-600" role="alert">
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-medium text-slate-700">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email address"
                    className={`h-9 text-sm ${errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-error" : undefined}
                  />
                  {errors.email && (
                    <p id="email-error" className="text-xs text-red-600" role="alert">
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-xs font-medium text-slate-700">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter 10-digit phone number"
                    className={`h-9 text-sm ${errors.phone ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    aria-invalid={!!errors.phone}
                    aria-describedby={errors.phone ? "phone-error" : undefined}
                  />
                  {errors.phone && (
                    <p id="phone-error" className="text-xs text-red-600" role="alert">
                      {errors.phone}
                    </p>
                  )}
                </div>

                {/* Alt Phone */}
                <div className="space-y-1.5">
                  <Label htmlFor="altPhone" className="text-xs font-medium text-slate-700">
                    Alternate Phone <span className="text-slate-500">(optional)</span>
                  </Label>
                  <Input
                    id="altPhone"
                    name="altPhone"
                    type="tel"
                    value={formData.altPhone}
                    onChange={handleChange}
                    placeholder="Enter alternate phone (optional)"
                    className={`h-9 text-sm ${errors.altPhone ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    aria-invalid={!!errors.altPhone}
                    aria-describedby={errors.altPhone ? "altPhone-error" : undefined}
                  />
                  {errors.altPhone && (
                    <p id="altPhone-error" className="text-xs text-red-600" role="alert">
                      {errors.altPhone}
                    </p>
                  )}
                </div>
              </div>
            </fieldset>

            {/* Academic Information */}
            <fieldset className="space-y-4 border-t border-slate-100 pt-6">
              <legend className="text-sm font-semibold text-slate-900">
                Academic Details
              </legend>

              <div className="grid gap-4 md:grid-cols-2">
                {/* USN */}
                <div className="space-y-1.5">
                  <Label htmlFor="usn" className="text-xs font-medium text-slate-700">
                    USN
                  </Label>
                  <Input
                    id="usn"
                    name="usn"
                    value={formData.usn}
                    onChange={handleChange}
                    placeholder="Enter your USN (e.g., 1XY21CS001)"
                    className={`h-9 text-sm ${errors.usn ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    aria-invalid={!!errors.usn}
                    aria-describedby={errors.usn ? "usn-error" : undefined}
                  />
                  {errors.usn && (
                    <p id="usn-error" className="text-xs text-red-600" role="alert">
                      {errors.usn}
                    </p>
                  )}
                </div>

                {/* College Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="collegeName" className="text-xs font-medium text-slate-700">
                    College Name
                  </Label>
                  <Input
                    id="collegeName"
                    name="collegeName"
                    value={formData.collegeName}
                    onChange={handleChange}
                    placeholder="Enter your college name"
                    className={`h-9 text-sm ${errors.collegeName ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    aria-invalid={!!errors.collegeName}
                    aria-describedby={errors.collegeName ? "collegeName-error" : undefined}
                  />
                  {errors.collegeName && (
                    <p id="collegeName-error" className="text-xs text-red-600" role="alert">
                      {errors.collegeName}
                    </p>
                  )}
                </div>

                {/* Branch */}
                <div className="space-y-1.5">
                  <Label htmlFor="branch" className="text-xs font-medium text-slate-700">
                    Branch
                  </Label>
                  <Input
                    id="branch"
                    name="branch"
                    value={formData.branch}
                    onChange={handleChange}
                    placeholder="Enter your branch (e.g., CSE, ECE)"
                    className={`h-9 text-sm ${errors.branch ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    aria-invalid={!!errors.branch}
                    aria-describedby={errors.branch ? "branch-error" : undefined}
                  />
                  {errors.branch && (
                    <p id="branch-error" className="text-xs text-red-600" role="alert">
                      {errors.branch}
                    </p>
                  )}
                </div>

                {/* Passout Year */}
                <div className="space-y-1.5">
                  <Label htmlFor="passoutBatch" className="text-xs font-medium text-slate-700">
                    Passout Year
                  </Label>
                  <Input
                    id="passoutBatch"
                    name="passoutBatch"
                    value={formData.passoutBatch}
                    onChange={handleChange}
                    placeholder="Enter passout year (e.g., 2025)"
                    className={`h-9 text-sm ${errors.passoutBatch ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    aria-invalid={!!errors.passoutBatch}
                    aria-describedby={errors.passoutBatch ? "passoutBatch-error" : undefined}
                  />
                  {errors.passoutBatch && (
                    <p id="passoutBatch-error" className="text-xs text-red-600" role="alert">
                      {errors.passoutBatch}
                    </p>
                  )}
                </div>

                {/* Semester */}
                <div className="space-y-1.5">
                  <Label htmlFor="sem" className="text-xs font-medium text-slate-700">
                    Current Semester
                  </Label>
                  <select
                    id="sem"
                    name="sem"
                    value={formData.sem}
                    onChange={handleChange}
                    className={`flex h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm shadow-sm transition-colors hover:border-slate-300 focus-visible:border-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                      errors.sem ? "border-red-500 focus-visible:ring-red-500" : ""
                    }`}
                    aria-invalid={!!errors.sem}
                    aria-describedby={errors.sem ? "sem-error" : undefined}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>
                        Semester {s}
                      </option>
                    ))}
                  </select>
                  {errors.sem && (
                    <p id="sem-error" className="text-xs text-red-600" role="alert">
                      {errors.sem}
                    </p>
                  )}
                </div>

                {/* CGPA */}
                <div className="space-y-1.5">
                  <Label htmlFor="cgpa" className="text-xs font-medium text-slate-700">
                    CGPA
                  </Label>
                  <Input
                    id="cgpa"
                    name="cgpa"
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={formData.cgpa}
                    onChange={handleChange}
                    placeholder="Enter CGPA (0.00 - 10.00)"
                    className={`h-9 text-sm ${errors.cgpa ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    aria-invalid={!!errors.cgpa}
                    aria-describedby={errors.cgpa ? "cgpa-error" : undefined}
                  />
                  {errors.cgpa && (
                    <p id="cgpa-error" className="text-xs text-red-600" role="alert">
                      {errors.cgpa}
                    </p>
                  )}
                </div>
              </div>
            </fieldset>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="h-9 px-6 text-sm font-medium sm:w-auto"
                disabled={loading}
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="h-9 bg-blue-600 px-6 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 sm:w-auto"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  "Continue to Assessment"
                )}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
