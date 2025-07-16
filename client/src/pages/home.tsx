import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, FileText } from "lucide-react";
import { Header } from "@/components/layout/header";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { CycleOverview } from "@/components/cycle/cycle-overview";
import { CalendarView } from "@/components/cycle/calendar-view";
import { DailyTrackingEnhanced } from "@/components/tracking/daily-tracking-enhanced";
import { HealthTips } from "@/components/tracking/health-tips";
import { PeriodLogModal } from "@/components/modals/period-log-modal";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Cycle, DailyLog, Prediction } from "@shared/schema";

export default function Home() {
  const { user } = useAuth();
  const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false);
  const dailyTrackingRef = useRef<HTMLDivElement>(null);
  const symptomsSectionRef = useRef<HTMLDivElement>(null);
  
  const today = new Date().toISOString().split('T')[0];

  // Fetch cycles
  const { data: cycles = [] } = useQuery<Cycle[]>({
    queryKey: [`/api/cycles/${user?.id}`],
    enabled: !!user,
  });

  // Fetch today's log
  const { data: todayLog } = useQuery<DailyLog | null>({
    queryKey: [`/api/daily-logs/${user?.id}/${today}`],
    enabled: !!user,
  });

  // Fetch predictions
  const { data: prediction } = useQuery<Prediction>({
    queryKey: ['/api/predictions', user?.id],
    enabled: !!user,
  });

  // Mutations
  const createCycleMutation = useMutation({
    mutationFn: async (data: { startDate: string; endDate?: string }) => {
      return apiRequest('POST', '/api/cycles', {
        userId: user?.id,
        startDate: data.startDate,
        endDate: data.endDate,
        isActive: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cycles'] });
      queryClient.invalidateQueries({ queryKey: ['/api/predictions'] });
    },
  });

  const updateDailyLogMutation = useMutation({
    mutationFn: async (updates: Partial<DailyLog>) => {
      console.log("Mutation called with updates:", updates);
      console.log("Current todayLog in mutation:", todayLog);
      console.log("todayLog has id?", todayLog?.id);
      
      if (todayLog && todayLog.id) {
        // Update existing log
        console.log("Updating existing log with id:", todayLog.id);
        return apiRequest('PATCH', `/api/daily-logs/${todayLog.id}`, updates);
      } else {
        // Create new log
        console.log("Creating new log");
        return apiRequest('POST', '/api/daily-logs', {
          userId: user?.id,
          date: today,
          ...updates,
        });
      }
    },
    onSuccess: () => {
      console.log("Mutation successful, invalidating queries");
      queryClient.invalidateQueries({ queryKey: [`/api/daily-logs/${user?.id}/${today}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/daily-logs'] });
    },
  });

  const activeCycle = cycles.find(cycle => cycle.isActive);
  
  const handlePeriodSave = async (data: { startDate: string; endDate?: string }) => {
    await createCycleMutation.mutateAsync(data);
  };

  const handleLogUpdate = (updates: Partial<DailyLog>) => {
    // Special handling for waterIntake to avoid stale state
    if (typeof updates.waterIntake === 'number') {
      const currentIntake = todayLog?.waterIntake || 0;
      const newIntake = updates.waterIntake;
      // If the update is an increment, add to current
      if (newIntake !== currentIntake) {
        updateDailyLogMutation.mutate({ ...updates, waterIntake: currentIntake + (newIntake - currentIntake) });
      } else {
        updateDailyLogMutation.mutate(updates);
      }
    } else {
      updateDailyLogMutation.mutate(updates);
    }
  };

  // Local state for water intake
  const [localWaterIntake, setLocalWaterIntake] = useState<number>(0);

  // Sync local state with todayLog
  useEffect(() => {
    setLocalWaterIntake(todayLog?.waterIntake || 0);
  }, [todayLog?.waterIntake]);

  // Always use the latest local state for water increments
  const handleAddWater = (amount: number) => {
    setLocalWaterIntake(prev => {
      const newIntake = prev + amount;
      updateDailyLogMutation.mutate({ waterIntake: newIntake });
      return newIntake;
    });
  };

  const handleLogSymptomsClick = () => {
    // Scroll directly to the symptoms section
    symptomsSectionRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  // Mood-boosting activity suggestions based on mood
  const moodActivities: Record<string, { title: string; description: string; link?: string }> = {
    happy: {
      title: "Share Your Joy!",
      description: "Call a friend, dance to your favorite song, or write about what made you happy today!",
    },
    sad: {
      title: "Music & Comfort",
      description: "Listen to uplifting music, watch a feel-good movie, or try a guided meditation.",
      link: "https://www.youtube.com/results?search_query=happy+music+playlist",
    },
    angry: {
      title: "Journaling & Movement",
      description: "Write down your feelings or go for a brisk walk to release tension.",
    },
    tired: {
      title: "Gentle Rest",
      description: "Try a short nap, gentle yoga, or a relaxing breathing exercise.",
      link: "https://www.youtube.com/results?search_query=relaxing+yoga+for+sleep",
    },
    anxious: {
      title: "Meditation & Mindfulness",
      description: "Try a 5-minute meditation or deep breathing. Journaling can also help calm your mind.",
      link: "https://www.youtube.com/results?search_query=guided+meditation+for+anxiety",
    },
  };

  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      setIsDark(true);
    } else {
      setIsDark(false);
    }
  }, []);

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-pink-50 via-pink-100 to-pink-200'}`}>
      <Header />
      
      <main className="max-w-md mx-auto px-4 py-6 pb-24">
        {/* Greeting */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            Hello, {user?.name?.split(' ')[0] || 'Beautiful'}! 💕
          </h2>
          <p className="text-gray-600 dark:text-gray-300">You've got this! 💪</p>
        </div>

        {/* Mood-Boosting Activities Card */}
        {todayLog?.mood && moodActivities[todayLog.mood] && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-brand-pink mb-6">
            <h3 className="text-lg font-semibold text-brand-pink mb-2">Mood-Boosting Activity</h3>
            <p className="font-bold text-gray-800 dark:text-white mb-1">{moodActivities[todayLog.mood].title}</p>
            <p className="text-gray-600 dark:text-gray-300 mb-2">{moodActivities[todayLog.mood].description}</p>
            {moodActivities[todayLog.mood].link && (
              <a
                href={moodActivities[todayLog.mood].link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-pink underline text-sm"
              >
                Try this activity
              </a>
            )}
          </div>
        )}

        {/* Cycle Overview - Only show if user has logged at least one period */}
        {cycles.length > 0 && (
          <CycleOverview 
            activeCycle={activeCycle}
            averageCycleLength={prediction?.averageCycleLength ?? undefined}
          />
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <PeriodLogModal
            isOpen={isPeriodModalOpen}
            onClose={() => setIsPeriodModalOpen(false)}
            onSave={handlePeriodSave}
            onOpen={() => setIsPeriodModalOpen(true)}
          >
            <Button className="btn-primary text-white rounded-xl p-4 h-auto flex flex-col items-center space-y-2">
              <Plus size={20} />
              <span className="font-medium">Log Period</span>
            </Button>
          </PeriodLogModal>
          
          <Button
            variant="outline"
            onClick={handleLogSymptomsClick}
            className="rounded-xl p-4 h-auto flex flex-col items-center space-y-2 border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
          >
            <FileText className="text-brand-pink" size={20} />
            <span className="font-medium text-gray-700 dark:text-white">Log Symptoms</span>
          </Button>
        </div>

        {/* Calendar View */}
        <CalendarView cycles={cycles} activeCycle={activeCycle} />

        {/* Daily Tracking */}
        <div ref={dailyTrackingRef}>
          <DailyTrackingEnhanced
            dailyLog={todayLog ? { ...todayLog, waterIntake: localWaterIntake } : undefined}
            onUpdateLog={handleLogUpdate}
            onAddWater={handleAddWater}
            isUpdating={updateDailyLogMutation.isPending}
            symptomsSectionRef={symptomsSectionRef}
          />
        </div>

        {/* Health Tips */}
        <HealthTips symptoms={todayLog?.symptoms || []} />

        {/* Insights Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-brand-pink">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Your Insights</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900 rounded-xl">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-300 mb-1">
                {prediction?.averageCycleLength || 28}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Average Cycle</p>
            </div>
            <div className="text-center p-4 bg-red-50 dark:bg-red-900 rounded-xl">
              <div className="text-2xl font-bold text-red-600 dark:text-red-300 mb-1">
                {typeof activeCycle?.length === 'number' ? activeCycle.length : 5}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Last Period</p>
            </div>
          </div>
          <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900 rounded-xl">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-4 h-4 bg-purple-600 rounded-full"></div>
              <p className="font-medium text-gray-800 dark:text-white">Pattern Recognition</p>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Your cycles have been regular. Keep tracking for better predictions! 📊
            </p>
          </div>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
}
