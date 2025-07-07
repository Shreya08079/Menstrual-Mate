import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, FileText } from "lucide-react";
import { Header } from "@/components/layout/header";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { CycleOverview } from "@/components/cycle/cycle-overview";
import { CalendarView } from "@/components/cycle/calendar-view";
import { DailyTracking } from "@/components/tracking/daily-tracking";
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
  
  const today = new Date().toISOString().split('T')[0];

  // Fetch cycles
  const { data: cycles = [] } = useQuery<Cycle[]>({
    queryKey: ['/api/cycles', user?.id],
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
    console.log("handleLogUpdate called with:", updates);
    updateDailyLogMutation.mutate(updates);
  };

  const handleLogSymptomsClick = () => {
    // Scroll to daily tracking section
    dailyTrackingRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  return (
    <div className="min-h-screen bg-brand-gray">
      <Header />
      
      <main className="max-w-md mx-auto px-4 py-6 pb-24">
        {/* Greeting */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Hello, {user?.name?.split(' ')[0] || 'Beautiful'}! 💕
          </h2>
          <p className="text-gray-600">You've got this! 💪</p>
        </div>

        {/* Cycle Overview - Only show if user has logged at least one period */}
        {cycles.length > 0 && (
          <CycleOverview 
            activeCycle={activeCycle}
            averageCycleLength={prediction?.averageCycleLength}
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
            className="rounded-xl p-4 h-auto flex flex-col items-center space-y-2 border-gray-200 hover:bg-gray-50"
          >
            <FileText className="text-brand-pink" size={20} />
            <span className="font-medium text-gray-700">Log Symptoms</span>
          </Button>
        </div>

        {/* Calendar View */}
        <CalendarView cycles={cycles} activeCycle={activeCycle} />

        {/* Daily Tracking */}
        <div ref={dailyTrackingRef}>
          <DailyTracking
            dailyLog={todayLog}
            onUpdateLog={handleLogUpdate}
            isUpdating={updateDailyLogMutation.isPending}
          />
        </div>

        {/* Health Tips */}
        <HealthTips symptoms={todayLog?.symptoms || []} />

        {/* Insights Card */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Insights</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {prediction?.averageCycleLength || 28}
              </div>
              <p className="text-sm text-gray-600">Average Cycle</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-xl">
              <div className="text-2xl font-bold text-red-600 mb-1">
                {activeCycle?.length || 5}
              </div>
              <p className="text-sm text-gray-600">Last Period</p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-purple-50 rounded-xl">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-4 h-4 bg-purple-600 rounded-full"></div>
              <p className="font-medium text-gray-800">Pattern Recognition</p>
            </div>
            <p className="text-sm text-gray-600">
              Your cycles have been regular. Keep tracking for better predictions! 📊
            </p>
          </div>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
}
