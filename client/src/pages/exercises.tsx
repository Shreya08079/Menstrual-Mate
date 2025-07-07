import { useState } from "react";
import { Play, Clock, Target, Heart } from "lucide-react";
import { Header } from "@/components/layout/header";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Exercise {
  id: string;
  name: string;
  description: string;
  duration: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  benefits: string[];
  instructions: string[];
  tips: string[];
  category: "Yoga" | "Stretching" | "Low Impact" | "Breathing";
}

const exercises: Exercise[] = [
  {
    id: "1",
    name: "Child's Pose",
    description: "A gentle yoga pose that helps relax the lower back and pelvis",
    duration: "2-5 minutes",
    difficulty: "Beginner",
    benefits: ["Reduces lower back tension", "Calms the nervous system", "Relieves menstrual cramps"],
    instructions: [
      "Kneel on the floor with your toes together and knees hip-width apart",
      "Sit back on your heels",
      "Slowly fold forward, extending your arms in front of you",
      "Rest your forehead on the ground",
      "Breathe deeply and hold the position"
    ],
    tips: [
      "Place a pillow under your forehead if you can't reach the ground",
      "Use a bolster between your legs for extra comfort",
      "Focus on deep, slow breathing"
    ],
    category: "Yoga"
  },
  {
    id: "2",
    name: "Cat-Cow Stretch",
    description: "A flowing movement that massages the spine and relieves tension",
    duration: "3-5 minutes",
    difficulty: "Beginner",
    benefits: ["Improves spinal mobility", "Reduces back pain", "Increases blood flow to reproductive organs"],
    instructions: [
      "Start on your hands and knees in a tabletop position",
      "Inhale, arch your back and look up (Cow pose)",
      "Exhale, round your spine and tuck your chin to chest (Cat pose)",
      "Continue flowing between these positions",
      "Move slowly and synchronize with your breath"
    ],
    tips: [
      "Move at your own pace",
      "Keep movements gentle and controlled",
      "Focus on the stretch in your spine"
    ],
    category: "Yoga"
  },
  {
    id: "3",
    name: "Supine Twist",
    description: "A gentle spinal twist performed lying down to ease cramps",
    duration: "2-3 minutes each side",
    difficulty: "Beginner",
    benefits: ["Relieves lower back tension", "Aids digestion", "Reduces abdominal discomfort"],
    instructions: [
      "Lie on your back with arms extended to the sides",
      "Bring your knees to your chest",
      "Lower both knees to one side while keeping shoulders on the ground",
      "Hold and breathe deeply",
      "Return to center and repeat on the other side"
    ],
    tips: [
      "Use a pillow between your knees for comfort",
      "Don't force the twist",
      "Keep both shoulders grounded"
    ],
    category: "Yoga"
  },
  {
    id: "4",
    name: "Legs Up the Wall",
    description: "A restorative pose that improves circulation and reduces fatigue",
    duration: "5-15 minutes",
    difficulty: "Beginner",
    benefits: ["Reduces leg swelling", "Calms the nervous system", "Relieves fatigue"],
    instructions: [
      "Lie on your back near a wall",
      "Extend your legs up the wall",
      "Rest your arms by your sides",
      "Close your eyes and breathe deeply",
      "Stay in position for 5-15 minutes"
    ],
    tips: [
      "Place a pillow under your lower back if needed",
      "Keep your legs relaxed",
      "This is perfect for evening relaxation"
    ],
    category: "Yoga"
  },
  {
    id: "5",
    name: "Hip Circles",
    description: "Gentle hip movements to increase circulation and reduce stiffness",
    duration: "2-3 minutes",
    difficulty: "Beginner",
    benefits: ["Increases hip mobility", "Improves circulation", "Reduces pelvic tension"],
    instructions: [
      "Stand with feet hip-width apart",
      "Place hands on your hips",
      "Slowly circle your hips in one direction",
      "Complete 10-15 circles",
      "Reverse direction and repeat"
    ],
    tips: [
      "Keep movements slow and controlled",
      "Engage your core gently",
      "Stop if you feel any discomfort"
    ],
    category: "Low Impact"
  },
  {
    id: "6",
    name: "Knee to Chest Stretch",
    description: "A simple stretch that relieves lower back and hip tension",
    duration: "1-2 minutes each leg",
    difficulty: "Beginner",
    benefits: ["Stretches lower back", "Relieves hip tightness", "Reduces cramping"],
    instructions: [
      "Lie on your back with legs extended",
      "Bring one knee toward your chest",
      "Hold behind your thigh or on top of your shin",
      "Gently pull your knee closer to your chest",
      "Hold and switch legs"
    ],
    tips: [
      "Keep the other leg relaxed on the ground",
      "Don't pull too aggressively",
      "Breathe deeply throughout the stretch"
    ],
    category: "Stretching"
  },
  {
    id: "7",
    name: "Deep Breathing Exercise",
    description: "Focused breathing to reduce stress and manage pain",
    duration: "5-10 minutes",
    difficulty: "Beginner",
    benefits: ["Reduces stress", "Manages pain perception", "Promotes relaxation"],
    instructions: [
      "Sit or lie down comfortably",
      "Place one hand on your chest, one on your belly",
      "Breathe in slowly through your nose for 4 counts",
      "Hold your breath for 4 counts",
      "Exhale slowly through your mouth for 6 counts",
      "Repeat for 5-10 minutes"
    ],
    tips: [
      "Focus on making your belly rise more than your chest",
      "Start with shorter counts if needed",
      "Practice regularly for best results"
    ],
    category: "Breathing"
  },
  {
    id: "8",
    name: "Gentle Walking",
    description: "Light movement to boost endorphins and improve circulation",
    duration: "10-30 minutes",
    difficulty: "Beginner",
    benefits: ["Releases endorphins", "Improves circulation", "Reduces bloating"],
    instructions: [
      "Start with a 5-minute warm-up at a slow pace",
      "Gradually increase to a comfortable walking speed",
      "Focus on maintaining good posture",
      "Breathe naturally and rhythmically",
      "Cool down with slow walking for the last 5 minutes"
    ],
    tips: [
      "Listen to your body and adjust pace as needed",
      "Wear comfortable, supportive shoes",
      "Stay hydrated during your walk"
    ],
    category: "Low Impact"
  }
];

export default function Exercises() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  const categories = ["All", "Yoga", "Stretching", "Low Impact", "Breathing"];

  const filteredExercises = selectedCategory === "All" 
    ? exercises 
    : exercises.filter(exercise => exercise.category === selectedCategory);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "bg-green-100 text-green-700";
      case "Intermediate": return "bg-yellow-100 text-yellow-700";
      case "Advanced": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Yoga": return "bg-purple-100 text-purple-700";
      case "Stretching": return "bg-blue-100 text-blue-700";
      case "Low Impact": return "bg-green-100 text-green-700";
      case "Breathing": return "bg-pink-100 text-pink-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-brand-gray">
      <Header />
      
      <main className="max-w-md mx-auto px-4 py-6 pb-24">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Exercise Tutorials</h2>
          <p className="text-gray-600">Gentle exercises and stretches for period cramp relief</p>
        </div>

        {/* Category Filter */}
        <div className="mb-6">
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={`whitespace-nowrap ${
                  selectedCategory === category 
                    ? "btn-primary text-white" 
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Benefits Banner */}
        <div className="bg-gradient-to-r from-brand-pink to-brand-purple rounded-2xl p-6 mb-6 text-white">
          <div className="flex items-center space-x-3 mb-3">
            <Heart size={24} />
            <h3 className="text-lg font-semibold">Why Exercise During Your Period?</h3>
          </div>
          <p className="text-sm opacity-90">
            Gentle exercise can help reduce cramps, boost mood through endorphin release, 
            improve circulation, and reduce bloating. Listen to your body and choose activities that feel good!
          </p>
        </div>

        {/* Exercise Cards */}
        <div className="space-y-4">
          {filteredExercises.map((exercise) => (
            <Card key={exercise.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 mb-2">{exercise.name}</h4>
                    <p className="text-sm text-gray-600 mb-3">{exercise.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge className={getCategoryColor(exercise.category)}>
                        {exercise.category}
                      </Badge>
                      <Badge className={getDifficultyColor(exercise.difficulty)}>
                        {exercise.difficulty}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Clock size={14} />
                        <span>{exercise.duration}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Target size={14} />
                        <span>{exercise.benefits.length} benefits</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      className="w-full btn-primary text-white"
                      onClick={() => setSelectedExercise(exercise)}
                    >
                      <Play size={16} className="mr-2" />
                      View Instructions
                    </Button>
                  </DialogTrigger>
                  
                  <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center space-x-2">
                        <span>{exercise.name}</span>
                        <Badge className={getCategoryColor(exercise.category)}>
                          {exercise.category}
                        </Badge>
                      </DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-6">
                      <div>
                        <p className="text-gray-600 mb-4">{exercise.description}</p>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <Clock className="mx-auto mb-1 text-blue-600" size={20} />
                            <p className="text-sm font-medium text-gray-800">{exercise.duration}</p>
                            <p className="text-xs text-gray-600">Duration</p>
                          </div>
                          <div className="text-center p-3 bg-green-50 rounded-lg">
                            <Target className="mx-auto mb-1 text-green-600" size={20} />
                            <p className="text-sm font-medium text-gray-800">{exercise.difficulty}</p>
                            <p className="text-xs text-gray-600">Level</p>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Benefits</h4>
                        <ul className="space-y-1">
                          {exercise.benefits.map((benefit, index) => (
                            <li key={index} className="text-sm text-gray-600 flex items-center space-x-2">
                              <span className="w-1.5 h-1.5 bg-brand-pink rounded-full"></span>
                              <span>{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-3">Instructions</h4>
                        <ol className="space-y-2">
                          {exercise.instructions.map((instruction, index) => (
                            <li key={index} className="text-sm text-gray-600 flex space-x-3">
                              <span className="flex-shrink-0 w-6 h-6 bg-brand-pink text-white rounded-full flex items-center justify-center text-xs font-medium">
                                {index + 1}
                              </span>
                              <span className="pt-0.5">{instruction}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Tips</h4>
                        <ul className="space-y-1">
                          {exercise.tips.map((tip, index) => (
                            <li key={index} className="text-sm text-gray-600 flex items-start space-x-2">
                              <span className="text-yellow-500 mt-0.5">💡</span>
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Safety Note */}
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <div className="flex items-start space-x-3">
            <span className="text-yellow-600 text-lg">⚠️</span>
            <div>
              <h4 className="font-medium text-yellow-800 mb-1">Safety First</h4>
              <p className="text-sm text-yellow-700">
                Listen to your body and stop any exercise that causes pain or discomfort. 
                If you have severe menstrual symptoms or medical conditions, consult your healthcare provider before starting any exercise routine.
              </p>
            </div>
          </div>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
}
