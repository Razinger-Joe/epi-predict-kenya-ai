import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Users, Activity } from "lucide-react";

const Analytics = () => {
    return (
        <SidebarProvider>
            <div className="min-h-screen flex w-full bg-background">
                <DashboardSidebar />

                <div className="flex-1 flex flex-col">
                    <DashboardHeader />

                    <main className="flex-1 p-6">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
                            <p className="text-muted-foreground mt-1">
                                Disease trends and data insights
                            </p>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
                                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">12,847</div>
                                    <p className="text-xs text-muted-foreground">This month</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Accuracy Rate</CardTitle>
                                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-primary">94.7%</div>
                                    <p className="text-xs text-muted-foreground">Prediction accuracy</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Data Sources</CardTitle>
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">135</div>
                                    <p className="text-xs text-muted-foreground">Active facilities</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Model Health</CardTitle>
                                    <Activity className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-primary">Optimal</div>
                                    <p className="text-xs text-muted-foreground">Last trained 2 days ago</p>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="mt-8 p-8 border-2 border-dashed border-muted rounded-lg text-center">
                            <p className="text-muted-foreground">
                                Interactive charts and trend analysis coming soon
                            </p>
                        </div>
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
};

export default Analytics;
