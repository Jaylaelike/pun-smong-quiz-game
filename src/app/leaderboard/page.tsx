import { getLeaderboard } from "@/actions/leaderboard";
import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table";
import { LeaderboardFilters } from "@/components/leaderboard/leaderboard-filters";

type LeaderboardPageProps = {
  searchParams: Record<string, string | undefined>;
};

const LeaderboardPage = async ({ searchParams }: LeaderboardPageProps) => {
  const rangeParam = (searchParams.range as "all" | "weekly" | "monthly") ?? "all";
  const leaderboard = await getLeaderboard(50, rangeParam);

  return (
    <div className="space-y-10">
      <div className="rounded-3xl border border-white/70 bg-white/90 p-8 shadow">
        <p className="text-sm uppercase text-primary">ผู้เล่นอันดับต้น</p>
        <h1 className="text-4xl font-semibold">กระดานคะแนน</h1>
        <p className="text-muted-foreground">คะแนนจะอัปเดตหลังจากทุกคำตอบ โดยคำนวณโบนัสด้วย</p>
        <div className="mt-6">
          <LeaderboardFilters />
        </div>
      </div>
      <LeaderboardTable rows={leaderboard} />
    </div>
  );
};

export default LeaderboardPage;

