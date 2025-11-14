import { Outlet, useLocation } from "react-router-dom";
import { Header } from "./Header";
import { BottomNavigation } from "./BottomNavigation";
import { ProBottomNavigation } from "./ProBottomNavigation";

export function MainLayout() {
  const location = useLocation();
  
  // Routes sans layout
  const noLayoutRoutes = ["/", "/login", "/signup", "/onboarding/welcome", "/onboarding/dog", "/onboarding/preferences", "/onboarding/location"];
  
  if (noLayoutRoutes.includes(location.pathname)) {
    return <Outlet />;
  }

  const isProRoute = location.pathname.startsWith('/pro');
  const isDebugRoute = location.pathname.startsWith('/debug');

  return (
    <div className="min-h-screen flex flex-col">
      {!isDebugRoute && <Header />}
      
      <main className="flex-1 pb-20 md:pb-0">
        <Outlet />
      </main>
      
      {!isDebugRoute && (
        isProRoute ? (
          <ProBottomNavigation />
        ) : (
          <BottomNavigation />
        )
      )}
    </div>
  );
}
