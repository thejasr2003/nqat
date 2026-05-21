"use client";

interface SubmitConfirmationProps {
  isVisible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  title?: string;
  message?: string;
}

export function SubmitConfirmation({
  isVisible,
  onConfirm,
  onCancel,
  isSubmitting = false,
  title = "Submit Test?",
  message = "Are you sure you want to submit your test? You won't be able to change your answers after submission.",
}: SubmitConfirmationProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-lg border-2 border-blue-400 shadow-2xl p-6 bg-blue-50">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="text-5xl">❓</div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-center mb-3 text-blue-900">
          Submit Test?
        </h2>

        {/* Message */}
        <p className="text-sm text-center mb-6 leading-relaxed text-blue-700">
          Are you sure you want to submit your test? You won't be able to change your answers after submission.
        </p>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 h-10 rounded-lg bg-slate-200 text-slate-900 font-semibold hover:bg-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="flex-1 h-10 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}
