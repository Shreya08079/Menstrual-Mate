import { useState } from "react";
import { Header } from "@/components/layout/header";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  // Local state for settings
  const [theme, setTheme] = useState("system");
  const [notifications, setNotifications] = useState(true);
  const [waterGoal, setWaterGoal] = useState(3000);
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast({
        title: "Settings saved!",
        description: "Your preferences have been updated.",
      });
    }, 1000);
  };

  const handleLogout = () => {
    logout();
  };

  const handleThemeChange = (value: string) => {
    setTheme(value);
    if (value === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else if (value === "light") {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      // System
      localStorage.removeItem("theme");
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 font-[cursive,'Comic Sans MS','Quicksand','Poppins','sans-serif']">
      <Header />
      <main className="max-w-md mx-auto px-4 py-6 pb-24">
        <div className="mb-8 flex items-center gap-2">
          <span className="text-pink-400 text-3xl">💖</span>
          <h2 className="text-3xl font-extrabold text-pink-600 mb-2 tracking-tight">Settings</h2>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 mb-8 border-2 border-pink-100 dark:border-gray-800 text-gray-900 dark:text-white">
          {/* Theme Toggle */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-pink-600 mb-2 flex items-center gap-2">
              <span className="text-pink-400">🎨</span> Theme
            </h3>
            <div className="flex gap-3">
              <Button
                variant={theme === "light" ? "default" : "outline"}
                className={theme === "light" ? "bg-pink-200 text-pink-700 scale-105 shadow" : ""}
                onClick={() => handleThemeChange("light")}
              >
                Light
              </Button>
              <Button
                variant={theme === "dark" ? "default" : "outline"}
                className={theme === "dark" ? "bg-purple-200 text-purple-700 scale-105 shadow" : ""}
                onClick={() => handleThemeChange("dark")}
              >
                Dark
              </Button>
              <Button
                variant={theme === "system" ? "default" : "outline"}
                className={theme === "system" ? "bg-blue-100 text-blue-700 scale-105 shadow" : ""}
                onClick={() => handleThemeChange("system")}
              >
                System
              </Button>
            </div>
          </div>
          {/* Notifications */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-pink-600 mb-2 flex items-center gap-2"><span className="text-pink-400">🔔</span> Notifications</h3>
            <div className="flex items-center gap-3">
              <Switch checked={notifications} onCheckedChange={setNotifications} />
              <span className="text-gray-700">Enable reminders & health tips</span>
            </div>
          </div>
          {/* Water Goal */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-pink-600 mb-2 flex items-center gap-2"><span className="text-pink-400">💧</span> Daily Water Goal</h3>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={1000}
                max={5000}
                step={100}
                value={waterGoal}
                onChange={e => setWaterGoal(Number(e.target.value))}
                className="w-24 px-3 py-2 rounded-lg border-2 border-pink-200 text-pink-700 font-semibold bg-pink-50 dark:bg-gray-800 dark:text-pink-200 focus:outline-none focus:border-pink-400"
              />
              <span className="text-gray-700">ml</span>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-300 mt-1">Recommended: 2000-3000ml per day</p>
          </div>
          {/* Account Management */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-pink-600 mb-2 flex items-center gap-2"><span className="text-pink-400">👤</span> Account</h3>
            <div className="flex flex-col gap-2">
              <Button variant="outline" className="border-pink-200 text-pink-600 hover:bg-pink-50 dark:bg-gray-800 dark:text-pink-200 dark:border-gray-700" onClick={handleLogout}>
                Log Out
              </Button>
              <Button variant="destructive" className="border-pink-200 bg-white text-red-500 hover:bg-red-50 dark:bg-gray-800 dark:text-red-400 dark:border-gray-700">
                Delete Account
              </Button>
            </div>
          </div>
          {/* Save/Cancel */}
          <div className="flex gap-3 mt-8">
            <Button className="btn-primary text-white rounded-full px-6 py-2 shadow-lg dark:bg-pink-700 dark:hover:bg-pink-600" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Settings"}
            </Button>
            <Button variant="outline" className="rounded-full px-6 py-2 border-pink-200 text-pink-600 hover:bg-pink-50 shadow dark:bg-gray-800 dark:text-pink-200 dark:border-gray-700" onClick={() => window.history.back()}>
              Cancel
            </Button>
          </div>
        </div>
      </main>
      <BottomNavigation />
    </div>
  );
} 