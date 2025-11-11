import { lazy, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AccountProvider } from "@/contexts/AccountContext";
import { Skeleton } from "@/components/ui/skeleton";
import { PageErrorBoundary } from "@/components/common/PageErrorBoundary";
import { queryClient } from "@/lib/queryClient";

// Eager loading for critical routes
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

// Lazy loading for non-critical routes
const Home = lazy(() => import("./pages/Home"));
const Discover = lazy(() => import("./pages/Discover"));
const Map = lazy(() => import("./pages/Map"));
const Messages = lazy(() => import("./pages/Messages"));
const Profile = lazy(() => import("./pages/Profile"));
const ProfileMe = lazy(() => import("./pages/ProfileMe"));
const Settings = lazy(() => import("./pages/Settings"));
const MatchHome = lazy(() => import("./pages/MatchHome"));
const LikesHistory = lazy(() => import("./pages/LikesHistory"));
const Premium = lazy(() => import("./pages/Premium"));
const Recompenses = lazy(() => import("./pages/Recompenses"));
const Events = lazy(() => import("./pages/Events"));
const Parrainage = lazy(() => import("./pages/Parrainage"));
const Ranking = lazy(() => import("./pages/Ranking"));
const AstroDog = lazy(() => import("./pages/AstroDog"));

// Onboarding
const Welcome = lazy(() => import("./pages/onboarding/Welcome"));
const DogOnboarding = lazy(() => import("./pages/onboarding/Dog"));
const Preferences = lazy(() => import("./pages/onboarding/Preferences"));
const LocationOnboarding = lazy(() => import("./pages/onboarding/Location"));

// Pro routes
const ProHome = lazy(() => import("./pages/pro/Home"));
const ProDashboard = lazy(() => import("./pages/pro/Dashboard"));

// Admin routes
const Moderation = lazy(() => import("./pages/admin/Moderation"));

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
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AccountProvider>
            <Toaster />
            <Sonner />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                {/* Main app routes with error boundaries */}
                <Route path="/home" element={<PageErrorBoundary><Home /></PageErrorBoundary>} />
                <Route path="/discover" element={<PageErrorBoundary><Discover /></PageErrorBoundary>} />
                <Route path="/map" element={<PageErrorBoundary><Map /></PageErrorBoundary>} />
                <Route path="/messages" element={<PageErrorBoundary><Messages /></PageErrorBoundary>} />
                <Route path="/profile/me" element={<PageErrorBoundary><ProfileMe /></PageErrorBoundary>} />
                <Route path="/profile/:id" element={<PageErrorBoundary><Profile /></PageErrorBoundary>} />
                <Route path="/settings" element={<PageErrorBoundary><Settings /></PageErrorBoundary>} />
                <Route path="/match" element={<PageErrorBoundary><MatchHome /></PageErrorBoundary>} />
                <Route path="/likes" element={<PageErrorBoundary><LikesHistory /></PageErrorBoundary>} />
                <Route path="/premium" element={<PageErrorBoundary><Premium /></PageErrorBoundary>} />
                <Route path="/recompenses" element={<PageErrorBoundary><Recompenses /></PageErrorBoundary>} />
                <Route path="/events" element={<PageErrorBoundary><Events /></PageErrorBoundary>} />
                <Route path="/parrainage" element={<PageErrorBoundary><Parrainage /></PageErrorBoundary>} />
                <Route path="/ranking" element={<PageErrorBoundary><Ranking /></PageErrorBoundary>} />
                <Route path="/astrodog" element={<PageErrorBoundary><AstroDog /></PageErrorBoundary>} />

                {/* Onboarding */}
                <Route path="/onboarding/welcome" element={<PageErrorBoundary><Welcome /></PageErrorBoundary>} />
                <Route path="/onboarding/dog" element={<PageErrorBoundary><DogOnboarding /></PageErrorBoundary>} />
                <Route path="/onboarding/preferences" element={<PageErrorBoundary><Preferences /></PageErrorBoundary>} />
                <Route path="/onboarding/location" element={<PageErrorBoundary><LocationOnboarding /></PageErrorBoundary>} />

                {/* Pro routes */}
                <Route path="/pro" element={<PageErrorBoundary><ProHome /></PageErrorBoundary>} />
                <Route path="/pro/dashboard" element={<PageErrorBoundary><ProDashboard /></PageErrorBoundary>} />

                {/* Admin */}
                <Route path="/admin/moderation" element={<PageErrorBoundary><Moderation /></PageErrorBoundary>} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </AccountProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
