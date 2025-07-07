import { Plus, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { DailyLog } from "@shared/schema";

interface DailyTrackingProps {
  dailyLog?: DailyLog;
  waterGoal?: number;
  onUpdateLog: (updates: Partial<DailyLog>) => void;
}

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
  
  const waterIntake = dailyLog?.waterIntake || 0;
  const mood = dailyLog?.mood;
  
  const addWater = () => {
    if (waterIntake < waterGoal) {
      onUpdateLog({ waterIntake: waterIntake + 1 });
    }
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
  
  const waterPercentage = (waterIntake / waterGoal) * 100;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Today's Tracking</h3>
      
      {/* Water Intake */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
            </div>
            <div>
              <p className="font-medium text-gray-800">Water Intake</p>
              <p className="text-sm text-gray-600">
                {waterIntake} of {waterGoal} glasses
              </p>
            </div>
          </div>
          <Button
            onClick={addWater}
            size="sm"
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-full w-8 h-8 p-0"
            disabled={waterIntake >= waterGoal}
          >
            <Plus size={16} />
          </Button>
        </div>
        <Progress value={waterPercentage} className="h-2" />
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
      <div>
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
    </div>
  );
}
