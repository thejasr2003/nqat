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
      <div className="flex w-full max-w-sm flex-col rounded-lg border-2 border-red-600 bg-white p-6 shadow-2xl dark:border-red-500 dark:bg-slate-900">
        <h2 className="mb-3 text-center text-xl font-bold text-red-800 dark:text-red-100">{title}</h2>
        <p className="mb-4 text-center text-sm leading-relaxed text-gray-700 dark:text-gray-200">{message}</p>
        <div className="flex w-full justify-center">
          <Button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-red-600 font-semibold text-white transition-colors hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-red-500 dark:hover:bg-red-400"
          >
            {isSubmitting ? "Submitting..." : "Submit Test"}
          </Button>
        </div>
      </div>
    </div>
  );
};