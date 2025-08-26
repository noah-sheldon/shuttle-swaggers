/**
 * Match Timer Utilities
 * Handles timing for matches - elapsed time since start
 */

export class MatchTimer {
  
  /**
   * Start a match timer
   */
  static startMatch(matchId: string): Date {
    const startTime = new Date();
    // Store in localStorage for client-side persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem(`match_${matchId}_start`, startTime.toISOString());
    }
    return startTime;
  }

  /**
   * Get elapsed time for a match in various formats
   */
  static getElapsedTime(startTime: Date): {
    seconds: number;
    minutes: number;
    formatted: string;
    formattedLong: string;
  } {
    const now = new Date();
    const elapsedMs = now.getTime() - startTime.getTime();
    const elapsedSeconds = Math.floor(elapsedMs / 1000);
    const minutes = Math.floor(elapsedSeconds / 60);
    const seconds = elapsedSeconds % 60;

    return {
      seconds: elapsedSeconds,
      minutes,
      formatted: `${minutes}:${seconds.toString().padStart(2, '0')}`,
      formattedLong: `${minutes}m ${seconds}s`
    };
  }

  /**
   * Get elapsed time from match start time string
   */
  static getElapsedTimeFromString(startTimeString: string): {
    seconds: number;
    minutes: number;
    formatted: string;
    formattedLong: string;
  } {
    const startTime = new Date(startTimeString);
    return this.getElapsedTime(startTime);
  }

  /**
   * Check if match has exceeded timeout
   */
  static hasExceededTimeout(startTime: Date, timeoutMinutes: number): boolean {
    const elapsed = this.getElapsedTime(startTime);
    return elapsed.minutes >= timeoutMinutes;
  }

  /**
   * Get time remaining until timeout
   */
  static getTimeRemaining(startTime: Date, timeoutMinutes: number): {
    seconds: number;
    minutes: number;
    formatted: string;
    isExpired: boolean;
  } {
    const elapsed = this.getElapsedTime(startTime);
    const remainingSeconds = (timeoutMinutes * 60) - elapsed.seconds;
    
    if (remainingSeconds <= 0) {
      return {
        seconds: 0,
        minutes: 0,
        formatted: '0:00',
        isExpired: true
      };
    }

    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;

    return {
      seconds: remainingSeconds,
      minutes,
      formatted: `${minutes}:${seconds.toString().padStart(2, '0')}`,
      isExpired: false
    };
  }

  /**
   * Format duration from seconds
   */
  static formatDuration(durationSeconds: number): string {
    const minutes = Math.floor(durationSeconds / 60);
    const seconds = durationSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  /**
   * Get session elapsed time
   */
  static getSessionElapsed(sessionStartTime: Date): {
    seconds: number;
    minutes: number;
    hours: number;
    formatted: string;
  } {
    const elapsed = this.getElapsedTime(sessionStartTime);
    const hours = Math.floor(elapsed.minutes / 60);
    const remainingMinutes = elapsed.minutes % 60;

    return {
      seconds: elapsed.seconds,
      minutes: elapsed.minutes,
      hours,
      formatted: hours > 0 
        ? `${hours}:${remainingMinutes.toString().padStart(2, '0')}:${(elapsed.seconds % 60).toString().padStart(2, '0')}`
        : `${elapsed.minutes}:${(elapsed.seconds % 60).toString().padStart(2, '0')}`
    };
  }

  /**
   * Client-side hook for real-time timer updates
   */
  static useRealTimeTimer(startTime: Date | null, intervalMs: number = 1000): {
    elapsed: {
      seconds: number;
      minutes: number;
      formatted: string;
      formattedLong: string;
    } | null;
  } {
    // This would be implemented as a React hook in the component
    // Returning the structure here for TypeScript support
    if (!startTime) {
      return { elapsed: null };
    }
    
    return { elapsed: this.getElapsedTime(startTime) };
  }
}