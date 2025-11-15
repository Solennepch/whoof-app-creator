import { lazy, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AccountProvider } from "@/contexts/AccountContext";
import { NotificationSystemProvider } from "@/contexts/NotificationSystemContext";
import { GamificationProvider } from "@/contexts/GamificationContext";
import { Skeleton } from "@/components/ui/skeleton";
import { PageErrorBoundary } from "@/components/common/PageErrorBoundary";
import { queryClient } from "@/lib/queryClient";
import { MainLayout } from "@/components/layout/MainLayout";

// Eager loading for critical routes
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Debug from "./pages/Debug";
import DebugHealth from "./pages/DebugHealth";
import TestAccounts from "./pages/debug/TestAccounts";
import FeatureFlags from "./pages/debug/FeatureFlags";

// Lazy loading for non-critical routes
const Home = lazy(() => import("./pages/Home"));
const Discover = lazy(() => import("./pages/Discover"));
const Map = lazy(() => import("./pages/Map"));
const Messages = lazy(() => import("./pages/Messages"));
const MessageThread = lazy(() => import("./pages/MessageThread"));
const Profile = lazy(() => import("./pages/Profile"));
const ProfileMe = lazy(() => import("./pages/ProfileMe"));
const MyProfile = lazy(() => import("./pages/MyProfile"));
const Settings = lazy(() => import("./pages/Settings"));
const MatchHome = lazy(() => import("./pages/MatchHome"));
const LikesHistory = lazy(() => import("./pages/LikesHistory"));
const Premium = lazy(() => import("./pages/Premium"));
const Recompenses = lazy(() => import("./pages/Recompenses"));
const Events = lazy(() => import("./pages/Events"));
const SocialEvents = lazy(() => import("./pages/SocialEvents"));
const SocialEventDetail = lazy(() => import("./pages/SocialEventDetail"));
const Balades = lazy(() => import("./pages/Balades"));
const Parrainage = lazy(() => import("./pages/Parrainage"));
const Ranking = lazy(() => import("./pages/Ranking"));
const AstroDog = lazy(() => import("./pages/AstroDog"));
const Annuaire = lazy(() => import("./pages/Annuaire"));
const AnnuaireDetail = lazy(() => import("./pages/AnnuaireDetail"));
const AnnuaireMap = lazy(() => import("./pages/AnnuaireMap"));
const Partenariats = lazy(() => import("./pages/Partenariats"));
const PartenariatDetail = lazy(() => import("./pages/PartenariatDetail"));
const BonsPlans = lazy(() => import("./pages/BonsPlans"));
const DevenirPro = lazy(() => import("./pages/DevenirPro"));
const DogProfile = lazy(() => import("./pages/DogProfile"));

// Onboarding
const Welcome = lazy(() => import("./pages/onboarding/Welcome"));
const DogOnboarding = lazy(() => import("./pages/onboarding/Dog"));
const Preferences = lazy(() => import("./pages/onboarding/Preferences"));
const LocationOnboarding = lazy(() => import("./pages/onboarding/Location"));

// Pro routes
const ProHome = lazy(() => import("./pages/pro/Home"));
const ProStats = lazy(() => import("./pages/pro/Stats"));
const ProPayments = lazy(() => import("./pages/pro/Payments"));
const ProAppointments = lazy(() => import("./pages/pro/Appointments"));
const ProAgenda = lazy(() => import("./pages/pro/Agenda"));
const ProEdit = lazy(() => import("./pages/pro/Edit"));
const ProMessages = lazy(() => import("./pages/pro/Messages"));
const ProOnboarding = lazy(() => import("./pages/pro/Onboarding"));
const ProPartners = lazy(() => import("./pages/pro/Partners"));
const ProPricing = lazy(() => import("./pages/pro/Pricing"));
const ProReviews = lazy(() => import("./pages/pro/Reviews"));
const ProServices = lazy(() => import("./pages/pro/Services"));
const ProSettings = lazy(() => import("./pages/pro/Settings"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Loading fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #FFE4C4 0%, #FFD1E8 30%, #E6DBFF 100%)" }}>
    <div className="space-y-4 max-w-md w-full px-4">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
  </div>
);

const App = () => {
  const isDev = import.meta.env.DEV;
  
  console.log('🔧 App - isDev:', isDev, '| MODE:', import.meta.env.MODE, '| Creating debug routes');
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AccountProvider>
            <NotificationSystemProvider>
              <GamificationProvider>
                <Toaster />
                <Sonner />
                <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Debug routes - toujours accessibles temporairement pour debug */}
                <>
                  <Route path="/debug" element={<PageErrorBoundary><Debug /></PageErrorBoundary>} />
                  <Route path="/debug/health" element={<PageErrorBoundary><DebugHealth /></PageErrorBoundary>} />
                  <Route path="/debug/test-accounts" element={<PageErrorBoundary><TestAccounts /></PageErrorBoundary>} />
                  <Route path="/debug/feature-flags" element={<PageErrorBoundary><FeatureFlags /></PageErrorBoundary>} />
                </>
                
                <Route element={<MainLayout />}>
                  {/* Public routes */}
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />

                  {/* Main app routes with error boundaries */}
                  <Route path="/home" element={<PageErrorBoundary><Home /></PageErrorBoundary>} />
                <Route path="/discover" element={<PageErrorBoundary><Discover /></PageErrorBoundary>} />
                <Route path="/map" element={<PageErrorBoundary><Map /></PageErrorBoundary>} />
                <Route path="/messages" element={<PageErrorBoundary><Messages /></PageErrorBoundary>} />
                <Route path="/messages/:threadId" element={<PageErrorBoundary><MessageThread /></PageErrorBoundary>} />
                <Route path="/my-profile" element={<PageErrorBoundary><MyProfile /></PageErrorBoundary>} />
                <Route path="/profile/me" element={<PageErrorBoundary><ProfileMe /></PageErrorBoundary>} />
                <Route path="/profile/:id" element={<PageErrorBoundary><Profile /></PageErrorBoundary>} />
                <Route path="/dog/:id" element={<PageErrorBoundary><DogProfile /></PageErrorBoundary>} />
                <Route path="/settings" element={<PageErrorBoundary><Settings /></PageErrorBoundary>} />
                <Route path="/match" element={<PageErrorBoundary><MatchHome /></PageErrorBoundary>} />
                <Route path="/likes" element={<PageErrorBoundary><LikesHistory /></PageErrorBoundary>} />
                <Route path="/premium" element={<PageErrorBoundary><Premium /></PageErrorBoundary>} />
                <Route path="/recompenses" element={<PageErrorBoundary><Recompenses /></PageErrorBoundary>} />
                <Route path="/events" element={<PageErrorBoundary><Events /></PageErrorBoundary>} />
                <Route path="/balades" element={<PageErrorBoundary><Balades /></PageErrorBoundary>} />
                <Route path="/social-events" element={<PageErrorBoundary><SocialEvents /></PageErrorBoundary>} />
                <Route path="/social-events/:eventId" element={<PageErrorBoundary><SocialEventDetail /></PageErrorBoundary>} />
                <Route path="/parrainage" element={<PageErrorBoundary><Parrainage /></PageErrorBoundary>} />
                <Route path="/ranking" element={<PageErrorBoundary><Ranking /></PageErrorBoundary>} />
                <Route path="/astro-dog" element={<PageErrorBoundary><AstroDog /></PageErrorBoundary>} />
                <Route path="/annuaire" element={<PageErrorBoundary><Annuaire /></PageErrorBoundary>} />
                <Route path="/annuaire/map" element={<PageErrorBoundary><AnnuaireMap /></PageErrorBoundary>} />
                <Route path="/annuaire/:id" element={<PageErrorBoundary><AnnuaireDetail /></PageErrorBoundary>} />
                <Route path="/partenariats" element={<PageErrorBoundary><Partenariats /></PageErrorBoundary>} />
                <Route path="/partenariats/:id" element={<PageErrorBoundary><PartenariatDetail /></PageErrorBoundary>} />
                <Route path="/bons-plans" element={<PageErrorBoundary><BonsPlans /></PageErrorBoundary>} />
                <Route path="/devenir-pro" element={<PageErrorBoundary><DevenirPro /></PageErrorBoundary>} />

                {/* Onboarding */}
                <Route path="/onboarding/welcome" element={<PageErrorBoundary><Welcome /></PageErrorBoundary>} />
                <Route path="/onboarding/dog" element={<PageErrorBoundary><DogOnboarding /></PageErrorBoundary>} />
                <Route path="/onboarding/preferences" element={<PageErrorBoundary><Preferences /></PageErrorBoundary>} />
                <Route path="/onboarding/location" element={<PageErrorBoundary><LocationOnboarding /></PageErrorBoundary>} />

                {/* Pro routes */}
                <Route path="/pro" element={<PageErrorBoundary><ProHome /></PageErrorBoundary>} />
                <Route path="/pro/home" element={<PageErrorBoundary><ProHome /></PageErrorBoundary>} />
                <Route path="/pro/stats" element={<PageErrorBoundary><ProStats /></PageErrorBoundary>} />
                <Route path="/pro/payments" element={<PageErrorBoundary><ProPayments /></PageErrorBoundary>} />
                <Route path="/pro/appointments" element={<PageErrorBoundary><ProAppointments /></PageErrorBoundary>} />
                <Route path="/pro/agenda" element={<PageErrorBoundary><ProAgenda /></PageErrorBoundary>} />
                <Route path="/pro/edit" element={<PageErrorBoundary><ProEdit /></PageErrorBoundary>} />
                <Route path="/pro/messages" element={<PageErrorBoundary><ProMessages /></PageErrorBoundary>} />
                <Route path="/pro/onboarding" element={<PageErrorBoundary><ProOnboarding /></PageErrorBoundary>} />
                <Route path="/pro/partners" element={<PageErrorBoundary><ProPartners /></PageErrorBoundary>} />
                <Route path="/pro/pricing" element={<PageErrorBoundary><ProPricing /></PageErrorBoundary>} />
                <Route path="/pro/reviews" element={<PageErrorBoundary><ProReviews /></PageErrorBoundary>} />
                <Route path="/pro/services" element={<PageErrorBoundary><ProServices /></PageErrorBoundary>} />
                <Route path="/pro/settings" element={<PageErrorBoundary><ProSettings /></PageErrorBoundary>} />

                  {/* Fallback */}
                  <Route path="*" element={<PageErrorBoundary><NotFound /></PageErrorBoundary>} />
                </Route>
              </Routes>
            </Suspense>
            </GamificationProvider>
            </NotificationSystemProvider>
          </AccountProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
