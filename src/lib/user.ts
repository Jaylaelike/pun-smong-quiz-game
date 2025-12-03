import { currentUser } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";

export const getOrCreateUser = async () => {
  const clerkUser = await currentUser();
  if (!clerkUser?.id || !clerkUser.primaryEmailAddress?.emailAddress) {
    return null;
  }

  const email = clerkUser.primaryEmailAddress.emailAddress;

  const existing = await prisma.user.findUnique({
    where: { clerkId: clerkUser.id }
  });

  if (existing) {
    return existing;
  }

  const created = await prisma.user.create({
    data: {
      clerkId: clerkUser.id,
      email,
      username: clerkUser.username ?? clerkUser.firstName ?? "Player"
    }
  });

  return created;
};

