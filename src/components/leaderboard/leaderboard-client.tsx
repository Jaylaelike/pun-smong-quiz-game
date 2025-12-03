"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { getLeaderboard, type LeaderboardRange } from "@/actions/leaderboard";
import { LeaderboardTable } from "./leaderboard-table";
import { LeaderboardFilters } from "./leaderboard-filters";
import { Loader2 } from "lucide-react";

export const LeaderboardClient = () => {
  const searchParams = useSearchParams();
  const rangeParam = (searchParams.get("range") as LeaderboardRange) ?? "all";

  const { data: leaderboard, isLoading, isFetching } = useQuery({
    queryKey: ["leaderboard", rangeParam],
    queryFn: () => getLeaderboard(50, rangeParam),
    refetchInterval: 5000, // Refetch every 5 seconds
    refetchIntervalInBackground: true
  });

  return (
    <div className="space-y-10">
      <div className="rounded-3xl border border-white/70 bg-white/90 p-8 shadow">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm uppercase text-primary">ผู้เล่นอันดับต้น</p>
            <h1 className="text-4xl font-semibold">กระดานคะแนน</h1>
            <p className="text-muted-foreground">คะแนนจะอัปเดตหลังจากทุกคำตอบ โดยคำนวณโบนัสด้วย</p>
          </div>
          {isFetching && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>กำลังอัปเดต...</span>
            </div>
          )}
        </div>
        <div className="mt-6">
          <LeaderboardFilters />
        </div>
      </div>
      {isLoading && !leaderboard ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <LeaderboardTable rows={leaderboard ?? []} />
      )}
    </div>
  );
};

