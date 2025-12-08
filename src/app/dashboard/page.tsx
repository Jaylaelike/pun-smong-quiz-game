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
      <div className="rounded-3xl border border-white/20 bg-white/10 backdrop-blur-lg p-6 shadow-xl">
        <p className="text-sm uppercase text-purple-300">แดชบอร์ด</p>
        <h1 className="text-3xl font-bold text-white">ยินดีต้อนรับกลับ, {data.user.username ?? "ผู้เล่น"} 👋</h1>
        <p className="text-white/70 mt-1">ติดตามสถิติของคุณ ตรวจสอบคะแนน และเข้าร่วมเกมถัดไป</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {statCards.map((stat) => (
          <Card key={stat.label} className="border border-white/20 bg-white/10 backdrop-blur-lg hover:bg-white/15 transition-colors">
            <div className="p-5">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/30 to-indigo-500/30 text-white shadow-lg">
                <stat.icon className="h-5 w-5" />
              </div>
              <p className="text-sm uppercase text-purple-300">{stat.label}</p>
              <p className="text-4xl font-bold text-white mt-2">{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex flex-col gap-6 rounded-3xl border border-white/20 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 p-6 text-white shadow-xl md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase text-white/90">พร้อมสำหรับเกมถัดไป?</p>
          <p className="text-3xl font-bold">เริ่มเกมใหม่เลย</p>
        </div>
        <Button size="lg" asChild className="bg-white text-purple-600 hover:bg-white/90 shadow-lg">
          <a href="/quiz">เริ่มเล่น</a>
        </Button>
      </div>

      <section className="space-y-4">
        <div>
          <p className="text-sm uppercase text-purple-300">กิจกรรม</p>
          <h2 className="text-xl font-bold text-white">คำตอบล่าสุด</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {data.user.responses.length === 0 && (
            <div className="col-span-2 rounded-2xl border border-white/20 bg-white/5 p-8 text-center">
              <p className="text-white/70">ยังไม่มีคำตอบ — เริ่มเล่นเลย!</p>
            </div>
          )}
          {data.user.responses.map((response) => (
            <Card key={response.id} className={cn(
              "border border-white/20 backdrop-blur-lg transition-all hover:scale-[1.02]",
              response.isCorrect 
                ? "bg-green-500/20 hover:bg-green-500/30" 
                : "bg-rose-500/20 hover:bg-rose-500/30"
            )}>
              <CardHeader>
                <CardTitle className="text-lg text-white">{response.question.question}</CardTitle>
                <CardDescription className="text-sm text-white/70">
                  ความยาก: {response.question.difficulty} · {new Intl.DateTimeFormat("th-TH", { month: "short", day: "numeric" }).format(response.answeredAt)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-1 text-sm text-white/80">
                <p>
                  คำตอบของคุณ: <span className="font-medium text-white">{response.answer}</span>
                </p>
                <p>คำตอบที่ถูกต้อง: {response.question.correctAnswer}</p>
                <p className="font-semibold text-green-300">คะแนนที่ได้: +{response.points}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;

