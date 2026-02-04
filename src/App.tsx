import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LoadingSpinner } from "@/components/ui/loading"; // Assuming this exists or we use a simple div

// Eager load critical pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";

// Lazy load dashboard pages (heavy)
const Dashboard = lazy(() => import("./pages/Dashboard"));
const DashboardPredictions = lazy(() => import("./pages/DashboardPredictions"));
const DashboardAlerts = lazy(() => import("./pages/DashboardAlerts"));
const DashboardAnalytics = lazy(() => import("./pages/DashboardAnalytics"));
const DashboardCounties = lazy(() => import("./pages/DashboardCounties"));
const DashboardSettings = lazy(() => import("./pages/DashboardSettings"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="flex items-center justify-center h-screen w-full bg-background">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/predictions" element={<DashboardPredictions />} />
            <Route path="/dashboard/alerts" element={<DashboardAlerts />} />
            <Route path="/dashboard/analytics" element={<DashboardAnalytics />} />
            <Route path="/dashboard/counties" element={<DashboardCounties />} />
            <Route path="/dashboard/settings" element={<DashboardSettings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
