import { useState, useCallback } from "react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Download,
  RotateCcw,
  MapPin,
  Users,
  Activity,
  ChevronDown,
  ChevronUp,
  Search,
  AlertTriangle,
  ThermometerSun,
  Droplets,
  X
} from "lucide-react";
import { DashboardBreadcrumbs } from "@/components/dashboard/DashboardBreadcrumbs";
import { useToast } from "@/hooks/use-toast";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from "recharts";

// 10 Featured Counties - 4 Major Cities + 6 Spread
const counties = [
  // Major Cities
  {
    name: "Nairobi",
    region: "Central",
    population: 4397073,
    disease: "Flu",
    risk: 52,
    trend: "up",
    trendValue: 8,
    peakDate: "Feb 15, 2026",
    diseases: { malaria: 15, cholera: 5, typhoid: 12, flu: 65, dengue: 3 },
    healthFacilities: 847,
    healthWorkers: 12500
  },
  {
    name: "Mombasa",
    region: "Coast",
    population: 1208333,
    disease: "Cholera",
    risk: 72,
    trend: "up",
    trendValue: 12,
    peakDate: "Feb 10, 2026",
    diseases: { malaria: 25, cholera: 45, typhoid: 15, flu: 10, dengue: 5 },
    healthFacilities: 234,
    healthWorkers: 4200
  },
  {
    name: "Kisumu",
    region: "Nyanza",
    population: 1155574,
    disease: "Malaria",
    risk: 85,
    trend: "up",
    trendValue: 18,
    peakDate: "Feb 8, 2026",
    diseases: { malaria: 60, cholera: 20, typhoid: 10, flu: 8, dengue: 2 },
    healthFacilities: 312,
    healthWorkers: 5100
  },
  {
    name: "Nakuru",
    region: "Rift Valley",
    population: 2162202,
    disease: "Flu",
    risk: 45,
    trend: "down",
    trendValue: 3,
    peakDate: "Feb 18, 2026",
    diseases: { malaria: 20, cholera: 8, typhoid: 15, flu: 50, dengue: 7 },
    healthFacilities: 456,
    healthWorkers: 6800
  },
  // Spread Counties
  {
    name: "Kisii",
    region: "Nyanza",
    population: 1266860,
    disease: "Malaria",
    risk: 68,
    trend: "up",
    trendValue: 10,
    peakDate: "Feb 12, 2026",
    diseases: { malaria: 55, cholera: 15, typhoid: 18, flu: 10, dengue: 2 },
    healthFacilities: 289,
    healthWorkers: 4500
  },
  {
    name: "Turkana",
    region: "Rift Valley",
    population: 926976,
    disease: "Rift Valley Fever",
    risk: 78,
    trend: "up",
    trendValue: 22,
    peakDate: "Feb 5, 2026",
    diseases: { malaria: 30, cholera: 25, typhoid: 10, flu: 5, rvf: 30 },
    healthFacilities: 98,
    healthWorkers: 1200
  },
  {
    name: "West Pokot",
    region: "Rift Valley",
    population: 621241,
    disease: "Malaria",
    risk: 62,
    trend: "neutral",
    trendValue: 0,
    peakDate: "Feb 20, 2026",
    diseases: { malaria: 45, cholera: 18, typhoid: 22, flu: 12, dengue: 3 },
    healthFacilities: 87,
    healthWorkers: 980
  },
  {
    name: "Garissa",
    region: "North Eastern",
    population: 841353,
    disease: "Cholera",
    risk: 58,
    trend: "down",
    trendValue: 5,
    peakDate: "Feb 22, 2026",
    diseases: { malaria: 20, cholera: 40, typhoid: 25, flu: 10, dengue: 5 },
    healthFacilities: 112,
    healthWorkers: 1450
  },
  {
    name: "Kakamega",
    region: "Western",
    population: 1867579,
    disease: "Malaria",
    risk: 71,
    trend: "up",
    trendValue: 14,
    peakDate: "Feb 9, 2026",
    diseases: { malaria: 58, cholera: 12, typhoid: 15, flu: 12, dengue: 3 },
    healthFacilities: 345,
    healthWorkers: 5600
  },
  {
    name: "Nyeri",
    region: "Central",
    population: 759164,
    disease: "Flu",
    risk: 35,
    trend: "down",
    trendValue: 8,
    peakDate: "Feb 25, 2026",
    diseases: { malaria: 10, cholera: 5, typhoid: 15, flu: 65, dengue: 5 },
    healthFacilities: 198,
    healthWorkers: 3200
  }
];

// Mock trend data for charts
const generateTrendData = (countyName: string) => {
  const baseValue = Math.random() * 50 + 20;
  return Array.from({ length: 7 }, (_, i) => ({
    week: `W${i + 1}`,
    cases: Math.round(baseValue + Math.random() * 30 - 15),
    predicted: Math.round(baseValue + (i * 3) + Math.random() * 10)
  }));
};

const COLORS = ['#F97316', '#3B82F6', '#EAB308', '#10B981', '#EC4899'];

const getRiskLevel = (risk: number) => {
  if (risk >= 70) return { label: "Critical", variant: "destructive" as const, color: "from-red-500/20 to-red-600/10" };
  if (risk >= 50) return { label: "High", variant: "secondary" as const, color: "from-orange-500/20 to-orange-600/10" };
  if (risk >= 30) return { label: "Medium", variant: "outline" as const, color: "from-yellow-500/20 to-yellow-600/10" };
  return { label: "Low", variant: "default" as const, color: "from-green-500/20 to-green-600/10" };
};

const DashboardCounties = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");
  const [diseaseFilter, setDiseaseFilter] = useState("all");
  const [expandedCounty, setExpandedCounty] = useState<string | null>(null);
  const [selectedCounty, setSelectedCounty] = useState<typeof counties[0] | null>(null);
  const { toast } = useToast();

  const handleExportCSV = useCallback(async () => {
    setIsLoading(true);
    try {
      const csvContent = [
        ["County", "Region", "Population", "Disease", "Risk Level", "Risk %", "Trend", "Peak Date"],
        ...counties.map(county => {
          const riskLevel = getRiskLevel(county.risk);
          return [
            county.name,
            county.region,
            county.population.toString(),
            county.disease,
            riskLevel.label,
            county.risk.toString(),
            county.trend === "up" ? `+${county.trendValue}%` :
              county.trend === "down" ? `-${county.trendValue}%` :
                `${county.trendValue}%`,
            county.peakDate
          ];
        })
      ].map(row => row.join(",")).join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `counties-health-data-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Export Complete",
        description: "County health data exported to CSV",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Unable to export data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const handleRefresh = useCallback(async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    toast({
      title: "Data Refreshed",
      description: "County health data updated",
    });
    setIsLoading(false);
  }, [toast]);

  // Filter counties
  const filteredCounties = counties.filter(county => {
    const matchesSearch = county.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRisk = riskFilter === "all" ||
      (riskFilter === "critical" && county.risk >= 70) ||
      (riskFilter === "high" && county.risk >= 50 && county.risk < 70) ||
      (riskFilter === "medium" && county.risk >= 30 && county.risk < 50) ||
      (riskFilter === "low" && county.risk < 30);
    const matchesDisease = diseaseFilter === "all" ||
      county.disease.toLowerCase().includes(diseaseFilter.toLowerCase());
    return matchesSearch && matchesRisk && matchesDisease;
  });

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar />

        <div className="flex-1 flex flex-col">
          <DashboardHeader />

          <main className="flex-1 p-6 overflow-auto">
            <DashboardBreadcrumbs />

            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground">Counties Health Overview</h1>
              <p className="text-muted-foreground mt-1">
                Interactive disease surveillance across 10 featured Kenyan counties
              </p>
            </div>

            {/* Filters & Actions */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-4 items-center justify-between">
                  <div className="flex flex-wrap gap-4 items-center">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search counties..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-[200px]"
                      />
                    </div>

                    <Select value={riskFilter} onValueChange={setRiskFilter}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Risk Level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Risks</SelectItem>
                        <SelectItem value="critical">Critical (70%+)</SelectItem>
                        <SelectItem value="high">High (50-70%)</SelectItem>
                        <SelectItem value="medium">Medium (30-50%)</SelectItem>
                        <SelectItem value="low">Low (&lt;30%)</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={diseaseFilter} onValueChange={setDiseaseFilter}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Disease" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Diseases</SelectItem>
                        <SelectItem value="malaria">Malaria</SelectItem>
                        <SelectItem value="cholera">Cholera</SelectItem>
                        <SelectItem value="flu">Flu</SelectItem>
                        <SelectItem value="typhoid">Typhoid</SelectItem>
                        <SelectItem value="rift valley">Rift Valley Fever</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
                      <RotateCcw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                      Refresh
                    </Button>
                    <Button variant="outline" onClick={handleExportCSV} disabled={isLoading}>
                      <Download className="h-4 w-4 mr-2" />
                      Export CSV
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* County Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCounties.map((county) => {
                const riskLevel = getRiskLevel(county.risk);
                const isExpanded = expandedCounty === county.name;
                const trendData = generateTrendData(county.name);
                const diseaseData = Object.entries(county.diseases).map(([name, value]) => ({
                  name: name.charAt(0).toUpperCase() + name.slice(1),
                  value
                }));

                return (
                  <Card
                    key={county.name}
                    className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer bg-gradient-to-br ${riskLevel.color}`}
                    onClick={() => setExpandedCounty(isExpanded ? null : county.name)}
                  >
                    {/* Risk indicator stripe */}
                    <div className={`absolute top-0 left-0 w-1 h-full ${county.risk >= 70 ? 'bg-red-500' : county.risk >= 50 ? 'bg-orange-500' : county.risk >= 30 ? 'bg-yellow-500' : 'bg-green-500'}`} />

                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <MapPin className="h-5 w-5 text-primary" />
                          {county.name}
                        </CardTitle>
                        <Badge variant={riskLevel.variant}>{riskLevel.label}</Badge>
                      </div>
                      <CardDescription className="flex items-center gap-2">
                        <span>{county.region}</span>
                        <span className="text-border">•</span>
                        <span>{county.population.toLocaleString()} people</span>
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Risk Progress */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Risk Level</span>
                          <span className="font-bold text-lg">{county.risk}%</span>
                        </div>
                        <Progress
                          value={county.risk}
                          className={`h-2 [&>div]:${county.risk >= 70 ? 'bg-red-500' : county.risk >= 50 ? 'bg-orange-500' : county.risk >= 30 ? 'bg-yellow-500' : 'bg-green-500'}`}
                        />
                      </div>

                      {/* Primary Disease & Trend */}
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm text-muted-foreground">Primary Concern</span>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className="bg-primary/20 text-primary border-primary/30">
                              {county.disease}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm text-muted-foreground">7-Day Trend</span>
                          <div className={`flex items-center gap-1 mt-1 ${county.trend === "up" ? "text-red-500" :
                              county.trend === "down" ? "text-green-500" : "text-muted-foreground"
                            }`}>
                            {county.trend === "up" && <TrendingUp className="h-4 w-4" />}
                            {county.trend === "down" && <TrendingDown className="h-4 w-4" />}
                            {county.trend === "neutral" && <Minus className="h-4 w-4" />}
                            <span className="font-medium">
                              {county.trend === "up" ? "+" : county.trend === "down" ? "-" : ""}
                              {county.trendValue}%
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Expand/Collapse Indicator */}
                      <div className="flex items-center justify-center pt-2 border-t border-border/50">
                        <Button variant="ghost" size="sm" className="gap-1">
                          {isExpanded ? (
                            <>
                              <ChevronUp className="h-4 w-4" />
                              Less Details
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-4 w-4" />
                              More Details
                            </>
                          )}
                        </Button>
                      </div>

                      {/* Expanded Content */}
                      {isExpanded && (
                        <div className="space-y-4 pt-4 border-t animate-in slide-in-from-top-2 duration-300">
                          {/* Health Resources */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-2">
                              <Activity className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-xs text-muted-foreground">Facilities</p>
                                <p className="font-medium">{county.healthFacilities}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-xs text-muted-foreground">Health Workers</p>
                                <p className="font-medium">{county.healthWorkers.toLocaleString()}</p>
                              </div>
                            </div>
                          </div>

                          {/* Mini Trend Chart */}
                          <div>
                            <p className="text-sm font-medium mb-2">Case Trend (7 Weeks)</p>
                            <div className="h-[100px]">
                              <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trendData}>
                                  <defs>
                                    <linearGradient id={`gradient-${county.name}`} x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                    </linearGradient>
                                  </defs>
                                  <XAxis dataKey="week" tick={{ fontSize: 10 }} />
                                  <Tooltip />
                                  <Area
                                    type="monotone"
                                    dataKey="cases"
                                    stroke="#3B82F6"
                                    fill={`url(#gradient-${county.name})`}
                                  />
                                </AreaChart>
                              </ResponsiveContainer>
                            </div>
                          </div>

                          {/* View Full Details Button */}
                          <Button
                            className="w-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCounty(county);
                            }}
                          >
                            View Full Details
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* County Details Modal */}
            <Dialog open={!!selectedCounty} onOpenChange={() => setSelectedCounty(null)}>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                {selectedCounty && (
                  <>
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2 text-2xl">
                        <MapPin className="h-6 w-6 text-primary" />
                        {selectedCounty.name} County Health Dashboard
                      </DialogTitle>
                      <DialogDescription>
                        {selectedCounty.region} Region • Population: {selectedCounty.population.toLocaleString()}
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                      {/* Key Stats */}
                      <div className="grid grid-cols-3 gap-4">
                        <Card className="p-4 bg-gradient-to-br from-red-500/10 to-red-500/5">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                            <span className="text-sm text-muted-foreground">Risk Level</span>
                          </div>
                          <p className="text-2xl font-bold mt-2">{selectedCounty.risk}%</p>
                          <Badge variant={getRiskLevel(selectedCounty.risk).variant}>
                            {getRiskLevel(selectedCounty.risk).label}
                          </Badge>
                        </Card>
                        <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5">
                          <div className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-blue-500" />
                            <span className="text-sm text-muted-foreground">Health Facilities</span>
                          </div>
                          <p className="text-2xl font-bold mt-2">{selectedCounty.healthFacilities}</p>
                        </Card>
                        <Card className="p-4 bg-gradient-to-br from-green-500/10 to-green-500/5">
                          <div className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-green-500" />
                            <span className="text-sm text-muted-foreground">Health Workers</span>
                          </div>
                          <p className="text-2xl font-bold mt-2">{selectedCounty.healthWorkers.toLocaleString()}</p>
                        </Card>
                      </div>

                      {/* Disease Distribution */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Disease Distribution</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={Object.entries(selectedCounty.diseases).map(([name, value]) => ({
                                    name: name.charAt(0).toUpperCase() + name.slice(1),
                                    value
                                  }))}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={50}
                                  outerRadius={80}
                                  paddingAngle={2}
                                  dataKey="value"
                                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                  {Object.keys(selectedCounty.diseases).map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                                </Pie>
                                <Tooltip />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Case Trend */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">7-Week Case Trend</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={generateTrendData(selectedCounty.name)}>
                                <XAxis dataKey="week" />
                                <YAxis />
                                <Tooltip />
                                <Line
                                  type="monotone"
                                  dataKey="cases"
                                  stroke="#3B82F6"
                                  strokeWidth={2}
                                  dot={{ fill: '#3B82F6' }}
                                  name="Actual Cases"
                                />
                                <Line
                                  type="monotone"
                                  dataKey="predicted"
                                  stroke="#F97316"
                                  strokeWidth={2}
                                  strokeDasharray="5 5"
                                  dot={{ fill: '#F97316' }}
                                  name="Predicted"
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Predicted Peak */}
                      <Card className="bg-gradient-to-r from-orange-500/10 to-orange-500/5 border-orange-500/20">
                        <CardContent className="flex items-center justify-between py-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-orange-500/20">
                              <ThermometerSun className="h-5 w-5 text-orange-500" />
                            </div>
                            <div>
                              <p className="font-medium">Predicted Peak</p>
                              <p className="text-sm text-muted-foreground">
                                {selectedCounty.disease} outbreak expected
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold">{selectedCounty.peakDate}</p>
                            <Badge variant="outline" className="mt-1">
                              {selectedCounty.trend === "up" ? `+${selectedCounty.trendValue}%` :
                                selectedCounty.trend === "down" ? `-${selectedCounty.trendValue}%` :
                                  "Stable"} weekly
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </>
                )}
              </DialogContent>
            </Dialog>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardCounties;
