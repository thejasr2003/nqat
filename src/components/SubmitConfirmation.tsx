"use client";

import React from "react";

interface SubmitConfirmationProps {
  isVisible: boolean;
  onConfirm: () => Promise<void> | void;
  onCancel: () => void;
  isSubmitting?: boolean;
  showCancelButton?: boolean;
  title?: string;
  message?: string;
}

export function SubmitConfirmation({
  isVisible,
  onConfirm,
  onCancel,
  isSubmitting = false,
  showCancelButton = true,
  title = "Submit Test?",
  message = "Are you sure you want to submit your test? You won't be able to change your answers after submission.",
}: SubmitConfirmationProps) {
  if (!isVisible) return null;

  const [localClicked, setLocalClicked] = React.useState(false);

  const handleConfirmClick = async () => {
    if (localClicked) return;
    setLocalClicked(true);
    console.log("Modal submit clicked");
    try {
      console.log("Calling parent onConfirm");
      const res = await onConfirm();
      console.log("Parent onConfirm completed", { res });
      console.log("Modal submit completed");
    } catch (error) {
      console.error("Modal submit failed:", error);
      setLocalClicked(false);
    }
  };
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="flex w-full max-w-sm flex-col rounded-lg border-2 border-blue-400 bg-blue-50 p-6 shadow-2xl dark:border-blue-500 dark:bg-slate-900">
        {/* Icon */}
        <div className="mb-4 flex justify-center">
          <div className="text-5xl">❓</div>
        </div>

        {/* Title */}
        <h2 className="mb-3 text-center text-xl font-bold text-blue-900 dark:text-blue-100">
          {title}
        </h2>

        {/* Message */}
        <p className="mb-6 text-center text-sm leading-relaxed text-blue-700 dark:text-blue-200">
          {message}
        </p>

        {/* Buttons */}
        <div className="flex w-full gap-3">
          {showCancelButton && (
            <button
              onClick={onCancel}
              disabled={isSubmitting}
              className="inline-flex h-10 flex-1 items-center justify-center rounded-lg bg-slate-200 font-semibold text-slate-900 transition-colors hover:bg-slate-300 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleConfirmClick}
            disabled={isSubmitting || localClicked}
            className="inline-flex h-10 flex-1 items-center justify-center rounded-lg bg-blue-600 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-400"
          >
            {isSubmitting || localClicked ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}
