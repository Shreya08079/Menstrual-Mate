import { Plus, Check, Lightbulb, ChevronDown, Droplets } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getHealthRecommendations } from "@/lib/health-recommendations";
import { useWaterReminders } from "@/lib/notifications";
import type { DailyLog } from "@shared/schema";

interface DailyTrackingProps {
  dailyLog?: DailyLog;
  waterGoal?: number;
  onUpdateLog: (updates: Partial<DailyLog>) => void;
  isUpdating?: boolean;
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
  { emoji: "😢", value: "sad", label: "Sad" },
  { emoji: "😠", value: "angry", label: "Angry" },
  { emoji: "😴", value: "tired", label: "Tired" },
  { emoji: "😰", value: "anxious", label: "Anxious" },
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

export function DailyTracking({ dailyLog, waterGoal = 12, onUpdateLog, isUpdating = false }: DailyTrackingProps) {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(
    dailyLog?.symptoms || []
  );
  const [selectedGlassSize, setSelectedGlassSize] = useState(250); // Default 250ml
  const [showGlassOptions, setShowGlassOptions] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [hasShownCelebration, setHasShownCelebration] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Water intake is stored directly in ml
  const totalWaterMl = dailyLog?.waterIntake || 0;
  const waterGoalMl = 3000; // 3L goal in ml
  const mood = dailyLog?.mood;
  
  // Water reminder notifications
  useWaterReminders(totalWaterMl, waterGoalMl);
  
  // Debug the current state
  console.log("Current dailyLog:", dailyLog);
  console.log("Current water:", totalWaterMl, "Current mood:", mood);

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
    // Store water intake directly in ml
    const newTotalMl = totalWaterMl + selectedGlassSize;
    console.log("Adding water:", selectedGlassSize, "ml. New total:", newTotalMl);
    onUpdateLog({ waterIntake: newTotalMl });
    
    // Check if goal is achieved and show celebration
    if (newTotalMl >= waterGoalMl && !hasShownCelebration) {
      setShowCelebration(true);
      setHasShownCelebration(true);
      setTimeout(() => setShowCelebration(false), 4000); // Hide after 4 seconds
    }
  };
  
  const selectMood = (moodValue: string) => {
    console.log("Mood selected:", moodValue);
    console.log("Current mood before change:", mood);
    console.log("About to call onUpdateLog with mood:", moodValue);
    
    // Allow changing mood even if it's the same value (for testing purposes)
    onUpdateLog({ mood: moodValue });
  };

  const getMoodRecommendation = (moodValue: string) => {
    const recommendations = {
      happy: "Keep that positive energy flowing! Maybe share your happiness with someone special or treat yourself to something nice.",
      sad: "It's okay to feel sad sometimes. Try listening to your favorite music, calling a friend, or doing something that usually makes you smile.",
      angry: "Take a deep breath and go for a walk, eat your favorite food, or binge-watch your favorite show (we recommend watching Friends!).",
      tired: "Your body is telling you something important - go get some rest! A good nap or early bedtime will help you feel refreshed.",
      anxious: "Try some deep breathing exercises, gentle stretching, or meditation. Remember, this feeling will pass."
    };
    return recommendations[moodValue as keyof typeof recommendations] || "";
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
    <>
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
              onClick={() => {
                onUpdateLog({ waterIntake: 0 });
                setHasShownCelebration(false);
              }}
              size="sm"
              variant="outline"
              className="text-gray-600"
            >
              Reset
            </Button>
          )}
        </div>
        
        <Progress value={Math.min(waterPercentage, 100)} className="h-2" />
        <p className="text-xs text-gray-500 mt-1">
          {waterPercentage >= 100 ? "Goal achieved! 🎉" : `${Math.round(waterGoalMl - totalWaterMl)}ml remaining`}
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
              disabled={isUpdating}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors text-2xl ${
                mood === moodOption.value
                  ? "bg-yellow-200 ring-2 ring-yellow-400"
                  : "bg-gray-100 hover:bg-gray-200"
              } ${isUpdating ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {moodOption.emoji}
            </button>
          ))}
        </div>
        
        {/* Mood Recommendation */}
        {mood && (
          <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-lg">💝</span>
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-800 mb-2">Just for you:</h4>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {getMoodRecommendation(mood)}
                </p>
              </div>
            </div>
          </div>
        )}
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

      {/* Full-Screen Celebration Overlay */}
      {showCelebration && (
        <div 
          className="fixed inset-0 bg-gradient-to-br from-pink-400 via-purple-500 to-blue-600 flex items-center justify-center z-50 animate-in fade-in duration-500 cursor-pointer"
          onClick={() => setShowCelebration(false)}
        >
          <div className="text-center text-white relative">
            {/* Confetti Animation */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute animate-bounce"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${1 + Math.random() * 2}s`
                  }}
                >
                  {['🎉', '✨', '🌟', '💖', '🎊', '🎈'][Math.floor(Math.random() * 6)]}
                </div>
              ))}
            </div>
            
            {/* Main Message */}
            <div className="relative z-10 max-w-lg mx-auto px-8">
              <div className="text-8xl mb-4 animate-pulse">🎉</div>
              <h1 className="text-6xl font-bold mb-4 animate-bounce">
                HURRAY!
              </h1>
              <h2 className="text-3xl font-semibold mb-6">
                Way to go, girl! 💪
              </h2>
              <div className="text-2xl mb-4">
                You achieved your 3L water goal! 💧
              </div>
              <div className="text-lg opacity-90 mb-8">
                Your body will thank you for staying so well hydrated today!
              </div>
              
              {/* Animated Trophy */}
              <div className="text-6xl mb-6 animate-bounce">🏆</div>
              
              {/* Sparkle Effects */}
              <div className="flex justify-center space-x-4 text-4xl">
                <span className="animate-pulse">✨</span>
                <span className="animate-bounce">🌟</span>
                <span className="animate-pulse">✨</span>
              </div>
              
              <p className="text-sm mt-8 opacity-75">
                Tap anywhere to continue...
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
