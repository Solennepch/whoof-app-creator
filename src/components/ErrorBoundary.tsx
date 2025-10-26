import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div 
          className="min-h-screen flex items-center justify-center p-4" 
          style={{ backgroundColor: "var(--paper)" }}
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
              Une erreur est survenue
            </h2>
            
            <p className="text-muted-foreground mb-6">
              Nous sommes désolés, quelque chose s'est mal passé. Veuillez réessayer.
            </p>
            
            {this.state.error && (
              <details className="mb-6 text-left">
                <summary className="text-sm cursor-pointer text-muted-foreground hover:text-foreground">
                  Détails de l'erreur
                </summary>
                <pre className="mt-2 text-xs bg-muted p-3 rounded overflow-auto max-h-32">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
            
            <Button
              onClick={this.handleReset}
              className="w-full rounded-2xl text-white font-semibold"
              style={{ backgroundColor: "var(--brand-plum)" }}
            >
              Réessayer
            </Button>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
