import { Navigate, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyProProfile, useProStats } from "@/hooks/usePro";
import { 
  Briefcase, 
  Eye, 
  MousePointer, 
  MessageSquare, 
  Star, 
  Settings, 
  Gift,
  HelpCircle,
  TrendingUp,
  MapPin,
  Calendar,
  Users
} from "lucide-react";

export default function ProHome() {
  const { data: profile, isLoading } = useMyProProfile();
  const { data: stats } = useProStats(profile?.id);

  // Redirect to pro onboarding if no profile
  if (!isLoading && !profile) {
    return <Navigate to="/pro/onboarding" replace />;
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-6xl">
      {/* Header Card */}
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile?.logo_url || undefined} />
              <AvatarFallback>
                <Briefcase className="h-10 w-10" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold">{profile?.business_name}</h1>
                {profile?.verified && (
                  <Badge variant="secondary">
                    <Star className="h-3 w-3 mr-1" />
                    Vérifié
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground capitalize">{profile?.activity}</p>
              {profile?.city && (
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin className="h-3 w-3" />
                  {profile.city}
                </p>
              )}
              {!profile?.is_published && (
                <Badge variant="outline" className="mt-2">
                  Brouillon - Non publié
                </Badge>
              )}
            </div>
            <Button asChild>
              <Link to="/pro/edit">
                <Settings className="h-4 w-4 mr-2" />
                Modifier
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats - Priorités principales */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">RDV aujourd'hui</CardTitle>
            <Calendar className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">2</div>
            <p className="text-xs text-muted-foreground mt-1">
              Rendez-vous prévus
            </p>
            <Button variant="link" className="p-0 h-auto mt-2" asChild>
              <Link to="/pro/agenda">Voir l'agenda →</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nouveaux messages</CardTitle>
            <MessageSquare className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{stats?.unread || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Messages non lus
            </p>
            <Button variant="link" className="p-0 h-auto mt-2" asChild>
              <Link to="/pro/messages">Lire les messages →</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clients ce mois</CardTitle>
            <Users className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">3</div>
            <p className="text-xs text-muted-foreground mt-1">
              Nouveaux clients
            </p>
            <Button variant="link" className="p-0 h-auto mt-2" asChild>
              <Link to="/pro/stats">Voir les stats →</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vues du profil</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.views || 0}</div>
            <p className="text-xs text-muted-foreground">
              Visiteurs ce mois
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clics</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.clicks || 0}</div>
            <p className="text-xs text-muted-foreground">
              Sur votre site web
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.unread || 0}</div>
            <p className="text-xs text-muted-foreground">
              Non lus
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Link to="/pro/messages">
          <Card className="cursor-pointer hover:border-primary transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Messagerie
              </CardTitle>
              <CardDescription>
                Répondez aux demandes de vos clients
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link to="/pro/partners">
          <Card className="cursor-pointer hover:border-primary transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Partenariats
              </CardTitle>
              <CardDescription>
                Découvrez les opportunités de collaboration
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Card className="cursor-pointer hover:border-primary transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Promouvoir mon activité
            </CardTitle>
            <CardDescription>
              Passez à un compte premium pour plus de visibilité
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:border-primary transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Support Whoof
            </CardTitle>
            <CardDescription>
              Besoin d'aide ? Contactez notre équipe
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Business Info */}
      {profile?.description && (
        <Card>
          <CardHeader>
            <CardTitle>À propos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {profile.description}
            </p>
            {profile.tags && profile.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {profile.tags.map((tag, i) => (
                  <Badge key={i} variant="outline">{tag}</Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
