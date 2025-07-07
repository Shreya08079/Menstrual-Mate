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
      title: "Heat Therapy for Cramps",
      description: "Apply a hot water bag or heating pad to your lower abdomen for 15-20 minutes to help relax muscles.",
      icon: "fa-thermometer-half",
      category: "pain-relief"
    });
    
    recommendations.push({
      id: "cramps-exercise",
      title: "Gentle Movement",
      description: "Light stretching, yoga, or a short walk can help reduce cramping by improving blood flow.",
      icon: "fa-walking",
      category: "exercise"
    });
  }
  
  if (symptoms.includes("headache")) {
    recommendations.push({
      id: "headache-hydration",
      title: "Stay Hydrated",
      description: "Drink plenty of water and consider herbal teas like ginger or peppermint to help with headaches.",
      icon: "fa-tint",
      category: "hydration"
    });
    
    recommendations.push({
      id: "headache-rest",
      title: "Rest and Relaxation",
      description: "Try a warm compress on your forehead and temples. Ensure you're getting adequate rest.",
      icon: "fa-bed",
      category: "rest"
    });
  }
  
  if (symptoms.includes("bloating")) {
    recommendations.push({
      id: "bloating-diet",
      title: "Anti-Inflammatory Foods",
      description: "Eat bananas for potassium, drink green tea for antioxidants, and avoid excess sodium.",
      icon: "fa-apple-alt",
      category: "nutrition"
    });
  }
  
  if (symptoms.includes("fatigue")) {
    recommendations.push({
      id: "fatigue-nutrition",
      title: "Energy-Boosting Foods",
      description: "Include iron-rich foods like dark leafy greens and dark chocolate (in moderation) for energy.",
      icon: "fa-battery-three-quarters",
      category: "nutrition"
    });
  }
  
  // General recommendations
  recommendations.push({
    id: "general-nutrition",
    title: "Period-Friendly Foods",
    description: "Eat bananas for potassium, dark chocolate for magnesium, and green tea for antioxidants.",
    icon: "fa-apple-alt",
    category: "nutrition"
  });
  
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
