import { prisma } from "@/lib/prisma";

export const updateRanks = async () => {
  const users = await prisma.user.findMany({
    orderBy: { totalScore: "desc" },
    select: { id: true }
  });

  await Promise.all(
    users.map((user, index) =>
      prisma.user.update({
        where: { id: user.id },
        data: { rank: index + 1 }
      })
    )
  );
};

