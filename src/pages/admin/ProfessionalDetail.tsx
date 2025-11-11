import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  Save, 
  CheckCircle, 
  XCircle,
  Eye,
  EyeOff,
  Mail,
  Phone,
  MapPin,
  Globe,
  Building,
  Clock,
  Euro
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface ProProfile {
  id: string;
  user_id: string;
  business_name: string;
  activity: string;
  description: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  logo_url: string | null;
  city: string | null;
  verified: boolean | null;
  is_published: boolean | null;
  siret: string | null;
  tags: string[] | null;
  created_at: string | null;
  updated_at: string | null;
}

export default function AdminProfessionalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pro, setPro] = useState<ProProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    business_name: '',
    activity: '',
    description: '',
    email: '',
    phone: '',
    website: '',
    city: '',
    siret: '',
  });

  useEffect(() => {
    if (id) {
      loadPro();
    }
  }, [id]);

  const loadPro = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pro_profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      setPro(data);
      setFormData({
        business_name: data.business_name || '',
        activity: data.activity || '',
        description: data.description || '',
        email: data.email || '',
        phone: data.phone || '',
        website: data.website || '',
        city: data.city || '',
        siret: data.siret || '',
      });
    } catch (error) {
      console.error('Error loading professional:', error);
      toast.error("Erreur lors du chargement du professionnel");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('pro_profiles')
        .update({
          ...formData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      toast.success("Modifications enregistrées");
      loadPro();
    } catch (error) {
      console.error('Error saving:', error);
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  const handleVerify = async (verify: boolean) => {
    try {
      const { error } = await supabase
        .from('pro_profiles')
        .update({ verified: verify })
        .eq('id', id);

      if (error) throw error;

      toast.success(verify ? "Professionnel vérifié" : "Vérification retirée");
      loadPro();
    } catch (error) {
      console.error('Error updating verification:', error);
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const handlePublish = async (publish: boolean) => {
    try {
      const { error } = await supabase
        .from('pro_profiles')
        .update({ is_published: publish })
        .eq('id', id);

      if (error) throw error;

      toast.success(publish ? "Profil publié" : "Profil dépublié");
      loadPro();
    } catch (error) {
      console.error('Error updating publication status:', error);
      toast.error("Erreur lors de la mise à jour");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!pro) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">
              Professionnel non trouvé
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/professionals')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{pro.business_name}</h1>
            <p className="text-muted-foreground">Gestion du profil professionnel</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </div>

      {/* Status and Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Statut et Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Vérification:</span>
              <Badge variant={pro.verified ? "default" : "secondary"}>
                {pro.verified ? (
                  <><CheckCircle className="h-3 w-3 mr-1" /> Vérifié</>
                ) : (
                  <><XCircle className="h-3 w-3 mr-1" /> Non vérifié</>
                )}
              </Badge>
              {!pro.verified ? (
                <Button size="sm" onClick={() => handleVerify(true)}>
                  Vérifier
                </Button>
              ) : (
                <Button size="sm" variant="outline" onClick={() => handleVerify(false)}>
                  Retirer vérification
                </Button>
              )}
            </div>

            <Separator orientation="vertical" className="h-6" />

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Publication:</span>
              <Badge variant={pro.is_published ? "default" : "outline"}>
                {pro.is_published ? (
                  <><Eye className="h-3 w-3 mr-1" /> Publié</>
                ) : (
                  <><EyeOff className="h-3 w-3 mr-1" /> Non publié</>
                )}
              </Badge>
              {!pro.is_published ? (
                <Button size="sm" variant="secondary" onClick={() => handlePublish(true)}>
                  Publier
                </Button>
              ) : (
                <Button size="sm" variant="ghost" onClick={() => handlePublish(false)}>
                  Dépublier
                </Button>
              )}
            </div>

            <Separator orientation="vertical" className="h-6" />

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Créé le {pro.created_at && format(new Date(pro.created_at), 'dd MMMM yyyy', { locale: fr })}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column - Avatar and basic info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Logo</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <Avatar className="h-32 w-32">
                <AvatarImage src={pro.logo_url || undefined} />
                <AvatarFallback className="text-2xl">
                  {pro.business_name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Button variant="outline" size="sm">
                Modifier le logo
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">SIRET:</span>
                <span>{pro.siret || 'Non renseigné'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{pro.activity}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column - Editable fields */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations générales</CardTitle>
              <CardDescription>Modifier les informations du professionnel</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="business_name">Nom de l'entreprise *</Label>
                  <Input
                    id="business_name"
                    value={formData.business_name}
                    onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="activity">Activité *</Label>
                  <Input
                    id="activity"
                    value={formData.activity}
                    onChange={(e) => setFormData({ ...formData, activity: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    <Mail className="h-4 w-4 inline mr-1" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">
                    <Phone className="h-4 w-4 inline mr-1" />
                    Téléphone
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">
                    <Globe className="h-4 w-4 inline mr-1" />
                    Site web
                  </Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">
                    <MapPin className="h-4 w-4 inline mr-1" />
                    Ville
                  </Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="siret">SIRET</Label>
                  <Input
                    id="siret"
                    value={formData.siret}
                    onChange={(e) => setFormData({ ...formData, siret: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  rows={6}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Présentez votre entreprise et vos services..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Services and Pricing - Placeholder for future implementation */}
          <Card>
            <CardHeader>
              <CardTitle>Services et Tarifs</CardTitle>
              <CardDescription>À implémenter : gestion des services, tarifs et horaires</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Euro className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Fonctionnalité à venir</p>
              </div>
            </CardContent>
          </Card>

          {/* Change History - Placeholder for future implementation */}
          <Card>
            <CardHeader>
              <CardTitle>Historique des modifications</CardTitle>
              <CardDescription>À implémenter : suivi des changements effectués</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Fonctionnalité à venir</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
