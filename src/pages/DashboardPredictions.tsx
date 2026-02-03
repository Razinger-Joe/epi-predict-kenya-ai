import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { DashboardBreadcrumbs } from "@/components/dashboard/DashboardBreadcrumbs";

const predictions = [
  {
    id: 1,
    day: 1,
    date: "Oct 23",
    event: "Malaria cases rising in Western Kenya",
    locations: ["Kisumu", "Siaya", "Busia"],
    confidence: 82,
    action: "Stock antimalarials",
    level: "high"
  },
  {
    id: 2,
    day: 3,
    date: "Oct 25",
    event: "Flu surge predicted in Nairobi schools",
    locations: ["Nairobi", "Kiambu"],
    confidence: 76,
    action: "Alert school health programs",
    level: "medium"
  },
  {
    id: 3,
    day: 5,
    date: "Oct 27",
    event: "Cholera outbreak risk in Mombasa",
    locations: ["Mombasa", "Kilifi"],
    confidence: 89,
    action: "Critical: Prepare ORS, alert CHVs",
    level: "critical"
  },
  {
    id: 4,
    day: 7,
    date: "Oct 29",
    event: "Typhoid cases increasing in Central Kenya",
    locations: ["Nakuru", "Nyeri"],
    confidence: 68,
    action: "Monitor water quality",
    level: "medium"
  },
  {
    id: 5,
    day: 9,
    date: "Oct 31",
    event: "Dengue fever alert in Coastal region",
    locations: ["Mombasa", "Malindi"],
    confidence: 71,
    action: "Vector control measures",
    level: "high"
  },
  {
    id: 6,
    day: 12,
    date: "Nov 3",
    event: "Flu season peak approaching nationwide",
    locations: ["All urban counties"],
    confidence: 85,
    action: "Increase ICU readiness",
    level: "critical"
  },
  {
    id: 7,
    day: 14,
    date: "Nov 5",
    event: "Malaria cases declining in Western Kenya",
    locations: ["Kisumu", "Kakamega"],
    confidence: 79,
    action: "Maintain vigilance",
    level: "low"
  }
];

const getLevelColor = (level: string) => {
  switch (level) {
    case "critical":
      return "bg-destructive/10 border-destructive text-destructive";
    case "high":
      return "bg-orange-500/10 border-orange-500 text-orange-600";
    case "medium":
      return "bg-yellow-500/10 border-yellow-500 text-yellow-600";
    default:
      return "bg-primary/10 border-primary text-primary";
  }
};

const DashboardPredictions = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar />

        <div className="flex-1 flex flex-col">
          <DashboardHeader />

          <main className="flex-1 p-6">
            <DashboardBreadcrumbs />

            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground">14-Day Outbreak Forecast</h1>
              <p className="text-muted-foreground mt-1">
                AI-powered predictions for disease outbreaks across Kenya
              </p>
            </div>

            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-orange-500 to-destructive" />

              {/* Prediction cards */}
              <div className="space-y-6">
                {predictions.map((prediction, index) => (
                  <div key={prediction.id} className="relative pl-20">
                    {/* Timeline dot */}
                    <div className={`absolute left-6 top-6 w-5 h-5 rounded-full border-4 border-background ${prediction.level === "critical" ? "bg-destructive" :
                      prediction.level === "high" ? "bg-orange-500" :
                        prediction.level === "medium" ? "bg-yellow-500" :
                          "bg-primary"
                      }`} />

                    <Card className={`border-2 ${getLevelColor(prediction.level)}`}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Calendar className="w-4 h-4" />
                              <span className="text-sm font-medium">Day {prediction.day} - {prediction.date}</span>
                              <Badge variant="outline" className="ml-2">
                                {prediction.confidence}% Confidence
                              </Badge>
                            </div>
                            <CardTitle className="text-xl">{prediction.event}</CardTitle>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="font-medium">Locations:</span>
                          <span>{prediction.locations.join(", ")}</span>
                        </div>
                        <div className={`p-3 rounded-lg ${prediction.level === "critical" ? "bg-destructive/10" :
                          prediction.level === "high" ? "bg-orange-500/10" :
                            prediction.level === "medium" ? "bg-yellow-500/10" :
                              "bg-primary/10"
                          }`}>
                          <p className="text-sm font-medium">Recommended Action</p>
                          <p className="text-sm mt-1">{prediction.action}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardPredictions;
