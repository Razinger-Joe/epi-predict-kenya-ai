import React, { createContext, useContext, ReactNode } from "react";

// ==================== TYPE DEFINITIONS ====================
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  organization: {
    name: string;
    type: string;
    county: string;
    facilities: number;
  };
  avatar: string;
}

export interface County {
  id: number;
  name: string;
  population: number;
  risk: number;
  primaryDisease?: string;
}

export interface Disease {
  id: number;
  name: string;
  color: string;
  mentions: number[];
}

export interface Prediction {
  id: number;
  county: string;
  disease: string;
  risk: number;
  confidence: number;
  peakDate: string;
  estimatedCases: string;
  trend: "up" | "down" | "stable";
  trendValue: number;
}

export interface Alert {
  id: number;
  level: "critical" | "high" | "medium" | "low";
  title: string;
  county: string;
  disease: string;
  risk: number;
  peakDate: string;
  affectedAreas: string[];
  estimatedCases: string;
  actions: string[];
  timestamp: string;
  handled: boolean;
}

export interface TimelinePrediction {
  id: number;
  day: number;
  date: string;
  event: string;
  locations: string[];
  confidence: number;
  action: string;
  urgency: "critical" | "high" | "medium" | "low";
}

// ==================== MOCK DATA ====================
const mockUser: User = {
  id: "user-123",
  name: "Dr. James Mwangi",
  email: "j.mwangi@knh.or.ke",
  phone: "+254712345678",
  role: "Hospital Administrator",
  organization: {
    name: "Kenyatta National Hospital",
    type: "Hospital",
    county: "Nairobi",
    facilities: 1,
  },
  avatar: "/avatar-placeholder.png",
};

const mockCounties: County[] = [
  { id: 1, name: "Nairobi", population: 4397073, risk: 85, primaryDisease: "Malaria" },
  { id: 2, name: "Mombasa", population: 1208333, risk: 72, primaryDisease: "Cholera" },
  { id: 3, name: "Kisumu", population: 1155574, risk: 68, primaryDisease: "Malaria" },
  { id: 4, name: "Nakuru", population: 2162202, risk: 45, primaryDisease: "Flu" },
  { id: 5, name: "Kiambu", population: 2417735, risk: 38, primaryDisease: "Flu" },
  { id: 6, name: "Machakos", population: 1421932, risk: 32, primaryDisease: "Typhoid" },
  { id: 7, name: "Uasin Gishu", population: 1163186, risk: 28, primaryDisease: "Flu" },
  { id: 8, name: "Kakamega", population: 1867579, risk: 24, primaryDisease: "Malaria" },
  { id: 9, name: "Murang'a", population: 1056640, risk: 22, primaryDisease: "Dengue" },
  { id: 10, name: "Nyeri", population: 759164, risk: 18, primaryDisease: "Flu" },
  { id: 11, name: "Kilifi", population: 1453787, risk: 25, primaryDisease: "Cholera" },
  { id: 12, name: "Bungoma", population: 1670570, risk: 20, primaryDisease: "Malaria" },
  { id: 13, name: "Meru", population: 1545714, risk: 19, primaryDisease: "Typhoid" },
  { id: 14, name: "Kericho", population: 901777, risk: 17, primaryDisease: "Flu" },
  { id: 15, name: "Nandi", population: 885711, risk: 16, primaryDisease: "Malaria" },
  { id: 16, name: "Kwale", population: 866820, risk: 23, primaryDisease: "Cholera" },
  { id: 17, name: "Trans Nzoia", population: 990341, risk: 21, primaryDisease: "Flu" },
  { id: 18, name: "Nyamira", population: 605576, risk: 15, primaryDisease: "Typhoid" },
  { id: 19, name: "Kisii", population: 1266860, risk: 18, primaryDisease: "Flu" },
  { id: 20, name: "Kajiado", population: 1117840, risk: 22, primaryDisease: "Malaria" },
  { id: 21, name: "Kirinyaga", population: 610411, risk: 16, primaryDisease: "Typhoid" },
  { id: 22, name: "Bomet", population: 875689, risk: 14, primaryDisease: "Flu" },
  { id: 23, name: "Laikipia", population: 518560, risk: 19, primaryDisease: "Malaria" },
  { id: 24, name: "Baringo", population: 666763, risk: 17, primaryDisease: "Cholera" },
  { id: 25, name: "Embu", population: 608599, risk: 15, primaryDisease: "Typhoid" },
  { id: 26, name: "Homa Bay", population: 1131950, risk: 26, primaryDisease: "Malaria" },
  { id: 27, name: "Migori", population: 1116436, risk: 24, primaryDisease: "Malaria" },
  { id: 28, name: "Siaya", population: 993183, risk: 27, primaryDisease: "Malaria" },
  { id: 29, name: "Busia", population: 893681, risk: 25, primaryDisease: "Malaria" },
  { id: 30, name: "Vihiga", population: 590013, risk: 18, primaryDisease: "Flu" },
  { id: 31, name: "Kitui", population: 1136187, risk: 20, primaryDisease: "Typhoid" },
  { id: 32, name: "Makueni", population: 987653, risk: 19, primaryDisease: "Cholera" },
  { id: 33, name: "Nyandarua", population: 638289, risk: 16, primaryDisease: "Flu" },
  { id: 34, name: "Tharaka Nithi", population: 393177, risk: 15, primaryDisease: "Typhoid" },
  { id: 35, name: "Elgeyo Marakwet", population: 454480, risk: 17, primaryDisease: "Malaria" },
  { id: 36, name: "West Pokot", population: 621241, risk: 21, primaryDisease: "Cholera" },
  { id: 37, name: "Samburu", population: 310327, risk: 18, primaryDisease: "Malaria" },
  { id: 38, name: "Taita Taveta", population: 340671, risk: 22, primaryDisease: "Dengue" },
  { id: 39, name: "Turkana", population: 926976, risk: 23, primaryDisease: "Cholera" },
  { id: 40, name: "Wajir", population: 781263, risk: 20, primaryDisease: "Cholera" },
  { id: 41, name: "Mandera", population: 867457, risk: 21, primaryDisease: "Cholera" },
  { id: 42, name: "Marsabit", population: 459785, risk: 19, primaryDisease: "Malaria" },
  { id: 43, name: "Isiolo", population: 268002, risk: 17, primaryDisease: "Typhoid" },
  { id: 44, name: "Garissa", population: 841353, risk: 24, primaryDisease: "Cholera" },
  { id: 45, name: "Tana River", population: 315943, risk: 23, primaryDisease: "Cholera" },
  { id: 46, name: "Lamu", population: 143920, risk: 20, primaryDisease: "Dengue" },
  { id: 47, name: "Narok", population: 1157873, risk: 18, primaryDisease: "Malaria" },
];

const mockDiseases: Disease[] = [
  { id: 1, name: "Malaria", color: "#F97316", mentions: [120, 145, 167, 189, 205, 234, 267] },
  { id: 2, name: "Flu", color: "#3B82F6", mentions: [89, 92, 87, 102, 115, 134, 145] },
  { id: 3, name: "Cholera", color: "#92400E", mentions: [23, 28, 31, 29, 35, 42, 48] },
  { id: 4, name: "COVID-19", color: "#9333EA", mentions: [12, 15, 11, 13, 14, 18, 21] },
  { id: 5, name: "Typhoid", color: "#EAB308", mentions: [8, 7, 9, 11, 13, 15, 17] },
  { id: 6, name: "Dengue", color: "#EC4899", mentions: [3, 4, 2, 5, 6, 7, 9] },
];

const mockPredictions: Prediction[] = [
  {
    id: 1,
    county: "Nairobi",
    disease: "Malaria",
    risk: 85,
    confidence: 82,
    peakDate: "2025-10-30",
    estimatedCases: "1,200-1,800",
    trend: "up",
    trendValue: 12,
  },
  {
    id: 2,
    county: "Mombasa",
    disease: "Cholera",
    risk: 72,
    confidence: 89,
    peakDate: "2025-10-28",
    estimatedCases: "300-500",
    trend: "up",
    trendValue: 8,
  },
  {
    id: 3,
    county: "Kisumu",
    disease: "Malaria",
    risk: 68,
    confidence: 76,
    peakDate: "2025-11-02",
    estimatedCases: "800-1,200",
    trend: "up",
    trendValue: 15,
  },
  {
    id: 4,
    county: "Nakuru",
    disease: "Flu",
    risk: 45,
    confidence: 68,
    peakDate: "2025-11-05",
    estimatedCases: "500-700",
    trend: "up",
    trendValue: 5,
  },
  {
    id: 5,
    county: "Kiambu",
    disease: "Flu",
    risk: 38,
    confidence: 71,
    peakDate: "2025-11-03",
    estimatedCases: "400-600",
    trend: "down",
    trendValue: -2,
  },
  {
    id: 6,
    county: "Machakos",
    disease: "Typhoid",
    risk: 32,
    confidence: 65,
    peakDate: "2025-11-08",
    estimatedCases: "200-350",
    trend: "up",
    trendValue: 3,
  },
  {
    id: 7,
    county: "Uasin Gishu",
    disease: "Flu",
    risk: 28,
    confidence: 62,
    peakDate: "2025-11-10",
    estimatedCases: "150-250",
    trend: "up",
    trendValue: 1,
  },
  {
    id: 8,
    county: "Kakamega",
    disease: "Malaria",
    risk: 24,
    confidence: 69,
    peakDate: "2025-11-12",
    estimatedCases: "300-450",
    trend: "stable",
    trendValue: 0,
  },
  {
    id: 9,
    county: "Murang'a",
    disease: "Dengue",
    risk: 22,
    confidence: 58,
    peakDate: "2025-11-14",
    estimatedCases: "80-120",
    trend: "up",
    trendValue: 4,
  },
  {
    id: 10,
    county: "Nyeri",
    disease: "Flu",
    risk: 18,
    confidence: 73,
    peakDate: "2025-11-15",
    estimatedCases: "100-180",
    trend: "down",
    trendValue: -1,
  },
];

const mockAlerts: Alert[] = [
  {
    id: 1,
    level: "critical",
    title: "Malaria Outbreak Imminent - Nairobi",
    county: "Nairobi",
    disease: "Malaria",
    risk: 85,
    peakDate: "2025-10-30",
    affectedAreas: ["Kibera", "Mathare", "Mukuru"],
    estimatedCases: "1,200-1,800",
    actions: [
      "Stock artemether-lumefantrine (Coartem)",
      "Alert emergency department staff",
      "Prepare 50+ inpatient beds",
      "Contact county health department",
    ],
    timestamp: "2 hours ago",
    handled: false,
  },
  {
    id: 2,
    level: "critical",
    title: "Cholera Outbreak Risk - Mombasa",
    county: "Mombasa",
    disease: "Cholera",
    risk: 72,
    peakDate: "2025-10-28",
    affectedAreas: ["Old Town", "Likoni", "Bangladesh"],
    estimatedCases: "300-500",
    actions: [
      "Stock ORS and IV fluids",
      "Activate cholera treatment unit",
      "Coordinate with water department",
      "Prepare health education materials",
    ],
    timestamp: "5 hours ago",
    handled: false,
  },
  {
    id: 3,
    level: "high",
    title: "Flu Surge Expected - Kisumu",
    county: "Kisumu",
    disease: "Flu",
    risk: 68,
    peakDate: "2025-11-02",
    affectedAreas: ["Kisumu Central", "Kisumu East"],
    estimatedCases: "800-1,200",
    actions: [
      "Ensure paracetamol stock adequate",
      "Schedule extra staff for next 2 weeks",
      "Prepare isolation areas",
      "Coordinate with schools (holiday period)",
    ],
    timestamp: "1 day ago",
    handled: false,
  },
  {
    id: 4,
    level: "medium",
    title: "Typhoid Cases Rising - Nakuru",
    county: "Nakuru",
    disease: "Typhoid",
    risk: 45,
    peakDate: "2025-11-05",
    affectedAreas: ["Nakuru Town", "Naivasha"],
    estimatedCases: "200-350",
    actions: [
      "Monitor water quality",
      "Stock ciprofloxacin",
      "Educate on hand hygiene",
      "Coordinate with public health",
    ],
    timestamp: "2 days ago",
    handled: false,
  },
  {
    id: 5,
    level: "medium",
    title: "Dengue Fever Alert - Coastal Region",
    county: "Mombasa",
    disease: "Dengue",
    risk: 38,
    peakDate: "2025-11-08",
    affectedAreas: ["Mombasa", "Malindi", "Kilifi"],
    estimatedCases: "150-250",
    actions: [
      "Vector control measures",
      "Community awareness campaigns",
      "Stock pain relievers",
      "Monitor severe cases",
    ],
    timestamp: "3 days ago",
    handled: false,
  },
];

const mockTimelinePredictions: TimelinePrediction[] = [
  {
    id: 1,
    day: 1,
    date: "2025-10-23",
    event: "Malaria cases rising in Western Kenya",
    locations: ["Kisumu", "Siaya", "Busia"],
    confidence: 82,
    action: "Stock antimalarials",
    urgency: "high",
  },
  {
    id: 2,
    day: 3,
    date: "2025-10-25",
    event: "Flu surge predicted in Nairobi schools",
    locations: ["Nairobi", "Kiambu"],
    confidence: 76,
    action: "Alert school health programs",
    urgency: "medium",
  },
  {
    id: 3,
    day: 5,
    date: "2025-10-27",
    event: "Cholera outbreak risk in Mombasa",
    locations: ["Mombasa", "Kilifi"],
    confidence: 89,
    action: "Critical: Prepare ORS, alert CHVs",
    urgency: "critical",
  },
  {
    id: 4,
    day: 7,
    date: "2025-10-29",
    event: "Typhoid cases increasing in Central Kenya",
    locations: ["Nakuru", "Nyeri"],
    confidence: 68,
    action: "Monitor water quality",
    urgency: "medium",
  },
  {
    id: 5,
    day: 9,
    date: "2025-10-31",
    event: "Dengue fever alert in Coastal region",
    locations: ["Mombasa", "Malindi"],
    confidence: 71,
    action: "Vector control measures",
    urgency: "medium",
  },
  {
    id: 6,
    day: 12,
    date: "2025-11-03",
    event: "Flu season peak approaching nationwide",
    locations: ["All urban counties"],
    confidence: 85,
    action: "Increase ICU readiness",
    urgency: "high",
  },
  {
    id: 7,
    day: 14,
    date: "2025-11-05",
    event: "Malaria cases declining in Western Kenya",
    locations: ["Kisumu", "Kakamega"],
    confidence: 79,
    action: "Maintain vigilance",
    urgency: "low",
  },
];

// ==================== CONTEXT INTERFACE ====================
interface MockDataContextValue {
  user: User;
  counties: County[];
  diseases: Disease[];
  predictions: Prediction[];
  alerts: Alert[];
  timelinePredictions: TimelinePrediction[];
  
  // Helper functions
  getCountyByName: (name: string) => County | undefined;
  getDiseaseByName: (name: string) => Disease | undefined;
  getPredictionsByCounty: (county: string) => Prediction[];
  getActiveAlerts: () => Alert[];
  getHighRiskCounties: () => County[];
  getCriticalAlerts: () => Alert[];
  getCountyRiskLevel: (risk: number) => "critical" | "high" | "medium" | "low";
}

// ==================== CONTEXT CREATION ====================
const MockDataContext = createContext<MockDataContextValue | undefined>(undefined);

// ==================== PROVIDER COMPONENT ====================
interface MockDataProviderProps {
  children: ReactNode;
}

export const MockDataProvider: React.FC<MockDataProviderProps> = ({ children }) => {
  // Helper function: Get county by name
  const getCountyByName = (name: string): County | undefined => {
    return mockCounties.find(
      (county) => county.name.toLowerCase() === name.toLowerCase()
    );
  };

  // Helper function: Get disease by name
  const getDiseaseByName = (name: string): Disease | undefined => {
    return mockDiseases.find(
      (disease) => disease.name.toLowerCase() === name.toLowerCase()
    );
  };

  // Helper function: Get predictions by county
  const getPredictionsByCounty = (county: string): Prediction[] => {
    return mockPredictions.filter(
      (prediction) => prediction.county.toLowerCase() === county.toLowerCase()
    );
  };

  // Helper function: Get active (unhandled) alerts
  const getActiveAlerts = (): Alert[] => {
    return mockAlerts.filter((alert) => !alert.handled);
  };

  // Helper function: Get high risk counties (risk >= 50%)
  const getHighRiskCounties = (): County[] => {
    return mockCounties.filter((county) => county.risk >= 50).sort((a, b) => b.risk - a.risk);
  };

  // Helper function: Get critical alerts
  const getCriticalAlerts = (): Alert[] => {
    return mockAlerts.filter((alert) => alert.level === "critical" && !alert.handled);
  };

  // Helper function: Get risk level based on percentage
  const getCountyRiskLevel = (risk: number): "critical" | "high" | "medium" | "low" => {
    if (risk >= 70) return "critical";
    if (risk >= 50) return "high";
    if (risk >= 30) return "medium";
    return "low";
  };

  const value: MockDataContextValue = {
    user: mockUser,
    counties: mockCounties,
    diseases: mockDiseases,
    predictions: mockPredictions,
    alerts: mockAlerts,
    timelinePredictions: mockTimelinePredictions,
    
    // Helper functions
    getCountyByName,
    getDiseaseByName,
    getPredictionsByCounty,
    getActiveAlerts,
    getHighRiskCounties,
    getCriticalAlerts,
    getCountyRiskLevel,
  };

  return <MockDataContext.Provider value={value}>{children}</MockDataContext.Provider>;
};

// ==================== CUSTOM HOOK ====================
export const useMockData = (): MockDataContextValue => {
  const context = useContext(MockDataContext);
  if (!context) {
    throw new Error("useMockData must be used within a MockDataProvider");
  }
  return context;
};
