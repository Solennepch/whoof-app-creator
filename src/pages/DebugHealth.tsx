import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ErrorBoundary from "@/components/ErrorBoundary";

interface HealthCheck {
  name: string;
  status: 'pending' | 'success' | 'error';
  statusCode?: number;
  message?: string;
}

function DebugHealthContent() {
  const [checks, setChecks] = useState<HealthCheck[]>([
    { name: 'GET /profile', status: 'pending' },
    { name: 'GET /dog?owner=:me', status: 'pending' },
    { name: 'GET /check-subscription', status: 'pending' },
  ]);

  useEffect(() => {
    async function runHealthChecks() {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const baseUrl = import.meta.env.VITE_SUPABASE_URL;

      // Check 1: GET /profile
      try {
        const response = await fetch(`${baseUrl}/functions/v1/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const errorText = response.ok ? 'OK' : await response.text();

        setChecks(prev => prev.map((check, idx) => 
          idx === 0 
            ? { 
                ...check, 
                status: response.ok ? 'success' : 'error',
                statusCode: response.status,
                message: errorText
              }
            : check
        ));
      } catch (error) {
        setChecks(prev => prev.map((check, idx) => 
          idx === 0 
            ? { 
                ...check, 
                status: 'error',
                message: error instanceof Error ? error.message : 'Network error'
              }
            : check
        ));
      }

      // Check 2: GET /dog?owner=:me
      if (session?.user?.id) {
        try {
          const response = await fetch(`${baseUrl}/functions/v1/dog?owner=${session.user.id}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          let resultMessage = 'Empty';
          if (response.ok) {
            const data = await response.json();
            const dogsCount = data?.data?.length || 0;
            resultMessage = `${dogsCount} dog(s) found`;
          } else {
            resultMessage = await response.text();
          }

          setChecks(prev => prev.map((check, idx) => 
            idx === 1 
              ? { 
                  ...check, 
                  status: response.ok ? 'success' : 'error',
                  statusCode: response.status,
                  message: resultMessage
                }
              : check
          ));
        } catch (error) {
          setChecks(prev => prev.map((check, idx) => 
            idx === 1 
              ? { 
                  ...check, 
                  status: 'error',
                  message: error instanceof Error ? error.message : 'Network error'
                }
              : check
          ));
        }
      }

      // Check 3: GET /check-subscription
      try {
        const response = await fetch(`${baseUrl}/functions/v1/check-subscription`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        let resultMessage = 'Error';
        if (response.ok) {
          const data = await response.json();
          resultMessage = `isPremium: ${data?.isPremium || false}, proPlan: ${data?.proPlan || 'none'}`;
        } else {
          resultMessage = await response.text();
        }

        setChecks(prev => prev.map((check, idx) => 
          idx === 2 
            ? { 
                ...check, 
                status: response.ok ? 'success' : 'error',
                statusCode: response.status,
                message: resultMessage
              }
            : check
        ));
      } catch (error) {
        setChecks(prev => prev.map((check, idx) => 
          idx === 2 
            ? { 
                ...check, 
                status: 'error',
                message: error instanceof Error ? error.message : 'Network error'
              }
            : check
        ));
      }
    }

    runHealthChecks();
  }, []);

  return (
    <div className="min-h-screen py-12 px-4" style={{ backgroundColor: "var(--paper)" }}>
      <div className="mx-auto max-w-2xl">
        <Card className="p-8 rounded-3xl shadow-soft">
          <h1 
            className="text-3xl font-bold mb-6" 
            style={{ fontFamily: "Fredoka", color: "var(--ink)" }}
          >
            Health Check
          </h1>

          <div className="space-y-4 mb-8">
            {checks.map((check, idx) => (
              <div 
                key={idx}
                className="flex items-start gap-4 p-4 rounded-2xl border"
                style={{ 
                  borderColor: check.status === 'error' 
                    ? 'var(--brand-raspberry)' 
                    : check.status === 'success' 
                    ? 'var(--brand-plum)' 
                    : '#e5e7eb'
                }}
              >
                {/* Icon */}
                <div className="flex-shrink-0 mt-1">
                  {check.status === 'pending' && (
                    <Loader2 className="w-5 h-5 animate-spin" style={{ color: "var(--brand-yellow)" }} />
                  )}
                  {check.status === 'success' && (
                    <CheckCircle className="w-5 h-5" style={{ color: "var(--brand-plum)" }} />
                  )}
                  {check.status === 'error' && (
                    <XCircle className="w-5 h-5" style={{ color: "var(--brand-raspberry)" }} />
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold mb-1" style={{ color: "var(--ink)" }}>
                    {check.name}
                  </p>
                  
                  {check.statusCode && (
                    <p className="text-sm mb-1" style={{ 
                      color: check.status === 'error' ? 'var(--brand-raspberry)' : 'var(--brand-plum)' 
                    }}>
                      Status: {check.statusCode}
                    </p>
                  )}
                  
                  {check.message && (
                    <p className="text-sm text-muted-foreground break-words">
                      {check.message}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex gap-3">
            <Button
              asChild
              className="rounded-2xl font-semibold"
              style={{ backgroundColor: "var(--brand-plum)" }}
            >
              <Link to="/profile/me">
                Go to Profile
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function DebugHealth() {
  return (
    <ErrorBoundary>
      <DebugHealthContent />
    </ErrorBoundary>
  );
}
