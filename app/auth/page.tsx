"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Send, Mountain, Loader2 } from "lucide-react";
import TelegramLogin, { TelegramUser } from "@/components/TelegramLogin";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default function AuthPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || "";

  // Check if already authenticated
  useEffect(() => {
    const userId = localStorage.getItem("synaq_user_id");
    if (userId) {
      // Already logged in, redirect to home
      router.push("/");
    }
  }, [router]);

  const handleTelegramAuth = async (user: TelegramUser) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("Telegram auth successful:", user);

      // In dev mode, skip server verification and Supabase
      if (process.env.NODE_ENV === 'development') {
        console.log("🧪 DEV MODE: Skipping verification, saving to localStorage");

        // Save user to localStorage
        localStorage.setItem("synaq_user_id", user.id.toString());
        localStorage.setItem("synaq_user_data", JSON.stringify({
          id: user.id,
          telegram_id: user.id,
          telegram_username: user.username || "",
          first_name: user.first_name,
          last_name: user.last_name,
          display_name: `${user.first_name}${user.last_name ? ' ' + user.last_name : ''}`,
          photo_url: user.photo_url,
        }));

        // Redirect to home after short delay
        setTimeout(() => {
          router.push("/");
        }, 1000);

        return;
      }

      // Production: Verify with server and save to Supabase
      const verifyResponse = await fetch("/api/auth/telegram/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });

      if (!verifyResponse.ok) {
        throw new Error("Failed to verify Telegram authentication");
      }

      const { valid } = await verifyResponse.json();

      if (!valid) {
        throw new Error("Invalid Telegram authentication");
      }

      // Create or update user in Supabase
      const { data: userData, error: upsertError } = await supabase
        .from("users")
        .upsert({
          id: `telegram-${user.id}`,
          telegram_id: user.id,
          telegram_username: user.username || "",
          display_name: `${user.first_name}${user.last_name ? ' ' + user.last_name : ''}`,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (upsertError) {
        console.error("Failed to save user:", upsertError);
        throw new Error("Failed to save user data");
      }

      // Save to localStorage
      localStorage.setItem("synaq_user_id", userData.id);
      localStorage.setItem("synaq_user_data", JSON.stringify(userData));

      // Redirect to home
      setTimeout(() => {
        router.push("/");
      }, 1000);
    } catch (err) {
      console.error("Auth error:", err);
      setError(err instanceof Error ? err.message : "Authentication failed");
      setIsLoading(false);
    }
  };

  const handleSkipAuth = () => {
    // Dev mode: Skip auth with mock user
    if (process.env.NODE_ENV === 'development') {
      const mockUser = {
        id: "mock-user-" + Date.now(),
        telegram_id: 0,
        telegram_username: "dev_user",
        display_name: "Dev User",
        first_name: "Dev",
      };

      localStorage.setItem("synaq_user_id", mockUser.id);
      localStorage.setItem("synaq_user_data", JSON.stringify(mockUser));

      router.push("/");
    }
  };

  if (!botUsername && process.env.NODE_ENV !== 'development') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-bold text-foreground mb-4">
            Configuration Error
          </h2>
          <p className="text-foreground-muted text-sm">
            Telegram bot is not configured. Please set
            NEXT_PUBLIC_TELEGRAM_BOT_USERNAME in your environment variables.
          </p>
        </div>
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
            opacity: [0.05, 0.1, 0.05],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-lime rounded-full blur-3xl"
        />
      </div>

      {/* Main Content */}
      <main className="relative flex-1 flex flex-col items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md w-full"
        >
          {/* Logo */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="mb-8"
          >
            <div className="w-20 h-20 mx-auto rounded-full bg-lime/10 border-2 border-lime flex items-center justify-center">
              <Mountain className="w-10 h-10 text-lime" />
            </div>
          </motion.div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome to <span className="text-lime">SYNAQ</span>
          </h1>
          <p className="text-foreground-muted mb-8">
            Login with Telegram to start tracking your climbs
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

          {/* Loading State */}
          {isLoading ? (
            <div className="bg-surface rounded-2xl p-8 border border-lime/20">
              <Loader2 className="w-8 h-8 text-lime mx-auto mb-4 animate-spin" />
              <p className="text-foreground-muted text-sm">Authenticating...</p>
            </div>
          ) : (
            <>
              {/* Telegram Login */}
              <div className="bg-surface rounded-2xl p-8 border border-lime/20">
                <div className="flex items-center justify-center gap-2 mb-6">
                  <Send className="w-5 h-5 text-lime" />
                  <h2 className="text-lg font-semibold text-foreground">
                    Login with Telegram
                  </h2>
                </div>

                <TelegramLogin
                  botUsername={botUsername || "synaq_bot"}
                  onAuth={handleTelegramAuth}
                  buttonSize="large"
                />
              </div>

              {/* Dev Mode Skip */}
              {process.env.NODE_ENV === 'development' && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  onClick={handleSkipAuth}
                  className="mt-4 w-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400
                             text-sm py-3 rounded-lg hover:bg-yellow-500/20 transition-colors"
                  type="button"
                >
                  🧪 DEV: Skip Authentication (use mock user)
                </motion.button>
              )}
            </>
          )}

          {/* Info */}
          <div className="mt-8 bg-surface/50 rounded-lg p-4">
            <p className="text-foreground-muted text-xs text-center">
              We use Telegram to verify your identity and prevent cheating.
              Your data is safe and only used for the leaderboard.
            </p>
          </div>

          {/* Features */}
          <div className="mt-8 space-y-3 text-left">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-lime/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-2 h-2 rounded-full bg-lime" />
              </div>
              <div>
                <p className="text-foreground text-sm font-semibold">
                  Track Your Progress
                </p>
                <p className="text-foreground-muted text-xs">
                  Save all your climbs and see improvement over time
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-lime/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-2 h-2 rounded-full bg-lime" />
              </div>
              <div>
                <p className="text-foreground text-sm font-semibold">
                  Compete on Leaderboard
                </p>
                <p className="text-foreground-muted text-xs">
                  See how you rank against other climbers
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-lime/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-2 h-2 rounded-full bg-lime" />
              </div>
              <div>
                <p className="text-foreground text-sm font-semibold">
                  Share on Social
                </p>
                <p className="text-foreground-muted text-xs">
                  Show off your achievements to friends
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
