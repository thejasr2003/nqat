"use client";

import { useState, useEffect, useCallback } from "react";

interface useTestProps {
  duration?: number; // in minutes (for fixed timer)
  totalQuestions?: number; // for dynamic timer (1 minute per question)
}

export const useTest = ({
  duration = 45,
  totalQuestions,
}: useTestProps = {}) => {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isExpired, setIsExpired] = useState(false);

  // Calculate duration: if totalQuestions provided, use 1 minute per question
  const calculatedDuration = totalQuestions ? totalQuestions : duration;

  // Initialize timer once on mount
  useEffect(() => {
    const storedEndTime = localStorage.getItem("testEndTime");
    const now = Date.now();

    if (storedEndTime) {
      const endTime = parseInt(storedEndTime);
      const remainingSeconds = Math.floor((endTime - now) / 1000);

      if (remainingSeconds > 0) {
        setTimeRemaining(remainingSeconds);
      } else {
        setIsExpired(true);
        localStorage.removeItem("testEndTime");
      }
    } else {
      // Set new timer
      const durationSeconds = calculatedDuration * 60;
      const endTime = now + durationSeconds * 1000;
      localStorage.setItem("testEndTime", endTime.toString());
      setTimeRemaining(durationSeconds);
    }
  }, [calculatedDuration]);

  // Countdown timer
  useEffect(() => {
    if (timeRemaining <= 0) {
      setIsExpired(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          setIsExpired(true);
          localStorage.removeItem("testEndTime");
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, []);

  const resetTimer = useCallback(() => {
    localStorage.removeItem("testEndTime");
    const endTime = Date.now() + duration * 60 * 1000;
    localStorage.setItem("testEndTime", endTime.toString());
    setTimeRemaining(duration * 60);
    setIsExpired(false);
  }, [duration]);

  return {
    timeRemaining,
    isExpired,
    formattedTime: formatTime(timeRemaining),
    resetTimer,
    totalTime: calculatedDuration * 60, // for progress bar calculation
  };
};
