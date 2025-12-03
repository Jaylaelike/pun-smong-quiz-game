"use server";

import { clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export type LeaderboardRange = "all" | "weekly" | "monthly";

export const getLeaderboard = async (
  limit = 50,
  range: LeaderboardRange = "all"
) => {
  /* -------------------------------------------------
   * 1.  ALL-TIME  –  order by first answer ever
   * ------------------------------------------------- */
  if (range === "all") {
    /* pull every response so we can compute the first answeredAt per user */
    const allResponses = await prisma.userResponse.findMany({
      select: { userId: true, answeredAt: true }
    });

    /* map userId → earliest answer */
    const firstAnswerMap = new Map<string, Date>();
    for (const r of allResponses) {
      const cur = firstAnswerMap.get(r.userId);
      if (!cur || r.answeredAt < cur) firstAnswerMap.set(r.userId, r.answeredAt);
    }

    const users = await prisma.user.findMany({
      where: { id: { in: [...firstAnswerMap.keys()] } },
      include: { _count: { select: { responses: true } } }
    });

    /* sort: first timestamp wins */
    users.sort(
      (a, b) =>
        firstAnswerMap.get(a.id)!.getTime() -
        firstAnswerMap.get(b.id)!.getTime()
    );

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
      return {
        id: user.id,
        username: user.username ?? user.email,
        totalScore: user.totalScore,
        questionsAnswered: user._count.responses,
        lastAnsweredAt: firstAnswerMap.get(user.id)!,
        imageUrl: clerkData?.imageUrl ?? null,
        rank: index + 1
      };
    });
  }

  /* -------------------------------------------------
   * 2.  WEEKLY / MONTHLY  –  order by first answer inside window
   * ------------------------------------------------- */
  const boundary = new Date();
  boundary.setDate(boundary.getDate() - (range === "weekly" ? 7 : 30));

  /* grab every response in the window */
  const windowResponses = await prisma.userResponse.findMany({
    where: { answeredAt: { gte: boundary } },
    select: { userId: true, answeredAt: true, points: true }
  });

  /* build two maps in one pass */
  const firstInWindowMap = new Map<string, Date>();
  const scoreInWindowMap  = new Map<string, number>();
  for (const r of windowResponses) {
    /* first timestamp */
    const cur = firstInWindowMap.get(r.userId);
    if (!cur || r.answeredAt < cur) firstInWindowMap.set(r.userId, r.answeredAt);
    /* total points */
    scoreInWindowMap.set(r.userId, (scoreInWindowMap.get(r.userId) ?? 0) + r.points);
  }

  const userIds = [...firstInWindowMap.keys()];
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    include: { _count: { select: { responses: true } } }
  });

  /* sort: first timestamp wins */
  users.sort(
    (a, b) =>
      firstInWindowMap.get(a.id)!.getTime() -
      firstInWindowMap.get(b.id)!.getTime()
  );

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
    return {
      id: user.id,
      username: user.username ?? user.email ?? "Player",
      totalScore: scoreInWindowMap.get(user.id) ?? 0,
      questionsAnswered: user._count.responses,
      lastAnsweredAt: firstInWindowMap.get(user.id)!,
      imageUrl: clerkData?.imageUrl ?? null,
      rank: index + 1
    };
  });
};