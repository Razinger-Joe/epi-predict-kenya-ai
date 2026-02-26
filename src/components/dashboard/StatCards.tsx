import { AlertTriangle, MapPin, Brain, Activity, TrendingUp } from "lucide-react";
import { useEffect, useState, useMemo } from "react";

/* Severity colors are static (consistent across themes) */
const stats = [
  {
    title: "Active Outbreaks",
    value: 7,
    change: "+2 from yesterday",
    trend: "up" as const,
    icon: AlertTriangle,
    accentColor: "var(--severity-critical-border)",
    bgGlow: "var(--severity-critical-bg)",
  },
  {
    title: "Counties Monitored",
    value: 47,
    change: "All 47 counties active",
    icon: MapPin,
    accentColor: "#3B82F6",
    bgGlow: "rgba(59, 130, 246, 0.08)",
  },
  {
    title: "Predictions Today",
    value: 24,
    change: "+8 new models run",
    trend: "up" as const,
    icon: Brain,
    accentColor: "var(--accent-primary)",
    bgGlow: "var(--accent-light)",
  },
  {
    title: "National Risk Score",
    value: 34,
    suffix: "%",
    change: "Low — stable trend",
    icon: Activity,
    accentColor: "#10B981",
    bgGlow: "rgba(16, 185, 129, 0.08)",
  },
];

export function StatCards() {
  const [animatedValues, setAnimatedValues] = useState(stats.map(() => 0));

  const memoizedStats = useMemo(() => stats, []);

  useEffect(() => {
    const timers: ReturnType<typeof setInterval>[] = [];
    memoizedStats.forEach((stat, index) => {
      if (typeof stat.value === "number") {
        let current = 0;
        const target = stat.value;
        const increment = target / 15;
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            current = target;
            clearInterval(timer);
          }
          setAnimatedValues((prev) => {
            const newValues = [...prev];
            newValues[index] = Math.floor(current);
            return newValues;
          });
        }, 40);
        timers.push(timer);
      }
    });
    return () => timers.forEach((t) => clearInterval(t));
  }, [memoizedStats]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {memoizedStats.map((stat, index) => (
        <div
          key={stat.title}
          className="epi-glass-card rounded-2xl p-5 hover:-translate-y-1 hover:border-[var(--card-hover-border)] transition-all duration-300 cursor-pointer group animate-cascade-in opacity-0"
          style={{
            animationDelay: `${index * 80 + 200}ms`,
            borderTop: `2px solid color-mix(in srgb, ${stat.accentColor} 40%, transparent)`,
          }}
        >
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {stat.title}
              </p>
              <p className="text-3xl font-syne font-bold text-foreground">
                {animatedValues[index]}
                {stat.suffix || ""}
              </p>
              {stat.change && (
                <div className="flex items-center gap-1.5 text-xs">
                  {stat.trend === "up" && (
                    <TrendingUp className="w-3 h-3" style={{ color: stat.accentColor }} />
                  )}
                  <span className="text-muted-foreground">{stat.change}</span>
                </div>
              )}
            </div>
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
              style={{ background: stat.bgGlow }}
            >
              <stat.icon className="w-5 h-5" style={{ color: stat.accentColor }} />
            </div>
          </div>
          {/* Mini sparkline bar */}
          <div className="mt-3 h-1 rounded-full bg-[var(--sparkline-track)] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${(animatedValues[index] / stat.value) * 70 + 30}%`,
                background: `linear-gradient(90deg, color-mix(in srgb, ${stat.accentColor} 60%, transparent), ${stat.accentColor})`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
