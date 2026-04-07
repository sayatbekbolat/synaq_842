"use client";

import { useEffect, useState } from "react";

export const dynamic = "force-dynamic";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mountain, Timer, Zap, AlertCircle } from "lucide-react";
import {
  getActiveAttempt,
  calculateElapsedTime,
  formatTime,
} from "@/lib/timer";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ClimbingPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [hasActiveAttempt, setHasActiveAttempt] = useState(false);

  useEffect(() => {
    // Check for active attempt
    const attempt = getActiveAttempt();

    if (!attempt) {
      // No active climb, redirect to home
      router.push("/");
      return;
    }

    setHasActiveAttempt(true);
    setElapsedSeconds(calculateElapsedTime(attempt.startTime));

    // Update timer every second
    const interval = setInterval(() => {
      const activeAttempt = getActiveAttempt();
      if (!activeAttempt) {
        clearInterval(interval);
        router.push("/");
        return;
      }

      setElapsedSeconds(calculateElapsedTime(activeAttempt.startTime));
    }, 1000);

    return () => clearInterval(interval);
  }, [router]);

  const handleFinish = () => {
    router.push("/finish");
  };

  if (!hasActiveAttempt) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-foreground-muted">{t('loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-lime/5 rounded-full blur-3xl"
        />
      </div>

      {/* Main Content */}
      <main className="relative flex-1 flex flex-col items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md w-full"
        >
          {/* Mountain Icon */}
          <motion.div
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="mx-auto mb-8"
          >
            <Mountain className="w-20 h-20 text-lime mx-auto" />
          </motion.div>

          {/* Status */}
          <div className="mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-2 h-2 bg-lime rounded-full animate-pulse" />
              <p className="text-lime text-sm font-semibold tracking-wide uppercase">
                {t('climbingInProgress')}
              </p>
            </div>
            <h1 className="text-3xl font-bold text-foreground">
              {t('keepGoingTitle')}
            </h1>
          </div>

          {/* Timer Display */}
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="mb-12"
          >
            <div className="bg-surface border-2 border-lime rounded-2xl p-8 glow-lime">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Timer className="w-5 h-5 text-lime" />
                <p className="text-foreground-muted text-sm">{t('yourTime')}</p>
              </div>
              <div className="text-6xl font-mono font-bold text-lime tabular-nums">
                {formatTime(elapsedSeconds)}
              </div>
              <p className="text-foreground-muted text-xs mt-2">
                {Math.floor(elapsedSeconds / 60)} {t('minutesElapsed')}
              </p>
            </div>
          </motion.div>

          {/* Motivational Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8 bg-lime/5 border border-lime/20 rounded-lg p-4"
          >
            <p className="text-foreground text-sm">
              {elapsedSeconds < 120
                ? t('motivational1')
                : elapsedSeconds < 240
                  ? t('motivational2')
                  : elapsedSeconds < 360
                    ? t('motivational3')
                    : t('motivational4')}
            </p>
          </motion.div>

          {/* Finish Button */}
          <button
            onClick={handleFinish}
            className="w-full bg-lime text-background font-bold text-xl py-6 rounded-xl
                       glow-lime border-sharp border-lime-glow
                       active:scale-[0.98] transition-all duration-150
                       flex items-center justify-center gap-3"
            type="button"
          >
            <Zap className="w-6 h-6" />
            {t('scanFinishQr')}
          </button>

          {/* Safety Note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 flex items-start gap-2 text-left bg-surface rounded-lg p-3"
          >
            <AlertCircle className="w-4 h-4 text-foreground-muted mt-0.5 flex-shrink-0" />
            <p className="text-foreground-muted text-xs">
              {t('timerNote')}
            </p>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
