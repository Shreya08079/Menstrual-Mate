import { Bell, User, Heart, Moon, Sun } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";

// Demo reminders (replace with real logic as needed)
const demoReminders = [
  { id: 1, message: "💧 Drink water in 30 min", type: "water", time: "in 30 min" },
  { id: 2, message: "🏃‍♀️ Move your body in 2 hours", type: "exercise", time: "in 2 hours" },
  { id: 3, message: "🍎 Healthy snack time soon!", type: "nutrition", time: "in 1 hour" },
];

export function Header() {
  const { user, logout } = useAuth();
  const [isDark, setIsDark] = useState(false);

  // Notification state
  const [reminders, setReminders] = useState(demoReminders);
  const [unread, setUnread] = useState(true);

  useEffect(() => {
    // On mount, check localStorage or system preference
    const saved = localStorage.getItem("theme");
    if (saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    } else {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  return (
    <header className="bg-white shadow-sm px-4 py-4 sticky top-0 z-50 dark:bg-gray-900">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-brand-pink to-brand-purple rounded-full flex items-center justify-center">
            <Heart className="text-white dark:text-red-400" size={16} />
          </div>
          <h1 className="text-2xl font-black bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent tracking-tight">
            PeriodCare
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Notification Bell with Dropdown */}
          <DropdownMenu onOpenChange={(open) => { if (open) setUnread(false); }}>
            <DropdownMenuTrigger asChild>
              <button className="relative focus:outline-none">
                <Bell className="text-gray-500 dark:text-gray-300" size={24} />
                {unread && reminders.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"></span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <div className="px-3 py-2 border-b text-sm font-semibold text-gray-700 dark:text-white">Reminders</div>
              {reminders.length === 0 ? (
                <div className="px-4 py-6 text-center text-gray-400 text-sm">No reminders</div>
              ) : (
                reminders.map(reminder => (
                  <DropdownMenuItem key={reminder.id} className="flex items-center gap-2 py-2">
                    <span>{reminder.message}</span>
                    <span className="ml-auto text-xs text-gray-400">{reminder.time}</span>
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          {/* Theme toggle */}
          <button
            className="ml-2 p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="text-yellow-400" size={18} /> : <Moon className="text-gray-600" size={18} />}
          </button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="w-8 h-8 rounded-full p-0 dark:text-red-400 dark:hover:text-red-300">
                <div className="w-8 h-8 bg-gradient-to-br from-brand-light-pink to-brand-pink rounded-full flex items-center justify-center">
                  <User className="text-white dark:text-red-400" size={14} />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem disabled>
                {user?.name || "User"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={logout} className="text-red-600">
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {/* Red border line below the PeriodCare banner */}
      <div className="max-w-md mx-auto">
        <div className="h-px w-full bg-gray-200 dark:bg-red-900 mt-2" />
      </div>
    </header>
  );
}
