import Link from "next/link";
import { ArrowRight, Sparkles, Trophy, Zap, Clock3, Users, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const stats = [
  { label: "เกมที่กำลังเล่น", value: "4,720", detail: "ผู้เล่นกำลังแข่งกัน" },
  { label: "คำถามที่สร้าง", value: "18k+", detail: "คำถามที่คัดเลือกแล้ว" },
  { label: "เวลาตอบเฉลี่ย", value: "11.3s", detail: "ความเร็วเฉลี่ย" }
];

const features = [
  {
    title: "ความเร็วสำคัญ",
    description: "นับถอยหลัง 30 วินาที และโบนัสที่เพิ่มขึ้นตามความเร็วในการตอบ",
    icon: Zap
  },
  {
    title: "โปรไฟล์ในกระดานคะแนน",
    description: "โปรไฟล์ที่ปลอดภัยด้วย Clerk แสดงสถิติ อวตาร และตรา",
    icon: Users
  },
  {
    title: "ห้องจัดการคำถาม",
    description: "นำเข้าคำถามจำนวนมาก ดูตัวอย่างทันที และสลับเปิด/ปิดคำถาม",
    icon: ShieldCheck
  }
];

const steps = [
  {
    title: "เตรียมพร้อม",
    description: "เลือกโหมด อ่านกฎ และเตรียมตัวก่อนเริ่มนับถอยหลัง",
    icon: Clock3
  },
  {
    title: "ตอบครั้งเดียว",
    description: "ทุกคำถามมีแอนิเมชัน ตอบได้ครั้งเดียวและแข่งเพื่อโบนัส",
    icon: Sparkles
  },
  {
    title: "ขึ้นอันดับทันที",
    description: "คะแนนอัปเดตไปยังกระดานคะแนนและแดชบอร์ดในไม่กี่มิลลิวินาที",
    icon: Trophy
  }
];

const LandingPage = () => {
  return (
    <div className="space-y-20">
      <section className="grid items-center gap-10 lg:grid-cols-2">
        <div className="space-y-6">
      
          <h1 className="font-display text-4xl font-semibold leading-snug text-gray-950 md:text-6xl">
            มาแข่งกัน <span className="text-gradient">ท่าคุณแน่จริง</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Pun Smong คือเกมตอบคำถามแข่งความเร็ว โปรไฟล์ที่ปลอดภัย และกระดานคะแนนที่อัปเดตแบบเรียลไทม์
          </p>
          <div className="flex flex-wrap gap-4">
            <Button asChild size="lg">
              <Link href="/quiz">
                เริ่มเล่น <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="ghost" className="border border-white/60 bg-white/70 shadow">
              <Link href="/leaderboard">ดูกระดานคะแนน</Link>
            </Button>
          </div>
        
        </div>
      
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.title} className="border border-slate-100/60 bg-white/90">
            <CardHeader className="space-y-4">
              <div className="w-fit rounded-2xl bg-primary/10 p-3 text-primary">
                <feature.icon className="h-6 w-6" />
              </div>
              <CardTitle className="text-xl">{feature.title}</CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </section>

      <section className="rounded-3xl border border-white/60 bg-white/90 p-8 shadow-lg">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase text-primary">วิธีการเล่น</p>
            <h2 className="font-display text-3xl font-semibold">วงจรการเล่นในสามขั้นตอน</h2>
          </div>
          <Button asChild size="lg">
            <Link href="/dashboard">ดูแดชบอร์ด</Link>
          </Button>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.title} className="rounded-2xl border border-slate-100/60 bg-gradient-to-b from-white to-slate-50/70 p-5">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <step.icon className="h-5 w-5" />
              </div>
              <p className="text-sm uppercase text-muted-foreground">ขั้นตอน {index + 1}</p>
              <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-primary/30 bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-500 p-8 text-white shadow-2xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase text-white/80">พร้อมเล่นแล้ว</p>
            <h2 className="text-3xl font-semibold">เข้าร่วมสนามแข่งตอบคำถามที่เร็วที่สุด</h2>
            <p className="text-white/80">ยืนยันตัวตนด้วย Clerk ใช้ Prisma + SQLite และแอนิเมชันด้วย Motion</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" variant="secondary" className="text-primary">
              <Link href="/auth/sign-up">สร้างบัญชี</Link>
            </Button>
            <Button asChild size="lg" variant="ghost" className="border border-white/40 text-white hover:bg-white/10">
              <Link href="/quiz">ดูเกม</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;

