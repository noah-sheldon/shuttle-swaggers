'use client';

import { useState, useEffect } from 'react';
import { MatchTimer } from '@/lib/utils/matchTimer';

export function useMatchTimer(startTime: Date | null, intervalMs: number = 1000) {
  const [elapsed, setElapsed] = useState<{
    seconds: number;
    minutes: number;
    formatted: string;
    formattedLong: string;
  } | null>(null);

  useEffect(() => {
    if (!startTime) {
      setElapsed(null);
      return;
    }

    // Initial calculation
    setElapsed(MatchTimer.getElapsedTime(startTime));

    // Set up interval for real-time updates
    const interval = setInterval(() => {
      setElapsed(MatchTimer.getElapsedTime(startTime));
    }, intervalMs);

    return () => clearInterval(interval);
  }, [startTime, intervalMs]);

  return elapsed;
}

export function useSessionTimer(sessionStartTime: Date | null, intervalMs: number = 1000) {
  const [elapsed, setElapsed] = useState<{
    seconds: number;
    minutes: number;
    hours: number;
    formatted: string;
  } | null>(null);

  useEffect(() => {
    if (!sessionStartTime) {
      setElapsed(null);
      return;
    }

    // Initial calculation
    setElapsed(MatchTimer.getSessionElapsed(sessionStartTime));

    // Set up interval for real-time updates
    const interval = setInterval(() => {
      setElapsed(MatchTimer.getSessionElapsed(sessionStartTime));
    }, intervalMs);

    return () => clearInterval(interval);
  }, [sessionStartTime, intervalMs]);

  return elapsed;
}

export function useTimeRemaining(
  startTime: Date | null, 
  timeoutMinutes: number,
  intervalMs: number = 1000
) {
  const [timeRemaining, setTimeRemaining] = useState<{
    seconds: number;
    minutes: number;
    formatted: string;
    isExpired: boolean;
  } | null>(null);

  useEffect(() => {
    if (!startTime) {
      setTimeRemaining(null);
      return;
    }

    // Initial calculation
    setTimeRemaining(MatchTimer.getTimeRemaining(startTime, timeoutMinutes));

    // Set up interval for real-time updates
    const interval = setInterval(() => {
      const remaining = MatchTimer.getTimeRemaining(startTime, timeoutMinutes);
      setTimeRemaining(remaining);
      
      // Clear interval if expired to avoid unnecessary updates
      if (remaining.isExpired) {
        clearInterval(interval);
      }
    }, intervalMs);

    return () => clearInterval(interval);
  }, [startTime, timeoutMinutes, intervalMs]);

  return timeRemaining;
}