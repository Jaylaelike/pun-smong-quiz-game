"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type { LeaderboardRange } from "@/actions/leaderboard";
import { Button } from "@/components/ui/button";

const options: { label: string; value: LeaderboardRange }[] = [
  { label: "ตลอดเวลา", value: "all" },
  { label: "รายสัปดาห์", value: "weekly" },
  { label: "รายเดือน", value: "monthly" }
];

export const LeaderboardFilters = () => {
  const pathname = usePathname();
  const router = useRouter();
  const params = useSearchParams();
  const active = (params.get("range") as LeaderboardRange) ?? "all";

  const setRange = (value: LeaderboardRange) => {
    const query = new URLSearchParams(params.toString());
    query.set("range", value);
    router.push(`${pathname}?${query.toString()}`);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <Button key={option.value} variant={active === option.value ? "default" : "outline"} size="sm" onClick={() => setRange(option.value)}>
          {option.label}
        </Button>
      ))}
    </div>
  );
};

