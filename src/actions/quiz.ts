"use server";

import { revalidatePath } from "next/cache";
import { auth, currentUser } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";
import { calculateScore, QUESTION_DURATION_MS } from "@/lib/scoring";
import { updateRanks } from "@/lib/rankings";
import { getOrCreateUser } from "@/lib/user";

export const getNextQuestion = async () => {
  const { userId } = auth();
  if (!userId) return null;

  let dbUser = await prisma.user.findUnique({
    where: { clerkId: userId }
  });
  if (!dbUser) {
    dbUser = await getOrCreateUser();
    if (!dbUser) return null;
  }

  const answeredIds = await prisma.userResponse.findMany({
    where: { userId: dbUser.id },
    select: { questionId: true }
  });

  const nextQuestion = await prisma.question.findFirst({
    where: {
      isActive: true,
      id: { notIn: answeredIds.map((r) => r.questionId) }
    },
    orderBy: { createdAt: "asc" }
  });

  return nextQuestion;
};

export const submitAnswer = async (payload: { questionId: string; answer: string; responseTime: number }) => {
  const { userId } = auth();
  if (!userId) {
    return { error: "Not authenticated" };
  }

  let dbUser = await prisma.user.findUnique({
    where: { clerkId: userId }
  });
  if (!dbUser) {
    dbUser = await getOrCreateUser();
    if (!dbUser) {
      return { error: "User not found" };
    }
  }

  const question = await prisma.question.findUnique({
    where: { id: payload.questionId }
  });

  if (!question) {
    return { error: "Question missing" };
  }

  const existing = await prisma.userResponse.findUnique({
    where: {
      userId_questionId: { userId: dbUser.id, questionId: question.id }
    }
  });

  if (existing) {
    return { error: "Already answered" };
  }

  const sanitizedTime = Math.min(Math.max(payload.responseTime, 0), QUESTION_DURATION_MS);
  const isCorrect = question.correctAnswer === payload.answer;
  const score = calculateScore(isCorrect, sanitizedTime);

  await prisma.$transaction([
    prisma.userResponse.create({
      data: {
        userId: dbUser.id,
        questionId: question.id,
        answer: payload.answer,
        isCorrect,
        responseTime: sanitizedTime,
        points: score
      }
    }),
    prisma.user.update({
      where: { id: dbUser.id },
      data: {
        totalScore: { increment: score }
      }
    })
  ]);

  await updateRanks();

  revalidatePath("/dashboard");
  revalidatePath("/quiz");
  revalidatePath("/leaderboard");

  return { success: true, isCorrect, score, correctAnswer: question.correctAnswer };
};

