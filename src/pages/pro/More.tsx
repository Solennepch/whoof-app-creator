import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMyProProfile, useTogglePublish } from "@/hooks/usePro";
import { 
  QrCode, 
  Share2, 
  TrendingUp, 
  HelpCircle, 
  Settings, 
  LogOut,
  Eye,
  EyeOff,
  Loader2,
  ExternalLink,
  FileText,
  Shield
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useState } from "react";

export default function ProMore() {
  const navigate = useNavigate();
  const { data: profile, isLoading } = useMyProProfile();
  const togglePublish = useTogglePublish();
  const [showQR, setShowQR] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Déconnecté");
    navigate("/login");
  };

  const handleTogglePublish = async () => {
    if (!profile) return;
    
    try {
      await togglePublish.mutateAsync({
        proId: profile.id,
        isPublished: !profile.is_published
      });
      toast.success(
        profile.is_published 
          ? "Profil retiré de l'annuaire" 
          : "Profil publié dans l'annuaire"
      );
    } catch (error) {
      console.error('Toggle publish error:', error);
    }
  };

  const shareProfile = async () => {
    const url = `${window.location.origin}/annuaire/${profile?.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: profile?.business_name,
          text: `Découvrez ${profile?.business_name} sur Whoof Apps`,
          url
        });
      } catch (error) {
        // User cancelled
      }
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Lien copié !");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-2xl pb-24">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Plus</h1>
        <p className="text-muted-foreground">
          Gérez votre profil professionnel et vos paramètres
        </p>
      </div>

      {/* Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Statut de publication</CardTitle>
              <CardDescription>
                {profile?.is_published 
                  ? "Votre profil est visible dans l'annuaire"
                  : "Votre profil est en mode brouillon"
                }
              </CardDescription>
            </div>
            {profile?.is_published ? (
              <Badge variant="default">Publié</Badge>
            ) : (
              <Badge variant="outline">Brouillon</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleTogglePublish}
            disabled={togglePublish.isPending}
            variant={profile?.is_published ? "outline" : "default"}
            className="w-full"
          >
            {togglePublish.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : profile?.is_published ? (
              <EyeOff className="h-4 w-4 mr-2" />
            ) : (
              <Eye className="h-4 w-4 mr-2" />
            )}
            {profile?.is_published ? "Retirer de l'annuaire" : "Publier dans l'annuaire"}
          </Button>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="space-y-3">
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => window.open(`/annuaire/${profile?.id}`, '_blank')}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Voir mon profil public
        </Button>

        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={shareProfile}
        >
          <Share2 className="h-4 w-4 mr-2" />
          Partager mon profil
        </Button>

        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => setShowQR(!showQR)}
        >
          <QrCode className="h-4 w-4 mr-2" />
          QR Code
        </Button>

        {showQR && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="bg-white p-4 inline-block rounded-lg">
                  <div className="text-xs text-muted-foreground mb-2">
                    Scanner pour me trouver
                  </div>
                  {/* QR Code would be generated here with a library */}
                  <div className="w-48 h-48 bg-muted flex items-center justify-center">
                    <QrCode className="h-16 w-16 text-muted-foreground" />
                  </div>
                  <p className="text-xs mt-2 text-muted-foreground">
                    {profile?.business_name}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Business Tools */}
      <Card>
        <CardHeader>
          <CardTitle>Outils professionnels</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="ghost" className="w-full justify-start">
            <TrendingUp className="h-4 w-4 mr-2" />
            Promouvoir mon activité
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <FileText className="h-4 w-4 mr-2" />
            Statistiques détaillées
          </Button>
        </CardContent>
      </Card>

      {/* Help & Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Support & Paramètres</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="ghost" className="w-full justify-start">
            <HelpCircle className="h-4 w-4 mr-2" />
            Centre d'aide
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <Settings className="h-4 w-4 mr-2" />
            Paramètres
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <Shield className="h-4 w-4 mr-2" />
            Confidentialité & RGPD
          </Button>
        </CardContent>
      </Card>

      {/* Logout */}
      <Button
        variant="destructive"
        className="w-full"
        onClick={handleLogout}
      >
        <LogOut className="h-4 w-4 mr-2" />
        Déconnexion
      </Button>
    </div>
  );
}