import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppNavbar from "@/components/AppNavbar";
import Index from "./pages/Index.tsx";
import ActiveAlertsPage from "./pages/ActiveAlertsPage.tsx";
import AnalyticsPage from "./pages/AnalyticsPage.tsx";
import OperationsPage from "./pages/OperationsPage.tsx";
import InventoryPage from "./pages/InventoryPage.tsx";
import AssetDetailPage from "./pages/AssetDetailPage.tsx";
import WorkOrdersPage from "./pages/WorkOrdersPage.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen bg-background">
          <AppNavbar />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/alerts" element={<ActiveAlertsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/operations" element={<OperationsPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/inventory/:id" element={<AssetDetailPage />} />
            <Route path="/workorders" element={<WorkOrdersPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
