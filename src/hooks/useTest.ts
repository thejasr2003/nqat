"use client";

import { useCallback, useEffect, useState } from "react";

interface UseTestProps {
  duration?: number;
  totalQuestions?: number;
}

type MalpracticeLogEntry = {
  type: string;
  timestamp: number;
};

const TEST_END_TIME_KEY = "testEndTime";
const TIMER_EXPIRED_KEY = "assessment_timer_expired";
const FORCE_SUBMIT_KEY = "assessment_force_submit";
const FORCE_SUBMIT_REASON_KEY = "assessment_submit_reason";
export const MAX_WARNING_COUNT = 3;
export const TERMINATION_WARNING_COUNT = MAX_WARNING_COUNT + 1;
const MALPRACTICE_WARNING_KEY = "assessment_warning_count";
const MALPRACTICE_TERMINATED_KEY = "assessment_terminated";
const MALPRACTICE_LOGS_KEY = "assessment_malpractice_logs";

const getStorageValue = (key: string) => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

const setStorageValue = (key: string, value: string) => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Ignore storage write failures in privacy modes.
  }
};

const removeStorageValue = (key: string) => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.removeItem(key);
  } catch {
    // Ignore storage removal failures.
  }
};

const safeParseLogs = (rawLogs: string | null): MalpracticeLogEntry[] => {
  if (!rawLogs) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawLogs);
    if (Array.isArray(parsed)) {
      return parsed.filter((entry) => {
        return (
          entry &&
          typeof entry === "object" &&
          typeof entry.timestamp === "number" &&
          typeof entry.type === "string"
        );
      }) as MalpracticeLogEntry[];
    }
  } catch {
    // Ignore malformed logs.
  }

  return [];
};

const syncToBackendIfAvailable = async (
  warningCount: number,
  isTerminated: boolean,
  logs: MalpracticeLogEntry[]
) => {
  const syncUrl = process.env.NEXT_PUBLIC_MALPRACTICE_SYNC_URL;

  if (!syncUrl) {
    return;
  }

  try {
    await fetch(syncUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        warningCount,
        isTerminated,
        logs,
        syncedAt: Date.now(),
      }),
    });
  } catch {
    // Best-effort backend sync. Failures are ignored so the test remains usable.
  }
};

const getInitialTimerState = (calculatedDuration: number) => {
  if (typeof window === "undefined") {
    return { timeRemaining: 0, isExpired: false };
  }

  if (getStorageValue(TIMER_EXPIRED_KEY) === "true") {
    removeStorageValue(TEST_END_TIME_KEY);
    return { timeRemaining: 0, isExpired: true };
  }

  const storedEndTime = getStorageValue(TEST_END_TIME_KEY);
  const now = Date.now();

  if (storedEndTime) {
    const endTime = Number.parseInt(storedEndTime, 10);
    if (Number.isNaN(endTime)) {
      removeStorageValue(TEST_END_TIME_KEY);
      const durationSeconds = calculatedDuration * 60;
      const freshEndTime = now + durationSeconds * 1000;
      setStorageValue(TEST_END_TIME_KEY, freshEndTime.toString());
      return { timeRemaining: durationSeconds, isExpired: false };
    }

    const remainingSeconds = Math.floor((endTime - now) / 1000);
    if (remainingSeconds > 0) {
      return { timeRemaining: remainingSeconds, isExpired: false };
    }

    removeStorageValue(TEST_END_TIME_KEY);
    setStorageValue(TIMER_EXPIRED_KEY, "true");
    setStorageValue(FORCE_SUBMIT_KEY, "true");
    setStorageValue(FORCE_SUBMIT_REASON_KEY, "timer_expired");
    return { timeRemaining: 0, isExpired: true };
  }

  const durationSeconds = calculatedDuration * 60;
  const endTime = now + durationSeconds * 1000;
  setStorageValue(TEST_END_TIME_KEY, endTime.toString());
  return { timeRemaining: durationSeconds, isExpired: false };
};

const getInitialMalpracticeState = () => {
  if (typeof window === "undefined") {
    return { warningCount: 0, isTerminated: false, logs: [] as MalpracticeLogEntry[] };
  }

  const storedWarningCount = Number.parseInt(
    getStorageValue(MALPRACTICE_WARNING_KEY) ?? "0",
    10
  );

  return {
    warningCount: Number.isFinite(storedWarningCount) ? Math.max(0, storedWarningCount) : 0,
    isTerminated: getStorageValue(MALPRACTICE_TERMINATED_KEY) === "true",
    logs: safeParseLogs(getStorageValue(MALPRACTICE_LOGS_KEY)),
  };
};

export const useTest = ({ duration = 45, totalQuestions }: UseTestProps = {}) => {
  const calculatedDuration = totalQuestions ?? duration;
  const [timeRemaining, setTimeRemaining] = useState(() =>
    getInitialTimerState(calculatedDuration).timeRemaining
  );
  const [isExpired, setIsExpired] = useState(() =>
    getInitialTimerState(calculatedDuration).isExpired
  );

  useEffect(() => {
    if (timeRemaining <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setTimeRemaining((previous) => {
        const next = previous - 1;
        if (next <= 0) {
          setIsExpired(true);
          removeStorageValue(TEST_END_TIME_KEY);
          return 0;
        }

        return next;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [timeRemaining]);

  useEffect(() => {
    if (!isExpired) {
      return;
    }

    setStorageValue(TIMER_EXPIRED_KEY, "true");
    setStorageValue(FORCE_SUBMIT_KEY, "true");
    setStorageValue(FORCE_SUBMIT_REASON_KEY, "timer_expired");
  }, [isExpired]);

  const formatTime = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  }, []);

  const resetTimer = useCallback(() => {
    removeStorageValue(TEST_END_TIME_KEY);
    removeStorageValue(TIMER_EXPIRED_KEY);
    removeStorageValue(FORCE_SUBMIT_KEY);
    removeStorageValue(FORCE_SUBMIT_REASON_KEY);

    const durationSeconds = calculatedDuration * 60;
    const endTime = Date.now() + durationSeconds * 1000;
    setStorageValue(TEST_END_TIME_KEY, endTime.toString());
    setTimeRemaining(durationSeconds);
    setIsExpired(false);
  }, [calculatedDuration]);

  return {
    timeRemaining,
    isExpired,
    formattedTime: formatTime(timeRemaining),
    resetTimer,
    totalTime: calculatedDuration * 60,
  };
};

type ForceSubmitReason = "timer_expired" | "malpractice_limit" | null;

const getInitialForceSubmitReason = (): ForceSubmitReason => {
  if (typeof window === "undefined") {
    return null;
  }

  const storedReason = getStorageValue(FORCE_SUBMIT_REASON_KEY);

  if (storedReason === "timer_expired" || storedReason === "malpractice_limit") {
    return storedReason;
  }

  return null;
};

export const useMalpracticeWarning = () => {
  const [{ warningCount, isTerminated, logs }, setMalpracticeState] = useState(
    getInitialMalpracticeState
  );
  const [forceSubmitReason, setForceSubmitReason] = useState<ForceSubmitReason>(
    getInitialForceSubmitReason
  );

  useEffect(() => {
    setStorageValue(MALPRACTICE_WARNING_KEY, warningCount.toString());
    setStorageValue(MALPRACTICE_LOGS_KEY, JSON.stringify(logs.slice(0, 50)));

    if (warningCount >= MAX_WARNING_COUNT) {
      setForceSubmitReason("malpractice_limit");
      setStorageValue(FORCE_SUBMIT_KEY, "true");
      setStorageValue(FORCE_SUBMIT_REASON_KEY, "malpractice_limit");
    }

    void syncToBackendIfAvailable(warningCount, false, logs.slice(0, 50));
  }, [logs, warningCount]);

  const addWarning = useCallback(
    (type = "tab_switch") => {
      if (typeof window === "undefined") {
        return;
      }

      setMalpracticeState((previous) => {
        if (previous.warningCount >= MAX_WARNING_COUNT) {
          return previous;
        }

        const nextWarningCount = previous.warningCount + 1;
        const nextLogs = [{ type, timestamp: Date.now() }, ...previous.logs].slice(0, 50);

        return {
          warningCount: Math.min(nextWarningCount, MAX_WARNING_COUNT),
          isTerminated: false,
          logs: nextLogs,
        };
      });
    },
    []
  );

  const resetWarnings = useCallback(() => {
    setMalpracticeState({ warningCount: 0, isTerminated: false, logs: [] });
    setForceSubmitReason(null);
    removeStorageValue(MALPRACTICE_WARNING_KEY);
    removeStorageValue(MALPRACTICE_TERMINATED_KEY);
    removeStorageValue(MALPRACTICE_LOGS_KEY);
    removeStorageValue(FORCE_SUBMIT_KEY);
    removeStorageValue(FORCE_SUBMIT_REASON_KEY);
  }, []);

  const markCompleted = useCallback(() => {
    resetWarnings();
  }, [resetWarnings]);

  return {
    warningCount,
    isTerminated,
    logs,
    addWarning,
    resetWarnings,
    markCompleted,
    forceSubmitReason,
  };
};
