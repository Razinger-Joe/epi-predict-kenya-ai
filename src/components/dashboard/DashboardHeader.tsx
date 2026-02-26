import { Search, Bell, ChevronDown, Shield } from "lucide-react";
import { useEffect, useState } from "react";

export function DashboardHeader() {
  const [currentTime, setCurrentTime] = useState(new Date());

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
    <header className="sticky top-0 z-30 epi-glass-card border-b border-[rgba(245,158,11,0.12)]">
      <div className="flex items-center gap-4 px-6 py-3">
        {/* Left — Page title */}
        <div className="flex-1 min-w-0">
          <h2 className="font-syne text-lg font-bold text-foreground truncate">
            Disease Intelligence
          </h2>
          <p className="text-xs text-muted-foreground">Biosurveillance Command Center</p>
        </div>

        {/* Center — Live Outbreak Status Pill */}
        <div className="hidden lg:flex items-center gap-2 px-4 py-1.5 rounded-full bg-epi-green/10 border border-epi-green/30">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-epi-green opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-epi-green" />
          </span>
          <span className="text-xs font-medium text-epi-green">Kenya Risk: Normal</span>
          <Shield className="w-3 h-3 text-epi-green" />
        </div>

        {/* Search */}
        <div className="hidden md:flex relative max-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            placeholder="Search..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-white/[0.04] border border-[rgba(245,158,11,0.12)] rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-epi-amber/40 focus:ring-1 focus:ring-epi-amber/20 transition-all"
          />
        </div>

        {/* Date/time — monospace */}
        <div className="hidden xl:block text-right">
          <p className="font-mono text-xs text-muted-foreground">{formattedDate}</p>
          <p className="font-mono text-sm font-semibold text-epi-amber tracking-wider">{formattedTime}</p>
        </div>

        {/* Notification bell */}
        <button className="relative p-2 rounded-xl hover:bg-white/[0.05] transition-colors" aria-label="Notifications">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-epi-red text-[9px] font-mono font-bold text-white flex items-center justify-center leading-none">
            3
          </span>
        </button>

        {/* User Avatar */}
        <button className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white/[0.05] transition-colors">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-epi-amber to-epi-orange flex items-center justify-center text-xs font-bold text-[#050A14]">
            KH
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground hidden md:block" />
        </button>
      </div>
    </header>
  );
}
