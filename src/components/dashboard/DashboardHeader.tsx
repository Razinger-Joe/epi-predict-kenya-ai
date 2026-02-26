import { Search, Bell, ChevronDown, Shield, Sun, Moon, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "@/contexts/ThemeProvider";
import { MobileDrawer } from "@/components/dashboard/DashboardSidebar";

export function DashboardHeader() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentTime.toLocaleDateString("en-KE", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const formattedTime = currentTime.toLocaleTimeString("en-KE", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  return (
    <>
      <header className="sticky top-0 z-30 epi-glass-card border-b border-border">
        <div className="flex items-center gap-4 px-4 md:px-6 py-3">
          {/* Mobile hamburger — 48px touch target */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-3 -ml-2 rounded-xl hover:bg-[var(--hover-bg)] transition-colors min-w-[48px] min-h-[48px] flex items-center justify-center"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5 text-foreground" />
          </button>

          {/* Left — Page title */}
          <div className="flex-1 min-w-0">
            <h2 className="font-syne text-lg font-bold text-foreground truncate">
              Disease Intelligence
            </h2>
            <p className="text-xs text-muted-foreground hidden sm:block">Biosurveillance Command Center</p>
          </div>

          {/* Center — Live Outbreak Status Pill */}
          <div className="hidden lg:flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/30">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            <span className="text-xs font-medium text-green-600 dark:text-green-400">Kenya Risk: Normal</span>
            <Shield className="w-3 h-3 text-green-500" />
          </div>

          {/* Search */}
          <div className="hidden md:flex relative max-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              placeholder="Search..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-[var(--hover-bg)] border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all"
            />
          </div>

          {/* Date/time — monospace */}
          <div className="hidden xl:block text-right">
            <p className="font-mono text-xs text-muted-foreground">{formattedDate}</p>
            <p className="font-mono text-sm font-semibold text-primary tracking-wider">{formattedTime}</p>
          </div>

          {/* Theme toggle button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-border bg-card hover:bg-[var(--hover-bg)] transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            title={theme === "dark" ? "Light mode" : "Dark mode"}
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5 text-primary" />
            ) : (
              <Moon className="w-5 h-5 text-muted-foreground" />
            )}
          </button>

          {/* Notification bell */}
          <button
            className="relative p-2 rounded-xl hover:bg-[var(--hover-bg)] transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-muted-foreground" />
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-destructive text-[9px] font-mono font-bold text-white flex items-center justify-center leading-none">
              3
            </span>
          </button>

          {/* User Avatar */}
          <button className="hidden sm:flex items-center gap-2 p-1.5 rounded-xl hover:bg-[var(--hover-bg)] transition-colors">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-xs font-bold text-primary-foreground">
              KH
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground hidden md:block" />
          </button>
        </div>
      </header>

      {/* Mobile drawer — rendered here so state is co-located */}
      <MobileDrawer isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
    </>
  );
}
