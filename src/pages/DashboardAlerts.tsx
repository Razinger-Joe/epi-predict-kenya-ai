import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { AlertTriangle, MapPin, Clock, Download, ExternalLink, Share2, Zap } from "lucide-react";
import { useState, useCallback, useEffect } from "react";

/* ------------------------------------------------------------------ */
/*  Mock Data                                                          */
/* ------------------------------------------------------------------ */
const alerts = [
  {
    id: 1, level: "critical", title: "Malaria Outbreak Imminent — Nairobi",
    county: "Nairobi", disease: "Malaria", risk: 85,
    affectedAreas: ["Kibera", "Mathare", "Mukuru"], peakDate: "October 30, 2025",
    daysUntilPeak: 7, estimatedCases: "1,200 – 1,800", casesConfirmed: 342,
    populationAtRisk: 45000, timestamp: "2 hours ago", source: "MoH Surveillance",
    trend: [20, 28, 35, 42, 55, 68, 85],
    actions: ["Stock artemether-lumefantrine (Coartem)", "Alert emergency department staff", "Prepare 50+ inpatient beds", "Contact county health department"],
  },
  {
    id: 2, level: "critical", title: "Cholera Outbreak Risk — Mombasa",
    county: "Mombasa", disease: "Cholera", risk: 72,
    affectedAreas: ["Old Town", "Likoni", "Bangladesh"], peakDate: "October 28, 2025",
    daysUntilPeak: 5, estimatedCases: "300 – 500", casesConfirmed: 89,
    populationAtRisk: 22000, timestamp: "5 hours ago", source: "WASH Program",
    trend: [10, 15, 22, 30, 45, 58, 72],
    actions: ["Stock ORS and IV fluids", "Activate cholera treatment unit", "Coordinate with water department", "Prepare health education materials"],
  },
  {
    id: 3, level: "high", title: "Flu Surge Expected — Kisumu",
    county: "Kisumu", disease: "Influenza", risk: 68,
    affectedAreas: ["Kisumu Central", "Kisumu East"], peakDate: "November 2, 2025",
    daysUntilPeak: 10, estimatedCases: "800 – 1,200", casesConfirmed: 156,
    populationAtRisk: 18000, timestamp: "1 day ago", source: "IDSR Report",
    trend: [8, 12, 18, 28, 40, 52, 68],
    actions: ["Ensure paracetamol stock adequate", "Schedule extra staff for 2 weeks", "Prepare isolation areas", "Coordinate with schools"],
  },
  {
    id: 4, level: "medium", title: "Dengue Cases Rising — Kilifi",
    county: "Kilifi", disease: "Dengue", risk: 48,
    affectedAreas: ["Malindi", "Watamu"], peakDate: "November 8, 2025",
    daysUntilPeak: 16, estimatedCases: "150 – 300", casesConfirmed: 42,
    populationAtRisk: 8500, timestamp: "2 days ago", source: "CDC Kenya",
    trend: [5, 8, 12, 18, 25, 35, 48],
    actions: ["Intensify vector control", "Distribute bed nets", "Activate dengue rapid testing"],
  },
  {
    id: 5, level: "low", title: "Typhoid Monitoring — Nakuru",
    county: "Nakuru", disease: "Typhoid", risk: 25,
    affectedAreas: ["Nakuru Town"], peakDate: "November 15, 2025",
    daysUntilPeak: 23, estimatedCases: "50 – 100", casesConfirmed: 18,
    populationAtRisk: 4200, timestamp: "3 days ago", source: "County DHIS2",
    trend: [8, 10, 12, 15, 18, 22, 25],
    actions: ["Continue water quality testing", "Maintain antibiotic stocks"],
  },
];

const filterOptions = ["All", "Critical", "High", "Medium", "Low"];

/* Helpers */
const levelConfig: Record<string, { badge: string; label: string }> = {
  critical: { badge: "badge-critical", label: "CRITICAL" },
  high: { badge: "badge-high", label: "HIGH" },
  medium: { badge: "badge-medium", label: "MEDIUM" },
  low: { badge: "badge-low", label: "LOW" },
};

const barColorVar: Record<string, string> = {
  critical: "var(--severity-critical-border)",
  high: "var(--severity-high-border)",
  medium: "var(--severity-medium-border)",
  low: "var(--severity-low-border)",
};

const sparkColorHex: Record<string, string> = {
  critical: "#EF4444", high: "#F97316", medium: "#EAB308", low: "#10B981",
};

/* Mini sparkline component */
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((v - min) / range) * 80 - 10;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg viewBox="0 0 100 100" className="w-full h-10" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      <polygon points={`0,100 ${points} 100,100`} fill={`url(#grad-${color.replace('#', '')})`} />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
const DashboardAlerts = () => {
  const [activeFilter, setActiveFilter] = useState("All");
  const [handledAlerts, setHandledAlerts] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState<number | null>(null);
  const [alertCount, setAlertCount] = useState(0);
  const [selectedAlert, setSelectedAlert] = useState<typeof alerts[0] | null>(null);

  useEffect(() => {
    let current = 0;
    const target = alerts.length;
    const timer = setInterval(() => {
      current++;
      if (current >= target) { current = target; clearInterval(timer); }
      setAlertCount(current);
    }, 100);
    return () => clearInterval(timer);
  }, []);

  const filteredAlerts = activeFilter === "All"
    ? alerts
    : alerts.filter((a) => a.level === activeFilter.toLowerCase());

  const handleMarkAsHandled = useCallback(async (alertId: number) => {
    setIsProcessing(alertId);
    await new Promise((r) => setTimeout(r, 600));
    setHandledAlerts((prev) => [...prev, alertId]);
    setIsProcessing(null);
  }, []);

  const handleExportReport = useCallback(() => {
    const reportContent = alerts
      .map((a) =>
        `ALERT: ${a.title}\nLevel: ${a.level}\nRisk: ${a.risk}%\nAffected: ${a.affectedAreas.join(", ")}\nPeak: ${a.peakDate}\nEstimated Cases: ${a.estimatedCases}\n\n`
      )
      .join("");
    const blob = new Blob([reportContent], { type: "text/plain;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `disease-alerts-${new Date().toISOString().split("T")[0]}.txt`;
    link.click();
  }, []);

  return (
    <div className="min-h-screen flex w-full epi-ambient-bg">
      <DashboardSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader />

        <main className="flex-1 p-4 md:p-6 overflow-auto space-y-6">
          {/* ---- Header ---- */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 animate-cascade-in opacity-0" style={{ animationDelay: "100ms" }}>
            <div>
              <h1 className="font-syne text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
                Active Alerts
                <span className="font-syne text-2xl md:text-3xl font-bold text-primary animate-pulse-glow inline-flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
                  {alertCount}
                </span>
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Real-time disease outbreak monitoring across Kenya
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-muted-foreground">
                Last updated: <span className="text-primary">{new Date().toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit", hour12: false })}</span>
              </span>
              <button
                onClick={handleExportReport}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border border-border text-muted-foreground hover:text-primary hover:border-primary/40 transition-all"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>

          {/* ---- Filter Bar ---- */}
          <div className="flex gap-2 overflow-x-auto pb-1 animate-cascade-in opacity-0" style={{ animationDelay: "200ms" }}>
            {filterOptions.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`
                  whitespace-nowrap px-4 py-2 text-xs font-medium rounded-full transition-all duration-200 shrink-0
                  ${activeFilter === filter
                    ? "bg-primary text-primary-foreground shadow-[0_0_15px_var(--glow-accent)]"
                    : "epi-glass-card text-muted-foreground hover:text-foreground hover:border-[var(--card-hover-border)]"
                  }
                `}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* ---- Alert Cards Grid ---- */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredAlerts.map((alert, index) => {
              const config = levelConfig[alert.level];
              const isCritical = alert.level === "critical";
              return (
                <div
                  key={alert.id}
                  className={`
                    epi-glass-card rounded-2xl overflow-hidden
                    hover:-translate-y-1 transition-all duration-300 cursor-pointer group
                    animate-cascade-in opacity-0
                  `}
                  style={{
                    animationDelay: `${300 + index * 60}ms`,
                    animation: isCritical
                      ? `criticalBorder 3s ease-in-out infinite, cascade-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${300 + index * 60}ms forwards`
                      : undefined,
                  }}
                >
                  <div className="flex">
                    {/* Left accent bar */}
                    <div className="w-1 shrink-0" style={{ background: barColorVar[alert.level] }} />

                    <div className="flex-1 p-5 space-y-4">
                      {/* Top */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <span className={`${config.badge} text-[10px] font-mono font-bold px-2 py-0.5 rounded-full inline-block`}>
                            {config.label}
                          </span>
                          <h3 className="font-syne text-base font-bold text-foreground leading-tight">
                            {alert.title}
                          </h3>
                        </div>
                        <AlertTriangle className="w-5 h-5 shrink-0" style={{ color: sparkColorHex[alert.level] }} />
                      </div>

                      {/* Metrics */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-[var(--hover-bg)] rounded-lg p-2.5">
                          <p className="text-[10px] text-muted-foreground uppercase">Risk</p>
                          <p className="font-syne text-lg font-bold" style={{ color: sparkColorHex[alert.level] }}>
                            {alert.risk}%
                          </p>
                        </div>
                        <div className="bg-[var(--hover-bg)] rounded-lg p-2.5">
                          <p className="text-[10px] text-muted-foreground uppercase">Confirmed</p>
                          <p className="font-syne text-lg font-bold text-foreground">
                            {alert.casesConfirmed}
                          </p>
                        </div>
                      </div>

                      {/* Sparkline */}
                      <div className="rounded-lg bg-[var(--hover-bg)] p-2">
                        <Sparkline data={alert.trend} color={sparkColorHex[alert.level]} />
                      </div>

                      {/* Location + time */}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {alert.county}
                        </span>
                        <span className="flex items-center gap-1 ml-auto">
                          <Clock className="w-3 h-3" />
                          <span className="font-mono">{alert.timestamp}</span>
                        </span>
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => setSelectedAlert(alert)}
                          className="flex-1 py-2 text-xs font-medium rounded-xl border border-border text-muted-foreground hover:text-primary hover:border-primary/40 transition-all flex items-center justify-center gap-1.5"
                        >
                          <ExternalLink className="w-3 h-3" />
                          View Details
                        </button>
                        <button
                          onClick={() => handleMarkAsHandled(alert.id)}
                          disabled={isProcessing === alert.id || handledAlerts.includes(alert.id)}
                          className={`flex-1 py-2 text-xs font-medium rounded-xl transition-all flex items-center justify-center gap-1.5 ${handledAlerts.includes(alert.id)
                              ? "bg-green-500/10 text-green-600 border border-green-500/20"
                              : "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20"
                            } disabled:opacity-50`}
                        >
                          {isProcessing === alert.id
                            ? "Processing..."
                            : handledAlerts.includes(alert.id)
                              ? "✓ Handled"
                              : "Mark Handled"
                          }
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>

      {/* ---- Detail Modal ---- */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelectedAlert(null)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative w-full max-w-[760px] epi-glass-modal rounded-2xl overflow-hidden animate-chat-entry" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-primary/20 bg-gradient-to-r from-primary/10 to-transparent">
              <AlertTriangle className="w-5 h-5" style={{ color: sparkColorHex[selectedAlert.level] }} />
              <div className="flex-1">
                <h3 className="font-syne text-lg font-bold text-foreground">{selectedAlert.title}</h3>
                <p className="text-xs text-muted-foreground">{selectedAlert.disease} · {selectedAlert.county} County</p>
              </div>
              <span className={`${levelConfig[selectedAlert.level].badge} text-[10px] font-mono font-bold px-2.5 py-1 rounded-full`}>
                {levelConfig[selectedAlert.level].label}
              </span>
              <button onClick={() => setSelectedAlert(null)} className="p-2 rounded-xl hover:bg-[var(--hover-bg)] transition-colors text-muted-foreground">✕</button>
            </div>

            <div className="p-6 space-y-6 max-h-[65vh] overflow-y-auto">
              {/* Stats row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "Risk Score", value: `${selectedAlert.risk}%`, color: sparkColorHex[selectedAlert.level] },
                  { label: "Confirmed Cases", value: selectedAlert.casesConfirmed.toString(), color: "var(--accent-primary)" },
                  { label: "Population at Risk", value: selectedAlert.populationAtRisk.toLocaleString(), color: "#3B82F6" },
                  { label: "Days to Peak", value: selectedAlert.daysUntilPeak.toString(), color: "#EF4444" },
                ].map((stat) => (
                  <div key={stat.label} className="epi-glass-card rounded-xl p-4 text-center">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                    <p className="font-syne text-2xl font-bold mt-1" style={{ color: stat.color }}>{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Trend chart */}
              <div className="epi-glass-card rounded-xl p-4">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">7-Day Trend</h4>
                <Sparkline data={selectedAlert.trend} color={sparkColorHex[selectedAlert.level]} />
              </div>

              {/* Affected areas */}
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Affected Areas</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedAlert.affectedAreas.map((area) => (
                    <span key={area} className="px-3 py-1.5 text-xs rounded-full epi-glass-card text-foreground">
                      <MapPin className="w-3 h-3 inline mr-1 text-primary" />{area}
                    </span>
                  ))}
                </div>
              </div>

              {/* AI Analysis */}
              <div className="epi-glass-card rounded-xl p-4 border-l-2 border-l-primary/40">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-primary" />
                  <h4 className="text-xs font-semibold text-primary uppercase tracking-wider">AI Prediction</h4>
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed">
                  Based on current trends, {selectedAlert.disease.toLowerCase()} cases in {selectedAlert.county} are projected to peak by <strong className="text-foreground">{selectedAlert.peakDate}</strong> with an estimated <strong className="text-foreground">{selectedAlert.estimatedCases}</strong> cases.
                  Immediate intervention is recommended.
                </p>
              </div>

              {/* Actions */}
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Recommended Actions</h4>
                <div className="space-y-2">
                  {selectedAlert.actions.map((action, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-[var(--hover-bg)] border border-border">
                      <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-sm text-foreground/80">{action}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center gap-3 px-6 py-4 border-t border-border">
              <button className="flex-1 py-2.5 text-sm font-medium rounded-xl bg-gradient-to-r from-primary to-primary/70 text-primary-foreground hover:shadow-[0_0_20px_var(--glow-accent)] transition-all active:scale-[0.98]">
                Set Alert
              </button>
              <button className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl border border-border text-muted-foreground hover:text-primary hover:border-primary/40 transition-all">
                <Share2 className="w-4 h-4" />
                Share
              </button>
              <button className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl border border-border text-muted-foreground hover:text-primary hover:border-primary/40 transition-all">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardAlerts;
