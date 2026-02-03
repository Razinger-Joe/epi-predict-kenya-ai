import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, MapPin, Clock, Download } from "lucide-react";
import { DashboardBreadcrumbs } from "@/components/dashboard/DashboardBreadcrumbs";
import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

const alerts = [
  {
    id: 1,
    level: "critical",
    title: "Malaria Outbreak Imminent - Nairobi",
    county: "Nairobi",
    disease: "Malaria",
    risk: 85,
    affectedAreas: ["Kibera", "Mathare", "Mukuru informal settlements"],
    peakDate: "October 30, 2025",
    daysUntilPeak: 7,
    estimatedCases: "1,200-1,800",
    actions: [
      "Stock artemether-lumefantrine (Coartem)",
      "Alert emergency department staff",
      "Prepare 50+ inpatient beds",
      "Contact county health department"
    ],
    timestamp: "2 hours ago",
    handled: false
  },
  {
    id: 2,
    level: "critical",
    title: "Cholera Outbreak Risk - Mombasa",
    county: "Mombasa",
    disease: "Cholera",
    risk: 72,
    affectedAreas: ["Old Town", "Likoni", "Bangladesh"],
    peakDate: "October 28, 2025",
    daysUntilPeak: 5,
    estimatedCases: "300-500",
    actions: [
      "Stock ORS and IV fluids",
      "Activate cholera treatment unit",
      "Coordinate with water department",
      "Prepare health education materials"
    ],
    timestamp: "5 hours ago",
    handled: false
  },
  {
    id: 3,
    level: "high",
    title: "Flu Surge Expected - Kisumu",
    county: "Kisumu",
    disease: "Flu",
    risk: 68,
    affectedAreas: ["Kisumu Central", "Kisumu East"],
    peakDate: "November 2, 2025",
    daysUntilPeak: 10,
    estimatedCases: "800-1,200",
    actions: [
      "Ensure paracetamol stock adequate",
      "Schedule extra staff for next 2 weeks",
      "Prepare isolation areas",
      "Coordinate with schools (holiday period)"
    ],
    timestamp: "1 day ago",
    handled: false
  }
];

const getLevelBadge = (level: string) => {
  switch (level) {
    case "critical":
      return <Badge variant="destructive">CRITICAL</Badge>;
    case "high":
      return <Badge className="bg-orange-500 text-white">HIGH</Badge>;
    case "medium":
      return <Badge className="bg-yellow-500 text-white">MEDIUM</Badge>;
    default:
      return <Badge className="bg-primary text-primary-foreground">LOW</Badge>;
  }
};

const DashboardAlerts = () => {
  const [handledAlerts, setHandledAlerts] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleMarkAsHandled = useCallback(async (alertId: number) => {
    setIsProcessing(alertId);
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      setHandledAlerts(prev => [...prev, alertId]);
      toast({
        title: "Alert Handled",
        description: "Alert marked as handled successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark alert as handled",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(null);
    }
  }, [toast]);

  const handleMarkAllAsRead = useCallback(async () => {
    setIsExporting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      toast({
        title: "Success",
        description: "All alerts marked as read",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark all as read",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  }, [toast]);

  const handleExportReport = useCallback(async () => {
    setIsExporting(true);
    try {
      const reportContent = alerts.map(alert => 
        `ALERT: ${alert.title}\nLevel: ${alert.level}\nRisk: ${alert.risk}%\nAffected Areas: ${alert.affectedAreas.join(', ')}\nPeak Date: ${alert.peakDate}\nEstimated Cases: ${alert.estimatedCases}\n\n`
      ).join('');

      const blob = new Blob([reportContent], { type: "text/plain;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `disease-alerts-${new Date().toISOString().split('T')[0]}.txt`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Success",
        description: "Alert report exported successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export report",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  }, [toast]);
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar />

        <div className="flex-1 flex flex-col">
          <DashboardHeader />

          <main className="flex-1 p-6">
            <DashboardBreadcrumbs />

            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Active Alerts</h1>
                <p className="text-muted-foreground mt-1">
                  Critical disease outbreak warnings requiring immediate attention
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  onClick={handleMarkAllAsRead}
                  disabled={isExporting}
                >
                  {isExporting ? "Processing..." : "Mark All as Read"}
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleExportReport}
                  disabled={isExporting}
                >
                  <Download className="w-4 h-4 mr-1" />
                  {isExporting ? "Exporting..." : "Export Report"}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {alerts.map((alert) => (
                <Card key={alert.id} className={`border-2 ${alert.level === "critical" ? "border-destructive" :
                  alert.level === "high" ? "border-orange-500" :
                    "border-yellow-500"
                  }`}>
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      {getLevelBadge(alert.level)}
                      <span className="text-sm text-muted-foreground">{alert.timestamp}</span>
                    </div>
                    <CardTitle className="text-xl">{alert.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Risk and details */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Risk Probability:</span>
                        <span className="font-semibold">{alert.risk}%</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                        <span className="text-muted-foreground flex-1">
                          {alert.affectedAreas.join(", ")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          Expected peak: {alert.peakDate} ({alert.daysUntilPeak} days)
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Estimated cases:</span>
                        <span className="font-semibold">{alert.estimatedCases}</span>
                      </div>
                    </div>

                    {/* Recommended actions */}
                    <div className="space-y-2">
                      <p className="text-sm font-semibold">Recommended Actions:</p>
                      <div className="space-y-2">
                        {alert.actions.map((action, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <Checkbox id={`${alert.id}-action-${idx}`} />
                            <label
                              htmlFor={`${alert.id}-action-${idx}`}
                              className="text-sm leading-tight cursor-pointer"
                            >
                              {action}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                      >
                        View Full Report
                      </Button>
                      <Button 
                        variant={handledAlerts.includes(alert.id) ? "outline" : "default"}
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleMarkAsHandled(alert.id)}
                        disabled={isProcessing === alert.id || handledAlerts.includes(alert.id)}
                      >
                        {isProcessing === alert.id 
                          ? "Processing..." 
                          : handledAlerts.includes(alert.id)
                          ? "Handled"
                          : "Mark as Handled"
                        }
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardAlerts;
