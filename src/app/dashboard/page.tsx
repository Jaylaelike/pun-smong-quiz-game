import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import { getDashboardData } from "@/actions/dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Award, Activity, Sparkles } from "lucide-react";

const DashboardPage = async () => {
  const { userId } = auth();
  if (!userId) {
    redirect("/auth/sign-in");
  }

  const data = await getDashboardData();
  if (!data) {
    redirect("/quiz");
  }

  const statCards = [
    {
      label: "คะแนนรวม",
      value: data.user.totalScore,
      icon: Award,
      gradient: "from-indigo-500/20 to-indigo-200/40"
    },
    {
      label: "คำถามที่ตอบแล้ว",
      value: data.user._count.responses,
      icon: Activity,
      gradient: "from-orange-500/20 to-rose-200/40"
    },
    {
      label: "คำถามทั้งหมด",
      value: data.totalQuestions,
      icon: Sparkles,
      gradient: "from-violet-500/20 to-sky-200/40"
    }
  ];

  return (
    <div className="space-y-10">
      <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-sm">
        <p className="text-sm uppercase text-primary">แดชบอร์ด</p>
        <h1 className="text-3xl font-semibold">ยินดีต้อนรับกลับ, {data.user.username ?? "ผู้เล่น"} 👋</h1>
        <p className="text-muted-foreground">ติดตามสถิติของคุณ ตรวจสอบคะแนน และเข้าร่วมเกมถัดไป</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {statCards.map((stat) => (
          <Card key={stat.label} className="border-none bg-gradient-to-br p-[1px]" style={{ backgroundImage: `linear-gradient(135deg, rgba(99,102,241,0.4), transparent)` }}>
            <div className={cn("rounded-3xl bg-white/95 p-5", stat.gradient && `bg-gradient-to-br ${stat.gradient}`)}>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/70 text-primary shadow">
                <stat.icon className="h-5 w-5" />
              </div>
              <p className="text-sm uppercase text-muted-foreground">{stat.label}</p>
              <p className="text-4xl font-semibold text-gray-900">{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex flex-col gap-6 rounded-3xl border border-primary/20 bg-gradient-to-r from-indigo-600/90 via-purple-600/90 to-pink-500/90 p-6 text-white shadow-xl md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase text-white/80">พร้อมสำหรับเกมถัดไป?</p>
          <p className="text-3xl font-semibold">เริ่มเกมใหม่เลย</p>
        </div>
        <Button size="lg" asChild variant="secondary" className="text-primary">
          <a href="/quiz">เริ่มเล่น</a>
        </Button>
      </div>

      <section className="space-y-4">
        <div>
          <p className="text-sm uppercase text-primary">กิจกรรม</p>
          <h2 className="text-xl font-semibold">คำตอบล่าสุด</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {data.user.responses.length === 0 && <p className="text-muted-foreground">ยังไม่มีคำตอบ — เริ่มเล่นเลย!</p>}
          {data.user.responses.map((response) => (
            <Card key={response.id} className={cn("border-0 shadow-sm", response.isCorrect ? "bg-green-50/80" : "bg-rose-50/80")}>
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">{response.question.question}</CardTitle>
                <CardDescription className="text-sm">
                  ความยาก: {response.question.difficulty} · {new Intl.DateTimeFormat("th-TH", { month: "short", day: "numeric" }).format(response.answeredAt)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-1 text-sm text-muted-foreground">
                <p>
                  คำตอบของคุณ: <span className="font-medium text-gray-900">{response.answer}</span>
                </p>
                <p>คำตอบที่ถูกต้อง: {response.question.correctAnswer}</p>
                <p>คะแนนที่ได้: +{response.points}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;

