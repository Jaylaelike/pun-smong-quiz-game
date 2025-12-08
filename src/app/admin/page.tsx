import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { FileQuestion, PlusCircle, Settings } from "lucide-react";

import { getAdminStats } from "@/actions/dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { isAdmin } from "@/lib/auth";
import { ResetRewardsButton } from "@/components/admin/reset-rewards-button";

const AdminPage = async () => {
  const { userId } = auth();
  if (!userId) redirect("/auth/sign-in");

  const clerkUser = await currentUser();
  if (!isAdmin(clerkUser)) redirect("/dashboard");

  const stats = await getAdminStats();

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase text-purple-300">ผู้ดูแลระบบ</p>
          <h1 className="text-4xl font-bold text-white">ห้องควบคุม</h1>
          <p className="text-white/70 mt-1">จัดการคลังคำถาม ดูกิจกรรม และรีเซ็ตรางวัล</p>
        </div>
        <div className="flex flex-col items-end gap-3">
          <Button asChild className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white">
            <a href="/admin/questions/new">สร้างคำถาม</a>
          </Button>
          <ResetRewardsButton variant="outline" size="sm" className="border-white/20 bg-white/10 text-white hover:bg-white/20">
            รีเซ็ตรางวัลทั้งหมด
          </ResetRewardsButton>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-white/20 bg-white/10 backdrop-blur-lg">
          <CardHeader>
            <CardDescription className="text-purple-300">คำถามทั้งหมด</CardDescription>
            <CardTitle className="text-3xl text-white font-bold">{stats?.questions ?? 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-white/20 bg-white/10 backdrop-blur-lg">
          <CardHeader>
            <CardDescription className="text-purple-300">ผู้ใช้ทั้งหมด</CardDescription>
            <CardTitle className="text-3xl text-white font-bold">{stats?.totalUsers ?? 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-white/20 bg-white/10 backdrop-blur-lg">
          <CardHeader>
            <CardDescription className="text-purple-300">คำตอบวันนี้</CardDescription>
            <CardTitle className="text-3xl text-white font-bold">{stats?.responsesToday ?? 0}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* จัดการคำถาม Section */}
      <Card className="border-white/20 bg-white/10 backdrop-blur-lg">
        <CardHeader>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/30 to-indigo-500/30 flex items-center justify-center">
              <FileQuestion className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl text-white">จัดการคำถาม</CardTitle>
              <CardDescription className="text-white/70">สร้าง แก้ไข และจัดการคำถามทั้งหมด</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              asChild
              className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
            >
              <Link href="/admin/questions">
                <Settings className="mr-2 h-4 w-4" />
                จัดการคำถามทั้งหมด
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="flex-1 border-white/20 bg-white/10 text-white hover:bg-white/20"
            >
              <Link href="/admin/questions/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                สร้างคำถามใหม่
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPage;

