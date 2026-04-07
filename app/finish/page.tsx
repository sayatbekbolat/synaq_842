"use client";

import { useState, useEffect } from "react";

export const dynamic = "force-dynamic";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  QrCode,
  AtSign,
  ChevronRight,
  CheckCircle2,
  User,
} from "lucide-react";
import QRScanner from "@/components/QRScanner";
import { getActiveAttempt, clearActiveAttempt } from "@/lib/timer";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/contexts/LanguageContext";

// Use dev geofence in development to skip location checks
const isDev = process.env.NODE_ENV === 'development';
const geofence = isDev
  ? import("@/lib/geofence-dev")
  : import("@/lib/geofence");

async function verifyFinishLocation() {
  const module = await geofence;
  return module.verifyFinishLocation();
}

export default function FinishPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [step, setStep] = useState<"scan" | "details" | "submitting">("scan");
  const [showScanner, setShowScanner] = useState(false);
  const [instagram, setInstagram] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [finishTime, setFinishTime] = useState<number | null>(null);

  // Pre-fill user data if logged in
  useEffect(() => {
    const userDataStr = localStorage.getItem("synaq_user_data");
    if (userDataStr) {
      try {
        const userData = JSON.parse(userDataStr);
        if (userData.display_name) {
          setDisplayName(userData.display_name);
        }
      } catch (e) {
        // Ignore parsing errors
      }
    }
  }, []);

  const handleScanQR = () => {
    setShowScanner(true);
    setError(null);
  };

  const handleQRScanned = async (qrData: string) => {
    console.log("Finish QR Scanned:", qrData);

    // Validate QR code
    if (qrData !== "SYNAQ_FINISH") {
      setError(t('invalidFinishQr'));
      setShowScanner(false);
      return;
    }

    try {
      // Verify location
      const locationCheck = await verifyFinishLocation();

      if (!locationCheck.isValid) {
        setError(
          locationCheck.error || t('tooFarFromFinish')
        );
        setShowScanner(false);
        return;
      }

      // Get active attempt
      const attempt = getActiveAttempt();
      if (!attempt) {
        setError(t('noActiveClimb'));
        setShowScanner(false);
        return;
      }

      // Calculate duration
      const now = Date.now();
      const durationMs = now - attempt.startTime;
      const durationSeconds = Math.floor(durationMs / 1000);

      setFinishTime(durationSeconds);
      setShowScanner(false);
      setStep("details");
    } catch (err) {
      console.error("Error finishing climb:", err);
      setError(t('somethingWentWrong'));
      setShowScanner(false);
    }
  };

  const handleSubmit = async () => {
    if (!displayName.trim()) {
      setError(t('pleaseEnterName'));
      return;
    }

    setStep("submitting");
    setError(null);

    try {
      const attempt = getActiveAttempt();
      if (!attempt || finishTime === null) {
        throw new Error("No active attempt found");
      }

      // Get user data from localStorage
      const userDataStr = localStorage.getItem("synaq_user_data");
      const userData = userDataStr ? JSON.parse(userDataStr) : null;

      // In dev mode, skip Supabase
      if (process.env.NODE_ENV === 'development') {
        console.log("🧪 DEV MODE: Skipping Supabase, saving to localStorage");

        // Save completed attempt to localStorage for leaderboard
        const completedAttempt = {
          ...attempt,
          endTime: Date.now(),
          duration: finishTime,
          status: 'completed',
          displayName: displayName.trim(),
          instagram: instagram.trim() || undefined,
        };

        // Store with a unique key
        localStorage.setItem(`synaq_attempt_${attempt.attemptId}`, JSON.stringify(completedAttempt));

        // Also update user data if provided
        if (userData) {
          localStorage.setItem(attempt.userId, JSON.stringify({
            ...userData,
            display_name: displayName.trim(),
            telegram_username: instagram.trim() || userData.telegram_username,
          }));
        } else {
          // Create user data if it doesn't exist
          localStorage.setItem(attempt.userId, JSON.stringify({
            id: attempt.userId,
            display_name: displayName.trim(),
            telegram_username: instagram.trim() || '',
          }));
        }

        // Clear active attempt
        clearActiveAttempt();

        // Navigate to success page
        router.push(`/success?time=${finishTime}&name=${encodeURIComponent(displayName)}`);
        return;
      }

      // Production: Save to Supabase
      // Update attempt in Supabase
      const { error: updateError } = await supabase
        .from("attempts")
        .update({
          end_time: new Date().toISOString(),
          duration: finishTime,
          status: "completed",
        })
        .eq("id", attempt.attemptId);

      if (updateError) {
        console.error("Failed to update attempt:", updateError);
        throw updateError;
      }

      // Update user Instagram handle if provided
      if (userData && instagram.trim()) {
        const { error: userError } = await supabase
          .from("users")
          .update({
            instagram_handle: instagram.trim(),
          })
          .eq("id", attempt.userId);

        if (userError) {
          console.error("Failed to update user Instagram:", userError);
          // Continue anyway - Instagram is optional
        }
      }

      // Clear local storage
      clearActiveAttempt();

      // Navigate to success page - use display name from Telegram if available
      const finalName = userData?.display_name || displayName.trim();
      router.push(`/success?time=${finishTime}&name=${encodeURIComponent(finalName)}`);
    } catch (err) {
      console.error("Error submitting climb:", err);
      setError(t('failedToStartClimb'));
      setStep("details");
    }
  };

  if (showScanner) {
    return (
      <QRScanner
        onScan={handleQRScanned}
        onClose={() => setShowScanner(false)}
        expectedCode="SYNAQ_FINISH"
        title="Scan Finish QR"
      />
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {step === "scan" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-md w-full"
          >
            {/* Icon */}
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-lime/10 border-2 border-lime flex items-center justify-center">
              <QrCode className="w-12 h-12 text-lime" />
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {t('almostThere')}
            </h2>
            <p className="text-foreground-muted mb-8">
              {t('scanFinishToComplete')}
            </p>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 bg-danger/10 border border-danger/30 rounded-lg p-4"
              >
                <p className="text-danger text-sm">{error}</p>
              </motion.div>
            )}

            {/* Scan Button */}
            <button
              onClick={handleScanQR}
              className="w-full bg-lime text-background font-bold text-lg py-5 rounded-xl
                         glow-lime border-sharp border-lime-glow
                         active:scale-[0.98] transition-all duration-150
                         flex items-center justify-center gap-3"
              type="button"
            >
              <QrCode className="w-6 h-6" />
              {t('scanFinishQr')}
            </button>
          </motion.div>
        )}

        {step === "details" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-md w-full"
          >
            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="w-24 h-24 mx-auto mb-6 rounded-full bg-lime/10 border-2 border-lime flex items-center justify-center"
            >
              <CheckCircle2 className="w-12 h-12 text-lime" />
            </motion.div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {t('greatJob')}
            </h2>
            <p className="text-foreground-muted mb-2">
              {t('youCompletedIn')}
            </p>
            <div className="text-5xl font-mono font-bold text-lime mb-8">
              {Math.floor((finishTime || 0) / 60)}:
              {((finishTime || 0) % 60).toString().padStart(2, "0")}
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 bg-danger/10 border border-danger/30 rounded-lg p-4"
              >
                <p className="text-danger text-sm">{error}</p>
              </motion.div>
            )}

            {/* Form */}
            <div className="space-y-4 mb-8">
              {/* Name Input */}
              <div className="text-left">
                <label
                  htmlFor="name"
                  className="block text-foreground text-sm font-semibold mb-2"
                >
                  {t('yourName')} <span className="text-danger">{t('required')}</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
                  <input
                    id="name"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder={t('enterYourName')}
                    className="w-full bg-surface border border-foreground-muted/20 rounded-lg py-3 pl-11 pr-4
                               text-foreground placeholder:text-foreground-muted/50
                               focus:outline-none focus:border-lime focus:ring-1 focus:ring-lime
                               transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Instagram Input */}
              <div className="text-left">
                <label
                  htmlFor="instagram"
                  className="block text-foreground text-sm font-semibold mb-2"
                >
                  {t('instagramHandle')}{" "}
                  <span className="text-foreground-muted font-normal">
                    {t('instagramOptional')}
                  </span>
                </label>
                <div className="relative">
                  <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
                  <input
                    id="instagram"
                    type="text"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="@your_handle"
                    className="w-full bg-surface border border-foreground-muted/20 rounded-lg py-3 pl-11 pr-4
                               text-foreground placeholder:text-foreground-muted/50
                               focus:outline-none focus:border-lime focus:ring-1 focus:ring-lime
                               transition-colors"
                  />
                </div>
                <p className="text-foreground-muted text-xs mt-1">
                  {t('shareInstagram')}
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={!displayName.trim()}
              className="w-full bg-lime text-background font-bold text-lg py-5 rounded-xl
                         glow-lime border-sharp border-lime-glow
                         disabled:opacity-50 disabled:cursor-not-allowed
                         active:scale-[0.98] transition-all duration-150
                         flex items-center justify-center gap-3"
              type="button"
            >
              {t('submitTime')}
              <ChevronRight className="w-6 h-6" />
            </button>
          </motion.div>
        )}

        {step === "submitting" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <div className="animate-pulse">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-lime/20 border-2 border-lime flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-lime" />
              </div>
              <p className="text-foreground text-lg font-semibold">
                {t('submittingClimb')}
              </p>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
