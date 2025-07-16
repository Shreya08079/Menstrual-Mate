import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Calendar, Target, Activity } from "lucide-react";
import { Header } from "@/components/layout/header";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { PatternRecognition } from "@/components/insights/pattern-recognition";
import { useAuth } from "@/lib/auth";
import type { Cycle, DailyLog, Prediction } from "@shared/schema";
import { useRef } from "react";

export default function Insights() {
  const { user } = useAuth();
  const reportRef = useRef<HTMLDivElement>(null);

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

  const handlePrintReport = () => {
    if (!reportRef.current) return;
    const printContents = reportRef.current.innerHTML;
    const printWindow = window.open('', '', 'height=800,width=600');
    if (printWindow) {
      printWindow.document.write('<html><head><title>Doctor Report</title>');
      printWindow.document.write('<style>body{font-family:sans-serif;padding:2rem;}h2{color:#d946ef;}h3{margin-top:2rem;}table{width:100%;border-collapse:collapse;}td,th{border:1px solid #eee;padding:0.5rem;}th{background:#f3e8ff;}</style>');
      printWindow.document.write('</head><body >');
      printWindow.document.write(printContents);
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => printWindow.print(), 500);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-pink-100 to-pink-200 dark:bg-gray-900">
      <Header />
      
      <main className="max-w-md mx-auto px-4 py-6 pb-24">
        <section className="mb-8 bg-gradient-to-br from-pink-50 via-pink-100 to-pink-200 dark:bg-gray-800 rounded-3xl shadow-lg p-6 border-2 border-brand-pink flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Insights</h2>
            <p className="text-gray-600 dark:text-gray-300">Your health patterns and trends</p>
          </div>
          <button
            onClick={handlePrintReport}
            className="bg-brand-pink text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-pink-600 transition"
          >
            Doctor Report
          </button>
        </section>
        <section ref={reportRef} className="bg-gradient-to-br from-pink-50 via-pink-100 to-pink-200 dark:bg-gray-800 rounded-3xl shadow-lg p-6 mb-8 border-2 border-brand-pink">
          <div className="flex items-center mb-4">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-brand-light-pink mr-3 shadow"><TrendingUp className="text-brand-pink" size={24} /></span>
            <h2 className="text-2xl font-extrabold text-brand-pink tracking-tight">Your Girlish Insights</h2>
          </div>
          <p className="text-brand-purple mb-6 font-medium">Track your health, spot trends, and celebrate your progress! 💖</p>

          {/* Pattern Recognition - Shows after 2-3 months of tracking */}
          <PatternRecognition cycles={cycles} />

          {/* Mood Trends */}
          <div className="bg-white/80 dark:bg-gray-900 rounded-2xl shadow p-4 mb-6 border border-pink-200">
            <h3 className="text-lg font-semibold text-brand-pink mb-2 flex items-center"><Activity className="mr-2 text-brand-pink" size={18}/>Mood Trends</h3>
            {/* Calculate and show most common mood */}
            {(() => {
              const moodCounts: Record<string, number> = {};
              recentLogs.forEach(log => {
                if (log.mood) moodCounts[log.mood] = (moodCounts[log.mood] || 0) + 1;
              });
              const sortedMoods = Object.entries(moodCounts).sort((a, b) => b[1] - a[1]);
              const topMood: [string, number] | undefined = sortedMoods[0];
              return topMood ? (
                <div className="flex items-center space-x-2">
                  <span className="capitalize font-bold text-brand-purple text-lg">{topMood[0]}</span>
                  <span className="text-gray-500">({topMood[1]} days)</span>
                </div>
              ) : <span className="text-gray-400">No mood data yet</span>;
            })()}
          </div>

          {/* Cycle Statistics */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 mb-6 border border-brand-pink">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Cycle Overview</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900 rounded-xl">
                <Calendar className="mx-auto mb-2 text-blue-600 dark:text-blue-300" size={24} />
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-300 mb-1">{averageCycleLength}</div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Avg Cycle Length</p>
              </div>
              <div className="text-center p-4 bg-red-50 dark:bg-red-900 rounded-xl">
                <Target className="mx-auto mb-2 text-red-600 dark:text-red-300" size={24} />
                <div className="text-2xl font-bold text-red-600 dark:text-red-300 mb-1">{averagePeriodLength}</div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Avg Period Length</p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900 rounded-xl">
              <div className="flex items-center space-x-3 mb-2">
                <TrendingUp className="text-purple-600 dark:text-purple-300" size={20} />
                <p className="font-medium text-gray-800 dark:text-white">Cycle Regularity</p>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {completedCycles.length >= 3
                  ? "Your cycles have been consistent. Great job tracking!"
                  : "Keep tracking to see patterns in your cycle regularity."
                }
              </p>
            </div>
          </div>

          {/* Health Tracking */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 mb-6 border border-brand-pink">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Health Tracking</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 bg-blue-500 dark:bg-blue-300 rounded-full"></div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">Water Intake</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">30-day average</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-blue-600 dark:text-blue-300">{averageWaterIntake}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">glasses/day</p>
                </div>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div className="flex items-center space-x-3 mb-2">
                  <Activity className="text-gray-600 dark:text-gray-300" size={20} />
                  <p className="font-medium text-gray-800 dark:text-white">Common Symptoms</p>
                </div>
                {topSymptoms.length > 0 ? (
                  <div className="space-y-1">
                    {topSymptoms.map(([symptom, count]) => (
                      <div key={symptom} className="flex justify-between text-sm">
                        <span className="capitalize text-gray-700 dark:text-gray-200">{symptom.replace('_', ' ')}</span>
                        <span className="text-gray-500 dark:text-gray-400">{count} times</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No symptoms tracked yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Consistency Streak */}
          <div className="bg-white/80 dark:bg-gray-900 rounded-2xl shadow p-4 mb-6 border border-pink-200">
            <h3 className="text-lg font-semibold text-brand-pink mb-2 flex items-center"><Calendar className="mr-2 text-brand-pink" size={18}/>Consistency Streak</h3>
            {(() => {
              let streak = 0, maxStreak = 0;
              for (let i = 0; i < recentLogs.length; i++) {
                if (recentLogs[i].symptoms?.length || recentLogs[i].mood) {
                  streak++;
                  if (streak > maxStreak) maxStreak = streak;
                } else {
                  streak = 0;
                }
              }
              return <span className="font-bold text-brand-purple">{maxStreak} days</span>;
            })()}
            <span className="ml-2 text-gray-500">Longest streak of logging</span>
          </div>

          {/* Motivational Message */}
          <div className="bg-brand-light-pink/80 rounded-xl p-4 mb-6 text-center font-semibold text-brand-purple shadow">
            🌸 Keep tracking, stay positive, and remember: every day is a step towards understanding your body better! 🌸
          </div>

          {/* AI Suggestions Placeholder */}
          <div className="bg-white/80 dark:bg-gray-900 rounded-2xl shadow p-4 border border-pink-200">
            <h3 className="text-lg font-semibold text-brand-pink mb-2 flex items-center"><Target className="mr-2 text-brand-pink" size={18}/>AI Suggestions</h3>
            <span className="text-gray-400">Personalized tips coming soon! ✨</span>
          </div>

          {/* Cycle History Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-brand-pink">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Cycle History</h3>
            
            {cycles.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="mx-auto mb-4 text-gray-400" size={48} />
                <p className="text-gray-500 dark:text-gray-400">Start tracking your periods to see insights here!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cycles.slice(0, 6).map((cycle, index) => {
                  const cycleLength = cycle.length || (cycle.endDate 
                    ? Math.ceil((new Date(cycle.endDate).getTime() - new Date(cycle.startDate).getTime()) / (1000 * 60 * 60 * 24))
                    : null);
                  
                  return (
                    <div key={cycle.id} className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div className="flex-shrink-0 w-8 h-8 bg-brand-pink text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {cycles.length - index}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800 dark:text-white">
                          {new Date(cycle.startDate).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {cycleLength ? `${cycleLength} days` : cycle.isActive ? "Active" : "Ongoing"}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className={`px-2 py-1 rounded-full text-xs ${cycle.isActive ? "bg-brand-pink text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-200"}`}>
                          {cycle.isActive ? "Current" : "Past"}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      <BottomNavigation />
    </div>
  );
}
