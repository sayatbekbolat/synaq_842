"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mountain, Zap, ChevronRight, LogOut, User, Send } from "lucide-react";
import Podium from "@/components/Podium";
import LiveCount from "@/components/LiveCount";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [leaders, setLeaders] = useState<any[]>([]);
  const [liveCount, setLiveCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ today: 0, week: 0, allTime: 0 });

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem("synaq_user_data");
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // Fetch leaderboard data
    fetchLeaderboard();
    fetchLiveCount();
    fetchStats();

    // Refresh every 30 seconds
    const interval = setInterval(() => {
      fetchLeaderboard();
      fetchLiveCount();
      fetchStats();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchLeaderboard = async () => {
    try {
      // In dev mode, try to get from Supabase, fallback to localStorage
      if (process.env.NODE_ENV === 'development') {
        // Try Supabase first
        const { data, error } = await supabase.rpc('get_todays_leaderboard', { limit_count: 10 });

        if (!error && data && data.length > 0) {
          // Transform data to match Podium component format (duration -> time)
          const transformedData = data.map((item: any) => ({
            ...item,
            time: item.duration
          }));
          setLeaders(transformedData);
          setIsLoading(false);
          return;
        }

        // Fallback: Check localStorage for completed attempts
        const attempts = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key?.startsWith('synaq_attempt_')) {
            const attempt = JSON.parse(localStorage.getItem(key) || '{}');
            if (attempt.status === 'completed' && attempt.duration) {
              const userData = JSON.parse(localStorage.getItem(attempt.userId) || '{}');
              attempts.push({
                rank: 0,
                name: userData.display_name || 'Anonymous',
                time: attempt.duration,
                duration: attempt.duration,
                instagram: userData.telegram_username || '',
                created_at: new Date(attempt.endTime || Date.now()).toISOString()
              });
            }
          }
        }

        // Sort by duration and assign ranks
        attempts.sort((a, b) => a.time - b.time);
        attempts.forEach((attempt, index) => {
          attempt.rank = index + 1;
        });

        setLeaders(attempts.slice(0, 3));
        setIsLoading(false);
        return;
      }

      // Production: Fetch from Supabase
      const { data, error } = await supabase.rpc('get_todays_leaderboard', { limit_count: 10 });

      if (error) {
        console.error('Error fetching leaderboard:', error);
        setIsLoading(false);
        return;
      }

      // Transform data to match Podium component format (duration -> time)
      const transformedData = (data || []).map((item: any) => ({
        ...item,
        time: item.duration
      }));

      setLeaders(transformedData);
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
      setIsLoading(false);
    }
  };

  const fetchLiveCount = async () => {
    try {
      const { data, error } = await supabase.rpc('get_live_climbers_count');

      if (!error && data !== null) {
        setLiveCount(data);
      }
    } catch (err) {
      console.error('Failed to fetch live count:', err);
    }
  };

  const fetchStats = async () => {
    try {
      // In dev mode, count from localStorage
      if (process.env.NODE_ENV === 'development') {
        let todayCount = 0;
        let weekCount = 0;
        let allTimeCount = 0;

        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).getTime();

        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key?.startsWith('synaq_attempt_')) {
            const attempt = JSON.parse(localStorage.getItem(key) || '{}');
            if (attempt.status === 'completed' && attempt.endTime) {
              allTimeCount++;
              if (attempt.endTime >= todayStart) todayCount++;
              if (attempt.endTime >= weekStart) weekCount++;
            }
          }
        }

        setStats({ today: todayCount, week: weekCount, allTime: allTimeCount });
        return;
      }

      // Production: Query Supabase
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - 7);

      // Count today's attempts
      const { count: todayCount } = await supabase
        .from('attempts')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed')
        .gte('created_at', todayStart.toISOString());

      // Count this week's attempts
      const { count: weekCount } = await supabase
        .from('attempts')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed')
        .gte('created_at', weekStart.toISOString());

      // Count all-time attempts
      const { count: allTimeCount } = await supabase
        .from('attempts')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed');

      setStats({
        today: todayCount || 0,
        week: weekCount || 0,
        allTime: allTimeCount || 0,
      });
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleStartClick = () => {
    // Check authentication
    if (!user && process.env.NODE_ENV !== 'development') {
      router.push("/auth");
      return;
    }

    router.push("/start");
  };

  const handleLogout = () => {
    localStorage.removeItem("synaq_user_id");
    localStorage.removeItem("synaq_user_data");
    setUser(null);
    setShowUserMenu(false);
  };

  const handleLogin = () => {
    console.log("Login button clicked!");
    router.push("/auth");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Live Count Indicator */}
      <LiveCount count={liveCount} />

      {/* User Menu */}
      {user ? (
        <div className="fixed top-4 left-4 z-50">
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="bg-surface-elevated border border-lime/30 rounded-full px-4 py-2 flex items-center gap-2 hover:bg-surface transition-colors"
              type="button"
            >
              <User className="w-4 h-4 text-lime" />
              <span className="text-foreground text-sm font-semibold">
                {user.first_name}
              </span>
            </button>

            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full left-0 mt-2 bg-surface border border-foreground-muted/20 rounded-lg shadow-lg overflow-hidden min-w-[200px]"
              >
                <div className="p-3 border-b border-foreground-muted/10">
                  <p className="text-foreground text-sm font-semibold">
                    {user.display_name}
                  </p>
                  {user.telegram_username && (
                    <p className="text-foreground-muted text-xs">
                      @{user.telegram_username}
                    </p>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full px-3 py-2 text-left text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2 text-sm"
                  type="button"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </motion.div>
            )}
          </div>
        </div>
      ) : (
        <div className="fixed top-4 left-4 z-50">
          <button
            onClick={handleLogin}
            className="bg-lime text-background font-semibold px-4 py-2 rounded-full hover:bg-lime-glow transition-colors text-sm flex items-center gap-2"
            type="button"
          >
            <Send className="w-4 h-4" />
            Login
          </button>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-between px-6 py-8 pb-24">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mt-8"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Mountain className="w-8 h-8 text-lime" />
            <h1 className="text-4xl font-bold tracking-tight">
              <span className="text-foreground">SYN</span>
              <span className="text-lime">AQ</span>
            </h1>
          </div>
          <p className="text-foreground-muted text-sm">
            Health Stairs · Almaty
          </p>
        </motion.div>

        {/* Podium Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="w-full max-w-md my-8"
        >
          {isLoading ? (
            <div className="text-center text-foreground-muted py-12">
              <p className="text-sm">Loading leaderboard...</p>
            </div>
          ) : leaders.length > 0 ? (
            <Podium leaders={leaders} />
          ) : (
            <div className="text-center text-foreground-muted py-12">
              <p className="text-sm">No climbs yet today. Be the first!</p>
            </div>
          )}
        </motion.div>

        {/* CTA Section - Positioned for easy thumb reach */}
        <div className="w-full max-w-md space-y-4">
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleStartClick}
            type="button"
            className="w-full bg-lime text-background font-bold text-2xl py-6 rounded-2xl
                       glow-lime border-sharp border-lime-glow
                       cursor-pointer
                       active:scale-[0.98] transition-all duration-150
                       flex items-center justify-center gap-3"
          >
            <Zap className="w-7 h-7" />
            START SYNAQ
            <ChevronRight className="w-7 h-7" />
          </motion.button>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-3 gap-2 text-center"
          >
            <div className="bg-surface rounded-lg p-3">
              <div className="text-lime font-bold text-xl font-mono">{stats.today}</div>
              <div className="text-foreground-muted text-xs">Today</div>
            </div>
            <div className="bg-surface rounded-lg p-3">
              <div className="text-accent font-bold text-xl font-mono">{stats.week}</div>
              <div className="text-foreground-muted text-xs">This Week</div>
            </div>
            <div className="bg-surface rounded-lg p-3">
              <div className="text-success font-bold text-xl font-mono">{stats.allTime}</div>
              <div className="text-foreground-muted text-xs">All Time</div>
            </div>
          </motion.div>

          {/* Info Text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center text-foreground-muted text-sm px-4"
          >
            Scan QR codes at start and finish to log your climb
          </motion.p>
        </div>
      </main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-center text-foreground-muted text-xs pb-6 px-6"
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="h-px bg-foreground-muted/20 flex-1 max-w-[80px]" />
          <span>Powered by mountain energy</span>
          <div className="h-px bg-foreground-muted/20 flex-1 max-w-[80px]" />
        </div>
      </motion.footer>
    </div>
  );
}
