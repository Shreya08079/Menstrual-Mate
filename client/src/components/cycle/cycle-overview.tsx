import { Calendar, TrendingUp, Droplet } from "lucide-react";
import { calculateCyclePredictions } from "@/lib/cycle-calculator";
import type { Cycle } from "@shared/schema";

interface CycleOverviewProps {
  activeCycle?: Cycle;
  averageCycleLength?: number;
}

export function CycleOverview({ activeCycle, averageCycleLength = 28 }: CycleOverviewProps) {
  if (!activeCycle?.startDate) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <div className="text-center">
          <div className="w-24 h-24 rounded-full border-8 border-gray-100 mx-auto mb-4 flex items-center justify-center">
            <span className="text-gray-400 text-lg font-semibold">?</span>
          </div>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Track Your Cycle</h2>
          <p className="text-gray-600 text-sm mb-4">Add your last period date to get started</p>
        </div>
      </div>
    );
  }

  const lastPeriodStart = new Date(activeCycle.startDate);
  const cycleData = calculateCyclePredictions(lastPeriodStart, averageCycleLength);
  
  const progressPercentage = (cycleData.currentCycleDay / averageCycleLength) * 100;
  const strokeDasharray = 2 * Math.PI * 40; // circumference
  const strokeDashoffset = strokeDasharray - (strokeDasharray * progressPercentage) / 100;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
      <div className="text-center">
        <div className="relative w-24 h-24 mx-auto mb-4">
          <svg className="w-24 h-24 transform -rotate-90">
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="rgb(243 244 246)"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="url(#gradient)"
              strokeWidth="8"
              fill="none"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(340, 82%, 52%)" />
                <stop offset="100%" stopColor="hsl(292, 64%, 42%)" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-semibold text-gray-800">
              {cycleData.daysUntilPeriod}
            </span>
          </div>
        </div>
        
        <h2 className="text-lg font-semibold text-gray-800 mb-2">
          Next Period in {cycleData.daysUntilPeriod} Days
        </h2>
        <p className="text-gray-600 text-sm mb-4">
          Expected on {cycleData.nextPeriodDate.toLocaleDateString()}
        </p>
        
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Calendar className="text-red-500" size={20} />
            </div>
            <p className="text-xs text-gray-600">Cycle Day</p>
            <p className="font-semibold text-gray-800">{cycleData.currentCycleDay}</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="text-green-500" size={20} />
            </div>
            <p className="text-xs text-gray-600">Avg Length</p>
            <p className="font-semibold text-gray-800">{averageCycleLength} days</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Droplet className="text-blue-500" size={20} />
            </div>
            <p className="text-xs text-gray-600">Last Period</p>
            <p className="font-semibold text-gray-800">
              {activeCycle.length || activeCycle.endDate 
                ? `${activeCycle.length || Math.ceil((new Date(activeCycle.endDate!).getTime() - new Date(activeCycle.startDate).getTime()) / (1000 * 60 * 60 * 24))} days`
                : "Ongoing"
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
