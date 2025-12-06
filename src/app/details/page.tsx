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

      candidateSchema.parse(data);

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
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <h1 className="text-lg font-semibold text-slate-900">
            Online Assessment Registration
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Complete your details to begin the test
          </p>
        </div>
      </header>

      {/* Main Form */}
      <main className="mx-auto w-full max-w-4xl px-4 py-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          {errors.submit && (
            <div className="mb-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm">
              <span className="text-lg">⚠️</span>
              <p className="flex-1 text-red-700">{errors.submit}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Personal Information Section */}
            <div>
              <h2 className="mb-3 text-sm font-semibold text-slate-900">
                Personal Information
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs font-medium text-slate-700">
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className={`h-9 text-sm ${
                      errors.name ? "border-red-500 focus-visible:ring-red-500" : ""
                    }`}
                  />
                  {errors.name && (
                    <p className="text-xs text-red-600">{errors.name}</p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-medium text-slate-700">
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your.email@example.com"
                    className={`h-9 text-sm ${
                      errors.email ? "border-red-500 focus-visible:ring-red-500" : ""
                    }`}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-600">{errors.email}</p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-xs font-medium text-slate-700">
                    Phone Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="10-digit mobile number"
                    className={`h-9 text-sm ${
                      errors.phone ? "border-red-500 focus-visible:ring-red-500" : ""
                    }`}
                  />
                  {errors.phone && (
                    <p className="text-xs text-red-600">{errors.phone}</p>
                  )}
                </div>

                {/* Alt Phone */}
                <div className="space-y-1.5">
                  <Label htmlFor="altPhone" className="text-xs font-medium text-slate-700">
                    Alternate Phone <span className="text-slate-400">(Optional)</span>
                  </Label>
                  <Input
                    id="altPhone"
                    name="altPhone"
                    value={formData.altPhone}
                    onChange={handleChange}
                    placeholder="10-digit mobile number"
                    className={`h-9 text-sm ${
                      errors.altPhone ? "border-red-500 focus-visible:ring-red-500" : ""
                    }`}
                  />
                  {errors.altPhone && (
                    <p className="text-xs text-red-600">{errors.altPhone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Academic Information Section */}
            <div className="border-t border-slate-100 pt-5">
              <h2 className="mb-3 text-sm font-semibold text-slate-900">
                Academic Details
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* USN */}
                <div className="space-y-1.5">
                  <Label htmlFor="usn" className="text-xs font-medium text-slate-700">
                    USN <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="usn"
                    name="usn"
                    value={formData.usn}
                    onChange={handleChange}
                    placeholder="University Serial Number"
                    className={`h-9 text-sm ${
                      errors.usn ? "border-red-500 focus-visible:ring-red-500" : ""
                    }`}
                  />
                  {errors.usn && (
                    <p className="text-xs text-red-600">{errors.usn}</p>
                  )}
                </div>

                {/* College Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="collegeName" className="text-xs font-medium text-slate-700">
                    College Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="collegeName"
                    name="collegeName"
                    value={formData.collegeName}
                    onChange={handleChange}
                    placeholder="Your college name"
                    className={`h-9 text-sm ${
                      errors.collegeName ? "border-red-500 focus-visible:ring-red-500" : ""
                    }`}
                  />
                  {errors.collegeName && (
                    <p className="text-xs text-red-600">{errors.collegeName}</p>
                  )}
                </div>

                {/* Branch */}
                <div className="space-y-1.5">
                  <Label htmlFor="branch" className="text-xs font-medium text-slate-700">
                    Branch/Stream <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="branch"
                    name="branch"
                    value={formData.branch}
                    onChange={handleChange}
                    placeholder="e.g., CSE, ECE, Mechanical"
                    className={`h-9 text-sm ${
                      errors.branch ? "border-red-500 focus-visible:ring-red-500" : ""
                    }`}
                  />
                  {errors.branch && (
                    <p className="text-xs text-red-600">{errors.branch}</p>
                  )}
                </div>

                {/* Passout Batch */}
                <div className="space-y-1.5">
                  <Label htmlFor="passoutBatch" className="text-xs font-medium text-slate-700">
                    Passout Year <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="passoutBatch"
                    name="passoutBatch"
                    value={formData.passoutBatch}
                    onChange={handleChange}
                    placeholder="e.g., 2024, 2025"
                    className={`h-9 text-sm ${
                      errors.passoutBatch ? "border-red-500 focus-visible:ring-red-500" : ""
                    }`}
                  />
                  {errors.passoutBatch && (
                    <p className="text-xs text-red-600">{errors.passoutBatch}</p>
                  )}
                </div>

                {/* Semester */}
                <div className="space-y-1.5">
                  <Label htmlFor="sem" className="text-xs font-medium text-slate-700">
                    Current Semester <span className="text-red-500">*</span>
                  </Label>
                  <select
                    id="sem"
                    name="sem"
                    value={formData.sem}
                    onChange={handleChange}
                    className={`flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 ${
                      errors.sem ? "border-red-500 focus-visible:ring-red-500" : ""
                    }`}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>
                        Semester {s}
                      </option>
                    ))}
                  </select>
                  {errors.sem && (
                    <p className="text-xs text-red-600">{errors.sem}</p>
                  )}
                </div>

                {/* CGPA */}
                <div className="space-y-1.5">
                  <Label htmlFor="cgpa" className="text-xs font-medium text-slate-700">
                    CGPA <span className="text-red-500">*</span>
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
                    placeholder="e.g., 8.50"
                    className={`h-9 text-sm ${
                      errors.cgpa ? "border-red-500 focus-visible:ring-red-500" : ""
                    }`}
                  />
                  {errors.cgpa && (
                    <p className="text-xs text-red-600">{errors.cgpa}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 border-t border-slate-100 pt-5">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="flex-1 h-10 text-sm font-medium"
                disabled={loading}
              >
                ← Back
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 h-10 bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Processing...
                  </span>
                ) : (
                  "Proceed to Test →"
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Footer Info */}
        <p className="mt-4 text-center text-xs text-slate-400">
          <span className="text-red-500">*</span> Required fields
        </p>
      </main>
    </div>
  );
}
