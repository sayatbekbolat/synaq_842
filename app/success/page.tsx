"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Trophy, Home, Share2, AtSign } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

function SuccessContent() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [time, setTime] = useState(0);
  const [name, setName] = useState("");

  useEffect(() => {
    const timeParam = searchParams.get("time");
    const nameParam = searchParams.get("name");

    if (timeParam) {
      setTime(parseInt(timeParam, 10));
    }

    if (nameParam) {
      setName(decodeURIComponent(nameParam));
    }
  }, [searchParams]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleShare = async () => {
    const shareText = `I just climbed the Health Stairs in ${formatTime(time)}! 🏔️ Try the SYNAQ challenge!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "SYNAQ - Health Stairs Challenge",
          text: shareText,
        });
      } catch (err) {
        console.log("Share cancelled");
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareText);
      alert(t('copiedToClipboard'));
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Confetti Effect (simple version) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{
              x: Math.random() * window.innerWidth,
              y: -20,
              rotate: Math.random() * 360,
            }}
            animate={{
              y: window.innerHeight + 20,
              rotate: Math.random() * 360 + 360,
            }}
            transition={{
              duration: Math.random() * 2 + 3,
              delay: Math.random() * 0.5,
              ease: "linear",
            }}
            className="absolute w-3 h-3 bg-lime rounded-full opacity-60"
          />
        ))}
      </div>

      {/* Main Content */}
      <main className="relative flex-1 flex flex-col items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="text-center max-w-md w-full"
        >
          {/* Trophy */}
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 150 }}
            className="mb-8"
          >
            <div className="relative inline-block">
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Trophy className="w-32 h-32 text-lime mx-auto drop-shadow-glow-lime" />
              </motion.div>
              {/* Glow effect */}
              <div className="absolute inset-0 bg-lime/20 blur-3xl rounded-full -z-10" />
            </div>
          </motion.div>

          {/* Success Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-foreground mb-3">
              {t('congratulations')}
            </h1>
            <p className="text-foreground-muted text-lg mb-2">
              {t('completedClimbIn', { name })}
            </p>
            <div className="text-6xl font-mono font-bold text-lime mb-2">
              {formatTime(time)}
            </div>
          </motion.div>

          {/* Stats Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-surface border border-lime/20 rounded-2xl p-6 mb-8"
          >
            <p className="text-foreground-muted text-sm mb-4">
              {t('climbRecorded')}
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-background rounded-lg p-3">
                <div className="text-lime font-bold text-2xl font-mono">✓</div>
                <div className="text-foreground-muted text-xs mt-1">
                  {t('completed')}
                </div>
              </div>
              <div className="bg-background rounded-lg p-3">
                <div className="text-lime font-bold text-2xl font-mono">
                  {formatTime(time)}
                </div>
                <div className="text-foreground-muted text-xs mt-1">
                  {t('yourTime')}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-3"
          >
            {/* Share Button */}
            <button
              onClick={handleShare}
              className="w-full bg-lime text-background font-bold text-lg py-4 rounded-xl
                         glow-lime border-sharp border-lime-glow
                         active:scale-[0.98] transition-all duration-150
                         flex items-center justify-center gap-3"
              type="button"
            >
              <Share2 className="w-5 h-5" />
              {t('shareYourAchievement')}
            </button>

            {/* Home Button */}
            <button
              onClick={() => router.push("/")}
              className="w-full bg-surface border border-foreground-muted/20 text-foreground font-semibold text-lg py-4 rounded-xl
                         hover:bg-surface/80 active:scale-[0.98] transition-all duration-150
                         flex items-center justify-center gap-3"
              type="button"
            >
              <Home className="w-5 h-5" />
              {t('backToHome')}
            </button>
          </motion.div>

          {/* Social CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 flex items-center justify-center gap-2 text-foreground-muted text-sm"
          >
            <AtSign className="w-4 h-4" />
            <p>{t('tagUsOnInstagram')}</p>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}

function SuccessPageLoader() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-pulse text-foreground-muted">{t('loading')}</div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<SuccessPageLoader />}>
      <SuccessContent />
    </Suspense>
  );
}
