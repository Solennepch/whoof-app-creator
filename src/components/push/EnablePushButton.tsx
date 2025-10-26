import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bell, BellOff } from "lucide-react";
import { subscribePush, unsubscribePush, getCurrentSubscription } from "@/lib/push/usePush";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const VAPID_PUBLIC_KEY = "BB5WgZcI90auEX1Z-A4u75PgAmPg5hr74vTKrcQutfBWDtQW7s8gUycLyI06dQ5elEIM5qSqIiYNbd8mSzYgWgg";

export function EnablePushButton() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    const subscription = await getCurrentSubscription();
    setIsSubscribed(!!subscription);
  };

  const handleToggle = async () => {
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to enable notifications",
          variant: "destructive",
        });
        return;
      }

      if (isSubscribed) {
        // Unsubscribe
        const subscription = await unsubscribePush();
        
        if (subscription?.endpoint) {
          const { data: { session } } = await supabase.auth.getSession();
          
          await supabase.functions.invoke('push-unregister', {
            body: { endpoint: subscription.endpoint },
            headers: {
              Authorization: `Bearer ${session?.access_token}`,
            },
          });
        }

        setIsSubscribed(false);
        toast({
          title: "Notifications disabled",
          description: "You will no longer receive push notifications",
        });
      } else {
        // Subscribe
        const subscription = await subscribePush(VAPID_PUBLIC_KEY);
        
        if (!subscription) {
          toast({
            title: "Notification permission denied",
            description: "Please allow notifications in your browser settings",
            variant: "destructive",
          });
          return;
        }

        const { data: { session } } = await supabase.auth.getSession();
        
        const { error } = await supabase.functions.invoke('push-register', {
          body: {
            endpoint: subscription.endpoint,
            keys: subscription.keys,
          },
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
          },
        });

        if (error) {
          throw error;
        }

        setIsSubscribed(true);
        toast({
          title: "Notifications enabled ✅",
          description: "You'll receive updates about walks, matches, and events",
        });
      }
    } catch (error) {
      console.error("Error toggling notifications:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update notification settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleToggle}
      disabled={isLoading}
      variant={isSubscribed ? "outline" : "default"}
      className="gap-2"
    >
      {isSubscribed ? <BellOff className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
      {isSubscribed ? "Disable notifications" : "Enable notifications"}
    </Button>
  );
}
