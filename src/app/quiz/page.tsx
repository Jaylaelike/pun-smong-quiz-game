import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import { getNextQuestion } from "@/actions/quiz";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/user";
import { QuizClient } from "@/components/quiz/quiz-client";

const QuizPage = async () => {
  const { userId } = auth();
  if (!userId) {
    redirect("/auth/sign-in");
  }

  const dbUser = await getOrCreateUser();
  const [question, user] = await Promise.all([
    getNextQuestion(),
    dbUser
      ? prisma.user.findUnique({
          where: { id: dbUser.id },
          include: { _count: { select: { responses: true } } }
        })
      : null
  ]);
  const totalQuestions = await prisma.question.count({ where: { isActive: true } });

  return (
    <QuizClient
      initialQuestion={question}
      stats={{
        answered: user?._count.responses ?? 0,
        total: totalQuestions,
        score: user?.totalScore ?? 0
      }}
    />
  );
};

export default QuizPage;

