"use server";

import { auth, currentUser } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";
import { getOrCreateUser } from "@/lib/user";

export const getDashboardData = async () => {
  const { userId } = auth();
  if (!userId) return null;

  const dbUser = await getOrCreateUser();
  if (!dbUser) return null;

  const user = await prisma.user.findUnique({
    where: { id: dbUser.id },
    include: {
      responses: {
        orderBy: { answeredAt: "desc" },
        take: 10,
        include: { question: true }
      },
      _count: {
        select: { responses: true }
      }
    }
  });

  if (!user) return null;

  const totalQuestions = await prisma.question.count({ where: { isActive: true } });

  return {
    user,
    totalQuestions
  };
};

export const getAdminStats = async () => {
  const user = await currentUser();
  if (!isAdmin(user)) return null;

  const [questions, totalUsers, responsesToday] = await Promise.all([
    prisma.question.count(),
    prisma.user.count(),
    prisma.userResponse.count({
      where: {
        answeredAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    })
  ]);

  return {
    questions,
    totalUsers,
    responsesToday
  };
};

