import { Bell, MapPin, Target, Activity, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState, useCallback, useMemo } from "react";

const stats = [
  {
    title: "Active Alerts",
    value: 7,
    change: "+2 from yesterday",
    trend: "up",
    icon: Bell,
    color: "text-destructive",
    bgColor: "bg-destructive/10",
  },
  {
    title: "Counties at High Risk",
    value: 3,
    subtitle: "Nairobi, Kisumu, Mombasa",
    icon: MapPin,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
  {
    title: "Counties Monitored",
    value: 47,
    change: "Updated 2 hours ago",
    icon: Target,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    title: "System Uptime",
    value: "99.9%",
    change: "All systems operational",
    trend: "up",
    icon: Activity,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
];

export function StatCards() {
  const [animatedValues, setAnimatedValues] = useState(stats.map(() => 0));
  const [animationComplete, setAnimationComplete] = useState(false);

  // Memoize stats to prevent unnecessary recalculations
  const memoizedStats = useMemo(() => stats, []);

  // Optimized animation with proper cleanup
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    let completedCount = 0;

    memoizedStats.forEach((stat, index) => {
      if (typeof stat.value === "number") {
        let current = 0;
        const target = stat.value;
        const increment = target / 15; // Reduced from 20 for smoother animation
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            current = target;
            clearInterval(timer);
            completedCount++;
            if (completedCount === memoizedStats.length) {
              setAnimationComplete(true);
            }
          }
          setAnimatedValues((prev) => {
            const newValues = [...prev];
            newValues[index] = Math.floor(current);
            return newValues;
          });
        }, 40); // Increased from 50ms for better performance
        timers.push(timer);
      }
    });

    // Cleanup function
    return () => {
      timers.forEach(timer => clearInterval(timer));
    };
  }, [memoizedStats]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {memoizedStats.map((stat, index) => (
        <Card
          key={stat.title}
          className="hover:shadow-md transition-shadow duration-200 cursor-pointer will-change-transform"
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-3xl font-bold text-card-foreground">
                  {typeof stat.value === "number" 
                    ? animatedValues[index]
                    : stat.value}
                </p>
                {stat.subtitle && (
                  <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
                )}
                {stat.change && (
                  <div className="flex items-center gap-1 text-xs">
                    {stat.trend === "up" ? (
                      <TrendingUp className={`w-3 h-3 ${stat.trend === "up" && stat.title === "Active Alerts" ? "text-destructive" : "text-primary"}`} />
                    ) : stat.trend === "down" ? (
                      <TrendingDown className="w-3 h-3 text-primary" />
                    ) : null}
                    <span className="text-muted-foreground">{stat.change}</span>
                  </div>
                )}
              </div>
              <div className={`w-12 h-12 rounded-full ${stat.bgColor} flex items-center justify-center flex-shrink-0`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
