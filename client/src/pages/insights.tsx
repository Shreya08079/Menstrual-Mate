import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Calendar, Target, Activity } from "lucide-react";
import { Header } from "@/components/layout/header";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { useAuth } from "@/lib/auth";
import type { Cycle, DailyLog, Prediction } from "@shared/schema";

export default function Insights() {
  const { user } = useAuth();

  const { data: cycles = [] } = useQuery<Cycle[]>({
    queryKey: ['/api/cycles', user?.id],
    enabled: !!user,
  });

  const { data: prediction } = useQuery<Prediction>({
    queryKey: ['/api/predictions', user?.id],
    enabled: !!user,
  });

  const { data: dailyLogs = [] } = useQuery<DailyLog[]>({
    queryKey: ['/api/daily-logs', user?.id],
    enabled: !!user,
  });

  // Calculate statistics
  const completedCycles = cycles.filter(cycle => cycle.endDate && cycle.length);
  const averageCycleLength = completedCycles.length > 0
    ? Math.round(completedCycles.reduce((sum, cycle) => sum + (cycle.length || 0), 0) / completedCycles.length)
    : 28;

  const averagePeriodLength = completedCycles.length > 0
    ? Math.round(completedCycles.reduce((sum, cycle) => {
        if (cycle.endDate) {
          const days = Math.ceil((new Date(cycle.endDate).getTime() - new Date(cycle.startDate).getTime()) / (1000 * 60 * 60 * 24));
          return sum + days;
        }
        return sum + (cycle.length || 5);
      }, 0) / completedCycles.length)
    : 5;

  // Water intake statistics
  const recentLogs = dailyLogs.slice(0, 30); // Last 30 days
  const averageWaterIntake = recentLogs.length > 0
    ? Math.round(recentLogs.reduce((sum, log) => sum + (log.waterIntake || 0), 0) / recentLogs.length)
    : 0;

  // Most common symptoms
  const symptomCounts: Record<string, number> = {};
  recentLogs.forEach(log => {
    log.symptoms?.forEach(symptom => {
      symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
    });
  });

  const topSymptoms = Object.entries(symptomCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-brand-gray">
      <Header />
      
      <main className="max-w-md mx-auto px-4 py-6 pb-24">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Insights</h2>
          <p className="text-gray-600">Your health patterns and trends</p>
        </div>

        {/* Cycle Statistics */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Cycle Overview</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <Calendar className="mx-auto mb-2 text-blue-600" size={24} />
              <div className="text-2xl font-bold text-blue-600 mb-1">{averageCycleLength}</div>
              <p className="text-sm text-gray-600">Avg Cycle Length</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-xl">
              <Target className="mx-auto mb-2 text-red-600" size={24} />
              <div className="text-2xl font-bold text-red-600 mb-1">{averagePeriodLength}</div>
              <p className="text-sm text-gray-600">Avg Period Length</p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-purple-50 rounded-xl">
            <div className="flex items-center space-x-3 mb-2">
              <TrendingUp className="text-purple-600" size={20} />
              <p className="font-medium text-gray-800">Cycle Regularity</p>
            </div>
            <p className="text-sm text-gray-600">
              {completedCycles.length >= 3
                ? "Your cycles have been consistent. Great job tracking!"
                : "Keep tracking to see patterns in your cycle regularity."
              }
            </p>
          </div>
        </div>

        {/* Health Tracking */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Health Tracking</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Water Intake</p>
                  <p className="text-sm text-gray-600">30-day average</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-blue-600">{averageWaterIntake}</p>
                <p className="text-sm text-gray-600">glasses/day</p>
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3 mb-2">
                <Activity className="text-gray-600" size={20} />
                <p className="font-medium text-gray-800">Common Symptoms</p>
              </div>
              {topSymptoms.length > 0 ? (
                <div className="space-y-1">
                  {topSymptoms.map(([symptom, count]) => (
                    <div key={symptom} className="flex justify-between text-sm">
                      <span className="capitalize text-gray-700">{symptom.replace('_', ' ')}</span>
                      <span className="text-gray-500">{count} times</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No symptoms tracked yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Cycle History Chart */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Cycle History</h3>
          
          {cycles.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="mx-auto mb-4 text-gray-400" size={48} />
              <p className="text-gray-500">Start tracking your periods to see insights here!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cycles.slice(0, 6).map((cycle, index) => {
                const cycleLength = cycle.length || (cycle.endDate 
                  ? Math.ceil((new Date(cycle.endDate).getTime() - new Date(cycle.startDate).getTime()) / (1000 * 60 * 60 * 24))
                  : null);
                
                return (
                  <div key={cycle.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 bg-brand-pink text-white rounded-full flex items-center justify-center text-sm font-medium">
                      {cycles.length - index}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">
                        {new Date(cycle.startDate).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        {cycleLength ? `${cycleLength} days` : cycle.isActive ? "Active" : "Ongoing"}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`px-2 py-1 rounded-full text-xs ${
                        cycle.isActive ? "bg-brand-pink text-white" : "bg-gray-200 text-gray-600"
                      }`}>
                        {cycle.isActive ? "Current" : "Past"}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
}
