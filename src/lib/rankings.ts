import { prisma } from "@/lib/prisma";

/**
 * Updates user ranks based on who answered correctly first.
 * Ranking priority:
 * 1. Only correct answers count
 * 2. Earliest correct answer timestamp wins
 * 3. Users with more correct answers ranked higher
 */
export const updateRanks = async () => {
  // Get all correct responses with timestamps
  const correctResponses = await prisma.userResponse.findMany({
    where: { isCorrect: true },
    select: {
      userId: true,
      answeredAt: true,
      questionId: true
    },
    orderBy: { answeredAt: "asc" }
  });

  // For each question, find who answered correctly first
  const questionFirstCorrect = new Map<string, { userId: string; answeredAt: Date }>();
  for (const response of correctResponses) {
    const existing = questionFirstCorrect.get(response.questionId);
    if (!existing || response.answeredAt < existing.answeredAt) {
      questionFirstCorrect.set(response.questionId, {
        userId: response.userId,
        answeredAt: response.answeredAt
      });
    }
  }

  // Calculate ranking score for each user
  // Score = number of questions answered correctly first + total correct answers
  const userScores = new Map<string, { firstCorrectCount: number; totalCorrect: number; earliestAnswer: Date }>();
  
  for (const response of correctResponses) {
    const isFirst = questionFirstCorrect.get(response.questionId)?.userId === response.userId;
    const current = userScores.get(response.userId);
    
    if (!current) {
      userScores.set(response.userId, {
        firstCorrectCount: isFirst ? 1 : 0,
        totalCorrect: 1,
        earliestAnswer: response.answeredAt
      });
    } else {
      userScores.set(response.userId, {
        firstCorrectCount: current.firstCorrectCount + (isFirst ? 1 : 0),
        totalCorrect: current.totalCorrect + 1,
        earliestAnswer: current.earliestAnswer < response.answeredAt 
          ? current.earliestAnswer 
          : response.answeredAt
      });
    }
  }

  // Sort users by:
  // 1. Number of first correct answers (desc)
  // 2. Total correct answers (desc)
  // 3. Earliest correct answer timestamp (asc - earlier is better)
  const sortedUsers = Array.from(userScores.entries())
    .map(([userId, score]) => ({ userId, ...score }))
    .sort((a, b) => {
      // First: compare first correct count
      if (b.firstCorrectCount !== a.firstCorrectCount) {
        return b.firstCorrectCount - a.firstCorrectCount;
      }
      // Second: compare total correct
      if (b.totalCorrect !== a.totalCorrect) {
        return b.totalCorrect - a.totalCorrect;
      }
      // Third: compare earliest answer (earlier is better)
      return a.earliestAnswer.getTime() - b.earliestAnswer.getTime();
    });

  // Update ranks
  await Promise.all(
    sortedUsers.map((user, index) =>
      prisma.user.update({
        where: { id: user.userId },
        data: { rank: index + 1 }
      })
    )
  );

  // Set rank to null for users with no correct answers
  const usersWithCorrectAnswers = new Set(sortedUsers.map(u => u.userId));
  await prisma.user.updateMany({
    where: {
      id: { notIn: Array.from(usersWithCorrectAnswers) }
    },
    data: { rank: null }
  });
};

