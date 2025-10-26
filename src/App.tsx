import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Header } from "./components/layout/Header";
import { BottomNavigation } from "./components/layout/BottomNavigation";
import Home from "./pages/Home";
import Discover from "./pages/Discover";
import Events from "./pages/Events";
import Map from "./pages/Map";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
import ProfileMe from "./pages/ProfileMe";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Ranking from "./pages/Ranking";
import Annuaire from "./pages/Annuaire";
import AnnuaireMap from "./pages/AnnuaireMap";
import AnnuaireDetail from "./pages/AnnuaireDetail";
import Partenariats from "./pages/Partenariats";
import PartenariatDetail from "./pages/PartenariatDetail";
import ProOnboarding from "./pages/pro/Onboarding";
import ProDashboard from "./pages/pro/Dashboard";
import ProPricing from "./pages/pro/Pricing";
import PremiumPricing from "./pages/premium/Pricing";
import Premium from "./pages/Premium";
import Parrainage from "./pages/Parrainage";
import AstroDog from "./pages/AstroDog";
import Recompenses from "./pages/Recompenses";
import ProfileOnboarding from "./pages/onboarding/Profile";
import DogOnboarding from "./pages/onboarding/Dog";
import DebugHealth from "./pages/DebugHealth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Header />
        <Routes>
          {/* Auth & Onboarding Flow */}
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/onboarding/profile" element={<ProfileOnboarding />} />
          <Route path="/onboarding/dog" element={<DogOnboarding />} />
          
          {/* Main App Pages */}
          <Route path="/" element={<Navigate to="/map" replace />} />
          <Route path="/map" element={<Map />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/events" element={<Events />} />
          <Route path="/ranking" element={<Ranking />} />
          
          {/* Profile Pages */}
          <Route path="/profile/me" element={<ProfileMe />} />
          <Route path="/profile/:id" element={<Profile />} />
          
          {/* Features */}
          <Route path="/astro-dog" element={<AstroDog />} />
          <Route path="/recompenses" element={<Recompenses />} />
          <Route path="/parrainage" element={<Parrainage />} />
          
          {/* Directory & Partnerships */}
          <Route path="/annuaire" element={<Annuaire />} />
          <Route path="/annuaire/carte" element={<AnnuaireMap />} />
          <Route path="/annuaire/:id" element={<AnnuaireDetail />} />
          <Route path="/partenariats" element={<Partenariats />} />
          <Route path="/partenariats/:id" element={<PartenariatDetail />} />
          
          {/* Premium & Pro */}
          <Route path="/premium" element={<Premium />} />
          <Route path="/premium/pricing" element={<PremiumPricing />} />
          <Route path="/pro/onboarding" element={<ProOnboarding />} />
          <Route path="/pro/dashboard" element={<ProDashboard />} />
          <Route path="/pro/pricing" element={<ProPricing />} />
          
          {/* Legacy & Debug */}
          <Route path="/home" element={<Home />} />
          <Route path="/debug/health" element={<DebugHealth />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <BottomNavigation />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
