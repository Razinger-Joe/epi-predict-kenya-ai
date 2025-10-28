import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Minus, Eye } from "lucide-react";

const counties = [
  { name: "Nairobi", disease: "Malaria", risk: 85, trend: "up", trendValue: 12, peakDate: "Oct 30, 2025" },
  { name: "Mombasa", disease: "Cholera", risk: 72, trend: "up", trendValue: 8, peakDate: "Oct 28, 2025" },
  { name: "Kisumu", disease: "Malaria", risk: 68, trend: "up", trendValue: 15, peakDate: "Nov 2, 2025" },
  { name: "Nakuru", disease: "Flu", risk: 45, trend: "up", trendValue: 5, peakDate: "Nov 5, 2025" },
  { name: "Kiambu", disease: "Flu", risk: 38, trend: "down", trendValue: 2, peakDate: "Nov 3, 2025" },
  { name: "Machakos", disease: "Typhoid", risk: 32, trend: "up", trendValue: 3, peakDate: "Nov 8, 2025" },
  { name: "Eldoret", disease: "Flu", risk: 28, trend: "up", trendValue: 1, peakDate: "Nov 10, 2025" },
  { name: "Kakamega", disease: "Malaria", risk: 24, trend: "neutral", trendValue: 0, peakDate: "Nov 12, 2025" },
  { name: "Thika", disease: "Dengue", risk: 22, trend: "up", trendValue: 4, peakDate: "Nov 14, 2025" },
  { name: "Nyeri", disease: "Flu", risk: 18, trend: "down", trendValue: 1, peakDate: "Nov 15, 2025" }
];

const getRiskLevel = (risk: number) => {
  if (risk >= 70) return { label: "Critical", color: "destructive" };
  if (risk >= 50) return { label: "High", color: "orange" };
  if (risk >= 30) return { label: "Medium", color: "yellow" };
  return { label: "Low", color: "primary" };
};

const getRiskColor = (risk: number) => {
  if (risk >= 70) return "bg-destructive";
  if (risk >= 50) return "bg-orange-500";
  if (risk >= 30) return "bg-yellow-500";
  return "bg-primary";
};

const DashboardCounties = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar />
        
        <div className="flex-1 flex flex-col">
          <DashboardHeader />
          
          <main className="flex-1 p-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground">High Risk Counties Overview</h1>
              <p className="text-muted-foreground mt-1">
                County-level disease outbreak risk assessment
              </p>
            </div>
            
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>County Comparison Table</CardTitle>
                    <CardDescription>Top 10 counties by risk level</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Export to CSV</Button>
                    <Button variant="outline" size="sm">Refresh</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>County</TableHead>
                      <TableHead>Primary Disease</TableHead>
                      <TableHead>Risk Level</TableHead>
                      <TableHead>7-Day Trend</TableHead>
                      <TableHead>Predicted Peak</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {counties.map((county) => {
                      const riskLevel = getRiskLevel(county.risk);
                      return (
                        <TableRow key={county.name}>
                          <TableCell className="font-medium">{county.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{county.disease}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">{county.risk}%</span>
                                <Badge
                                  variant={riskLevel.color === "destructive" ? "destructive" : "outline"}
                                  className={
                                    riskLevel.color === "orange" ? "bg-orange-500 text-white border-orange-500" :
                                    riskLevel.color === "yellow" ? "bg-yellow-500 text-white border-yellow-500" :
                                    riskLevel.color === "primary" ? "bg-primary text-primary-foreground" : ""
                                  }
                                >
                                  {riskLevel.label}
                                </Badge>
                              </div>
                              <Progress value={county.risk} className={getRiskColor(county.risk)} />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {county.trend === "up" && (
                                <>
                                  <TrendingUp className="w-4 h-4 text-destructive" />
                                  <span className="text-sm text-destructive">+{county.trendValue}%</span>
                                </>
                              )}
                              {county.trend === "down" && (
                                <>
                                  <TrendingDown className="w-4 h-4 text-primary" />
                                  <span className="text-sm text-primary">-{county.trendValue}%</span>
                                </>
                              )}
                              {county.trend === "neutral" && (
                                <>
                                  <Minus className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-sm text-muted-foreground">{county.trendValue}%</span>
                                </>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{county.peakDate}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardCounties;
