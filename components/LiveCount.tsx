"use client";

import { motion } from "framer-motion";
import { Activity } from "lucide-react";
import { useEffect, useState } from "react";

interface LiveCountProps {
  count: number;
}

export default function LiveCount({ count }: LiveCountProps) {
  const [displayCount, setDisplayCount] = useState(0);

  // Animate count changes
  useEffect(() => {
    const duration = 500;
    const steps = 20;
    const increment = (count - displayCount) / steps;
    let current = displayCount;

    const timer = setInterval(() => {
      current += increment;
      if (
        (increment > 0 && current >= count) ||
        (increment < 0 && current <= count)
      ) {
        setDisplayCount(count);
        clearInterval(timer);
      } else {
        setDisplayCount(Math.round(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [count, displayCount]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed top-4 right-4 z-50"
    >
      <div className="bg-surface-elevated border-2 border-lime/30 rounded-full px-4 py-2 flex items-center gap-2 backdrop-blur-lg">
        <div className="relative">
          <Activity className="w-4 h-4 text-lime" />
          {count > 0 && (
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [1, 0.5, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute inset-0 bg-lime rounded-full blur-sm"
            />
          )}
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-lime font-bold text-lg font-mono">
            {displayCount}
          </span>
          <span className="text-foreground-muted text-xs">
            climbing now
          </span>
        </div>
      </div>
    </motion.div>
  );
}
