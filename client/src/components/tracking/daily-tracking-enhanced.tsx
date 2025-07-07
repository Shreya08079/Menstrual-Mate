import { useState, useEffect, useRef } from "react";
import { Droplets, Heart, Coffee, Plus, Minus, Sparkles, Trophy, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import type { DailyLog } from "@shared/schema";
import { notificationService } from "@/lib/notifications";
import confetti from 'canvas-confetti';

interface DailyTrackingEnhancedProps {
  dailyLog?: DailyLog;
  waterGoal?: number;
  onUpdateLog: (updates: Partial<DailyLog>) => void;
  isUpdating?: boolean;
}

export function DailyTrackingEnhanced({ 
  dailyLog, 
  waterGoal = 3000, // 3L in ml
  onUpdateLog, 
  isUpdating = false 
}: DailyTrackingEnhancedProps) {
  const [showCelebration, setShowCelebration] = useState(false);
  const [hasRequestedPermission, setHasRequestedPermission] = useState(false);
  const celebrationRef = useRef<HTMLDivElement>(null);

  const waterIntake = dailyLog?.waterIntake || 0;
  const mood = dailyLog?.mood || null;
  const symptoms = dailyLog?.symptoms || [];

  const waterPercentage = Math.min((waterIntake / waterGoal) * 100, 100);
  const glassCount = Math.floor(waterIntake / 250); // 250ml glasses

  // Request notification permission on mount
  useEffect(() => {
    if (!hasRequestedPermission) {
      notificationService.requestPermission().then(() => {
        setHasRequestedPermission(true);
        notificationService.scheduleWaterReminders();
      });
    }
  }, [hasRequestedPermission]);

  // Check for goal achievement
  useEffect(() => {
    if (waterIntake >= waterGoal && !showCelebration) {
      setShowCelebration(true);
      notificationService.showGoalReachedNotification();
      
      // Trigger confetti
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      const interval: NodeJS.Timeout = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti(Object.assign({}, defaults, { 
          particleCount, 
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } 
        }));
        confetti(Object.assign({}, defaults, { 
          particleCount, 
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } 
        }));
      }, 250);

      setTimeout(() => setShowCelebration(false), 5000);
    }
  }, [waterIntake, waterGoal, showCelebration]);

  const moods = [
    { value: "happy", emoji: "😊", label: "Happy", color: "bg-yellow-100 border-yellow-300 text-yellow-700" },
    { value: "sad", emoji: "😢", label: "Sad", color: "bg-blue-100 border-blue-300 text-blue-700" },
    { value: "angry", emoji: "😠", label: "Angry", color: "bg-red-100 border-red-300 text-red-700" },
    { value: "tired", emoji: "😴", label: "Tired", color: "bg-gray-100 border-gray-300 text-gray-700" },
    { value: "anxious", emoji: "😰", label: "Anxious", color: "bg-purple-100 border-purple-300 text-purple-700" },
  ];

  const availableSymptoms = [
    "cramps", "bloating", "headache", "nausea", "acne", 
    "mood_swings", "fatigue", "breast_tenderness", "cravings"
  ];

  const selectMood = (selectedMood: string) => {
    console.log('Selecting mood:', selectedMood);
    onUpdateLog({ mood: selectedMood });
  };

  const addWater = (amount: number) => {
    const newAmount = waterIntake + amount;
    console.log('Adding water:', amount, 'New total:', newAmount);
    onUpdateLog({ waterIntake: newAmount });
  };

  const toggleSymptom = (symptom: string) => {
    const updatedSymptoms = symptoms.includes(symptom)
      ? symptoms.filter(s => s !== symptom)
      : [...symptoms, symptom];
    onUpdateLog({ symptoms: updatedSymptoms });
  };

  const getMoodRecommendation = () => {
    switch (mood) {
      case "happy":
        return { text: "Keep that positive energy flowing! Maybe try some upbeat music or call a friend to share your joy.", icon: "✨" };
      case "sad":
        return { text: "It's okay to feel this way. Try listening to your favorite music or reaching out to friends for support.", icon: "🎵" };
      case "angry":
        return { text: "Take a deep breath. Consider going for a walk, eating something comforting, or watching Friends to lighten your mood.", icon: "🚶‍♀️" };
      case "tired":
        return { text: "Your body needs rest. Consider taking a short nap, getting to bed early, or doing some gentle stretching.", icon: "💤" };
      case "anxious":
        return { text: "Try some deep breathing exercises, meditation, or gentle yoga to help calm your mind.", icon: "🧘‍♀️" };
      default:
        return null;
    }
  };

  const waterQuickAmounts = [
    { amount: 250, label: "1 Glass", icon: "🥤" },
    { amount: 500, label: "1 Bottle", icon: "💧" },
    { amount: 750, label: "Large Cup", icon: "☕" },
    { amount: 1000, label: "1 Liter", icon: "🌊" }
  ];

  return (
    <div className="space-y-8">
      {/* Celebration Banner */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            ref={celebrationRef}
            initial={{ opacity: 0, y: -50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.8 }}
            className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-2xl p-6 text-white text-center shadow-lg"
          >
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Trophy className="text-yellow-300" size={32} />
              <Sparkles className="text-yellow-300" size={24} />
            </div>
            <h3 className="text-2xl font-black mb-2">HURRAY! Way to go, girl!</h3>
            <p className="text-lg opacity-90">You've reached your 3L water goal today! 🎉</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Water Tracking Section */}
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl p-8 shadow-sm border border-blue-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full flex items-center justify-center">
              <Droplets className="text-white" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Water Intake</h3>
              <p className="text-sm text-gray-600">Stay hydrated, stay healthy</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black text-blue-600">{waterIntake}ml</div>
            <div className="text-sm text-gray-500">of {waterGoal}ml goal</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <Progress value={waterPercentage} className="h-4 bg-blue-100">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${waterPercentage}%` }}
            />
          </Progress>
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>0ml</span>
            <span className="flex items-center space-x-1">
              <Target size={14} />
              <span>{Math.round(waterPercentage)}%</span>
            </span>
            <span>{waterGoal}ml</span>
          </div>
        </div>

        {/* Water Glasses Visual */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex space-x-2">
            {Array.from({ length: 12 }, (_, i) => (
              <div
                key={i}
                className={`w-4 h-6 rounded-sm border-2 transition-all duration-300 ${
                  i < glassCount 
                    ? 'bg-gradient-to-t from-blue-400 to-cyan-300 border-blue-400' 
                    : 'border-gray-300 bg-gray-50'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Quick Add Buttons */}
        <div className="grid grid-cols-2 gap-3">
          {waterQuickAmounts.map((item) => (
            <motion.button
              key={item.amount}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => addWater(item.amount)}
              disabled={isUpdating}
              className="bg-white rounded-2xl p-4 shadow-sm border border-blue-200 hover:border-blue-300 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-2xl mb-1">{item.icon}</div>
              <div className="text-sm font-semibold text-gray-900">{item.label}</div>
              <div className="text-xs text-gray-500">+{item.amount}ml</div>
            </motion.button>
          ))}
        </div>

        {/* Custom Amount Controls */}
        <div className="flex items-center justify-center space-x-4 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => addWater(-50)}
            disabled={isUpdating || waterIntake <= 0}
            className="rounded-full w-10 h-10 p-0 border-blue-300 text-blue-600 hover:bg-blue-50"
          >
            <Minus size={16} />
          </Button>
          <span className="text-sm text-gray-600 min-w-[80px] text-center">Custom</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => addWater(50)}
            disabled={isUpdating}
            className="rounded-full w-10 h-10 p-0 border-blue-300 text-blue-600 hover:bg-blue-50"
          >
            <Plus size={16} />
          </Button>
        </div>
      </div>

      {/* Mood Tracking Section */}
      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-3xl p-8 shadow-sm border border-yellow-100">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
            <Heart className="text-white" size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">How are you feeling?</h3>
            <p className="text-sm text-gray-600">Track your emotional wellbeing</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {moods.map((moodOption) => (
            <motion.button
              key={moodOption.value}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => selectMood(moodOption.value)}
              disabled={isUpdating}
              className={`p-4 rounded-2xl border-2 transition-all duration-200 ${
                mood === moodOption.value
                  ? `${moodOption.color} border-current shadow-md scale-105`
                  : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm"
              } ${isUpdating ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <div className="text-3xl mb-2">{moodOption.emoji}</div>
              <div className="text-xs font-medium">{moodOption.label}</div>
            </motion.button>
          ))}
        </div>

        {/* Mood Recommendation */}
        {mood && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-4 border border-yellow-200"
          >
            <div className="flex items-start space-x-3">
              <div className="text-2xl">{getMoodRecommendation()?.icon}</div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Wellness Tip</h4>
                <p className="text-sm text-gray-700">{getMoodRecommendation()?.text}</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Symptoms Tracking */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-8 shadow-sm border border-purple-100">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
            <Coffee className="text-white" size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Symptoms & Feelings</h3>
            <p className="text-sm text-gray-600">Track what you're experiencing</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {availableSymptoms.map((symptom) => (
            <Badge
              key={symptom}
              variant={symptoms.includes(symptom) ? "default" : "outline"}
              className={`cursor-pointer transition-all duration-200 px-3 py-2 rounded-full ${
                symptoms.includes(symptom)
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md hover:shadow-lg"
                  : "border-purple-300 text-purple-700 hover:bg-purple-50"
              } ${isUpdating ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={() => !isUpdating && toggleSymptom(symptom)}
            >
              {symptom.replace(/_/g, " ")}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}