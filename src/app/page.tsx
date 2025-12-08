import Link from "next/link";

import { Button } from "@/components/ui/button";

const LandingPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[90vh] text-center space-y-8 px-4">
      {/* Lightbulb Icon */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-orange-500 to-yellow-500 rounded-full blur-2xl opacity-50 animate-pulse" />
        <div className="relative w-28 h-28 md:w-36 md:h-36 flex items-center justify-center">
          <div className="w-full h-full bg-gradient-to-br from-pink-500 via-orange-500 to-yellow-500 rounded-full flex items-center justify-center text-5xl md:text-6xl shadow-2xl">
            💡
          </div>
        </div>
      </div>
      
      {/* Title */}
      <div className="space-y-3">
        <h1 className="font-display text-5xl md:text-7xl font-bold text-white">
          Pun Smong
        </h1>
        <h2 className="text-3xl md:text-5xl font-bold text-white">
          Let's Play!
        </h2>
        <p className="text-lg md:text-xl text-white/80">
          Play now and Level up
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
        <Button asChild size="lg" className="bg-purple-600 hover:bg-purple-700 text-white text-lg py-7 px-8 shadow-xl w-full rounded-xl">
          <Link href="/quiz">
            Play Now
          </Link>
        </Button>
        <Button asChild size="lg" className="bg-white text-purple-600 hover:bg-white/90 border-0 text-lg py-7 px-8 shadow-xl w-full rounded-xl">
          <Link href="/leaderboard">Leader Board</Link>
        </Button>
      </div>
    </div>
  );
};

export default LandingPage;

