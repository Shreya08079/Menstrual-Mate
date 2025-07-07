import { TrendingUp, BarChart3, Calendar, Award } from "lucide-react";
import { analyzeCyclePattern, shouldShowPatternAnalysis, PatternInsight } from "@/lib/pattern-analysis";
import type { Cycle } from "@shared/schema";

interface PatternRecognitionProps {
  cycles: Cycle[];
}

export function PatternRecognition({ cycles }: PatternRecognitionProps) {
  const shouldShow = shouldShowPatternAnalysis(cycles);
  
  if (!shouldShow) {
    return null; // Don't show until user has 2+ complete cycles
  }

  const pattern = analyzeCyclePattern(cycles);
  
  if (!pattern) {
    return null;
  }

  const getRegularityColor = (regularity: string) => {
    switch (regularity) {
      case "very_regular": return "text-green-600 bg-green-50 border-green-200";
      case "regular": return "text-blue-600 bg-blue-50 border-blue-200";
      case "somewhat_irregular": return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "irregular": return "text-orange-600 bg-orange-50 border-orange-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getInsightIcon = (insight: PatternInsight) => {
    switch (insight.type) {
      case "regular": return <Award className="text-green-500" size={20} />;
      case "improving": return <TrendingUp className="text-blue-500" size={20} />;
      case "irregular": return <BarChart3 className="text-orange-500" size={20} />;
      default: return <Calendar className="text-purple-500" size={20} />;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
          <BarChart3 className="text-purple-600" size={20} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Pattern Recognition</h3>
          <p className="text-sm text-gray-600">Based on your cycle history</p>
        </div>
      </div>

      {/* Pattern Summary */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-800 mb-1">
            {pattern.averageLength} days
          </div>
          <div className="text-sm text-gray-600">Average Cycle</div>
        </div>
        
        <div className={`rounded-lg p-4 border ${getRegularityColor(pattern.regularity)}`}>
          <div className="text-sm font-medium mb-1 capitalize">
            {pattern.regularity.replace('_', ' ')}
          </div>
          <div className="text-xs opacity-75">
            Variation: ±{pattern.variation} days
          </div>
        </div>
      </div>

      {/* Pattern Insights */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-800 mb-3">Your Cycle Insights</h4>
        
        {pattern.insights.map((insight) => (
          <div
            key={insight.id}
            className="border border-gray-200 rounded-lg p-4 bg-gradient-to-r from-purple-50 to-pink-50"
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                {getInsightIcon(insight)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-gray-800">{insight.title}</h5>
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                    {insight.confidence}% confidence
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2 leading-relaxed">
                  {insight.description}
                </p>
                {insight.recommendation && (
                  <div className="bg-white bg-opacity-60 rounded-md p-3 border-l-4 border-purple-300">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Recommendation:</span> {insight.recommendation}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Data Progress */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            Cycles tracked: {cycles.filter(c => c.endDate).length}
          </span>
          <span className="text-purple-600 font-medium">
            Keep tracking for better insights! 📊
          </span>
        </div>
      </div>
    </div>
  );
}