import { useState } from "react";
import { Settings, LogOut, BookOpen, MessageSquare, Dumbbell, Heart } from "lucide-react";
import { Header } from "@/components/layout/header";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import { Link } from "wouter";

export default function Profile() {
  const { user, logout } = useAuth();

  const menuItems = [
    {
      icon: BookOpen,
      label: "Journal",
      description: "Write and reflect on your thoughts",
      href: "/journal",
      color: "bg-purple-100 text-purple-600"
    },
    {
      icon: MessageSquare,
      label: "AI Assistant",
      description: "Get personalized health advice",
      href: "/ai-assistant", 
      color: "bg-blue-100 text-blue-600"
    },
    {
      icon: Dumbbell,
      label: "Exercises",
      description: "Period cramp relief workouts",
      href: "/exercises",
      color: "bg-green-100 text-green-600"
    },
    {
      icon: Settings,
      label: "Settings",
      description: "Manage your preferences",
      href: "/settings",
      color: "bg-gray-100 text-gray-600"
    }
  ];

  return (
    <div className="min-h-screen bg-brand-gray">
      <Header />
      
      <main className="max-w-md mx-auto px-4 py-6 pb-24">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-brand-light-pink to-brand-pink rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="text-white" size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-1">{user?.name}</h2>
            <p className="text-gray-600">{user?.email}</p>
            <p className="text-sm text-brand-pink mt-2">@{user?.username}</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Journey</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-pink-50 rounded-xl">
              <div className="text-2xl font-bold text-brand-pink mb-1">✨</div>
              <p className="text-sm text-gray-600">Days Tracking</p>
              <p className="font-semibold text-gray-800">Active</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <div className="text-2xl font-bold text-brand-purple mb-1">💪</div>
              <p className="text-sm text-gray-600">Health Score</p>
              <p className="font-semibold text-gray-800">Excellent</p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="space-y-3 mb-6">
          {menuItems.map((item) => (
            <Link key={item.label} href={item.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${item.color}`}>
                      <item.icon size={20} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">{item.label}</h4>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Motivational Quote */}
        <div className="bg-gradient-to-r from-brand-pink to-brand-purple rounded-2xl p-6 mb-6">
          <div className="text-center text-white">
            <p className="text-lg font-medium mb-2">"You are stronger than you think! 💕"</p>
            <p className="text-sm opacity-90">Remember to take care of yourself today</p>
          </div>
        </div>

        {/* Logout Button */}
        <Button
          onClick={logout}
          variant="outline"
          className="w-full flex items-center justify-center space-x-2 text-red-600 border-red-200 hover:bg-red-50"
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </Button>
      </main>

      <BottomNavigation />
    </div>
  );
}
