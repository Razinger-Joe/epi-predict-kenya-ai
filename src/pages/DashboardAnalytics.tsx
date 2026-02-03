import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

const diseaseData = [
  {
    date: "Oct 16",
    Malaria: 120,
    Flu: 89,
    Cholera: 23,
    COVID: 12,
    Typhoid: 8,
    Dengue: 3
  },
  {
    date: "Oct 17",
    Malaria: 145,
    Flu: 92,
    Cholera: 28,
    COVID: 15,
    Typhoid: 7,
    Dengue: 4
  },
  {
    date: "Oct 18",
    Malaria: 167,
    Flu: 87,
    Cholera: 31,
    COVID: 11,
    Typhoid: 9,
    Dengue: 2
  },
  {
    date: "Oct 19",
    Malaria: 189,
    Flu: 102,
    Cholera: 29,
    COVID: 13,
    Typhoid: 11,
    Dengue: 5
  },
  {
    date: "Oct 20",
    Malaria: 205,
    Flu: 115,
    Cholera: 35,
    COVID: 14,
    Typhoid: 13,
    Dengue: 6
  },
  {
    date: "Oct 21",
    Malaria: 234,
    Flu: 134,
    Cholera: 42,
    COVID: 18,
    Typhoid: 15,
    Dengue: 7
  },
  {
    date: "Oct 22",
    Malaria: 267,
    Flu: 145,
    Cholera: 48,
    COVID: 21,
    Typhoid: 17,
    Dengue: 9
  }
];

import { DashboardBreadcrumbs } from "@/components/dashboard/DashboardBreadcrumbs";

const DashboardAnalytics = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar />

        <div className="flex-1 flex flex-col">
          <DashboardHeader />

          <main className="flex-1 p-6">
            <DashboardBreadcrumbs />
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
              <p className="text-muted-foreground mt-1">
                Disease trends and outbreak analytics across Kenya
              </p>
            </div>

            <div className="space-y-6">
              {/* Disease Trends Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Disease Mentions Trend</CardTitle>
                  <CardDescription>Social media mentions across Kenya - Last 7 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={diseaseData}>
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="Malaria" fill="#F97316" />
                      <Bar dataKey="Flu" fill="#3B82F6" />
                      <Bar dataKey="Cholera" fill="#92400E" />
                      <Bar dataKey="COVID" fill="#9333EA" />
                      <Bar dataKey="Typhoid" fill="#EAB308" />
                      <Bar dataKey="Dengue" fill="#EC4899" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Total Mentions</CardTitle>
                    <CardDescription>Last 7 days</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-foreground">4,523</div>
                    <p className="text-sm text-muted-foreground mt-1">+18% from previous week</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Most Mentioned</CardTitle>
                    <CardDescription>Top disease this week</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-orange-500">Malaria</div>
                    <p className="text-sm text-muted-foreground mt-1">1,327 mentions</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Trend Change</CardTitle>
                    <CardDescription>Fastest growing</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-destructive">Cholera</div>
                    <p className="text-sm text-muted-foreground mt-1">+45% increase</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardAnalytics;
