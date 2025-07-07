import { Lightbulb, Thermometer, Apple, Bed, Zap } from "lucide-react";
import { getHealthRecommendations } from "@/lib/health-recommendations";

interface HealthTipsProps {
  symptoms: string[];
}

const iconMap: Record<string, React.ComponentType<any>> = {
  "fa-thermometer-half": Thermometer,
  "fa-apple-alt": Apple,
  "fa-bed": Bed,
  "fa-battery-three-quarters": Zap,
  "fa-tint": () => <div className="w-4 h-4 bg-blue-500 rounded-full"></div>,
  "fa-walking": () => <span>🚶‍♀️</span>,
};

export function HealthTips({ symptoms }: HealthTipsProps) {
  const recommendations = getHealthRecommendations(symptoms);
  
  if (recommendations.length === 0) {
    recommendations.push({
      id: "general",
      title: "Stay Healthy",
      description: "Remember to stay hydrated, eat nutritious foods, and get enough rest during your cycle.",
      icon: "fa-apple-alt",
      category: "general"
    });
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 mb-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-r from-brand-purple to-brand-pink rounded-full flex items-center justify-center">
          <Lightbulb className="text-white" size={20} />
        </div>
        <h3 className="text-lg font-semibold text-gray-800">Today's Tips</h3>
      </div>
      
      <div className="space-y-4">
        {recommendations.map((tip) => {
          const IconComponent = iconMap[tip.icon] || Apple;
          
          return (
            <div key={tip.id} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <IconComponent className="text-red-500" size={16} />
                </div>
                <div>
                  <p className="font-medium text-gray-800 mb-1">{tip.title}</p>
                  <p className="text-sm text-gray-600">{tip.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
