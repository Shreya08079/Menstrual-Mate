import { Cycle } from "@shared/schema";

export interface PatternInsight {
  id: string;
  type: "regular" | "irregular" | "short" | "long" | "improving";
  title: string;
  description: string;
  icon: string;
  confidence: number; // 0-100
  recommendation?: string;
}

export interface CyclePattern {
  averageLength: number;
  variation: number; // standard deviation
  regularity: "very_regular" | "regular" | "somewhat_irregular" | "irregular";
  trend: "stable" | "getting_shorter" | "getting_longer" | "improving";
  insights: PatternInsight[];
}

export function analyzeCyclePattern(cycles: Cycle[]): CyclePattern | null {
  // Need at least 2-3 complete cycles for pattern analysis
  const completeCycles = cycles.filter(cycle => cycle.endDate && cycle.length);
  
  if (completeCycles.length < 2) {
    return null; // Not enough data
  }

  const cycleLengths = completeCycles.map(cycle => cycle.length!);
  const averageLength = cycleLengths.reduce((sum, length) => sum + length, 0) / cycleLengths.length;
  
  // Calculate variation (standard deviation)
  const variance = cycleLengths.reduce((sum, length) => sum + Math.pow(length - averageLength, 2), 0) / cycleLengths.length;
  const variation = Math.sqrt(variance);

  // Determine regularity
  let regularity: CyclePattern["regularity"];
  if (variation <= 2) {
    regularity = "very_regular";
  } else if (variation <= 4) {
    regularity = "regular";
  } else if (variation <= 7) {
    regularity = "somewhat_irregular";
  } else {
    regularity = "irregular";
  }

  // Analyze trend (if we have enough data)
  let trend: CyclePattern["trend"] = "stable";
  if (cycleLengths.length >= 3) {
    const recentCycles = cycleLengths.slice(-3);
    const olderCycles = cycleLengths.slice(0, -3);
    
    if (olderCycles.length > 0) {
      const recentAvg = recentCycles.reduce((sum, l) => sum + l, 0) / recentCycles.length;
      const olderAvg = olderCycles.reduce((sum, l) => sum + l, 0) / olderCycles.length;
      
      if (recentAvg < olderAvg - 2) {
        trend = "getting_shorter";
      } else if (recentAvg > olderAvg + 2) {
        trend = "getting_longer";
      } else if (variation < 3 && cycleLengths.length >= 4) {
        trend = "improving";
      }
    }
  }

  // Generate insights
  const insights = generateInsights(averageLength, variation, regularity, trend, completeCycles.length);

  return {
    averageLength: Math.round(averageLength),
    variation: Math.round(variation * 10) / 10,
    regularity,
    trend,
    insights
  };
}

function generateInsights(
  averageLength: number, 
  variation: number, 
  regularity: CyclePattern["regularity"], 
  trend: CyclePattern["trend"],
  cycleCount: number
): PatternInsight[] {
  const insights: PatternInsight[] = [];

  // Regularity insights
  if (regularity === "very_regular" || regularity === "regular") {
    insights.push({
      id: "regular-cycles",
      type: "regular",
      title: "🎯 Regular Cycles Detected",
      description: `Your cycles have been ${regularity === "very_regular" ? "very" : ""} regular! Keep tracking for better predictions.`,
      icon: "chart-bar",
      confidence: regularity === "very_regular" ? 95 : 85,
      recommendation: "Continue your current routine as it's working well for cycle regularity."
    });
  } else if (regularity === "irregular") {
    insights.push({
      id: "irregular-cycles",
      type: "irregular",
      title: "📊 Irregular Pattern Noticed",
      description: "Your cycles show some variation. This is normal, but tracking helps identify triggers.",
      icon: "trending-up",
      confidence: 70,
      recommendation: "Consider tracking stress, sleep, and exercise to identify potential factors affecting your cycle."
    });
  }

  // Length insights
  if (averageLength < 21) {
    insights.push({
      id: "short-cycles",
      type: "short",
      title: "⏰ Short Cycle Pattern",
      description: `Your average cycle is ${Math.round(averageLength)} days, which is shorter than typical.`,
      icon: "clock",
      confidence: 80,
      recommendation: "Consider discussing this pattern with a healthcare provider if it's a recent change."
    });
  } else if (averageLength > 35) {
    insights.push({
      id: "long-cycles",
      type: "long",
      title: "📅 Long Cycle Pattern",
      description: `Your average cycle is ${Math.round(averageLength)} days, which is longer than typical.`,
      icon: "calendar",
      confidence: 80,
      recommendation: "This could be normal for you, but mention it to your healthcare provider at your next visit."
    });
  }

  // Trend insights
  if (trend === "improving") {
    insights.push({
      id: "improving-regularity",
      type: "improving",
      title: "📈 Improving Regularity",
      description: "Great news! Your cycles are becoming more regular over time.",
      icon: "trending-up",
      confidence: 85,
      recommendation: "Whatever you're doing is working! Keep up your healthy habits."
    });
  }

  // Data confidence insight
  if (cycleCount >= 6) {
    insights.push({
      id: "strong-data",
      type: "regular",
      title: "💪 Strong Pattern Data",
      description: `With ${cycleCount} cycles tracked, predictions are becoming more accurate.`,
      icon: "database",
      confidence: 90,
      recommendation: "Your data is robust enough for reliable predictions and pattern analysis."
    });
  } else if (cycleCount >= 3) {
    insights.push({
      id: "building-data",
      type: "improving",
      title: "🔄 Building Pattern Data",
      description: `${cycleCount} cycles tracked. Keep going for even better insights!`,
      icon: "refresh",
      confidence: 70,
      recommendation: "Continue tracking for more accurate pattern recognition."
    });
  }

  return insights;
}

export function shouldShowPatternAnalysis(cycles: Cycle[]): boolean {
  const completeCycles = cycles.filter(cycle => cycle.endDate && cycle.length);
  return completeCycles.length >= 2; // Show after 2 complete cycles (roughly 2 months)
}

export function getPatternConfidenceLevel(cycleCount: number): string {
  if (cycleCount >= 6) return "High";
  if (cycleCount >= 4) return "Good";
  if (cycleCount >= 2) return "Building";
  return "Insufficient";
}