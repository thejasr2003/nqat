"use client";

interface TabSwitchWarningProps {
  warningCount: number;
  isVisible: boolean;
  onClose: () => void;
}

export function TabSwitchWarning({
  warningCount,
  isVisible,
  onClose,
}: TabSwitchWarningProps) {
  if (!isVisible) {
    return null;
  }

  const hasReachedTerminationThreshold = warningCount >= 4;
  const displayedWarningCount = Math.min(warningCount, 3);
  const title = hasReachedTerminationThreshold ? "Test Terminated" : "Malpractice Warning";
  const message = hasReachedTerminationThreshold
    ? "Your test has been terminated because the misconduct limit was reached. Refreshing will not reset this state."
    : warningCount >= 3
    ? "This is your final warning. One more tab switch will submit your test."
    : "Switching tabs, minimizing the browser, or leaving fullscreen is not allowed. Please continue the assessment carefully.";

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-lg border-2 border-yellow-400 bg-yellow-50 p-6 shadow-2xl">
        <div className="mb-4 flex justify-center text-5xl">⚠️</div>

        <h2 className="mb-3 text-center text-xl font-bold text-yellow-800">
          {title}
        </h2>

        <p className="mb-4 text-center text-sm leading-relaxed text-yellow-700">
          {message}
        </p>

        <div className="mb-5 flex justify-center gap-2">
          {[1, 2, 3].map((num) => (
            <div
              key={num}
              className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold ${
                num <= displayedWarningCount
                  ? "bg-red-500 text-white"
                  : "bg-slate-200 text-slate-400"
              }`}
            >
              {num}
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="h-10 w-full rounded-lg bg-slate-900 font-semibold text-white transition-colors hover:bg-slate-800"
        >
          Continue Test
        </button>
      </div>
    </div>
  );
}
