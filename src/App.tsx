import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Header } from "./components/layout/Header";
import { BottomNavigation } from "./components/layout/BottomNavigation";
import { ProBottomNavigation } from "./components/layout/ProBottomNavigation";
import Home from "./pages/Home";
import Index from "./pages/Index";
import MatchHome from "./pages/MatchHome";
import Discover from "./pages/Discover";
import DiscoverAdoption from "./pages/DiscoverAdoption";
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
import ProHome from "./pages/pro/Home";
import ProEdit from "./pages/pro/Edit";
import ProMessages from "./pages/pro/Messages";
import ProPartners from "./pages/pro/Partners";
import ProMore from "./pages/pro/More";
import ProAgenda from "./pages/pro/Agenda";
import ProMap from "./pages/pro/ProMap";
import ProSettings from "./pages/pro/Settings";
import ProNotifications from "./pages/pro/Notifications";
import ProHelp from "./pages/pro/Help";
import ProQRCode from "./pages/pro/QRCode";
import PremiumPricing from "./pages/premium/Pricing";
import Premium from "./pages/Premium";
import Parrainage from "./pages/Parrainage";
import AstroDog from "./pages/AstroDog";
import Recompenses from "./pages/Recompenses";
import ProfileOnboarding from "./pages/onboarding/Profile";
import DogOnboarding from "./pages/onboarding/Dog";
import DebugHealth from "./pages/DebugHealth";
import NotFound from "./pages/NotFound";
import AdminModeration from "./pages/admin/Moderation";
import TestAccounts from "./pages/debug/TestAccounts";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Header />
        <Routes>
          {/* Pro Routes - Use ProBottomNavigation */}
          <Route path="/pro/*" element={<ProBottomNavigation />} />
          
          {/* Auth & Onboarding Flow */}
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/onboarding/profile" element={<ProfileOnboarding />} />
          <Route path="/onboarding/dog" element={<DogOnboarding />} />
          
          {/* Main App Pages */}
          <Route path="/" element={<Index />} />
          <Route path="/map" element={<Map />} />
          <Route path="/discover" element={<MatchHome />} />
          <Route path="/discover/region" element={<Discover />} />
          <Route path="/discover/adoption" element={<DiscoverAdoption />} />
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
          <Route path="/pro/home" element={<ProHome />} />
          <Route path="/pro/qrcode" element={<ProQRCode />} />
          <Route path="/pro/agenda" element={<ProAgenda />} />
          <Route path="/pro/map" element={<ProMap />} />
          <Route path="/pro/edit" element={<ProEdit />} />
          <Route path="/pro/messages" element={<ProMessages />} />
          <Route path="/pro/partners" element={<ProPartners />} />
          <Route path="/pro/more" element={<ProMore />} />
          <Route path="/pro/dashboard" element={<ProDashboard />} />
          <Route path="/pro/pricing" element={<ProPricing />} />
          <Route path="/pro/settings" element={<ProSettings />} />
          <Route path="/pro/notifications" element={<ProNotifications />} />
          <Route path="/pro/help" element={<ProHelp />} />
          
          {/* Admin */}
          <Route path="/admin/moderation" element={<AdminModeration />} />
          
          {/* Legacy & Debug */}
          <Route path="/home" element={<Home />} />
          <Route path="/debug/health" element={<DebugHealth />} />
          <Route path="/debug/accounts" element={<TestAccounts />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <BottomNavigation />
        <ProBottomNavigation />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
