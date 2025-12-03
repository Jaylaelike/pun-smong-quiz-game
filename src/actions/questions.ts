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

export const listQuestions = async () => {
  const questions = await prisma.question.findMany({
    orderBy: { createdAt: "desc" }
  });
  return questions;
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

