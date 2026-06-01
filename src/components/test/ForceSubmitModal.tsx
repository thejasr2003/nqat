"use client";

import React from "react";
import { Button } from "@/components/ui/button";

interface ForceSubmitModalProps {
  open: boolean;
  reason: "timer_expired" | "malpractice_limit";
  onSubmit: () => void;
  isSubmitting?: boolean;
}

export const ForceSubmitModal: React.FC<ForceSubmitModalProps> = ({
  open,
  reason,
  onSubmit,
  isSubmitting = false,
}) => {
  if (!open) return null;

  const title =
    reason === "timer_expired" ? "Time is up" : "Maximum warnings reached";

  const message =
    reason === "timer_expired"
      ? "Your assessment time has ended. Please submit your test."
      : "Multiple malpractice activities were detected. You must submit the assessment.";

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-lg border-2 border-red-600 bg-white p-6 shadow-2xl">
        <h2 className="mb-3 text-center text-xl font-bold text-red-800">{title}</h2>
        <p className="mb-4 text-center text-sm leading-relaxed text-gray-700">{message}</p>
        <Button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="h-10 w-full rounded-lg bg-red-600 font-semibold text-white transition-colors hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Submitting..." : "Submit Test"}
        </Button>
      </div>
    </div>
  );
};