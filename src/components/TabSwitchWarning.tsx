"use client";

import { useRouter } from "next/navigation";

interface TabSwitchWarningProps {
  isVisible: boolean;
  violationCount: number;
  onClose: () => void;
}

export function TabSwitchWarning({
  isVisible,
  violationCount,
  onClose,
}: TabSwitchWarningProps) {
  const router = useRouter();

  if (!isVisible) return null;

  const isAutoSubmitting = violationCount >= 3;
  const title = isAutoSubmitting ? "Test Submitted" : "Tab Switch Warning";
  const message = 
    violationCount === 1 
      ? "Switching tabs is not allowed. You have 2 more warnings before auto-submission."
      : violationCount === 2
      ? "This is your second violation. One more tab switch will auto-submit your test."
      : "Your test has been auto-submitted due to tab switching.";

  const handleGoToResults = () => {
    // Redirect to results page (will be filled by parent with actual score/total)
    router.push("/result?score=0&total=0");
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className={`w-full max-w-sm rounded-lg border-2 shadow-2xl p-6 ${
        isAutoSubmitting
          ? "bg-red-50 border-red-500"
          : "bg-yellow-50 border-yellow-400"
      }`}>
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className={`text-5xl ${isAutoSubmitting ? "animate-pulse" : ""}`}>
            {isAutoSubmitting ? "❌" : "⚠️"}
          </div>
        </div>

        {/* Title */}
        <h2 className={`text-xl font-bold text-center mb-3 ${
          isAutoSubmitting ? "text-red-700" : "text-yellow-800"
        }`}>
          {title}
        </h2>

        {/* Message */}
        <p className={`text-sm text-center mb-4 leading-relaxed ${
          isAutoSubmitting ? "text-red-600" : "text-yellow-700"
        }`}>
          {message}
        </p>

        {/* Violation Counter */}
        <div className="flex justify-center gap-2 mb-5">
          {[1, 2, 3].map((num) => (
            <div
              key={num}
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${
                num < violationCount
                  ? "bg-red-500 text-white"
                  : num === violationCount
                  ? "bg-yellow-500 text-white animate-pulse"
                  : "bg-slate-200 text-slate-400"
              }`}
            >
              {num}
            </div>
          ))}
        </div>

        {/* Button */}
        {!isAutoSubmitting && (
          <button
            onClick={onClose}
            className="w-full h-10 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors"
          >
            Continue Test
          </button>
        )}

        {isAutoSubmitting && (
          <button
            onClick={handleGoToResults}
            className="w-full h-10 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
          >
            Go to Results
          </button>
        )}
      </div>
    </div>
  );
}
