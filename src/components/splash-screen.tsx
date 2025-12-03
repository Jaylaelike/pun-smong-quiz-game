"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Flame } from "lucide-react";

export const SplashScreen = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsVisible(false);
    }, 1200);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex flex-col items-center gap-4 text-white"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/30 bg-white/10">
              <Flame className="h-8 w-8 text-white" />
            </div>
            <div className="text-center">
              <p className="text-sm uppercase tracking-[0.3em] text-white/70">Loading</p>
              <p className="text-3xl font-semibold">Pun Smong</p>
            </div>
            <div className="h-1 w-40 overflow-hidden rounded-full bg-white/20">
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                className="h-full w-1/2 rounded-full bg-white"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

