"use client";

import { useState } from "react";

export const dynamic = "force-dynamic";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { QrCode, MapPin, ChevronLeft } from "lucide-react";
import QRScanner from "@/components/QRScanner";
import { saveActiveAttempt } from "@/lib/timer";
import { supabase } from "@/lib/supabase";

// Use dev geofence in development to skip location checks
const isDev = process.env.NODE_ENV === 'development';
const geofence = isDev
  ? import("@/lib/geofence-dev")
  : import("@/lib/geofence");

async function verifyStartLocation() {
  const module = await geofence;
  return module.verifyStartLocation();
}

export default function StartPage() {
  const router = useRouter();
  const [showScanner, setShowScanner] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleScanQR = () => {
    setShowScanner(true);
    setError(null);
  };

  const handleQRScanned = async (qrData: string) => {
    console.log("QR Scanned:", qrData);

    // Validate QR code (should be "START" or specific code)
    if (qrData !== "SYNAQ_START") {
      setError("Invalid QR code. Please scan the START code.");
      setShowScanner(false);
      return;
    }

    setIsVerifying(true);

    try {
      // Step 1: Verify location
      const locationCheck = await verifyStartLocation();

      if (!locationCheck.isValid) {
        setError(
          locationCheck.error ||
            `You're too far from the start (${Math.round(locationCheck.distance || 0)}m away)`
        );
        setShowScanner(false);
        setIsVerifying(false);
        return;
      }

      // Step 2: Get user ID from localStorage
      const userId = localStorage.getItem("synaq_user_id") || "temp-user-" + Date.now();
      const attemptId = "attempt-" + Date.now();

      // In dev mode, skip Supabase and use localStorage only
      if (process.env.NODE_ENV === 'development') {
        console.log("🧪 DEV MODE: Skipping Supabase, using localStorage only");

        // Step 3: Save to localStorage
        saveActiveAttempt({
          attemptId,
          userId,
          startTime: Date.now(),
          status: "started",
        });

        // Step 4: Navigate to climbing screen
        router.push("/climbing");
        return;
      }

      // Production: Save to Supabase
      const { data: attempt, error: insertError } = await supabase
        .from("attempts")
        .insert({
          user_id: userId,
          start_time: new Date().toISOString(),
          status: "started",
          start_lat: locationCheck.location?.latitude,
          start_lng: locationCheck.location?.longitude,
        })
        .select()
        .single();

      if (insertError) {
        console.error("Failed to create attempt:", insertError);
        setError("Failed to start climb. Please try again.");
        setShowScanner(false);
        setIsVerifying(false);
        return;
      }

      // Step 3: Save to localStorage
      saveActiveAttempt({
        attemptId: attempt.id,
        userId,
        startTime: Date.now(),
        status: "started",
      });

      // Step 4: Navigate to climbing screen
      router.push("/climbing");
    } catch (err) {
      console.error("Error starting climb:", err);
      setError("Something went wrong. Please try again.");
      setShowScanner(false);
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Show scanner if active */}
      {showScanner && (
        <QRScanner
          onScan={handleQRScanned}
          onClose={() => setShowScanner(false)}
          expectedCode="SYNAQ_START"
          title="Scan Start QR"
        />
      )}

      {/* Main Content */}
      {!showScanner && (
        <>
          {/* Header */}
          <div className="flex items-center gap-3 p-4 border-b border-foreground-muted/10">
            <button
              onClick={() => router.push("/")}
              className="p-2 hover:bg-surface rounded-lg transition-colors"
              type="button"
            >
              <ChevronLeft className="w-6 h-6 text-foreground-muted" />
            </button>
            <h1 className="text-xl font-bold text-foreground">Start Synaq</h1>
          </div>

          {/* Content */}
          <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-md"
            >
              {/* Icon */}
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-lime/10 border-2 border-lime flex items-center justify-center">
                <QrCode className="w-12 h-12 text-lime" />
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Ready to climb?
              </h2>
              <p className="text-foreground-muted mb-8">
                Scan the QR code at the start of Health Stairs to begin your
                climb.
              </p>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-6 bg-red-500/10 border border-red-500/20 rounded-lg p-4"
                >
                  <p className="text-red-400 text-sm">{error}</p>
                </motion.div>
              )}

              {/* Scan Button */}
              <button
                onClick={handleScanQR}
                disabled={isVerifying}
                className="w-full bg-lime text-background font-bold text-lg py-5 rounded-xl
                           glow-lime border-sharp border-lime-glow
                           disabled:opacity-50 disabled:cursor-not-allowed
                           active:scale-[0.98] transition-all duration-150
                           flex items-center justify-center gap-3"
                type="button"
              >
                <QrCode className="w-6 h-6" />
                {isVerifying ? "Verifying..." : "Scan QR Code"}
              </button>

              {/* Info Cards */}
              <div className="mt-8 space-y-3">
                <div className="bg-surface rounded-lg p-4 text-left">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-lime mt-0.5" />
                    <div>
                      <h3 className="text-foreground font-semibold text-sm mb-1">
                        Location Required
                      </h3>
                      <p className="text-foreground-muted text-xs">
                        You must be within 50m of the start point to begin your
                        climb.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-surface rounded-lg p-4 text-left">
                  <div className="flex items-start gap-3">
                    <QrCode className="w-5 h-5 text-lime mt-0.5" />
                    <div>
                      <h3 className="text-foreground font-semibold text-sm mb-1">
                        QR Code Location
                      </h3>
                      <p className="text-foreground-muted text-xs">
                        Find the QR code at the bottom of the stairs near the
                        entrance.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </main>
        </>
      )}
    </div>
  );
}
