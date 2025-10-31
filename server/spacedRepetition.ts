/**
 * SM-2 Spaced Repetition Algorithm
 * 
 * This implements the SuperMemo 2 algorithm for optimal review timing.
 * The algorithm adjusts review intervals based on how well the user recalls information.
 */

export interface SpacedRepetitionResult {
  easeFactor: number;
  interval: number;
  nextReviewDate: Date;
  isMastered: boolean;
}

/**
 * Calculate next review using SM-2 algorithm
 * 
 * @param quality - Answer quality (0-5):
 *   5 - Perfect response
 *   4 - Correct response with hesitation
 *   3 - Correct response with difficulty
 *   2 - Incorrect but remembered
 *   1 - Incorrect, barely remembered
 *   0 - Complete blackout
 * @param currentEaseFactor - Current ease factor (stored as integer 100-300, representing 1.0-3.0)
 * @param currentInterval - Current interval in days
 * @param consecutiveCorrect - Number of consecutive correct answers
 * @returns Updated spaced repetition parameters
 */
export function calculateNextReview(
  quality: number,
  currentEaseFactor: number = 250, // Default 2.5
  currentInterval: number = 0,
  consecutiveCorrect: number = 0
): SpacedRepetitionResult {
  // Ensure quality is in valid range
  quality = Math.max(0, Math.min(5, quality));
  
  // Convert ease factor from storage format (100-300) to actual value (1.0-3.0)
  let easeFactor = currentEaseFactor / 100;
  
  // Calculate new ease factor
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  
  // Minimum ease factor is 1.3
  if (easeFactor < 1.3) {
    easeFactor = 1.3;
  }
  
  let interval = currentInterval;
  let repetitions = consecutiveCorrect;
  
  // If quality < 3, reset interval and repetitions
  if (quality < 3) {
    interval = 0;
    repetitions = 0;
  } else {
    // Correct answer, increase interval
    if (repetitions === 0) {
      interval = 1; // First review: 1 day
    } else if (repetitions === 1) {
      interval = 6; // Second review: 6 days
    } else {
      // Subsequent reviews: multiply by ease factor
      interval = Math.round(currentInterval * easeFactor);
    }
    repetitions++;
  }
  
  // Calculate next review date
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + interval);
  nextReviewDate.setHours(0, 0, 0, 0); // Set to start of day
  
  // Determine if mastered (3+ consecutive correct with interval >= 21 days)
  const isMastered = repetitions >= 3 && interval >= 21;
  
  return {
    easeFactor: Math.round(easeFactor * 100), // Convert back to storage format
    interval,
    nextReviewDate,
    isMastered,
  };
}

/**
 * Determine quality score based on answer correctness and time taken
 * 
 * @param isCorrect - Whether the answer was correct
 * @param timeTaken - Time taken to answer in seconds (optional)
 * @returns Quality score 0-5
 */
export function determineQuality(isCorrect: boolean, timeTaken?: number): number {
  if (!isCorrect) {
    return 1; // Incorrect but tried
  }
  
  // If no time tracking, default to good quality
  if (timeTaken === undefined) {
    return 4; // Correct with slight hesitation
  }
  
  // Quick answers (< 10 seconds) = Perfect
  if (timeTaken < 10) {
    return 5;
  }
  
  // Medium speed (10-30 seconds) = Good
  if (timeTaken < 30) {
    return 4;
  }
  
  // Slow (30-60 seconds) = Okay
  if (timeTaken < 60) {
    return 3;
  }
  
  // Very slow (> 60 seconds) = Difficult
  return 2;
}

/**
 * Check if a question is due for review
 * 
 * @param nextReviewDate - The scheduled next review date
 * @returns Whether the question is due for review
 */
export function isDueForReview(nextReviewDate: Date | null): boolean {
  if (!nextReviewDate) {
    return true; // Never reviewed, so it's due
  }
  
  const now = new Date();
  now.setHours(0, 0, 0, 0); // Compare dates only
  
  return nextReviewDate <= now;
}
