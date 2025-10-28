import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, MapPin, Clock } from "lucide-react";

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
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar />
        
        <div className="flex-1 flex flex-col">
          <DashboardHeader />
          
          <main className="flex-1 p-6">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Active Alerts</h1>
                <p className="text-muted-foreground mt-1">
                  Critical disease outbreak warnings requiring immediate attention
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">Mark All as Read</Button>
                <Button variant="outline">Export Report</Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {alerts.map((alert) => (
                <Card key={alert.id} className={`border-2 ${
                  alert.level === "critical" ? "border-destructive" :
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
                      <Button variant="outline" size="sm" className="flex-1">
                        View Full Report
                      </Button>
                      <Button variant="default" size="sm" className="flex-1">
                        Mark as Handled
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
