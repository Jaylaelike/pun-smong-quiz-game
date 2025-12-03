import { Crown } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

type LeaderRow = {
  id: string;
  username: string | null;
  totalScore: number;
  questionsAnswered: number;
  rank: number;
};

type LeaderboardTableProps = {
  rows: LeaderRow[];
};

export const LeaderboardTable = ({ rows }: LeaderboardTableProps) => {
  return (
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
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">
                      {row.username?.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-gray-900">{row.username}</span>
                  </TableCell>
                  <TableCell className="text-gray-900">{row.totalScore}</TableCell>
                  <TableCell className="text-muted-foreground">{row.questionsAnswered}</TableCell>
                </TableRow>
              );
            })}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  ยังไม่มีคะแนน — เป็นคนแรกที่เล่นเลย!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          <TableCaption>อันดับใช้ช่วงเวลาที่เลือก</TableCaption>
        </Table>
      </CardContent>
    </Card>
  );
};

