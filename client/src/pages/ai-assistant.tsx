import { useState } from "react";
import { Send, MessageSquare, Heart, Sparkles, Mic, MicOff } from "lucide-react";
import { Header } from "@/components/layout/header";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChatMessage {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      type: "assistant",
      content: "Hello! I'm your personal health assistant. I'm here to help you with questions about your menstrual health, symptoms, nutrition, and general wellness. How can I assist you today? 💕",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const quickQuestions = [
    "How can I reduce period cramps?",
    "What foods should I eat during my period?",
    "Is it normal to feel emotional during PMS?",
    "How much water should I drink daily?",
    "What exercises help with menstrual pain?",
    "Why am I so tired during my period?",
  ];

  const getAIResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    if (message.includes("cramp") || message.includes("pain")) {
      return "For period cramps, try these natural remedies:\n\n• Apply heat with a heating pad or hot water bottle\n• Gentle exercise like walking or yoga\n• Stay hydrated and avoid caffeine\n• Try anti-inflammatory foods like ginger tea\n• Magnesium supplements may help\n• Practice deep breathing or meditation\n\nIf pain is severe, please consult with your healthcare provider.";
    }
    
    if (message.includes("food") || message.includes("eat") || message.includes("nutrition")) {
      return "During your period, focus on these nutrients:\n\n🍌 Potassium: Bananas, avocados, sweet potatoes\n🍫 Magnesium: Dark chocolate, nuts, leafy greens\n🐟 Iron: Lean meats, spinach, lentils\n🥛 Calcium: Dairy, fortified plant milks\n\nAvoid: Excess caffeine, processed foods, high sodium foods, and excessive sugar.\n\nStay hydrated with water and herbal teas like chamomile or ginger!";
    }
    
    if (message.includes("emotional") || message.includes("mood") || message.includes("pms")) {
      return "Emotional changes during PMS are completely normal! Here's why and how to cope:\n\n• Hormonal fluctuations affect neurotransmitters\n• Practice self-care and be gentle with yourself\n• Regular exercise can boost mood\n• Try mindfulness or meditation\n• Ensure adequate sleep (7-9 hours)\n• Talk to supportive friends or family\n• Consider journaling your feelings\n\nIf mood changes are severe, speak with a healthcare professional.";
    }
    
    if (message.includes("water") || message.includes("hydrat")) {
      return "Proper hydration is crucial during your cycle! 💧\n\n• Aim for 8-10 glasses of water daily\n• Increase intake during your period\n• Herbal teas count toward hydration\n• Add lemon or cucumber for variety\n• Monitor urine color (pale yellow is ideal)\n\nGood hydration helps reduce bloating, fatigue, and can ease cramps!";
    }
    
    if (message.includes("exercise") || message.includes("workout")) {
      return "Exercise can actually help with period symptoms! 💪\n\n✅ Gentle activities:\n• Walking or light jogging\n• Yoga (especially poses like child's pose)\n• Swimming\n• Stretching\n• Pilates\n\n❌ Avoid if you're feeling very fatigued:\n• High-intensity workouts\n• Heavy lifting\n\nListen to your body and adjust intensity as needed!";
    }
    
    if (message.includes("tired") || message.includes("fatigue") || message.includes("energy")) {
      return "Period fatigue is common due to:\n\n• Iron loss during menstruation\n• Hormonal changes\n• Disrupted sleep patterns\n\nTo boost energy:\n🌱 Eat iron-rich foods\n😴 Prioritize sleep\n🥤 Stay hydrated\n🏃‍♀️ Light exercise\n☀️ Get sunlight exposure\n🧘‍♀️ Manage stress\n\nIf fatigue is severe or persistent, consult your doctor.";
    }
    
    if (message.includes("normal") || message.includes("is it")) {
      return "Many period experiences are normal, but here are some guidelines:\n\n✅ Normal:\n• Cycles 21-35 days long\n• Periods lasting 3-7 days\n• Some cramping and mood changes\n• Flow changes throughout cycle\n\n⚠️ See a doctor if:\n• Periods last longer than 7 days\n• Extremely heavy bleeding\n• Severe pain that interferes with daily life\n• Missed periods (not pregnant)\n• Bleeding between periods\n\nTrust your body and seek help when needed!";
    }
    
    // Default response
    return "I'm here to help with your health questions! I can provide information about:\n\n• Menstrual health and symptoms\n• Nutrition during your cycle\n• Exercise recommendations\n• Managing PMS\n• General wellness tips\n\nPlease remember that while I can offer general guidance, always consult with healthcare professionals for serious concerns or personalized medical advice. What specific topic would you like to explore? 🌸";
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: getAIResponse(inputMessage),
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleQuickQuestion = (question: string) => {
    setInputMessage(question);
  };

  const toggleVoiceInput = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      if (isListening) {
        recognition.stop();
        setIsListening(false);
      } else {
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputMessage(transcript);
          setIsListening(false);
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.start();
      }
    }
  };

  return (
    <div className="min-h-screen bg-brand-gray flex flex-col">
      <Header />
      
      <main className="flex-1 max-w-md mx-auto w-full px-4 py-6 pb-24 flex flex-col">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">AI Health Assistant</h2>
          <p className="text-gray-600">Get personalized health advice and answers to your questions</p>
        </div>

        {/* Quick Questions */}
        {messages.length === 1 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Quick Questions</h3>
            <div className="grid grid-cols-1 gap-2">
              {quickQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  onClick={() => handleQuickQuestion(question)}
                  className="text-left justify-start h-auto p-3 border-gray-200 hover:bg-brand-light-pink hover:border-brand-pink hover:text-brand-pink"
                >
                  <MessageSquare size={16} className="mr-2 flex-shrink-0" />
                  <span className="text-sm">{question}</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Chat Messages */}
        <div className="flex-1 mb-4">
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                >
                  <Card className={`max-w-[80%] ${
                    message.type === "user"
                      ? "bg-brand-pink text-white"
                      : "bg-white border-gray-200"
                  }`}>
                    <CardContent className="p-3">
                      {message.type === "assistant" && (
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-6 h-6 bg-gradient-to-r from-brand-pink to-brand-purple rounded-full flex items-center justify-center">
                            <Sparkles className="text-white" size={12} />
                          </div>
                          <span className="text-sm font-medium text-gray-800">Health Assistant</span>
                        </div>
                      )}
                      <p className={`text-sm whitespace-pre-line ${
                        message.type === "user" ? "text-white" : "text-gray-700"
                      }`}>
                        {message.content}
                      </p>
                      <p className={`text-xs mt-2 ${
                        message.type === "user" ? "text-pink-100" : "text-gray-500"
                      }`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <Card className="bg-white border-gray-200">
                    <CardContent className="p-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-6 h-6 bg-gradient-to-r from-brand-pink to-brand-purple rounded-full flex items-center justify-center">
                          <Sparkles className="text-white" size={12} />
                        </div>
                        <span className="text-sm font-medium text-gray-800">Health Assistant</span>
                      </div>
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Input Area */}
        <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="flex-1 relative">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Ask me anything about your health..."
                disabled={isLoading}
                className="pr-12"
              />
              {('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleVoiceInput}
                  className={`absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 ${
                    isListening ? "text-red-500" : "text-gray-400"
                  }`}
                >
                  {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                </Button>
              )}
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="btn-primary text-white rounded-full w-10 h-10 p-0"
            >
              <Send size={16} />
            </Button>
          </div>
          
          <div className="mt-3 text-center">
            <p className="text-xs text-gray-500">
              💕 Remember: This is general guidance. Consult healthcare professionals for serious concerns.
            </p>
          </div>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
}
