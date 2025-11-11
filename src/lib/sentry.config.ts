import * as Sentry from "@sentry/react";

export const initSentry = () => {
  // Only initialize Sentry in production
  if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
      
      // Performance Monitoring
      tracesSampleRate: 1.0,
      tracePropagationTargets: ["localhost", /^https:\/\/.*\.lovable\.app/],
      
      // Session Replay
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      
      // Environment
      environment: import.meta.env.MODE,
      
      // Release tracking
      release: import.meta.env.VITE_APP_VERSION || "1.0.0",
      
      // Ignore common errors
      ignoreErrors: [
        // Browser extensions
        'top.GLOBALS',
        'canvas.contentDocument',
        'MyApp_RemoveAllHighlights',
        'atomicFindClose',
        // Network errors
        'NetworkError',
        'Network request failed',
        // Random plugins/extensions
        'Can\'t find variable: ZiteReader',
        'jigsaw is not defined',
        'ComboSearch is not defined',
      ],
      
      // Filter sensitive data and configure alerts
      beforeSend(event, hint) {
        // Don't send events in development
        if (import.meta.env.DEV) {
          return null;
        }
        
        // Filter out PII
        if (event.request) {
          delete event.request.cookies;
          if (event.request.headers) {
            delete event.request.headers['Authorization'];
            delete event.request.headers['Cookie'];
          }
        }

        // Set custom tags for alerting
        const error = hint.originalException;
        if (error instanceof Error) {
          // Critical errors
          if (
            error.message.includes('Payment failed') ||
            error.message.includes('Database connection') ||
            error.message.includes('Authentication failed')
          ) {
            event.level = 'error';
            event.tags = { ...event.tags, alert_type: 'critical', notify_email: 'true' };
          }
          // Warnings
          else if (
            error.message.includes('Slow query') ||
            error.message.includes('Rate limit') ||
            error.message.includes('API timeout')
          ) {
            event.level = 'warning';
            event.tags = { ...event.tags, alert_type: 'warning', notify_email: 'false' };
          }
          // Info
          else {
            event.level = 'info';
            event.tags = { ...event.tags, alert_type: 'info', notify_email: 'false' };
          }
        }
        
        return event;
      },
    });
  }
};

// Error boundary fallback component
export const SentryErrorBoundary = Sentry.ErrorBoundary;

// Capture custom events
export const captureMessage = Sentry.captureMessage;
export const captureException = Sentry.captureException;

// Set user context
export const setUser = (user: { id: string; email?: string } | null) => {
  if (user) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
    });
  } else {
    Sentry.setUser(null);
  }
};

// Add breadcrumb for debugging
export const addBreadcrumb = (message: string, data?: Record<string, any>) => {
  Sentry.addBreadcrumb({
    message,
    data,
    level: 'info',
  });
};
