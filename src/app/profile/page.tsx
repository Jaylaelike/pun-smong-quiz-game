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
        <p className="text-sm uppercase text-primary">โปรไฟล์</p>
        <h1 className="text-4xl font-semibold">{user.username ?? user.email}</h1>
        <p className="text-muted-foreground">สมาชิกตั้งแต่ {user.createdAt.toLocaleDateString("th-TH")}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>คะแนนรวม</CardDescription>
            <CardTitle className="text-3xl">{user.totalScore}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>คำตอบที่บันทึก</CardDescription>
            <CardTitle className="text-3xl">{user._count.responses}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>อันดับ (คงที่)</CardDescription>
            <CardTitle className="text-3xl">{user.rank ?? "ยังไม่มี"}</CardTitle>
          </CardHeader>
        </Card>
      </div>
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">ประวัติ</h2>
        <div className="grid gap-4">
          {user.responses.map((response) => (
            <Card key={response.id}>
              <CardHeader>
                <CardTitle className="text-lg">{response.question.question}</CardTitle>
                <CardDescription>{response.answeredAt.toLocaleString("th-TH")}</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-1">
                <p>คำตอบของคุณ: {response.answer}</p>
                <p>คำตอบที่ถูกต้อง: {response.question.correctAnswer}</p>
                <p>คะแนน: {response.points}</p>
              </CardContent>
            </Card>
          ))}
          {user.responses.length === 0 && <p className="text-muted-foreground">ยังไม่มีประวัติ</p>}
        </div>
      </section>
    </div>
  );
};

export default ProfilePage;

