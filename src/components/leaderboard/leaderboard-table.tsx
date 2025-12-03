import Image from "next/image";
import { Crown, Trophy, Sparkles } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

type LeaderRow = {
  id: string;
  username: string | null;
  totalScore: number;
  questionsAnswered: number;
  lastAnsweredAt: Date | null;
  imageUrl: string | null;
  rank: number;
};

type LeaderboardTableProps = {
  rows: LeaderRow[];
};

export const LeaderboardTable = ({ rows }: LeaderboardTableProps) => {
  const topPlayer = rows.find((row) => row.rank === 1);

  return (
    <div className="space-y-6">
      {topPlayer && (
        <Card className="border-2 border-yellow-400 bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 shadow-2xl overflow-hidden">
          <CardContent className="p-8">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full blur-2xl opacity-50 animate-pulse" />
                <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500 text-white shadow-2xl border-4 border-white overflow-hidden">
                  {topPlayer.imageUrl ? (
                    <Image
                      src={topPlayer.imageUrl}
                      alt={topPlayer.username ?? "Champion"}
                      width={128}
                      height={128}
                      className="h-full w-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <span className="text-5xl font-bold">{topPlayer.username?.charAt(0).toUpperCase() ?? "🏆"}</span>
                  )}
                </div>
                <div className="absolute -top-2 -right-2">
                  <Crown className="h-8 w-8 text-yellow-500 fill-yellow-500" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <Trophy className="h-6 w-6 text-yellow-600" />
                  <h2 className="text-3xl font-bold text-gray-900">ยินดีด้วย! 🎉</h2>
                  <Trophy className="h-6 w-6 text-yellow-600" />
                </div>
                <p className="text-xl font-semibold text-gray-700">{topPlayer.username}</p>
                <p className="text-sm text-muted-foreground">แชมป์อันดับ 1</p>
                <div className="flex items-center justify-center gap-4 pt-2">
                  <div className="flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 shadow">
                    <Sparkles className="h-4 w-4 text-yellow-600" />
                    <span className="text-lg font-bold text-gray-900">{topPlayer.totalScore}</span>
                    <span className="text-sm text-muted-foreground">คะแนน</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 shadow">
                    <span className="text-lg font-bold text-gray-900">{topPlayer.questionsAnswered}</span>
                    <span className="text-sm text-muted-foreground">คำถาม</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-white/70 bg-white/95 shadow-lg">
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Crown className="h-6 w-6 text-amber-500" /> 50 อันดับแรก
          </CardTitle>
        </CardHeader>
        <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>อันดับ</TableHead>
              <TableHead>ผู้เล่น</TableHead>
              <TableHead>คะแนน</TableHead>
              <TableHead>คำถาม</TableHead>
              <TableHead>ตอบล่าสุด</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => {
              const getRankBadge = () => {
                if (row.rank === 1) {
                  return (
                    <Badge className="h-10 w-10 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-white border-0 flex items-center justify-center p-0 text-sm font-semibold">
                      🥇
                    </Badge>
                  );
                }
                if (row.rank === 2) {
                  return (
                    <Badge className="h-10 w-10 rounded-full bg-gradient-to-r from-gray-300 to-gray-400 text-white border-0 flex items-center justify-center p-0 text-sm font-semibold">
                      🥈
                    </Badge>
                  );
                }
                if (row.rank === 3) {
                  return (
                    <Badge className="h-10 w-10 rounded-full bg-gradient-to-r from-amber-600 to-amber-800 text-white border-0 flex items-center justify-center p-0 text-sm font-semibold">
                      🥉
                    </Badge>
                  );
                }
                return (
                  <Badge variant="secondary" className="h-10 w-10 rounded-full flex items-center justify-center p-0 text-sm font-semibold">
                    {row.rank}
                  </Badge>
                );
              };

              return (
                <TableRow key={row.id} className={row.rank <= 3 ? "bg-gradient-to-r from-amber-50/80 to-white" : undefined}>
                  <TableCell className="font-semibold text-slate-700">
                    <div className="flex items-center gap-2">
                      {getRankBadge()}
                    </div>
                  </TableCell>
                  <TableCell className="flex items-center gap-3">
                    {row.rank === 1 ? (
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full blur-sm opacity-50" />
                        <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500 text-white text-xl font-bold shadow-lg border-2 border-yellow-300 overflow-hidden">
                          {row.imageUrl ? (
                            <Image
                              src={row.imageUrl}
                              alt={row.username ?? "Player"}
                              width={64}
                              height={64}
                              className="h-full w-full object-cover"
                              unoptimized
                            />
                          ) : (
                            <span>{row.username?.charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600 overflow-hidden">
                        {row.imageUrl ? (
                          <Image
                            src={row.imageUrl}
                            alt={row.username ?? "Player"}
                            width={40}
                            height={40}
                            className="h-full w-full object-cover"
                            unoptimized
                          />
                        ) : (
                          <span>{row.username?.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                    )}
                    <span className={`font-medium ${row.rank === 1 ? "text-yellow-700 text-lg" : "text-gray-900"}`}>
                      {row.username}
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-900">{row.totalScore}</TableCell>
                  <TableCell className="text-muted-foreground">{row.questionsAnswered}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {row.lastAnsweredAt
                      ? new Intl.DateTimeFormat("th-TH", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        }).format(new Date(row.lastAnsweredAt))
                      : "ยังไม่เคยตอบ"}
                  </TableCell>
                </TableRow>
              );
            })}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  ยังไม่มีคะแนน — เป็นคนแรกที่เล่นเลย!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          <TableCaption>อันดับใช้ช่วงเวลาที่เลือก</TableCaption>
        </Table>
      </CardContent>
    </Card>
    </div>
  );
};

