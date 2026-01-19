import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";

const countyData = [
    { name: "Nairobi", status: "high", cases: 234, trend: "+12%" },
    { name: "Mombasa", status: "high", cases: 189, trend: "+8%" },
    { name: "Kisumu", status: "high", cases: 156, trend: "+15%" },
    { name: "Nakuru", status: "medium", cases: 98, trend: "+3%" },
    { name: "Kiambu", status: "medium", cases: 87, trend: "-2%" },
    { name: "Machakos", status: "low", cases: 45, trend: "-5%" },
    { name: "Meru", status: "low", cases: 32, trend: "-8%" },
    { name: "Nyeri", status: "low", cases: 28, trend: "-3%" },
];

const Counties = () => {
    return (
        <SidebarProvider>
            <div className="min-h-screen flex w-full bg-background">
                <DashboardSidebar />

                <div className="flex-1 flex flex-col">
                    <DashboardHeader />

                    <main className="flex-1 p-6">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-foreground">Counties</h1>
                            <p className="text-muted-foreground mt-1">
                                Monitor all 47 Kenyan counties
                            </p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            {countyData.map((county) => (
                                <Card key={county.name} className="hover:shadow-md transition-shadow cursor-pointer">
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <MapPin className="h-4 w-4 text-primary" />
                                                {county.name}
                                            </CardTitle>
                                            <Badge
                                                variant={
                                                    county.status === "high" ? "destructive" :
                                                        county.status === "medium" ? "secondary" :
                                                            "outline"
                                                }
                                            >
                                                {county.status}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-2xl font-bold">{county.cases}</p>
                                                <p className="text-xs text-muted-foreground">Active cases</p>
                                            </div>
                                            <div className={`text-sm font-medium ${county.trend.startsWith("+") ? "text-destructive" : "text-primary"
                                                }`}>
                                                {county.trend}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        <div className="mt-8 p-8 border-2 border-dashed border-muted rounded-lg text-center">
                            <p className="text-muted-foreground">
                                Interactive county map visualization coming soon
                            </p>
                        </div>
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
};

export default Counties;
