import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { 
  Bell, 
  Shield, 
  Palette, 
  User, 
  HelpCircle,
  ChevronRight,
  LogOut,
  Trash2,
  MessageSquare,
  Users,
  MapPin,
  AlertTriangle,
  Eye,
  Locate,
  Globe,
  Moon,
  Vibrate,
  Type,
  Mail,
  Lock,
  Download,
  LifeBuoy,
  FileQuestion
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Settings() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { toast } = useToast();

  // Notification preferences state
  const [notifMessages, setNotifMessages] = useState(true);
  const [notifMatches, setNotifMatches] = useState(true);
  const [notifWalks, setNotifWalks] = useState(true);
  const [notifEvents, setNotifEvents] = useState(true);
  const [notifLostDog, setNotifLostDog] = useState(true);

  // Privacy preferences state
  const [profilePublic, setProfilePublic] = useState(true);
  const [shareDistance, setShareDistance] = useState(true);
  const [allowFriendRequests, setAllowFriendRequests] = useState(true);
  const [geolocEnabled, setGeolocEnabled] = useState(true);

  // App preferences state
  const [vibrationEnabled, setVibrationEnabled] = useState(true);

  const handleLogout = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de se déconnecter",
        variant: "destructive",
      });
    } else {
      toast({
        title: "À bientôt !",
        description: "Tu as été déconnecté avec succès",
      });
      navigate("/login");
    }
  };

  const handleDeleteAccount = () => {
    toast({
      title: "Fonctionnalité à venir",
      description: "La suppression de compte sera disponible prochainement",
    });
  };

  return (
    <div className="min-h-screen pb-24" style={{ background: "linear-gradient(135deg, #FFE4C4 0%, #FFD1E8 30%, #E6DBFF 100%)" }}>
      <div className="mx-auto max-w-3xl px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 text-foreground" style={{ fontFamily: "Fredoka" }}>
            Paramètres
          </h1>
          <p className="text-lg text-muted-foreground">
            Gère ton compte, tes préférences et ta confidentialité
          </p>
        </div>

        <div className="space-y-6">
          {/* Notifications Section */}
          <Card className="rounded-3xl shadow-soft">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-2xl flex items-center justify-center"
                  style={{ background: "var(--brand-raspberry)" }}
                >
                  <Bell className="w-5 h-5 text-white" />
                </div>
                <CardTitle>Notifications</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <MessageSquare className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <Label htmlFor="notif-messages" className="font-medium cursor-pointer">
                      Messages
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Alerte quand tu reçois un message
                    </p>
                  </div>
                </div>
                <Switch
                  id="notif-messages"
                  checked={notifMessages}
                  onCheckedChange={setNotifMessages}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <Users className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <Label htmlFor="notif-matches" className="font-medium cursor-pointer">
                      Nouveaux amis / matches
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Quand un nouveau match est créé
                    </p>
                  </div>
                </div>
                <Switch
                  id="notif-matches"
                  checked={notifMatches}
                  onCheckedChange={setNotifMatches}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <Label htmlFor="notif-walks" className="font-medium cursor-pointer">
                      Balades proches
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Quand une balade est créée dans ta zone
                    </p>
                  </div>
                </div>
                <Switch
                  id="notif-walks"
                  checked={notifWalks}
                  onCheckedChange={setNotifWalks}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <Bell className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <Label htmlFor="notif-events" className="font-medium cursor-pointer">
                      Événements nouveaux
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Découvre les nouveaux événements
                    </p>
                  </div>
                </div>
                <Switch
                  id="notif-events"
                  checked={notifEvents}
                  onCheckedChange={setNotifEvents}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  <div>
                    <Label htmlFor="notif-lost-dog" className="font-medium cursor-pointer text-destructive">
                      Alerte chien perdu ⚠️
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Activer les alertes prioritaires locales
                    </p>
                  </div>
                </div>
                <Switch
                  id="notif-lost-dog"
                  checked={notifLostDog}
                  onCheckedChange={setNotifLostDog}
                />
              </div>
            </CardContent>
          </Card>

          {/* Privacy Section */}
          <Card className="rounded-3xl shadow-soft">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-2xl flex items-center justify-center"
                  style={{ background: "var(--brand-raspberry)" }}
                >
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <CardTitle>Confidentialité</CardTitle>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Tu contrôles ici ce que les autres utilisateurs peuvent voir
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <Eye className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <Label htmlFor="profile-public" className="font-medium cursor-pointer">
                      Profil visible publiquement
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Si désactivé, seuls tes amis peuvent voir ton profil
                    </p>
                  </div>
                </div>
                <Switch
                  id="profile-public"
                  checked={profilePublic}
                  onCheckedChange={setProfilePublic}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <Label htmlFor="share-distance" className="font-medium cursor-pointer">
                      Partager ma distance approximative
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Les autres voient la distance qui vous sépare
                    </p>
                  </div>
                </div>
                <Switch
                  id="share-distance"
                  checked={shareDistance}
                  onCheckedChange={setShareDistance}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <Users className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <Label htmlFor="friend-requests" className="font-medium cursor-pointer">
                      Autoriser les demandes d'amis
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      D'autres utilisateurs peuvent t'envoyer des invitations
                    </p>
                  </div>
                </div>
                <Switch
                  id="friend-requests"
                  checked={allowFriendRequests}
                  onCheckedChange={setAllowFriendRequests}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <Locate className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <Label htmlFor="geoloc" className="font-medium cursor-pointer">
                      Activer la géolocalisation
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Requiert la permission système
                    </p>
                  </div>
                </div>
                <Switch
                  id="geoloc"
                  checked={geolocEnabled}
                  onCheckedChange={setGeolocEnabled}
                />
              </div>
            </CardContent>
          </Card>

          {/* App Preferences Section */}
          <Card className="rounded-3xl shadow-soft">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-2xl flex items-center justify-center"
                  style={{ background: "var(--brand-raspberry)" }}
                >
                  <Palette className="w-5 h-5 text-white" />
                </div>
                <CardTitle>Préférences</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <button 
                className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-muted/50 transition-colors"
                onClick={() => toast({ title: "Fonctionnalité à venir", description: "Le changement de langue sera disponible prochainement" })}
              >
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-muted-foreground" />
                  <span className="font-medium">Langue</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Français</span>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </button>

              <button 
                className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-muted/50 transition-colors"
                onClick={() => toast({ title: "Fonctionnalité à venir", description: "Le changement de thème sera disponible prochainement" })}
              >
                <div className="flex items-center gap-3">
                  <Moon className="w-5 h-5 text-muted-foreground" />
                  <span className="font-medium">Thème</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Clair</span>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </button>

              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <Vibrate className="w-5 h-5 text-muted-foreground" />
                  <span className="font-medium">Vibration / feedback haptique</span>
                </div>
                <Switch
                  checked={vibrationEnabled}
                  onCheckedChange={setVibrationEnabled}
                />
              </div>

              <button 
                className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-muted/50 transition-colors"
                onClick={() => toast({ title: "Fonctionnalité à venir", description: "Le réglage de la taille du texte sera disponible prochainement" })}
              >
                <div className="flex items-center gap-3">
                  <Type className="w-5 h-5 text-muted-foreground" />
                  <span className="font-medium">Taille du texte</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Normal</span>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </button>
            </CardContent>
          </Card>

          {/* Account Section */}
          <Card className="rounded-3xl shadow-soft">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-2xl flex items-center justify-center"
                  style={{ background: "var(--brand-raspberry)" }}
                >
                  <User className="w-5 h-5 text-white" />
                </div>
                <CardTitle>Compte</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <button 
                className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-muted/50 transition-colors"
                onClick={() => toast({ title: "Fonctionnalité à venir", description: "La modification d'email sera disponible prochainement" })}
              >
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                  <span className="font-medium">Modifier mon email</span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>

              <button 
                className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-muted/50 transition-colors"
                onClick={() => toast({ title: "Fonctionnalité à venir", description: "La modification du mot de passe sera disponible prochainement" })}
              >
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-muted-foreground" />
                  <span className="font-medium">Modifier mon mot de passe</span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>

              <button 
                className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-muted/50 transition-colors"
                onClick={() => toast({ title: "Fonctionnalité à venir", description: "L'export de données (RGPD) sera disponible prochainement" })}
              >
                <div className="flex items-center gap-3">
                  <Download className="w-5 h-5 text-muted-foreground" />
                  <span className="font-medium">Télécharger mes données (RGPD)</span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            </CardContent>
          </Card>

          {/* Help & Support Section */}
          <Card className="rounded-3xl shadow-soft">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-2xl flex items-center justify-center"
                  style={{ background: "var(--brand-raspberry)" }}
                >
                  <HelpCircle className="w-5 h-5 text-white" />
                </div>
                <CardTitle>Aide & Support</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <button 
                className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-muted/50 transition-colors"
                onClick={() => toast({ title: "Fonctionnalité à venir", description: "Le centre d'aide sera disponible prochainement" })}
              >
                <div className="flex items-center gap-3">
                  <LifeBuoy className="w-5 h-5 text-muted-foreground" />
                  <span className="font-medium">Centre d'aide</span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>

              <button 
                className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-muted/50 transition-colors"
                onClick={() => toast({ title: "Fonctionnalité à venir", description: "Le signalement de problème sera disponible prochainement" })}
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-muted-foreground" />
                  <span className="font-medium">Signaler un problème</span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>

              <button 
                className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-muted/50 transition-colors"
                onClick={() => toast({ title: "Fonctionnalité à venir", description: "Le contact support sera disponible prochainement" })}
              >
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-muted-foreground" />
                  <span className="font-medium">Contacter le support</span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>

              <button 
                className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-muted/50 transition-colors"
                onClick={() => toast({ title: "Fonctionnalité à venir", description: "La FAQ sera disponible prochainement" })}
              >
                <div className="flex items-center gap-3">
                  <FileQuestion className="w-5 h-5 text-muted-foreground" />
                  <span className="font-medium">FAQ</span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card 
            className="rounded-3xl shadow-soft border-2"
            style={{ 
              background: "linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)",
              borderColor: "#FCA5A5"
            }}
          >
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone 🔥</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                variant="outline"
                className="w-full rounded-2xl border-destructive text-destructive hover:bg-destructive hover:text-white"
                onClick={handleLogout}
              >
                <LogOut className="w-5 h-5 mr-2" />
                Déconnexion
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="w-full rounded-2xl"
                  >
                    <Trash2 className="w-5 h-5 mr-2" />
                    Supprimer mon compte
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-3xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Cette action est permanente. Toutes tes données seront définitivement supprimées
                      et tu ne pourras pas récupérer ton compte.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-2xl">Annuler</AlertDialogCancel>
                    <AlertDialogAction 
                      className="rounded-2xl bg-destructive hover:bg-destructive/90"
                      onClick={handleDeleteAccount}
                    >
                      Supprimer définitivement
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <p className="text-sm text-muted-foreground text-center">
                Cette action est permanente. Toutes tes données seront supprimées.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
