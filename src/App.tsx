import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar } from "./components/layout/Navbar";
import Home from "./pages/Home";
import Discover from "./pages/Discover";
import Events from "./pages/Events";
import Map from "./pages/Map";
import Profile from "./pages/Profile";
import ProfileMe from "./pages/ProfileMe";
import Login from "./pages/Login";
import Annuaire from "./pages/Annuaire";
import AnnuaireDetail from "./pages/AnnuaireDetail";
import Partenariats from "./pages/Partenariats";
import PartenariatDetail from "./pages/PartenariatDetail";
import ProOnboarding from "./pages/pro/Onboarding";
import ProDashboard from "./pages/pro/Dashboard";
import ProPricing from "./pages/pro/Pricing";
import PremiumPricing from "./pages/premium/Pricing";
import DebugHealth from "./pages/DebugHealth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/events" element={<Events />} />
          <Route path="/map" element={<Map />} />
          <Route path="/login" element={<Login />} />
          <Route path="/annuaire" element={<Annuaire />} />
          <Route path="/annuaire/:id" element={<AnnuaireDetail />} />
          <Route path="/partenariats" element={<Partenariats />} />
          <Route path="/partenariats/:id" element={<PartenariatDetail />} />
          <Route path="/pro/onboarding" element={<ProOnboarding />} />
          <Route path="/pro/dashboard" element={<ProDashboard />} />
          <Route path="/pro/pricing" element={<ProPricing />} />
          <Route path="/premium/pricing" element={<PremiumPricing />} />
          <Route path="/profile/me" element={<ProfileMe />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/debug/health" element={<DebugHealth />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
