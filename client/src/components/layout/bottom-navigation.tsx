import { Home, Calendar, BarChart3, User } from "lucide-react";
import { useLocation } from "wouter";
import { Link } from "wouter";

const navItems = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/calendar", icon: Calendar, label: "Calendar" },
  { path: "/insights", icon: BarChart3, label: "Insights" },
  { path: "/profile", icon: User, label: "Profile" },
];

export function BottomNavigation() {
  const [location] = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0">
      <div className="max-w-md mx-auto">
        <div className="h-px w-full bg-gray-200 dark:bg-red-900" />
      </div>
      <nav className="bg-white px-4 py-2 dark:bg-gray-900">
        <div className="max-w-md mx-auto flex items-center justify-around">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location === path;
            return (
              <Link
                key={path}
                href={path}
                className={`flex flex-col items-center space-y-1 py-2 px-3 transition-colors
                ${isActive ? "text-brand-pink dark:text-red-300" : "text-gray-500 hover:text-brand-pink dark:text-red-400 dark:hover:text-red-300"}
              `}
              >
                <Icon size={20} />
                <span className="text-xs font-medium">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
