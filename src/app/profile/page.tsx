import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/user";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const ProfilePage = async () => {
  const { userId } = auth();
  if (!userId) {
    redirect("/auth/sign-in");
  }

  const dbUser = await getOrCreateUser();
  if (!dbUser) {
    redirect("/dashboard");
  }

  const user = await prisma.user.findUnique({
    where: { id: dbUser.id },
    include: {
      responses: {
        include: { question: true },
        orderBy: { answeredAt: "desc" },
        take: 20
      },
      _count: {
        select: { responses: true }
      }
    }
  });

  if (!user) {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase text-purple-300">โปรไฟล์</p>
        <h1 className="text-4xl font-bold text-white">{user.username ?? user.email}</h1>
        <p className="text-white/70 mt-1">สมาชิกตั้งแต่ {user.createdAt.toLocaleDateString("th-TH")}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-white/20 bg-white/10 backdrop-blur-lg">
          <CardHeader>
            <CardDescription className="text-purple-300">คะแนนรวม</CardDescription>
            <CardTitle className="text-3xl text-white font-bold">{user.totalScore}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-white/20 bg-white/10 backdrop-blur-lg">
          <CardHeader>
            <CardDescription className="text-purple-300">คำตอบที่บันทึก</CardDescription>
            <CardTitle className="text-3xl text-white font-bold">{user._count.responses}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-white/20 bg-white/10 backdrop-blur-lg">
          <CardHeader>
            <CardDescription className="text-purple-300">อันดับ (คงที่)</CardDescription>
            <CardTitle className="text-3xl text-white font-bold">{user.rank ?? "ยังไม่มี"}</CardTitle>
          </CardHeader>
        </Card>
      </div>
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">ประวัติ</h2>
        <div className="grid gap-4">
          {user.responses.map((response) => (
            <Card key={response.id} className="border-white/20 bg-white/10 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="text-lg text-white">{response.question.question}</CardTitle>
                <CardDescription className="text-white/70">{response.answeredAt.toLocaleString("th-TH")}</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-white/80 space-y-1">
                <p>คำตอบของคุณ: <span className="text-white font-medium">{response.answer}</span></p>
                <p>คำตอบที่ถูกต้อง: {response.question.correctAnswer}</p>
                <p className="text-green-300 font-semibold">คะแนน: +{response.points}</p>
              </CardContent>
            </Card>
          ))}
          {user.responses.length === 0 && (
            <div className="rounded-xl border border-white/20 bg-white/5 p-8 text-center">
              <p className="text-white/70">ยังไม่มีประวัติ</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ProfilePage;

