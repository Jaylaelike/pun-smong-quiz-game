import { notFound, redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";
import { QuestionForm } from "@/components/admin/question-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isAdmin } from "@/lib/auth";

type EditQuestionPageProps = {
  params: { id: string };
};

const EditQuestionPage = async ({ params }: EditQuestionPageProps) => {
  const { userId } = auth();
  if (!userId) redirect("/auth/sign-in");

  const clerkUser = await currentUser();
  if (!isAdmin(clerkUser)) redirect("/dashboard");

  const question = await prisma.question.findUnique({
    where: { id: params.id }
  });

  if (!question) {
    notFound();
  }

  return (
    <Card className="max-w-4xl">
      <CardHeader>
        <CardTitle>แก้ไขคำถาม</CardTitle>
      </CardHeader>
      <CardContent>
        <QuestionForm question={question} />
      </CardContent>
    </Card>
  );
};

export default EditQuestionPage;

