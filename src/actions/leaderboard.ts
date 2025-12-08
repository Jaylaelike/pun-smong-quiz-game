"use server";

import { clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export type LeaderboardRange = "all" | "weekly" | "monthly";

export const getLeaderboard = async (
  limit = 50,
  range: LeaderboardRange = "all"
) => {
  /* -------------------------------------------------
   * 1.  ALL-TIME  –  order by first CORRECT answer
   * ------------------------------------------------- */
  if (range === "all") {
    /* Only get correct responses */
    const correctResponses = await prisma.userResponse.findMany({
      where: { isCorrect: true },
      select: { userId: true, answeredAt: true, questionId: true },
      orderBy: { answeredAt: "asc" }
    });

    /* For each question, find who answered correctly first */
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

    /* Calculate user stats */
    const userStats = new Map<string, { 
      firstCorrectCount: number; 
      totalCorrect: number; 
      earliestAnswer: Date;
    }>();
    
    for (const response of correctResponses) {
      const isFirst = questionFirstCorrect.get(response.questionId)?.userId === response.userId;
      const current = userStats.get(response.userId);
      
      if (!current) {
        userStats.set(response.userId, {
          firstCorrectCount: isFirst ? 1 : 0,
          totalCorrect: 1,
          earliestAnswer: response.answeredAt
        });
      } else {
        userStats.set(response.userId, {
          firstCorrectCount: current.firstCorrectCount + (isFirst ? 1 : 0),
          totalCorrect: current.totalCorrect + 1,
          earliestAnswer: current.earliestAnswer < response.answeredAt 
            ? current.earliestAnswer 
            : response.answeredAt
        });
      }
    }

    /* Get all users with correct answers */
    const users = await prisma.user.findMany({
      where: { id: { in: Array.from(userStats.keys()) } },
      include: { _count: { select: { responses: true } } }
    });

    /* Sort by ranking criteria */
    users.sort((a, b) => {
      const statsA = userStats.get(a.id)!;
      const statsB = userStats.get(b.id)!;
      
      // 1. First correct count (desc)
      if (statsB.firstCorrectCount !== statsA.firstCorrectCount) {
        return statsB.firstCorrectCount - statsA.firstCorrectCount;
      }
      // 2. Total correct (desc)
      if (statsB.totalCorrect !== statsA.totalCorrect) {
        return statsB.totalCorrect - statsA.totalCorrect;
      }
      // 3. Earliest answer (asc - earlier is better)
      return statsA.earliestAnswer.getTime() - statsB.earliestAnswer.getTime();
    });

    const clerkUsers = await Promise.all(
      users.slice(0, limit).map(async (user) => {
        try {
          const clerkUser = await clerkClient.users.getUser(user.clerkId);
          return {
            clerkId: user.clerkId,
            imageUrl: clerkUser.imageUrl,
            email: clerkUser.emailAddresses[0]?.emailAddress
          };
        } catch {
          return { clerkId: user.clerkId, imageUrl: null, email: null };
        }
      })
    );

    const clerkUserMap = new Map(
      clerkUsers.map((cu) => [cu.clerkId, cu])
    );

    return users.slice(0, limit).map((user, index) => {
      const clerkData = clerkUserMap.get(user.clerkId);
      const stats = userStats.get(user.id)!;
      return {
        id: user.id,
        username: user.username ?? user.email,
        totalScore: user.totalScore,
        questionsAnswered: user._count.responses,
        lastAnsweredAt: stats.earliestAnswer,
        imageUrl: clerkData?.imageUrl ?? null,
        rank: index + 1
      };
    });
  }

  /* -------------------------------------------------
   * 2.  WEEKLY / MONTHLY  –  order by first CORRECT answer inside window
   * ------------------------------------------------- */
  const boundary = new Date();
  boundary.setDate(boundary.getDate() - (range === "weekly" ? 7 : 30));

  /* Only get correct responses in the window */
  const windowResponses = await prisma.userResponse.findMany({
    where: { 
      answeredAt: { gte: boundary },
      isCorrect: true
    },
    select: { userId: true, answeredAt: true, questionId: true, points: true },
    orderBy: { answeredAt: "asc" }
  });

  /* For each question in window, find who answered correctly first */
  const questionFirstCorrect = new Map<string, { userId: string; answeredAt: Date }>();
  for (const response of windowResponses) {
    const existing = questionFirstCorrect.get(response.questionId);
    if (!existing || response.answeredAt < existing.answeredAt) {
      questionFirstCorrect.set(response.questionId, {
        userId: response.userId,
        answeredAt: response.answeredAt
      });
    }
  }

  /* Calculate user stats in window */
  const userStats = new Map<string, { 
    firstCorrectCount: number; 
    totalCorrect: number; 
    earliestAnswer: Date;
    totalScore: number;
  }>();
  
  for (const response of windowResponses) {
    const isFirst = questionFirstCorrect.get(response.questionId)?.userId === response.userId;
    const current = userStats.get(response.userId);
    
    if (!current) {
      userStats.set(response.userId, {
        firstCorrectCount: isFirst ? 1 : 0,
        totalCorrect: 1,
        earliestAnswer: response.answeredAt,
        totalScore: response.points
      });
    } else {
      userStats.set(response.userId, {
        firstCorrectCount: current.firstCorrectCount + (isFirst ? 1 : 0),
        totalCorrect: current.totalCorrect + 1,
        earliestAnswer: current.earliestAnswer < response.answeredAt 
          ? current.earliestAnswer 
          : response.answeredAt,
        totalScore: current.totalScore + response.points
      });
    }
  }

  const userIds = Array.from(userStats.keys());
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    include: { _count: { select: { responses: true } } }
  });

  /* Sort by ranking criteria */
  users.sort((a, b) => {
    const statsA = userStats.get(a.id)!;
    const statsB = userStats.get(b.id)!;
    
    // 1. First correct count (desc)
    if (statsB.firstCorrectCount !== statsA.firstCorrectCount) {
      return statsB.firstCorrectCount - statsA.firstCorrectCount;
    }
    // 2. Total correct (desc)
    if (statsB.totalCorrect !== statsA.totalCorrect) {
      return statsB.totalCorrect - statsA.totalCorrect;
    }
    // 3. Earliest answer (asc - earlier is better)
    return statsA.earliestAnswer.getTime() - statsB.earliestAnswer.getTime();
  });

  const clerkUsers = await Promise.all(
    users.slice(0, limit).map(async (user) => {
      try {
        const clerkUser = await clerkClient.users.getUser(user.clerkId);
        return {
          clerkId: user.clerkId,
          imageUrl: clerkUser.imageUrl,
          email: clerkUser.emailAddresses[0]?.emailAddress
        };
      } catch {
        return { clerkId: user.clerkId, imageUrl: null, email: null };
      }
    })
  );

  const clerkUserMap = new Map(
    clerkUsers.map((cu) => [cu.clerkId, cu])
  );

  return users.slice(0, limit).map((user, index) => {
    const clerkData = clerkUserMap.get(user.clerkId);
    const stats = userStats.get(user.id)!;
    return {
      id: user.id,
      username: user.username ?? user.email ?? "Player",
      totalScore: stats.totalScore,
      questionsAnswered: user._count.responses,
      lastAnsweredAt: stats.earliestAnswer,
      imageUrl: clerkData?.imageUrl ?? null,
      rank: index + 1
    };
  });
};