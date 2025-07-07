export interface HealthTip {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
}

export function getHealthRecommendations(symptoms: string[]): HealthTip[] {
  const recommendations: HealthTip[] = [];
  
  if (symptoms.includes("cramps")) {
    recommendations.push({
      id: "cramps-heat",
      title: "🔥 Heat Therapy",
      description: "Apply a hot water bag or heating pad to your lower abdomen for 15-20 minutes. The heat helps relax uterine muscles and reduces pain.",
      icon: "heat",
      category: "Pain Relief"
    });
    
    recommendations.push({
      id: "cramps-exercise",
      title: "🧘‍♀️ Gentle Movement",
      description: "Try gentle yoga poses like child's pose or cat-cow stretches. Light walking can also help improve blood flow and reduce cramping.",
      icon: "exercise",
      category: "Movement"
    });

    recommendations.push({
      id: "cramps-foods",
      title: "🍌 Anti-Cramp Foods",
      description: "Eat bananas for potassium and magnesium. Dark chocolate (70%+) can help with muscle relaxation. Avoid excess caffeine.",
      icon: "nutrition",
      category: "Nutrition"
    });
  }
  
  if (symptoms.includes("headache")) {
    recommendations.push({
      id: "headache-hydration",
      title: "💧 Stay Hydrated",
      description: "Drink 8-10 glasses of water daily. Try herbal teas like ginger or peppermint which can help reduce headache intensity.",
      icon: "hydration",
      category: "Hydration"
    });
    
    recommendations.push({
      id: "headache-rest",
      title: "😴 Rest & Cool Compress",
      description: "Apply a cool compress to your forehead for 15 minutes. Rest in a dark, quiet room to help reduce headache symptoms.",
      icon: "rest",
      category: "Relief"
    });
  }
  
  if (symptoms.includes("bloating")) {
    recommendations.push({
      id: "bloating-diet",
      title: "🫖 Anti-Bloating Tips",
      description: "Drink green tea or peppermint tea to reduce bloating. Eat smaller, frequent meals and avoid high-sodium foods.",
      icon: "nutrition",
      category: "Digestive Health"
    });

    recommendations.push({
      id: "bloating-movement",
      title: "🚶‍♀️ Gentle Walk",
      description: "A 10-15 minute walk can help reduce bloating by stimulating digestion and reducing water retention.",
      icon: "movement",
      category: "Movement"
    });
  }
  
  if (symptoms.includes("fatigue")) {
    recommendations.push({
      id: "fatigue-nutrition",
      title: "⚡ Energy Foods",
      description: "Include iron-rich foods like spinach and lean meats. Dark chocolate (in moderation) provides magnesium for energy.",
      icon: "nutrition",
      category: "Energy"
    });

    recommendations.push({
      id: "fatigue-rest",
      title: "💤 Quality Sleep",
      description: "Aim for 7-8 hours of sleep. Consider a short 20-minute nap if needed, but avoid longer naps that might disrupt nighttime sleep.",
      icon: "sleep",
      category: "Rest"
    });
  }

  if (symptoms.includes("nausea")) {
    recommendations.push({
      id: "nausea-ginger",
      title: "🫚 Ginger Remedy",
      description: "Try ginger tea or small amounts of crystallized ginger. Eat small, frequent meals and avoid greasy foods.",
      icon: "remedy",
      category: "Digestive Relief"
    });
  }

  if (symptoms.includes("mood_swings")) {
    recommendations.push({
      id: "mood-exercise",
      title: "🏃‍♀️ Mood-Boosting Activity",
      description: "Light exercise releases endorphins that can help stabilize mood. Try a 15-minute walk or gentle stretching.",
      icon: "mood",
      category: "Mental Health"
    });
  }

  if (symptoms.includes("breast_tenderness")) {
    recommendations.push({
      id: "breast-support",
      title: "👙 Proper Support",
      description: "Wear a well-fitting, supportive bra. Apply a warm compress for comfort and avoid caffeine which can worsen tenderness.",
      icon: "support",
      category: "Comfort"
    });
  }

  if (symptoms.includes("acne")) {
    recommendations.push({
      id: "acne-care",
      title: "🧴 Gentle Skincare",
      description: "Use gentle, non-comedogenic products. Avoid over-washing and consider zinc-rich foods like nuts and seeds.",
      icon: "skincare",
      category: "Skin Health"
    });
  }
  
  return recommendations;
}

export const FOODS_TO_AVOID = [
  "Excessive caffeine",
  "High sodium foods",
  "Processed foods",
  "Excess sugar",
  "Alcohol",
  "Fried foods"
];

export const RECOMMENDED_FOODS = [
  "Bananas (potassium)",
  "Dark chocolate (magnesium)",
  "Green tea (antioxidants)",
  "Leafy greens (iron)",
  "Nuts and seeds",
  "Whole grains",
  "Fatty fish (omega-3)"
];
