import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatCards } from "@/components/dashboard/StatCards";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { InsightsHarvester } from "@/components/dashboard/InsightsHarvester";
import { MapPin, Clock } from "lucide-react";

/* Mock recent alerts for the live feed */
const recentAlerts = [
  { id: 1, level: "critical", title: "Malaria Surge — Kibera", county: "Nairobi", time: "2m ago" },
  { id: 2, level: "high", title: "Cholera Cases Rising", county: "Mombasa", time: "18m ago" },
  { id: 3, level: "medium", title: "Flu Season Onset", county: "Kisumu", time: "1h ago" },
  { id: 4, level: "low", title: "Typhoid Stable", county: "Nakuru", time: "3h ago" },
];

const levelColor: Record<string, string> = {
  critical: "bg-[var(--severity-critical-border)]",
  high: "bg-[var(--severity-high-border)]",
  medium: "bg-[var(--severity-medium-border)]",
  low: "bg-[var(--severity-low-border)]",
};

const Dashboard = () => {
  return (
    <div className="min-h-screen flex w-full epi-ambient-bg">
      <DashboardSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader />

        <main className="flex-1 p-4 md:p-6 overflow-auto space-y-6">
          {/* Page title */}
          <div className="animate-cascade-in opacity-0" style={{ animationDelay: "100ms" }}>
            <h1 className="font-syne text-2xl md:text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Real-time disease outbreak monitoring for Kenya
            </p>
          </div>

          {/* Stat Cards */}
          <StatCards />

          {/* Two-column layout */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 animate-cascade-in opacity-0" style={{ animationDelay: "600ms" }}>
              <InsightsHarvester />
            </div>

            {/* Recent Alerts Live Feed */}
            <div className="animate-cascade-in opacity-0" style={{ animationDelay: "700ms" }}>
              <div className="epi-glass-card rounded-2xl p-5 h-full">
                <div className="flex items-center gap-2 mb-4">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                  </span>
                  <h3 className="font-syne text-sm font-bold text-foreground">Live Feed</h3>
                </div>

                <div className="space-y-3">
                  {recentAlerts.map((alert, i) => (
                    <div
                      key={alert.id}
                      className="flex items-start gap-3 p-3 rounded-xl bg-[var(--hover-bg)] border border-border hover:shadow-sm transition-colors cursor-pointer animate-cascade-in opacity-0"
                      style={{ animationDelay: `${800 + i * 80}ms` }}
                    >
                      <div className={`w-1 self-stretch rounded-full ${levelColor[alert.level]}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{alert.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <MapPin className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{alert.county}</span>
                          <Clock className="w-3 h-3 text-muted-foreground ml-auto" />
                          <span className="text-xs font-mono text-muted-foreground">{alert.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <ChatInterface />
    </div>
  );
};

export default Dashboard;
