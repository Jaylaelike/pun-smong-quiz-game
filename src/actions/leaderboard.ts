"use server";

import { prisma } from "@/lib/prisma";

export type LeaderboardRange = "all" | "weekly" | "monthly";

export const getLeaderboard = async (limit = 50, range: LeaderboardRange = "all") => {
  if (range === "all") {
    const users = await prisma.user.findMany({
      orderBy: { totalScore: "desc" },
      take: limit,
      include: {
        responses: {
          select: { id: true }
        }
      }
    });

    return users.map((user, index) => ({
      id: user.id,
      username: user.username ?? user.email,
      totalScore: user.totalScore,
      questionsAnswered: user.responses.length,
      rank: index + 1
    }));
  }

  const boundary = new Date();
  boundary.setDate(boundary.getDate() - (range === "weekly" ? 7 : 30));

  const grouped = await prisma.userResponse.groupBy({
    by: ["userId"],
    where: { answeredAt: { gte: boundary } },
    _sum: { points: true },
    _count: { _all: true },
    orderBy: { _sum: { points: "desc" } },
    take: limit
  });

  const users = await prisma.user.findMany({
    where: { id: { in: grouped.map((g) => g.userId) } }
  });

  return grouped.map((record, index) => {
    const user = users.find((u) => u.id === record.userId);
    return {
      id: record.userId,
      username: user?.username ?? user?.email ?? "Player",
      totalScore: record._sum.points ?? 0,
      questionsAnswered: record._count._all,
      rank: index + 1
    };
  });
};

