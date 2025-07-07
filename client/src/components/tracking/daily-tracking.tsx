import { Plus, Check, Lightbulb, ChevronDown, Droplets } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getHealthRecommendations } from "@/lib/health-recommendations";
import type { DailyLog } from "@shared/schema";

interface DailyTrackingProps {
  dailyLog?: DailyLog;
  waterGoal?: number;
  onUpdateLog: (updates: Partial<DailyLog>) => void;
}

const glassOptions = [
  { size: 150, label: "Small Glass (150ml)" },
  { size: 200, label: "Regular Glass (200ml)" },
  { size: 250, label: "Large Glass (250ml)" },
  { size: 300, label: "Water Bottle (300ml)" },
  { size: 500, label: "Large Bottle (500ml)" },
  { size: 750, label: "Big Bottle (750ml)" }
];

const moods = [
  { emoji: "😊", value: "happy", label: "Happy" },
  { emoji: "😐", value: "neutral", label: "Neutral" },
  { emoji: "😢", value: "sad", label: "Sad" },
  { emoji: "😴", value: "tired", label: "Tired" },
  { emoji: "😣", value: "pain", label: "Pain" },
];

const symptoms = [
  "cramps",
  "headache", 
  "bloating",
  "fatigue",
  "nausea",
  "mood_swings",
  "breast_tenderness",
  "acne"
];

export function DailyTracking({ dailyLog, waterGoal = 8, onUpdateLog }: DailyTrackingProps) {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(
    dailyLog?.symptoms || []
  );
  const [selectedGlassSize, setSelectedGlassSize] = useState(250); // Default 250ml
  const [showGlassOptions, setShowGlassOptions] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Convert waterIntake from glasses to ml (assuming 250ml per glass if stored as glasses)
  const totalWaterMl = dailyLog?.waterIntake ? dailyLog.waterIntake * 250 : 0;
  const waterGoalMl = waterGoal * 250; // Goal in ml
  const mood = dailyLog?.mood;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowGlassOptions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const addWater = () => {
    // Convert the new total ml to glasses for storage
    const newTotalMl = totalWaterMl + selectedGlassSize;
    const newGlassCount = Math.round(newTotalMl / 250); // Convert back to glasses for storage
    onUpdateLog({ waterIntake: newGlassCount });
  };
  
  const selectMood = (moodValue: string) => {
    onUpdateLog({ mood: moodValue });
  };
  
  const toggleSymptom = (symptom: string) => {
    const newSymptoms = selectedSymptoms.includes(symptom)
      ? selectedSymptoms.filter(s => s !== symptom)
      : [...selectedSymptoms, symptom];
    
    setSelectedSymptoms(newSymptoms);
    onUpdateLog({ symptoms: newSymptoms });
  };
  
  const waterPercentage = (totalWaterMl / waterGoalMl) * 100;
  const recommendations = getHealthRecommendations(selectedSymptoms);

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Today's Tracking</h3>
      
      {/* Water Intake */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Droplets className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="font-medium text-gray-800">Water Intake</p>
              <p className="text-sm text-gray-600">
                {totalWaterMl}ml of {waterGoalMl}ml ({Math.round(totalWaterMl / 250)} glasses)
              </p>
            </div>
          </div>
        </div>
        
        {/* Glass Size Selector */}
        <div className="mb-3">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowGlassOptions(!showGlassOptions)}
              className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg border text-sm"
            >
              <span>Add: {selectedGlassSize}ml</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showGlassOptions ? 'rotate-180' : ''}`} />
            </button>
            
            {showGlassOptions && (
              <div className="absolute top-full left-0 right-0 bg-white border rounded-lg shadow-lg z-10 mt-1">
                {glassOptions.map((option) => (
                  <button
                    key={option.size}
                    onClick={() => {
                      setSelectedGlassSize(option.size);
                      setShowGlassOptions(false);
                    }}
                    className={`w-full text-left p-3 hover:bg-gray-50 text-sm ${
                      selectedGlassSize === option.size ? 'bg-blue-50 text-blue-600' : ''
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-3 mb-3">
          <Button
            onClick={addWater}
            size="sm"
            className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2"
            disabled={totalWaterMl >= waterGoalMl}
          >
            <Plus size={16} />
            Add {selectedGlassSize}ml
          </Button>
          {totalWaterMl > 0 && (
            <Button
              onClick={() => onUpdateLog({ waterIntake: 0 })}
              size="sm"
              variant="outline"
              className="text-gray-600"
            >
              Reset
            </Button>
          )}
        </div>
        
        <Progress value={waterPercentage} className="h-2" />
        <p className="text-xs text-gray-500 mt-1">
          {waterPercentage >= 100 ? "Goal achieved! 🎉" : `${Math.round(100 - waterPercentage)}% remaining`}
        </p>
      </div>

      {/* Mood Tracking */}
      <div className="mb-6">
        <p className="font-medium text-gray-800 mb-3">How are you feeling?</p>
        <div className="flex items-center space-x-3">
          {moods.map((moodOption) => (
            <button
              key={moodOption.value}
              onClick={() => selectMood(moodOption.value)}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors text-2xl ${
                mood === moodOption.value
                  ? "bg-yellow-200 ring-2 ring-yellow-400"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              {moodOption.emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Symptoms */}
      <div className="mb-6">
        <p className="font-medium text-gray-800 mb-3">Symptoms</p>
        <div className="grid grid-cols-2 gap-2">
          {symptoms.map((symptom) => {
            const isSelected = selectedSymptoms.includes(symptom);
            return (
              <button
                key={symptom}
                onClick={() => toggleSymptom(symptom)}
                className={`flex items-center space-x-2 p-3 rounded-lg transition-colors text-sm ${
                  isSelected
                    ? "bg-brand-light-pink text-brand-pink"
                    : "bg-gray-50 hover:bg-brand-light-pink hover:text-brand-pink"
                }`}
              >
                <Check
                  size={16}
                  className={isSelected ? "opacity-100" : "opacity-30"}
                />
                <span className="capitalize">{symptom.replace('_', ' ')}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Health Recommendations */}
      {recommendations.length > 0 && (
        <div className="border-t pt-6">
          <div className="flex items-center space-x-2 mb-4">
            <Lightbulb className="text-yellow-500" size={20} />
            <p className="font-medium text-gray-800">Health Tips for You</p>
          </div>
          <div className="space-y-3">
            {recommendations.map((tip) => (
              <div
                key={tip.id}
                className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Lightbulb size={16} className="text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800 mb-1">{tip.title}</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{tip.description}</p>
                    <span className="inline-block mt-2 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                      {tip.category}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
