import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { calculateCyclePredictions, getDayType } from "@/lib/cycle-calculator";
import type { Cycle } from "@shared/schema";

interface CalendarViewProps {
  cycles: Cycle[];
  activeCycle?: Cycle;
  onDateClick?: (date: Date) => void;
}

export function CalendarView({ cycles, activeCycle, onDateClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const firstDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();
  
  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  
  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };
  
  // Get period dates from cycles
  const periodDates: Date[] = [];
  cycles.forEach(cycle => {
    const startDate = new Date(cycle.startDate);
    periodDates.push(startDate);
    
    if (cycle.endDate) {
      const endDate = new Date(cycle.endDate);
      const currentPeriodDate = new Date(startDate);
      while (currentPeriodDate <= endDate) {
        periodDates.push(new Date(currentPeriodDate));
        currentPeriodDate.setDate(currentPeriodDate.getDate() + 1);
      }
    } else if (cycle.length) {
      for (let i = 1; i < cycle.length; i++) {
        const periodDate = new Date(startDate);
        periodDate.setDate(startDate.getDate() + i);
        periodDates.push(periodDate);
      }
    }
  });
  
  // Calculate cycle predictions if we have an active cycle
  let cycleData = null;
  if (activeCycle) {
    cycleData = calculateCyclePredictions(new Date(activeCycle.startDate));
  }
  
  // Helper to get the user's cycle length (default 28)
  const userCycleLength = activeCycle?.length || 28;
  // Find the most recent period start date
  const lastPeriodStart = cycles.length > 0 ? new Date(cycles[cycles.length - 1].startDate) : null;
  // Debug output
  console.log('CalendarView cycles:', cycles);
  console.log('CalendarView lastPeriodStart:', lastPeriodStart, 'userCycleLength:', userCycleLength);
  console.log('CalendarView current month/year:', month + 1, year);
  console.log('CalendarView activeCycle:', activeCycle);

  // Enhanced getDayType for robust phase coloring
  function getDayPhase(date: Date): string {
    if (!lastPeriodStart) {
      console.log('getDayPhase: No lastPeriodStart, returning normal for date:', date.toDateString());
      return "normal";
    }
    // Calculate days since last period
    const diff = Math.floor((date.getTime() - lastPeriodStart.getTime()) / (1000 * 60 * 60 * 24));
    const dayInCycle = ((diff % userCycleLength) + userCycleLength) % userCycleLength;
    const today = new Date();
    today.setHours(0,0,0,0);
    // Predicted next period window
    const predictedStart = userCycleLength;
    const predictedEnd = userCycleLength + 4;
    // If the date is in the future, use predicted color for period days
    if (date > today) {
      if (dayInCycle >= 0 && dayInCycle < 5) return "predicted"; // future period as predicted
    }
    // Prioritize: ovulation > period > fertile > predicted
    if (dayInCycle === 13) return "ovulation"; // blue
    if (dayInCycle >= 0 && dayInCycle < 5) return "period"; // red/pink
    if (dayInCycle >= 8 && dayInCycle < 14) return "fertile"; // green
    if (dayInCycle >= predictedStart && dayInCycle < predictedEnd) return "predicted"; // orange
    return "normal";
  }

  const renderDay = (day: number) => {
    const date = new Date(year, month, day);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    let dayType = getDayPhase(date);
    // Use soft, girlish pastel colors
    let dayClasses = "w-9 h-9 aspect-square flex items-center justify-center text-sm rounded-full cursor-pointer transition-colors mx-auto ";
    if (isToday) {
      dayClasses += "ring-4 ring-pink-200 shadow-pink-100 shadow-lg ";
    }
    switch (dayType) {
      case "period":
        dayClasses += "bg-pink-200 text-pink-800 "; // light pink
        break;
      case "fertile":
        dayClasses += "bg-purple-200 text-purple-800 "; // light purple
        break;
      case "ovulation":
        dayClasses += "bg-pink-700 text-white "; // dark pink
        break;
      case "predicted":
        dayClasses += "bg-red-200 text-red-700 "; // lightish red
        break;
      default:
        dayClasses += "bg-transparent text-gray-900 ";
    }
    return (
      <button
        key={day}
        className={dayClasses}
        onClick={() => onDateClick?.(date)}
      >
        {day}
      </button>
    );
  };
  
  const renderCalendar = () => {
    const days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="aspect-square"></div>);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(renderDay(day));
    }
    
    return days;
  };
  
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="bg-gradient-to-br from-pink-50 via-white to-pink-100 rounded-3xl shadow-lg p-7 mb-8 border-2 border-pink-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="flex items-center gap-2 text-xl font-extrabold text-pink-600 font-[cursive, 'Comic Sans MS', 'Quicksand', 'Poppins', 'sans-serif']">
          <Heart size={20} className="text-pink-400 mr-1" />
          {monthNames[month]} {year}
        </h3>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={previousMonth}
            className="p-2 hover:bg-pink-100 dark:hover:bg-gray-700 rounded-full"
          >
            <ChevronLeft size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={nextMonth}
            className="p-2 hover:bg-pink-100 dark:hover:bg-gray-700 rounded-full"
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>

      {/* Week day headers */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-xs font-bold text-pink-400 font-[cursive, 'Comic Sans MS', 'Quicksand', 'Poppins', 'sans-serif'] py-2 tracking-wide">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {renderCalendar()}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center space-x-6 mt-6 text-xs">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-pink-200"></div>
          <span className="text-gray-600 dark:text-gray-300">Period</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-purple-200"></div>
          <span className="text-gray-600 dark:text-gray-300">Fertile</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-pink-700"></div>
          <span className="text-gray-600 dark:text-gray-300">Ovulation</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-200"></div>
          <span className="text-gray-600 dark:text-gray-300">Predicted</span>
        </div>
      </div>
    </div>
  );
}
