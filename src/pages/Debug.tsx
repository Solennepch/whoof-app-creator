import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Users, Database, FileText, Shield, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Debug() {
  const tools = [
    {
      title: "Health Check",
      description: "Vérifier l'état des APIs et services backend",
      icon: Activity,
      path: "/debug/health",
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
    {
      title: "Comptes de Test",
      description: "Créer et gérer les comptes de test (admin, modérateur, utilisateurs)",
      icon: Users,
      path: "/debug/test-accounts",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    {
      title: "Base de Données",
      description: "Explorer les tables et les données Supabase",
      icon: Database,
      path: "/debug/database",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      disabled: true,
    },
    {
      title: "Logs",
      description: "Consulter les logs d'erreur et d'activité",
      icon: FileText,
      path: "/debug/logs",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      disabled: true,
    },
    {
      title: "RLS Policies",
      description: "Tester les politiques de sécurité Row Level Security",
      icon: Shield,
      path: "/debug/rls",
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      disabled: true,
    },
    {
      title: "Outils Système",
      description: "Performances, cache, variables d'environnement",
      icon: Wrench,
      path: "/debug/system",
      color: "text-gray-600",
      bgColor: "bg-gray-50",
      borderColor: "border-gray-200",
      disabled: true,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Wrench className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Debug Tools</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Outils de développement et de débogage pour Pawtes
          </p>
        </div>

        {/* Warning Banner */}
        <Card className="mb-6 border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <h3 className="font-semibold text-amber-900 mb-1">
                  Environnement de développement
                </h3>
                <p className="text-sm text-amber-800">
                  Ces outils sont destinés au développement et au débogage uniquement. 
                  Ils ne doivent pas être utilisés en production.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tools Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Card
                key={tool.path}
                className={`transition-all hover:shadow-lg ${
                  tool.disabled 
                    ? "opacity-50 cursor-not-allowed" 
                    : "hover:scale-105 cursor-pointer"
                } ${tool.borderColor}`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div
                      className={`p-3 rounded-xl ${tool.bgColor} ${tool.borderColor} border`}
                    >
                      <Icon className={`h-6 w-6 ${tool.color}`} />
                    </div>
                    {tool.disabled && (
                      <span className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground">
                        Bientôt
                      </span>
                    )}
                  </div>
                  <CardTitle className="mt-4">{tool.title}</CardTitle>
                  <CardDescription>{tool.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  {tool.disabled ? (
                    <Button variant="outline" disabled className="w-full">
                      Indisponible
                    </Button>
                  ) : (
                    <Link to={tool.path} className="block">
                      <Button variant="default" className="w-full">
                        Ouvrir
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
            <CardDescription>
              Raccourcis vers les opérations courantes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Link to="/debug/test-accounts">
                <Button variant="outline" size="sm">
                  <Users className="h-4 w-4 mr-2" />
                  Créer comptes de test
                </Button>
              </Link>
              <Link to="/debug/health">
                <Button variant="outline" size="sm">
                  <Activity className="h-4 w-4 mr-2" />
                  Vérifier santé API
                </Button>
              </Link>
              <Link to="/">
                <Button variant="outline" size="sm">
                  Retour à l'accueil
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Documentation */}
        <Card className="mt-6 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-900">📚 Documentation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-blue-800">
              <p>
                <strong>Health Check :</strong> Teste les endpoints critiques (profile, dogs, subscription)
              </p>
              <p>
                <strong>Comptes de Test :</strong> Génère automatiquement des comptes admin, modérateur et utilisateurs standard
              </p>
              <p>
                <strong>Pour accéder à l'admin :</strong> Créez les comptes de test puis connectez-vous avec <code className="bg-blue-100 px-2 py-1 rounded">test.admin@pawtes.app</code>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
