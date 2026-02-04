import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardBreadcrumbs } from "@/components/dashboard/DashboardBreadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, RadarChart,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from "recharts";
import { TrendingUp, TrendingDown, AlertTriangle, Activity, MapPin, Users, Droplets, ThermometerSun } from "lucide-react";

// Disease trends data (COVID removed)
const diseaseData = [
  { date: "Week 1", Malaria: 120, Cholera: 23, Typhoid: 8, Dengue: 3, RiftValley: 5 },
  { date: "Week 2", Malaria: 145, Cholera: 28, Typhoid: 7, Dengue: 4, RiftValley: 3 },
  { date: "Week 3", Malaria: 167, Cholera: 31, Typhoid: 9, Dengue: 2, RiftValley: 8 },
  { date: "Week 4", Malaria: 189, Cholera: 29, Typhoid: 11, Dengue: 5, RiftValley: 12 },
  { date: "Week 5", Malaria: 205, Cholera: 35, Typhoid: 13, Dengue: 6, RiftValley: 7 },
  { date: "Week 6", Malaria: 234, Cholera: 42, Typhoid: 15, Dengue: 7, RiftValley: 4 },
  { date: "Week 7", Malaria: 267, Cholera: 48, Typhoid: 17, Dengue: 9, RiftValley: 6 },
];

// Regional outbreak data
const regionalData = [
  { region: "Coastal", cases: 450, risk: 78 },
  { region: "Western", cases: 320, risk: 65 },
  { region: "Nyanza", cases: 280, risk: 58 },
  { region: "Central", cases: 180, risk: 42 },
  { region: "Rift Valley", cases: 220, risk: 51 },
  { region: "Eastern", cases: 150, risk: 35 },
  { region: "North Eastern", cases: 120, risk: 45 },
  { region: "Nairobi", cases: 95, risk: 28 },
];

// Environmental factors correlation
const environmentalData = [
  { factor: "Rainfall", malaria: 85, cholera: 90, typhoid: 70 },
  { factor: "Temperature", malaria: 92, cholera: 45, typhoid: 55 },
  { factor: "Humidity", malaria: 88, cholera: 60, typhoid: 50 },
  { factor: "Water Access", malaria: 30, cholera: 95, typhoid: 85 },
  { factor: "Sanitation", malaria: 25, cholera: 88, typhoid: 80 },
];

// Disease distribution for pie chart
const diseaseDistribution = [
  { name: "Malaria", value: 1327, color: "#F97316" },
  { name: "Cholera", value: 236, color: "#3B82F6" },
  { name: "Typhoid", value: 80, color: "#EAB308" },
  { name: "Dengue", value: 36, color: "#EC4899" },
  { name: "Rift Valley Fever", value: 45, color: "#10B981" },
];

// Prediction accuracy data
const predictionAccuracy = [
  { month: "Sep", accuracy: 72 },
  { month: "Oct", accuracy: 78 },
  { month: "Nov", accuracy: 82 },
  { month: "Dec", accuracy: 85 },
  { month: "Jan", accuracy: 89 },
  { month: "Feb", accuracy: 91 },
];

const StatCard = ({ title, value, change, icon: Icon, trend, color }: {
  title: string;
  value: string;
  change: string;
  icon: React.ElementType;
  trend: "up" | "down";
  color: string;
}) => (
  <Card className="relative overflow-hidden">
    <div className={`absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full opacity-10 ${color}`} />
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      <Icon className={`h-5 w-5 ${color.replace('bg-', 'text-')}`} />
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold">{value}</div>
      <div className={`flex items-center text-sm mt-1 ${trend === "up" ? "text-destructive" : "text-green-500"}`}>
        {trend === "up" ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
        {change}
      </div>
    </CardContent>
  </Card>
);

const DashboardAnalytics = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar />

        <div className="flex-1 flex flex-col">
          <DashboardHeader />

          <main className="flex-1 p-6 overflow-auto">
            <DashboardBreadcrumbs />
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Disease surveillance insights powered by ML predictions
              </p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard
                title="Active Outbreaks"
                value="12"
                change="+3 this week"
                icon={AlertTriangle}
                trend="up"
                color="bg-orange-500"
              />
              <StatCard
                title="Counties at Risk"
                value="18"
                change="-2 from last week"
                icon={MapPin}
                trend="down"
                color="bg-blue-500"
              />
              <StatCard
                title="Cases This Month"
                value="1,724"
                change="+12% vs last month"
                icon={Users}
                trend="up"
                color="bg-red-500"
              />
              <StatCard
                title="ML Accuracy"
                value="91%"
                change="+6% improvement"
                icon={Activity}
                trend="down"
                color="bg-green-500"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Disease Trends - Area Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Disease Trends
                  </CardTitle>
                  <CardDescription>Weekly case progression across Kenya</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={diseaseData}>
                      <defs>
                        <linearGradient id="colorMalaria" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#F97316" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorCholera" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="Malaria" stroke="#F97316" fillOpacity={1} fill="url(#colorMalaria)" />
                      <Area type="monotone" dataKey="Cholera" stroke="#3B82F6" fillOpacity={1} fill="url(#colorCholera)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Disease Distribution - Pie Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Droplets className="h-5 w-5 text-primary" />
                    Disease Distribution
                  </CardTitle>
                  <CardDescription>Total case breakdown by disease type</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={diseaseDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {diseaseDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Regional Risk Analysis */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Regional Risk Analysis
                  </CardTitle>
                  <CardDescription>Outbreak risk levels by region</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={regionalData} layout="vertical">
                      <XAxis type="number" domain={[0, 100]} />
                      <YAxis dataKey="region" type="category" width={100} />
                      <Tooltip />
                      <Bar dataKey="risk" fill="#3B82F6" radius={[0, 4, 4, 0]}>
                        {regionalData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.risk > 70 ? '#EF4444' : entry.risk > 50 ? '#F97316' : '#22C55E'}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* ML Model Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    ML Prediction Accuracy
                  </CardTitle>
                  <CardDescription>Model performance over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={predictionAccuracy}>
                      <XAxis dataKey="month" />
                      <YAxis domain={[60, 100]} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="accuracy"
                        stroke="#10B981"
                        strokeWidth={3}
                        dot={{ fill: '#10B981', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Environmental Correlation Radar */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ThermometerSun className="h-5 w-5 text-primary" />
                    Environmental Correlations
                  </CardTitle>
                  <CardDescription>How environmental factors affect disease spread</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <RadarChart data={environmentalData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="factor" />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} />
                      <Radar name="Malaria" dataKey="malaria" stroke="#F97316" fill="#F97316" fillOpacity={0.3} />
                      <Radar name="Cholera" dataKey="cholera" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                      <Radar name="Typhoid" dataKey="typhoid" stroke="#EAB308" fill="#EAB308" fillOpacity={0.3} />
                      <Legend />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Top Risk Counties */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    High Risk Counties
                  </CardTitle>
                  <CardDescription>Counties requiring immediate attention</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { name: "Kisumu", risk: 85, disease: "Malaria", trend: "+12%" },
                    { name: "Mombasa", risk: 78, disease: "Cholera", trend: "+8%" },
                    { name: "Turkana", risk: 72, disease: "Rift Valley Fever", trend: "+15%" },
                    { name: "Kilifi", risk: 68, disease: "Dengue", trend: "+5%" },
                    { name: "Garissa", risk: 65, disease: "Typhoid", trend: "+10%" },
                  ].map((county, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{county.name}</span>
                          <Badge variant={county.risk > 75 ? "destructive" : "secondary"}>
                            {county.disease}
                          </Badge>
                        </div>
                        <span className="text-destructive text-sm font-medium">{county.trend}</span>
                      </div>
                      <Progress
                        value={county.risk}
                        className={`h-2 ${county.risk > 75 ? '[&>div]:bg-destructive' : '[&>div]:bg-orange-500'}`}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardAnalytics;
