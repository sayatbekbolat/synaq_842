"use client";

import { motion } from "framer-motion";
import { Trophy, Mountain } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Leader {
  rank: number;
  name: string;
  time: number; // in seconds
  instagram?: string;
}

interface PodiumProps {
  leaders: Leader[];
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const podiumHeights = {
  1: "h-32",
  2: "h-24",
  3: "h-20",
};

const podiumColors = {
  1: "bg-lime text-background",
  2: "bg-surface-elevated text-foreground",
  3: "bg-surface text-foreground",
};

export default function Podium({ leaders }: PodiumProps) {
  const { t } = useLanguage();

  // Ensure we have exactly 3 leaders, pad with empty if needed
  const paddedLeaders = [...leaders];
  while (paddedLeaders.length < 3) {
    paddedLeaders.push({
      rank: paddedLeaders.length + 1,
      name: "—",
      time: 0,
    });
  }

  // Reorder for podium display: [2nd, 1st, 3rd]
  const podiumOrder = [
    paddedLeaders.find((l) => l.rank === 2),
    paddedLeaders.find((l) => l.rank === 1),
    paddedLeaders.find((l) => l.rank === 3),
  ].filter(Boolean) as Leader[];

  return (
    <div className="w-full max-w-md mx-auto px-4">
      <div className="flex items-end justify-center gap-2 mb-6">
        {podiumOrder.map((leader, index) => {
          const actualRank = leader.rank;
          const isChampion = actualRank === 1;

          return (
            <motion.div
              key={actualRank}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
                type: "spring",
                stiffness: 100,
              }}
              className="flex flex-col items-center flex-1"
            >
              {/* Rank Badge */}
              <div className="mb-2 relative">
                {isChampion ? (
                  <div className="relative">
                    <Trophy className="w-8 h-8 text-lime animate-pulse-glow" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-lime rounded-full animate-ping" />
                  </div>
                ) : (
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      actualRank === 2
                        ? "bg-foreground-muted/20 text-foreground-muted"
                        : "bg-surface-elevated text-foreground-muted"
                    }`}
                  >
                    {actualRank}
                  </div>
                )}
              </div>

              {/* Name */}
              <div
                className={`text-center mb-2 ${
                  isChampion ? "text-lime font-bold" : "text-foreground-muted"
                }`}
              >
                <div className="text-sm font-medium truncate max-w-[100px]">
                  {leader.name !== "—" ? leader.name : ""}
                </div>
                {leader.instagram && (
                  <div className="text-xs opacity-70">@{leader.instagram}</div>
                )}
              </div>

              {/* Podium Block */}
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                className={`w-full ${podiumHeights[actualRank as keyof typeof podiumHeights]}
                  ${podiumColors[actualRank as keyof typeof podiumColors]}
                  rounded-t-lg flex flex-col items-center justify-center
                  border-t-4 border-sharp
                  ${
                    isChampion
                      ? "border-lime-glow glow-lime"
                      : "border-foreground-muted/20"
                  }
                  relative overflow-hidden`}
              >
                {/* Mountain Pattern Background */}
                <Mountain
                  className={`absolute bottom-0 opacity-10 ${
                    isChampion ? "w-16 h-16" : "w-12 h-12"
                  }`}
                />

                {/* Time Display */}
                {leader.time > 0 && (
                  <div
                    className={`font-mono font-bold relative z-10 ${
                      isChampion ? "text-2xl" : "text-lg"
                    }`}
                  >
                    {formatTime(leader.time)}
                  </div>
                )}
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* Podium Label */}
      <div className="text-center text-foreground-muted text-xs uppercase tracking-wider">
        {t('todaysChampions')}
      </div>
    </div>
  );
}
