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
import { MainLayout } from "@/components/layout/MainLayout";

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
const ProStats = lazy(() => import("./pages/pro/Stats"));
const ProPayments = lazy(() => import("./pages/pro/Payments"));
const ProAppointments = lazy(() => import("./pages/pro/Appointments"));
const ProAgenda = lazy(() => import("./pages/pro/Agenda"));
const ProCommunity = lazy(() => import("./pages/pro/Community"));
const ProEdit = lazy(() => import("./pages/pro/Edit"));
const ProEvents = lazy(() => import("./pages/pro/Events"));
const ProHelp = lazy(() => import("./pages/pro/Help"));
const ProMessages = lazy(() => import("./pages/pro/Messages"));
const ProMore = lazy(() => import("./pages/pro/More"));
const ProNotifications = lazy(() => import("./pages/pro/Notifications"));
const ProOffers = lazy(() => import("./pages/pro/Offers"));
const ProOnboarding = lazy(() => import("./pages/pro/Onboarding"));
const ProPartners = lazy(() => import("./pages/pro/Partners"));
const ProPricing = lazy(() => import("./pages/pro/Pricing"));
const ProMap = lazy(() => import("./pages/pro/ProMap"));
const ProProfile = lazy(() => import("./pages/pro/Profile"));
const ProReviews = lazy(() => import("./pages/pro/Reviews"));
const ProServices = lazy(() => import("./pages/pro/Services"));
const ProSettings = lazy(() => import("./pages/pro/Settings"));

// Admin routes
const Moderation = lazy(() => import("./pages/admin/Moderation"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminUsers = lazy(() => import("./pages/admin/Users"));
const AstroDogCMS = lazy(() => import("./pages/admin/AstroDogCMS"));
const AdminProfessionals = lazy(() => import("./pages/admin/Professionals"));
const AdminProfessionalDetail = lazy(() => import("./pages/admin/ProfessionalDetail"));
const AdminEmailTemplates = lazy(() => import("./pages/admin/EmailTemplates"));
const AdminNotificationDashboard = lazy(() => import("./pages/admin/NotificationDashboard"));
const AdminABTesting = lazy(() => import("./pages/admin/ABTesting"));

// Debug routes
const Debug = lazy(() => import("./pages/Debug"));
const DebugHealth = lazy(() => import("./pages/DebugHealth"));
const TestAccounts = lazy(() => import("./pages/debug/TestAccounts"));
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
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AccountProvider>
            <Toaster />
            <Sonner />
            <Suspense fallback={<PageLoader />}>
              <Routes>
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
                <Route path="/pro/stats" element={<PageErrorBoundary><ProStats /></PageErrorBoundary>} />
                <Route path="/pro/payments" element={<PageErrorBoundary><ProPayments /></PageErrorBoundary>} />
                <Route path="/pro/appointments" element={<PageErrorBoundary><ProAppointments /></PageErrorBoundary>} />
                <Route path="/pro/agenda" element={<PageErrorBoundary><ProAgenda /></PageErrorBoundary>} />
                <Route path="/pro/community" element={<PageErrorBoundary><ProCommunity /></PageErrorBoundary>} />
                <Route path="/pro/edit" element={<PageErrorBoundary><ProEdit /></PageErrorBoundary>} />
                <Route path="/pro/events" element={<PageErrorBoundary><ProEvents /></PageErrorBoundary>} />
                <Route path="/pro/help" element={<PageErrorBoundary><ProHelp /></PageErrorBoundary>} />
                <Route path="/pro/messages" element={<PageErrorBoundary><ProMessages /></PageErrorBoundary>} />
                <Route path="/pro/more" element={<PageErrorBoundary><ProMore /></PageErrorBoundary>} />
                <Route path="/pro/notifications" element={<PageErrorBoundary><ProNotifications /></PageErrorBoundary>} />
                <Route path="/pro/offers" element={<PageErrorBoundary><ProOffers /></PageErrorBoundary>} />
                <Route path="/pro/onboarding" element={<PageErrorBoundary><ProOnboarding /></PageErrorBoundary>} />
                <Route path="/pro/partners" element={<PageErrorBoundary><ProPartners /></PageErrorBoundary>} />
                <Route path="/pro/pricing" element={<PageErrorBoundary><ProPricing /></PageErrorBoundary>} />
                <Route path="/pro/map" element={<PageErrorBoundary><ProMap /></PageErrorBoundary>} />
                <Route path="/pro/profile" element={<PageErrorBoundary><ProProfile /></PageErrorBoundary>} />
                <Route path="/pro/reviews" element={<PageErrorBoundary><ProReviews /></PageErrorBoundary>} />
                <Route path="/pro/services" element={<PageErrorBoundary><ProServices /></PageErrorBoundary>} />
                <Route path="/pro/settings" element={<PageErrorBoundary><ProSettings /></PageErrorBoundary>} />

                  {/* Admin */}
                  <Route path="/admin" element={<PageErrorBoundary><AdminDashboard /></PageErrorBoundary>} />
                  <Route path="/admin/dashboard" element={<PageErrorBoundary><AdminDashboard /></PageErrorBoundary>} />
                  <Route path="/admin/users" element={<PageErrorBoundary><AdminUsers /></PageErrorBoundary>} />
                  <Route path="/admin/professionals" element={<PageErrorBoundary><AdminProfessionals /></PageErrorBoundary>} />
                  <Route path="/admin/professionals/:id" element={<PageErrorBoundary><AdminProfessionalDetail /></PageErrorBoundary>} />
                  <Route path="/admin/moderation" element={<PageErrorBoundary><Moderation /></PageErrorBoundary>} />
                  <Route path="/admin/astrodog-cms" element={<PageErrorBoundary><AstroDogCMS /></PageErrorBoundary>} />
                  <Route path="/admin/email-templates" element={<PageErrorBoundary><AdminEmailTemplates /></PageErrorBoundary>} />
                  <Route path="/admin/notification-dashboard" element={<PageErrorBoundary><AdminNotificationDashboard /></PageErrorBoundary>} />
                  <Route path="/admin/ab-testing" element={<PageErrorBoundary><AdminABTesting /></PageErrorBoundary>} />

                  {/* Fallback */}
                  <Route path="*" element={<PageErrorBoundary><NotFound /></PageErrorBoundary>} />
                </Route>
                
                {/* Debug routes - outside MainLayout */}
                <Route path="/debug" element={<PageErrorBoundary><Debug /></PageErrorBoundary>} />
                <Route path="/debug/health" element={<PageErrorBoundary><DebugHealth /></PageErrorBoundary>} />
                <Route path="/debug/test-accounts" element={<PageErrorBoundary><TestAccounts /></PageErrorBoundary>} />
              </Routes>
            </Suspense>
          </AccountProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
