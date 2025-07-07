import { ChevronLeft, ChevronRight } from "lucide-react";
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
  
  const renderDay = (day: number) => {
    const date = new Date(year, month, day);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    
    let dayType = "normal";
    if (cycleData) {
      dayType = getDayType(date, cycleData, periodDates);
    }
    
    let dayClasses = "aspect-square flex items-center justify-center text-sm rounded-lg cursor-pointer transition-colors ";
    
    if (isToday) {
      dayClasses += "ring-2 ring-brand-pink ";
    }
    
    switch (dayType) {
      case "period":
        dayClasses += "period-day text-white font-medium ";
        break;
      case "fertile":
        dayClasses += "fertile-day text-white font-medium ";
        break;
      case "predicted":
        dayClasses += "predicted-day text-gray-700 font-medium ";
        break;
      default:
        dayClasses += "hover:bg-gray-100 ";
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
  
  const weekDays = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">
          {monthNames[month]} {year}
        </h3>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={previousMonth}
            className="p-2 hover:bg-gray-100"
          >
            <ChevronLeft size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100"
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>

      {/* Week day headers */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
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
          <div className="w-3 h-3 period-day rounded-full"></div>
          <span className="text-gray-600">Period</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 fertile-day rounded-full"></div>
          <span className="text-gray-600">Fertile</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 predicted-day rounded-full"></div>
          <span className="text-gray-600">Predicted</span>
        </div>
      </div>
    </div>
  );
}
