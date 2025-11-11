import { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class PageErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div 
          className="min-h-screen flex items-center justify-center p-4" 
          style={{ background: "linear-gradient(135deg, #FFE4C4 0%, #FFD1E8 30%, #E6DBFF 100%)" }}
        >
          <Card className="max-w-md w-full p-8 rounded-3xl shadow-soft text-center">
            <div 
              className="flex items-center justify-center w-16 h-16 rounded-2xl mb-6 mx-auto"
              style={{ backgroundColor: "var(--brand-raspberry)20" }}
            >
              <AlertTriangle 
                className="w-8 h-8" 
                style={{ color: "var(--brand-raspberry)" }} 
              />
            </div>
            
            <h2 
              className="text-2xl font-bold mb-4" 
              style={{ fontFamily: "Fredoka", color: "var(--ink)" }}
            >
              Oups, une erreur est survenue
            </h2>
            
            <p className="text-muted-foreground mb-6">
              Nous sommes désolés. Veuillez réessayer.
            </p>
            
            <Button
              onClick={() => window.location.reload()}
              className="rounded-2xl text-white font-semibold"
              style={{ backgroundColor: "var(--brand-plum)" }}
            >
              Recharger la page
            </Button>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
