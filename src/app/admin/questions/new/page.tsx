import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { QuestionForm } from "@/components/admin/question-form";
import { Button } from "@/components/ui/button";
import { isAdmin } from "@/lib/auth";

const NewQuestionPage = async () => {
  const { userId } = auth();
  if (!userId) redirect("/auth/sign-in");

  const clerkUser = await currentUser();
  if (!isAdmin(clerkUser)) redirect("/dashboard");

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-3xl">
        <div className="mb-6">
          <Button
            asChild
            variant="ghost"
            className="text-white/80 hover:text-white hover:bg-white/10 mb-4"
          >
            <Link href="/admin/questions">
              <ArrowLeft className="mr-2 h-4 w-4" />
              กลับไปยังรายการคำถาม
            </Link>
          </Button>
          <h1 className="text-4xl font-bold text-white mb-2">สร้างคำถาม</h1>
          <p className="text-white/70">เพิ่มคำถามใหม่เข้าสู่ระบบ</p>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl p-8">
          <QuestionForm />
        </div>
      </div>
    </div>
  );
};

export default NewQuestionPage;

