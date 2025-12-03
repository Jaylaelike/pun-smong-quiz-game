export const BASE_POINTS = 10;
export const BONUS_MULTIPLIER = 5;
export const QUESTION_DURATION_MS = 30_000;

export const calculateScore = (isCorrect: boolean, responseTime: number) => {
  if (!isCorrect) return 0;

  const clampedTime = Math.min(Math.max(responseTime, 0), QUESTION_DURATION_MS);
  const timeRemaining = QUESTION_DURATION_MS - clampedTime;
  const timeBonus = Math.floor((timeRemaining / QUESTION_DURATION_MS) * BONUS_MULTIPLIER);

  return BASE_POINTS + timeBonus;
};

