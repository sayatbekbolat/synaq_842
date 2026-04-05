// Timer utilities with localStorage persistence

const STORAGE_KEY = "synaq_active_attempt";

export interface ActiveAttempt {
  attemptId: string;
  userId: string;
  startTime: number; // Unix timestamp in milliseconds
  status: "started" | "paused";
}

/**
 * Save active attempt to localStorage
 */
export function saveActiveAttempt(attempt: ActiveAttempt): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(attempt));
  } catch (error) {
    console.error("Failed to save attempt to localStorage:", error);
  }
}

/**
 * Get active attempt from localStorage
 */
export function getActiveAttempt(): ActiveAttempt | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const attempt: ActiveAttempt = JSON.parse(stored);

    // Validate that the attempt is not too old (max 2 hours)
    const now = Date.now();
    const elapsed = now - attempt.startTime;
    const maxDuration = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

    if (elapsed > maxDuration) {
      clearActiveAttempt();
      return null;
    }

    return attempt;
  } catch (error) {
    console.error("Failed to get attempt from localStorage:", error);
    return null;
  }
}

/**
 * Clear active attempt from localStorage
 */
export function clearActiveAttempt(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear attempt from localStorage:", error);
  }
}

/**
 * Calculate elapsed time in seconds
 */
export function calculateElapsedTime(startTime: number): number {
  const now = Date.now();
  const elapsed = now - startTime;
  return Math.floor(elapsed / 1000);
}

/**
 * Format time as MM:SS
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Format time as detailed string (e.g., "3m 24s")
 */
export function formatTimeDetailed(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  if (mins === 0) {
    return `${secs}s`;
  }

  return `${mins}m ${secs}s`;
}

/**
 * Check if there's an active climb in progress
 */
export function hasActiveClimb(): boolean {
  return getActiveAttempt() !== null;
}

/**
 * Get current climb duration
 */
export function getCurrentClimbDuration(): number {
  const attempt = getActiveAttempt();
  if (!attempt) return 0;

  return calculateElapsedTime(attempt.startTime);
}
