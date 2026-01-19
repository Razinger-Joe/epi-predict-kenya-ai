import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, AlertTriangle, Info, CheckCircle } from "lucide-react";

const alerts = [
    {
        id: 1,
        title: "Cholera Outbreak Risk - Kisumu",
        description: "Water quality indicators suggest elevated cholera risk in Lake Victoria region",
        severity: "high",
        time: "2 hours ago",
        county: "Kisumu",
    },
    {
        id: 2,
        title: "Malaria Cases Rising - Mombasa",
        description: "15% increase in reported malaria cases over the past week",
        severity: "medium",
        time: "5 hours ago",
        county: "Mombasa",
    },
    {
        id: 3,
        title: "Dengue Monitoring - Nairobi",
        description: "Seasonal dengue patterns detected, recommend preventive measures",
        severity: "low",
        time: "1 day ago",
        county: "Nairobi",
    },
];

const Alerts = () => {
    return (
        <SidebarProvider>
            <div className="min-h-screen flex w-full bg-background">
                <DashboardSidebar />

                <div className="flex-1 flex flex-col">
                    <DashboardHeader />

                    <main className="flex-1 p-6">
                        <div className="mb-8 flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-foreground">Alerts</h1>
                                <p className="text-muted-foreground mt-1">
                                    Active disease surveillance alerts
                                </p>
                            </div>
                            <Badge variant="destructive" className="text-sm">
                                <Bell className="w-4 h-4 mr-1" />
                                {alerts.length} Active
                            </Badge>
                        </div>

                        <div className="space-y-4">
                            {alerts.map((alert) => (
                                <Card key={alert.id} className="hover:shadow-md transition-shadow">
                                    <CardHeader className="pb-2">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-2">
                                                {alert.severity === "high" && (
                                                    <AlertTriangle className="h-5 w-5 text-destructive" />
                                                )}
                                                {alert.severity === "medium" && (
                                                    <Info className="h-5 w-5 text-orange-500" />
                                                )}
                                                {alert.severity === "low" && (
                                                    <CheckCircle className="h-5 w-5 text-primary" />
                                                )}
                                                <CardTitle className="text-lg">{alert.title}</CardTitle>
                                            </div>
                                            <Badge
                                                variant={alert.severity === "high" ? "destructive" : "secondary"}
                                            >
                                                {alert.severity}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground">{alert.description}</p>
                                        <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                                            <span>{alert.county} County</span>
                                            <span>•</span>
                                            <span>{alert.time}</span>
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

export default Alerts;
