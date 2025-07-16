import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { CalendarView } from "@/components/cycle/calendar-view";
import { useAuth } from "@/lib/auth";
import type { Cycle } from "@shared/schema";

export default function Calendar() {
  const { user } = useAuth();

  const { data: cycles = [] } = useQuery<Cycle[]>({
    queryKey: ['/api/cycles', user?.id],
    enabled: !!user,
  });

  const activeCycle = cycles.find(cycle => cycle.isActive);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-pink-100 to-pink-200 dark:bg-gray-900">
      <Header />
      
      <main className="max-w-md mx-auto px-4 py-6 pb-24">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Calendar</h2>
          <p className="text-gray-600">Track your cycle history and predictions</p>
        </div>

        <CalendarView cycles={cycles} activeCycle={activeCycle} />

        {/* Cycle History */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Cycles</h3>
          
          {cycles.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No cycle data yet. Start by logging your period!
            </p>
          ) : (
            <div className="space-y-3">
              {cycles.slice(0, 5).map((cycle) => (
                <div key={cycle.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">
                      {new Date(cycle.startDate).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      {cycle.endDate 
                        ? `${Math.ceil((new Date(cycle.endDate).getTime() - new Date(cycle.startDate).getTime()) / (1000 * 60 * 60 * 24))} days`
                        : cycle.isActive ? "Active" : "Ongoing"
                      }
                    </p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs ${
                    cycle.isActive ? "bg-brand-pink text-white" : "bg-gray-200 text-gray-600"
                  }`}>
                    {cycle.isActive ? "Current" : "Past"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
}
