import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, TrendingUp, AlertTriangle } from "lucide-react";

const Predictions = () => {
    return (
        <SidebarProvider>
            <div className="min-h-screen flex w-full bg-background">
                <DashboardSidebar />

                <div className="flex-1 flex flex-col">
                    <DashboardHeader />

                    <main className="flex-1 p-6">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-foreground">Predictions</h1>
                            <p className="text-muted-foreground mt-1">
                                AI-powered disease outbreak predictions
                            </p>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">14-Day Forecast</CardTitle>
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-primary">Low Risk</div>
                                    <p className="text-xs text-muted-foreground">Overall national assessment</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Trending Diseases</CardTitle>
                                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">Malaria</div>
                                    <p className="text-xs text-muted-foreground">+12% in Western region</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Watch Areas</CardTitle>
                                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-orange-500">3 Counties</div>
                                    <p className="text-xs text-muted-foreground">Require monitoring</p>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="mt-8 p-8 border-2 border-dashed border-muted rounded-lg text-center">
                            <p className="text-muted-foreground">
                                Prediction charts and detailed analytics coming soon
                            </p>
                        </div>
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
};

export default Predictions;
