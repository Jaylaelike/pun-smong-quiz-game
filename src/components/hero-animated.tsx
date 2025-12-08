"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const blobVariants = {
  animate: {
    x: [0, 30, -20, 10, 0],
    y: [0, -20, 30, -10, 0],
    scale: [1, 1.05, 0.95, 1.08, 1],
    rotate: [0, 5, -5, 8, 0],
    transition: { duration: 12, repeat: Infinity, ease: "easeInOut" }
  }
};

export const HeroAnimated = () => {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-[90vh] text-center space-y-8 px-4 overflow-hidden">
      <motion.div
        variants={blobVariants}
        animate="animate"
        className="pointer-events-none absolute -left-32 -top-32 h-72 w-72 rounded-full bg-gradient-to-r from-pink-500 via-orange-400 to-yellow-400 blur-3xl opacity-60"
      />
      <motion.div
        variants={blobVariants}
        animate="animate"
        transition={{ ...blobVariants.animate.transition, duration: 14, delay: 1 }}
        className="pointer-events-none absolute -right-24 top-10 h-64 w-64 rounded-full bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-400 blur-3xl opacity-50"
      />
      <motion.div
        variants={blobVariants}
        animate="animate"
        transition={{ ...blobVariants.animate.transition, duration: 16, delay: 2 }}
        className="pointer-events-none absolute left-10 bottom-0 h-64 w-64 rounded-full bg-gradient-to-r from-emerald-400 via-teal-400 to-sky-400 blur-3xl opacity-50"
      />

      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-orange-500 to-yellow-500 rounded-full blur-2xl opacity-50 animate-pulse" />
        <div className="relative w-28 h-28 md:w-36 md:h-36 flex items-center justify-center">
          <div className="w-full h-full bg-gradient-to-br from-pink-500 via-orange-500 to-yellow-500 rounded-full flex items-center justify-center text-5xl md:text-6xl shadow-2xl overflow-hidden">
            <Image
              src="https://56fwnhyzti.ufs.sh/f/aK4w8mNL3AiPeaic0VN3vt975U2sBlNohJF1QZ0LyXdPDaH8"
              alt="Quizzles"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h1 className="font-display text-5xl md:text-7xl font-bold text-white">
          Pun Sa-mong <br />
          (ปั่น สมอง) ...
        </h1>
        <h2 className="text-3xl md:text-5xl font-bold text-white">เล่นเลย!</h2>
        <p className="text-lg md:text-xl text-white/80">Play now and Level up</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
        <Button asChild size="lg" className="bg-purple-600 hover:bg-purple-700 text-white text-lg py-7 px-8 shadow-xl w-full rounded-xl">
          <Link href="/quiz">Play Now</Link>
        </Button>
        <Button asChild size="lg" className="bg-white text-purple-600 hover:bg-white/90 border-0 text-lg py-7 px-8 shadow-xl w-full rounded-xl">
          <Link href="/leaderboard">กระดานคะแนน</Link>
        </Button>
      </div>
    </div>
  );
};