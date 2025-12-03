import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";

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
          <p className="text-sm uppercase text-primary">ผู้ดูแลระบบ</p>
          <h1 className="text-4xl font-semibold">ห้องควบคุม</h1>
          <p className="text-muted-foreground">จัดการคลังคำถาม ดูกิจกรรม และรีเซ็ตรางวัล</p>
        </div>
        <div className="flex flex-col items-end gap-3">
          <Button asChild>
            <a href="/admin/questions/new">สร้างคำถาม</a>
          </Button>
          <ResetRewardsButton variant="outline" size="sm">
            รีเซ็ตรางวัลทั้งหมด
          </ResetRewardsButton>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>คำถามทั้งหมด</CardDescription>
            <CardTitle className="text-3xl">{stats?.questions ?? 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>ผู้ใช้ทั้งหมด</CardDescription>
            <CardTitle className="text-3xl">{stats?.totalUsers ?? 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>คำตอบวันนี้</CardDescription>
            <CardTitle className="text-3xl">{stats?.responsesToday ?? 0}</CardTitle>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
};

export default AdminPage;

