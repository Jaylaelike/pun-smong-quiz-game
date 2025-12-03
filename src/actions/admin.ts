"use server";

import { revalidatePath } from "next/cache";
import { currentUser } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";

export const resetRewards = async (options?: { clearHistory?: boolean }) => {
  const user = await currentUser();
  if (!isAdmin(user)) {
    throw new Error("Forbidden");
  }

  const clearHistory = options?.clearHistory ?? true;

  await prisma.$transaction([
    prisma.user.updateMany({
      data: {
        totalScore: 0,
        rank: null
      }
    }),
    ...(clearHistory
      ? [
          prisma.userResponse.deleteMany({})
        ]
      : [])
  ]);

  revalidatePath("/leaderboard");
  revalidatePath("/dashboard");
  revalidatePath("/quiz");
  revalidatePath("/admin");
};

export const checkIsAdmin = async () => {
  const user = await currentUser();
  return isAdmin(user);
};


