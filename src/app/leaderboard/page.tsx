import { Suspense } from "react";
import { LeaderboardClient } from "@/components/leaderboard/leaderboard-client";
import { Loader2 } from "lucide-react";

const LeaderboardPage = () => {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <LeaderboardClient />
    </Suspense>
  );
};

export default LeaderboardPage;

