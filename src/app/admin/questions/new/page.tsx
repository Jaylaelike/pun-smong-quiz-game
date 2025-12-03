import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";

import { QuestionForm } from "@/components/admin/question-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isAdmin } from "@/lib/auth";

const NewQuestionPage = async () => {
  const { userId } = auth();
  if (!userId) redirect("/auth/sign-in");

  const clerkUser = await currentUser();
  if (!isAdmin(clerkUser)) redirect("/dashboard");

  return (
    <Card className="max-w-4xl">
      <CardHeader>
        <CardTitle>สร้างคำถาม</CardTitle>
      </CardHeader>
      <CardContent>
        <QuestionForm />
      </CardContent>
    </Card>
  );
};

export default NewQuestionPage;

