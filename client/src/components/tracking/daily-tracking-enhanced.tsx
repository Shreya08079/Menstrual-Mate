import { useState, useEffect, useRef, forwardRef } from "react";
import { Droplets, Heart, Coffee, Plus, Minus, Sparkles, Trophy, Target, X } from "lucide-react";
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
  onAddWater?: (amount: number) => void;
  isUpdating?: boolean;
  symptomsSectionRef?: React.Ref<HTMLDivElement>;
}

export const DailyTrackingEnhanced = forwardRef<HTMLDivElement, DailyTrackingEnhancedProps>(function DailyTrackingEnhanced({ 
  dailyLog, 
  waterGoal = 3000, // 3L in ml
  onUpdateLog, 
  onAddWater,
  isUpdating = false,
  symptomsSectionRef
}, ref) {
  const [showCelebration, setShowCelebration] = useState(false);
  const [hasRequestedPermission, setHasRequestedPermission] = useState(false);
  const celebrationRef = useRef<HTMLDivElement>(null);

  // Add overlay state for celebration
  const [showCelebrationOverlay, setShowCelebrationOverlay] = useState(false);
  const [hasCelebrated, setHasCelebrated] = useState(false);

  // Custom moods and symptoms from localStorage
  const [customMoods, setCustomMoods] = useState<{ value: string; emoji: string; label: string; color: string; suggestions?: string[] }[]>([]);
  const [customSymptoms, setCustomSymptoms] = useState<string[]>([]);
  const [newMood, setNewMood] = useState("");
  const [newMoodEmoji, setNewMoodEmoji] = useState("");
  const [newMoodSuggestion, setNewMoodSuggestion] = useState("");
  const [newSymptom, setNewSymptom] = useState("");
  const [selectedSymptom, setSelectedSymptom] = useState<string | null>(null);
  const [selectedMood, setSelectedMood] = useState<string | null>(dailyLog?.mood || null);

  // Sync local selectedMood with dailyLog.mood when dailyLog changes
  useEffect(() => {
    setSelectedMood(dailyLog?.mood || null);
  }, [dailyLog?.mood]);

  useEffect(() => {
    const storedMoods = localStorage.getItem("customMoods");
    if (storedMoods) setCustomMoods(JSON.parse(storedMoods));
    const storedSymptoms = localStorage.getItem("customSymptoms");
    if (storedSymptoms) setCustomSymptoms(JSON.parse(storedSymptoms));
  }, []);

  const addCustomMood = () => {
    if (!newMood || !newMoodEmoji || !newMoodSuggestion) return;
    // Check if mood already exists
    const existing = customMoods.find(m => m.value === newMood.toLowerCase());
    if (existing) {
      // If exists, add the suggestion to its suggestions array
      existing.suggestions = [...(existing.suggestions || []), newMoodSuggestion];
      setCustomMoods([...customMoods]);
      localStorage.setItem("customMoods", JSON.stringify([...customMoods]));
    } else {
      const newEntry = {
        value: newMood.toLowerCase(),
        emoji: newMoodEmoji,
        label: newMood,
        color: "bg-green-100 border-green-300 text-green-700",
        suggestions: [newMoodSuggestion]
      };
      const updated = [...customMoods, newEntry];
      setCustomMoods(updated);
      localStorage.setItem("customMoods", JSON.stringify(updated));
    }
    setNewMood("");
    setNewMoodEmoji("");
    setNewMoodSuggestion("");
  };
  const removeCustomMood = (value: string) => {
    const updated = customMoods.filter(m => m.value !== value);
    setCustomMoods(updated);
    localStorage.setItem("customMoods", JSON.stringify(updated));
  };
  const addCustomSymptom = () => {
    if (!newSymptom) return;
    const entry = newSymptom.toLowerCase().replace(/\s+/g, '_');
    if (customSymptoms.includes(entry)) return;
    const updated = [...customSymptoms, entry];
    setCustomSymptoms(updated);
    localStorage.setItem("customSymptoms", JSON.stringify(updated));
    setNewSymptom("");
  };
  const removeCustomSymptom = (sym: string) => {
    const updated = customSymptoms.filter(s => s !== sym);
    setCustomSymptoms(updated);
    localStorage.setItem("customSymptoms", JSON.stringify(updated));
  };

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
    if (waterIntake >= waterGoal && !showCelebration && !hasCelebrated) {
      setShowCelebration(true);
      setShowCelebrationOverlay(true);
      setHasCelebrated(true);
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
    // Reset hasCelebrated if waterIntake drops below goal (e.g., new day)
    if (waterIntake < waterGoal && hasCelebrated) {
      setHasCelebrated(false);
    }
  }, [waterIntake, waterGoal, showCelebration, hasCelebrated]);

  const moods = [
    { value: "happy", emoji: "😊", label: "Happy", color: "bg-yellow-100 border-yellow-300 text-yellow-700" },
    { value: "sad", emoji: "😢", label: "Sad", color: "bg-blue-100 border-blue-300 text-blue-700" },
    { value: "angry", emoji: "😠", label: "Angry", color: "bg-red-100 border-red-300 text-red-700" },
    { value: "tired", emoji: "😴", label: "Tired", color: "bg-gray-100 border-gray-300 text-gray-700" },
    { value: "anxious", emoji: "😰", label: "Anxious", color: "bg-purple-100 border-purple-300 text-purple-700" },
    ...customMoods
  ];

  const availableSymptoms = [
    "cramps", "bloating", "nausea", "acne", 
    "mood_swings", "fatigue", "breast_tenderness", "cravings",
    ...customSymptoms
  ];

  const selectMood = (moodValue: string) => {
    setSelectedMood(moodValue);
    onUpdateLog({ mood: moodValue });
  };

  // Use the onAddWater prop if provided
  const addWater = (amount: number) => {
    if (typeof onAddWater === 'function') {
      onAddWater(amount);
    } else {
      // fallback for legacy usage
      const latestIntake = dailyLog?.waterIntake || 0;
      const newAmount = latestIntake + amount;
      onUpdateLog({ waterIntake: newAmount });
    }
  };

  const toggleSymptom = (symptom: string) => {
    const updatedSymptoms = symptoms.includes(symptom)
      ? symptoms.filter(s => s !== symptom)
      : [...symptoms, symptom];
    onUpdateLog({ symptoms: updatedSymptoms });
  };

  const handleSymptomClick = (symptom: string) => {
    toggleSymptom(symptom);
    setSelectedSymptom(prev => prev === symptom ? null : symptom);
  };

  const moodSuggestions: Record<string, { icon: string; color: string; title: string; tips: string[] }> = {
    happy: {
      icon: '😊',
      color: 'text-yellow-500',
      title: 'Spread the Joy!',
      tips: [
        'Spread the good vibes — message someone and make their day!',
        'Capture the moment — take a fun selfie or journal your joy.',
        'Dance it out to your favorite song!',
        'Use this energy to start something new or creative.'
      ]
    },
    sad: {
      icon: '😨',
      color: 'text-blue-500',
      title: 'Gentle Comforts',
      tips: [
        'Talk to someone you trust — you\'re not alone.',
        'Write down how you feel; sometimes it lightens the heart.',
        'Watch a comfort movie or listen to calming music.',
        'Try stepping outside and soaking in some sunlight.'
      ]
    },
    angry: {
      icon: '😠',
      color: 'text-red-500',
      title: 'Release & Reset',
      tips: [
        'Go for a walk and let the tension melt away.',
        'Try deep breathing — inhale 4, hold 4, exhale 4.',
        'Scream into a pillow (it helps more than you think!).',
        'Distract yourself with a funny show or game.'
      ]
    },
    tired: {
      icon: '😴',
      color: 'text-gray-500',
      title: 'Rest & Recharge',
      tips: [
        'Take a 15-minute power nap if you can.',
        'Drink some water — hydration boosts energy.',
        'Stretch or move gently to wake your body up.',
        'Put your phone away and give yourself a proper break.'
      ]
    },
    anxious: {
      icon: '😰',
      color: 'text-purple-500',
      title: 'Calm & Center',
      tips: [
        'Try grounding: name 5 things you can see, hear, or touch.',
        'Write down your worries — let them out of your mind.',
        'Do a 5-minute breathing or meditation session.',
        'Listen to calming nature sounds or soft music.'
      ]
    }
  };

  const waterQuickAmounts = [
    { amount: 250, label: "1 Glass", icon: "🥤" },
    { amount: 500, label: "1 Bottle", icon: "💧" },
    { amount: 750, label: "Large Cup", icon: "☕" },
    { amount: 1000, label: "1 Liter", icon: "🌊" }
  ];

  const symptomAdvice: Record<string, string> = {
    cramps: `Menstrual cramps are a common symptom during your period, caused by the uterus contracting to help shed its lining. To ease cramps, try using a heating pad or hot water bottle on your lower abdomen, take warm baths, and practice gentle stretching or yoga. Over-the-counter pain relievers like ibuprofen can help, but always follow the recommended dosage. Staying hydrated and avoiding caffeine or salty foods may also reduce discomfort. If your cramps are severe, last for several days, or interfere with daily life, consult a healthcare provider to rule out underlying conditions like endometriosis. Remember, you’re not alone—many people experience this, and self-care can make a big difference!`,
    bloating: `Bloating is a feeling of fullness or swelling in your abdomen, often caused by hormonal changes during your cycle. To reduce bloating, drink plenty of water, avoid salty and processed foods, and eat smaller, more frequent meals. Gentle exercise like walking or yoga can help stimulate digestion. Herbal teas such as peppermint or ginger may also provide relief. If bloating is severe or accompanied by pain, consult your doctor. Be kind to yourself—bloating is temporary and very common during menstruation.`,
    nausea: `Nausea during your period can be uncomfortable and is often related to hormonal shifts. Try eating small, bland meals throughout the day and avoid greasy or spicy foods. Sipping ginger or peppermint tea can soothe your stomach. Staying hydrated is important, but drink fluids slowly. Rest in a cool, quiet place if you feel queasy. If nausea is severe, persistent, or accompanied by vomiting, seek medical advice. Remember, it’s okay to take it easy and listen to your body.`,
    acne: `Hormonal changes during your cycle can trigger breakouts. To manage acne, keep your skin clean with a gentle cleanser, avoid touching your face, and use non-comedogenic (non-pore-clogging) skincare products. Eating a balanced diet and staying hydrated can also help. If your acne is severe or causing distress, consider consulting a dermatologist for tailored treatment. Remember, period-related acne is normal and nothing to be ashamed of—your skin will likely improve as your hormones balance out.`,
    mood_swings: `Mood swings are a common part of the menstrual cycle due to hormonal fluctuations. If you’re feeling up and down, try practicing deep breathing, journaling your feelings, or talking to a trusted friend. Gentle exercise, listening to music, or spending time in nature can also help stabilize your mood. If mood swings are severe or lead to feelings of depression or anxiety, reach out to a mental health professional. Remember, your feelings are valid and you deserve support and understanding.`,
    fatigue: `Fatigue during your period is normal as your body works harder and hormone levels shift. Prioritize rest and aim for 7-9 hours of sleep each night. Eat nutritious foods, including iron-rich options like leafy greens and beans, and avoid excessive caffeine or sugar. Gentle movement, like stretching or a short walk, can boost your energy. If fatigue is extreme or persistent, talk to your doctor to rule out anemia or thyroid issues. Be gentle with yourself—rest is an important part of self-care.`,
    breast_tenderness: `Breast tenderness is often caused by hormonal changes before and during your period. Wearing a supportive bra, applying a warm compress, and avoiding caffeine and salty foods may help reduce discomfort. Gentle self-massage or relaxation techniques can also provide relief. If tenderness is severe, one-sided, or accompanied by a lump, consult your healthcare provider. Remember, this symptom is common and usually temporary.`,
    cravings: `Cravings for sweets, carbs, or salty foods are common during your period due to hormonal changes. It’s okay to indulge in moderation! Try to balance treats with healthy snacks like fruit, nuts, or yogurt. Staying hydrated and eating regular meals can help curb intense cravings. If you find cravings are affecting your well-being, consider keeping a food journal or talking to a nutritionist. Be kind to yourself—your body is working hard and deserves compassion.`,
    dizziness: `Dizziness during your period can be caused by hormonal changes, low blood sugar, or dehydration. If you feel dizzy, sit or lie down right away and drink some water. Eat small, frequent meals and avoid standing up too quickly. If dizziness is severe, persistent, or accompanied by fainting, seek medical attention. Take care and don’t hesitate to ask for help if you need it.`,
  };

  return (
    <div className="space-y-8">
      {/* Celebration Overlay */}
      {showCelebrationOverlay && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-70 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl p-10 flex flex-col items-center relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none"
              onClick={() => setShowCelebrationOverlay(false)}
              aria-label="Close celebration popup"
            >
              &times;
            </button>
            <Trophy className="text-yellow-400 mb-4" size={64} />
            <Sparkles className="text-pink-400 mb-2" size={40} />
            <h2 className="text-3xl font-extrabold text-brand-pink mb-2 text-center">Congratulations!</h2>
            <p className="text-lg text-gray-700 mb-4 text-center">You've reached your 3L water goal today! Stay hydrated and keep up the great work! 🎉</p>
            <Button className="bg-brand-pink text-white px-6 py-2 rounded-full text-lg" onClick={() => setShowCelebrationOverlay(false)}>
              Close
            </Button>
          </div>
        </div>
      )}
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
      <div className="bg-gradient-to-br from-pink-50 via-pink-100 to-pink-200 rounded-2xl p-6 shadow-xl border border-pink-200 mb-8">
        <h3 className="text-lg font-bold text-pink-600 mb-4 flex items-center gap-2 font-[cursive,'Quicksand','Poppins','sans-serif']">
          <span className="text-pink-400 text-2xl">💖</span>
          Mood
        </h3>
        <div className="grid grid-cols-3 gap-2 mb-6">
          {moods.map(m => (
            <button
              key={m.value}
              className={`flex items-center justify-center px-2 py-1 rounded-full border text-sm font-semibold focus:outline-none transition shadow font-[cursive,'Quicksand','Poppins','sans-serif'] bg-gradient-to-r ${selectedMood === m.value ? 'from-pink-200 via-pink-100 to-pink-50 ring-2 ring-pink-400 scale-105' : 'from-white to-pink-50'} ${m.color}`}
              onClick={() => selectMood(m.value)}
              type="button"
              style={{ boxShadow: '0 2px 8px 0 rgba(255, 182, 193, 0.10)' }}
            >
              <span className="mr-1 text-base">{m.emoji}</span> <span className="font-bold">{m.label}</span>
              {customMoods.some(cm => cm.value === m.value) && (
                <X size={14} className="ml-1 cursor-pointer hover:text-red-400" onClick={e => { e.stopPropagation(); removeCustomMood(m.value); }} />
              )}
            </button>
          ))}
        </div>
        {/* Mood Suggestions Box */}
        {selectedMood && (
          customMoods.some(m => m.value === selectedMood) ? (
            (() => {
              const moodObj = customMoods.find(m => m.value === selectedMood);
              return moodObj && moodObj.suggestions && moodObj.suggestions.length > 0 ? (
                <div className="animate-fade-in bg-white bg-opacity-90 rounded-2xl p-5 mb-4 shadow border border-pink-100 flex flex-col gap-2">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl text-green-500">{moodObj.emoji}</span>
                    <span className="font-bold text-pink-500 text-lg font-[cursive,'Quicksand','Poppins','sans-serif']">{moodObj.label} To-Do</span>
                    <span className="ml-2 text-pink-400 text-xl">✨</span>
                  </div>
                  <ul className="list-disc pl-6 space-y-1 text-sm text-gray-700 font-[cursive,'Quicksand','Poppins','sans-serif']">
                    {moodObj.suggestions.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-pink-400">🌸</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null;
            })()
          ) : (
            moodSuggestions[selectedMood] && (
              <div className="animate-fade-in bg-white bg-opacity-90 rounded-2xl p-5 mb-4 shadow border border-pink-100 flex flex-col gap-2">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-2xl ${moodSuggestions[selectedMood].color}`}>{moodSuggestions[selectedMood].icon}</span>
                  <span className="font-bold text-pink-500 text-lg font-[cursive,'Quicksand','Poppins','sans-serif']">{moodSuggestions[selectedMood].title}</span>
                  <span className="ml-2 text-pink-400 text-xl">✨</span>
                </div>
                <ul className="list-disc pl-6 space-y-1 text-sm text-gray-700 font-[cursive,'Quicksand','Poppins','sans-serif']">
                  {moodSuggestions[selectedMood].tips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-pink-400">🌸</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          )
        )}
        <div className="flex gap-2 mt-4 items-stretch w-full min-w-0">
          <input
            type="text"
            placeholder="Add mood (e.g. Motivated)"
            className="flex-1 min-w-0 rounded-2xl border border-pink-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 shadow-sm font-[cursive,'Quicksand','Poppins','sans-serif']"
            value={newMood}
            onChange={e => setNewMood(e.target.value)}
            maxLength={16}
          />
          <input
            type="text"
            placeholder="Emoji"
            className="w-16 min-w-0 rounded-2xl border border-pink-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 shadow-sm font-[cursive,'Quicksand','Poppins','sans-serif']"
            value={newMoodEmoji}
            onChange={e => setNewMoodEmoji(e.target.value)}
            maxLength={2}
          />
          <input
            type="text"
            placeholder="What to do? (e.g. Go workout)"
            className="flex-1 min-w-0 rounded-2xl border border-pink-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 shadow-sm font-[cursive,'Quicksand','Poppins','sans-serif']"
            value={newMoodSuggestion}
            onChange={e => setNewMoodSuggestion(e.target.value)}
            maxLength={60}
          />
          <Button className="rounded-2xl bg-pink-500 hover:bg-pink-600 text-white font-bold px-4 py-2 transition shadow-lg flex items-center gap-1" size="sm" onClick={addCustomMood} type="button">
            <span>Add</span> <span className="text-lg">💖</span>
          </Button>
        </div>
      </div>
      {/* Symptom Tracking Section */}
      <div ref={symptomsSectionRef} className="bg-gradient-to-br from-pink-50 via-pink-100 to-purple-100 rounded-2xl p-6 shadow-md border border-pink-100 mb-8">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-pink-400 text-2xl">🌸</span>
          Symptoms
        </h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {availableSymptoms.map((symptom, idx) => {
            const pastelColors = [
              { base: 'bg-pink-100 text-pink-700 border-pink-200', selected: 'border-pink-400 bg-pink-200 shadow-pink-100' },
              { base: 'bg-purple-100 text-purple-700 border-purple-200', selected: 'border-purple-400 bg-purple-200 shadow-purple-100' },
              { base: 'bg-blue-100 text-blue-700 border-blue-200', selected: 'border-blue-400 bg-blue-200 shadow-blue-100' },
              { base: 'bg-green-100 text-green-700 border-green-200', selected: 'border-green-400 bg-green-200 shadow-green-100' },
              { base: 'bg-yellow-100 text-yellow-700 border-yellow-200', selected: 'border-yellow-400 bg-yellow-200 shadow-yellow-100' },
              { base: 'bg-orange-100 text-orange-700 border-orange-200', selected: 'border-orange-400 bg-orange-200 shadow-orange-100' },
            ];
            const color = pastelColors[idx % pastelColors.length];
            const isSelected = symptoms.includes(symptom);
            return (
              <button
                key={symptom}
                className={`flex items-center gap-2 px-4 py-1 rounded-full border-2 text-sm font-semibold focus:outline-none font-[cursive,'Comic Sans MS','Quicksand','Poppins','sans-serif'] shadow-sm transition-all duration-200 
                  ${isSelected ? `${color.selected} border-4 scale-105` : `${color.base} border-2 scale-100`}`}
                onClick={() => handleSymptomClick(symptom)}
                type="button"
              >
                <span className="text-pink-400">🌸</span>
                <span>{symptom.replace('_', ' ')}</span>
                {customSymptoms.includes(symptom) && (
                  <X size={14} className="ml-2 cursor-pointer" onClick={e => { e.stopPropagation(); removeCustomSymptom(symptom); }} />
                )}
              </button>
            );
          })}
        </div>
        {/* Advice for selected symptom */}
        {selectedSymptom && (
          <div className="bg-gradient-to-br from-pink-50 via-pink-100 to-purple-50 rounded-3xl p-6 mb-6 shadow-lg border-2 border-pink-100 animate-fade-in flex items-start gap-4">
            <div className="flex-shrink-0 w-14 h-14 rounded-full bg-pink-100 flex items-center justify-center text-3xl shadow-sm border border-pink-200">
              <span role="img" aria-label="advice">💡</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl font-bold text-pink-600">Advice for {selectedSymptom.replace('_', ' ')}</span>
              </div>
              <div className="text-gray-700 text-base mb-4">{symptomAdvice[selectedSymptom] || "Take care and consult a healthcare professional if needed."}</div>
              <button
                className="mt-2 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-full font-semibold shadow transition-all"
                onClick={() => window.location.href = `/ai-assistant?question=What can I do about ${selectedSymptom.replace('_', ' ')}?`}
              >
                🤖 Ask AI Assistant about this symptom
              </button>
            </div>
          </div>
        )}
        <div className="flex items-center gap-2 mt-2">
          <input
            type="text"
            placeholder="Add symptom (e.g. dizziness)"
            className="border rounded px-2 py-1 text-sm"
            value={newSymptom}
            onChange={e => setNewSymptom(e.target.value)}
            maxLength={20}
          />
          <Button size="sm" onClick={addCustomSymptom} type="button">Add</Button>
        </div>
        <div className="mt-4">
          <a href="#" className="inline-flex items-center text-pink-500 font-semibold hover:underline text-sm">
            <Heart size={16} className="mr-1 text-pink-400" />
            Track what you are experiencing
          </a>
        </div>
      </div>
    </div>
  );
})