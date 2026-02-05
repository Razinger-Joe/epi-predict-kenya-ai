import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatCards } from "@/components/dashboard/StatCards";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardBreadcrumbs } from "@/components/dashboard/DashboardBreadcrumbs";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { InsightsHarvester } from "@/components/dashboard/InsightsHarvester";

const Dashboard = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar />

        <div className="flex-1 flex flex-col">
          <DashboardHeader />

          <main className="flex-1 p-6 overflow-auto">
            <DashboardBreadcrumbs />

            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Real-time disease outbreak monitoring for Kenya
              </p>
            </div>

            <StatCards />

            {/* Social Media Insights Harvester */}
            <div className="mt-8">
              <InsightsHarvester />
            </div>
          </main>
        </div>
      </div>

      {/* AI Chat Widget */}
      <ChatInterface />
    </SidebarProvider>
  );
};

export default Dashboard;
