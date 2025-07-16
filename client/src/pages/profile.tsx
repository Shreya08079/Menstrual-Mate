import { useState } from "react";
import { Settings, LogOut, BookOpen, MessageSquare, Dumbbell, Heart, Pencil } from "lucide-react";
import { Header } from "@/components/layout/header";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import { Link } from "wouter";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export default function Profile() {
  const { user, logout } = useAuth();

  // Profile picture state (local only for now)
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [showImageModal, setShowImageModal] = useState(false);

  const handleAvatarClick = (e: React.MouseEvent) => {
    // Only open modal if not clicking the pencil
    if ((e.target as HTMLElement).closest('.edit-avatar-btn')) return;
    if (profilePic) setShowImageModal(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfilePic(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-pink-100 to-pink-200 dark:bg-gray-900">
      <Header />
      
      <main className="max-w-md mx-auto px-4 py-6 pb-24">
        {/* Profile Picture Section */}
        <section className="flex flex-col items-center mb-6 bg-gradient-to-br from-pink-50 via-pink-100 to-pink-200 dark:bg-gray-800 rounded-3xl shadow-lg p-6 border-2 border-brand-pink">
          <div className="relative w-44 h-44 group cursor-pointer" onClick={handleAvatarClick}>
            <Avatar className="w-44 h-44 border-8 border-white shadow-xl bg-gradient-to-br from-brand-light-pink to-brand-pink overflow-hidden">
              {profilePic ? (
                <AvatarImage src={profilePic} alt="Profile picture" className="w-full h-full object-cover" />
              ) : (
                <AvatarFallback className="bg-brand-pink text-white w-full h-full flex items-center justify-center">
                  <Heart className="text-white" size={72} />
                </AvatarFallback>
              )}
            </Avatar>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
          <button
            className="edit-avatar-btn mt-4 flex items-center justify-center px-5 py-2 rounded-full bg-brand-pink text-white font-semibold shadow-lg hover:bg-pink-600 focus:outline-none transition"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Edit profile picture"
            type="button"
          >
            <Pencil className="mr-2" size={22} /> Edit
          </button>
          {/* Modal for large image view */}
          {profilePic && (
            <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
              <DialogContent className="flex items-center justify-center bg-transparent shadow-none border-none p-0 m-0" style={{ background: 'transparent', boxShadow: 'none', border: 'none' }}>
                <img src={profilePic} alt="Profile large view" className="max-w-[90vw] max-h-[90vh] object-contain" />
              </DialogContent>
            </Dialog>
          )}
        </section>
        {/* Profile Info Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 mb-6 border border-brand-pink">
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-1">{user?.name}</h2>
            <p className="text-gray-600 dark:text-gray-300">{user?.email}</p>
            <p className="text-sm text-brand-pink mt-2">@{user?.username}</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 mb-6 border border-brand-pink">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Your Journey</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-pink-50 dark:bg-pink-900 rounded-xl">
              <div className="text-2xl font-bold text-brand-pink mb-1">✨</div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Days Tracking</p>
              <p className="font-semibold text-gray-800 dark:text-white">Active</p>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900 rounded-xl">
              <div className="text-2xl font-bold text-brand-purple mb-1">💪</div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Health Score</p>
              <p className="font-semibold text-gray-800 dark:text-white">Excellent</p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="space-y-3 mb-6">
          {menuItems.map((item) => (
            <Link key={item.label} href={item.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer dark:bg-gray-800 border border-brand-pink">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${item.color}`}>
                      <item.icon size={20} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800 dark:text-white">{item.label}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{item.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Motivational Quote */}
        <section className="mb-6 bg-gradient-to-br from-pink-50 via-pink-100 to-pink-200 dark:bg-gray-800 rounded-3xl shadow-lg p-6 border-2 border-brand-pink">
          <div className="text-center text-black dark:text-black">
            <p className="text-lg font-extrabold mb-2">"You are stronger than you think! <span className='align-middle text-brand-pink'>💕</span>"</p>
            <p className="text-sm opacity-90">Remember to take care of yourself today</p>
          </div>
        </section>

        {/* Logout Button */}
        <Button
          onClick={logout}
          variant="outline"
          className="w-full flex items-center justify-center space-x-2 text-red-600 border-red-200 hover:bg-red-50 dark:border-red-700 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-gray-900"
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </Button>
      </main>

      <BottomNavigation />
    </div>
  );
}
