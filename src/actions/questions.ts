"use server";

import { revalidatePath } from "next/cache";
import { auth, currentUser } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";

const assertAdmin = async () => {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await currentUser();
  if (!isAdmin(user)) throw new Error("Forbidden");
};

type ListQuestionsParams = {
  page?: number;
  limit?: number;
  search?: string;
  difficulty?: string;
  isActive?: boolean;
  sortBy?: "createdAt" | "updatedAt" | "points" | "difficulty";
  sortOrder?: "asc" | "desc";
};

export const listQuestions = async (params: ListQuestionsParams = {}) => {
  const {
    page = 1,
    limit = 20,
    search = "",
    difficulty,
    isActive,
    sortBy = "createdAt",
    sortOrder = "desc"
  } = params;

  const skip = (page - 1) * limit;
  const where: any = {};

  if (search) {
    where.question = {
      contains: search,
      mode: "insensitive"
    };
  }

  if (difficulty) {
    where.difficulty = difficulty;
  }

  if (isActive !== undefined) {
    where.isActive = isActive;
  }

  const [questions, total] = await Promise.all([
    prisma.question.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder }
    }),
    prisma.question.count({ where })
  ]);

  return {
    questions,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + questions.length < total
    }
  };
};

export const createQuestion = async (data: {
  question: string;
  options: string[];
  correctAnswer: string;
  difficulty: string;
  category?: string;
  points: number;
  isActive: boolean;
}) => {
  await assertAdmin();
  const { options, ...rest } = data;
  const created = await prisma.question.create({
    data: {
      ...rest,
      options: JSON.stringify(options)
    }
  });
  revalidatePath("/admin/questions");
  return created;
};

export const updateQuestion = async (id: string, data: Partial<{
  question: string;
  options: string[];
  correctAnswer: string;
  difficulty: string;
  category?: string;
  points: number;
  isActive: boolean;
}>) => {
  await assertAdmin();
  const { options, ...rest } = data;
  const updated = await prisma.question.update({
    where: { id },
    data: {
      ...rest,
      ...(options ? { options: JSON.stringify(options) } : {})
    }
  });
  revalidatePath("/admin/questions");
  return updated;
};

export const deleteQuestion = async (id: string) => {
  await assertAdmin();
  await prisma.question.delete({
    where: { id }
  });
  revalidatePath("/admin/questions");
};

export const bulkCreateQuestions = async (questions: Array<{
  question: string;
  options: string[];
  correctAnswer: string;
  difficulty: string;
  category?: string;
  points?: number;
  isActive?: boolean;
}>) => {
  await assertAdmin();
  
  const result = await prisma.$transaction(
    async (tx) => {
      return Promise.all(
        questions.map((q) =>
          tx.question.create({
            data: {
              question: q.question,
              options: JSON.stringify(q.options),
              correctAnswer: q.correctAnswer,
              difficulty: q.difficulty,
              category: q.category,
              points: q.points ?? 10,
              isActive: q.isActive ?? true
            }
          })
        )
      );
    },
    {
      timeout: 30000 // 30 seconds for large batches
    }
  );

  revalidatePath("/admin/questions");
  return result;
};

