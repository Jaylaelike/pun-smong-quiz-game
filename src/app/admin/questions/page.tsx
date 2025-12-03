import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import { Pencil, PlusCircle, Trash } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DeleteQuestionButton } from "@/components/admin/delete-question-button";
import { BulkImport } from "@/components/admin/bulk-import";
import { parseQuestionOptions } from "@/lib/questions";

const AdminQuestionsPage = async () => {
  const { userId } = auth();
  if (!userId) redirect("/auth/sign-in");

  const clerkUser = await currentUser();
  if (!isAdmin(clerkUser)) redirect("/dashboard");

  const questions = await prisma.question.findMany({
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm uppercase text-primary">คลังคำถาม</p>
          <h1 className="text-3xl font-semibold">จัดการคำถาม</h1>
        </div>
        <Button asChild>
          <Link href="/admin/questions/new">
            <PlusCircle className="mr-2 h-4 w-4" /> คำถามใหม่
          </Link>
        </Button>
      </div>

      <div className="grid gap-4">
        {questions.map((question) => {
          const options = parseQuestionOptions(question.options);
          return (
          <Card key={question.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div className="space-y-1">
                <CardTitle className="text-lg">{question.question}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  ความยาก: {question.difficulty} · คะแนน: {question.points}
                </p>
                <Badge variant={question.isActive ? "default" : "secondary"}>{question.isActive ? "เปิดใช้งาน" : "ปิดใช้งาน"}</Badge>
              </div>
              <div className="flex gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/admin/questions/${question.id}`}>
                    <Pencil className="mr-1 h-4 w-4" /> แก้ไข
                  </Link>
                </Button>
                <DeleteQuestionButton questionId={question.id} variant="destructive" size="sm">
                  <Trash className="mr-1 h-4 w-4" /> ลบ
                </DeleteQuestionButton>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              {options.map((option) => (
                <p key={option}>
                  {option} {option === question.correctAnswer && <span className="text-green-500">(ถูกต้อง)</span>}
                </p>
              ))}
            </CardContent>
          </Card>
        )})}
        {questions.length === 0 && <p className="text-muted-foreground">ยังไม่มีคำถาม สร้างคำถามเพื่อเริ่มต้น</p>}
      </div>

      <BulkImport />
    </div>
  );
};

export default AdminQuestionsPage;

