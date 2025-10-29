import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMyProProfile, useUpsertProProfile } from "@/hooks/usePro";
import { Skeleton } from "@/components/ui/skeleton";
import { Save, ArrowLeft } from "lucide-react";

const ACTIVITIES = [
  { value: 'vet', label: 'Vétérinaire' },
  { value: 'sitter', label: 'Pet-sitter / Promeneur' },
  { value: 'toiletteur', label: 'Toiletteur' },
  { value: 'educateur', label: 'Éducateur canin' },
  { value: 'pension', label: 'Pension / Garde' },
  { value: 'marque', label: 'Marque / Boutique' },
  { value: 'autre', label: 'Autre' },
];

export default function ProEdit() {
  const navigate = useNavigate();
  const { data: profile, isLoading } = useMyProProfile();
  const upsertProfile = useUpsertProProfile();

  const [formData, setFormData] = useState({
    business_name: profile?.business_name || '',
    activity: profile?.activity || 'autre',
    siret: profile?.siret || '',
    city: profile?.city || '',
    description: profile?.description || '',
    website: profile?.website || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    radius_km: profile?.radius_km || 25,
    tags: profile?.tags?.join(', ') || '',
    is_published: profile?.is_published || false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await upsertProfile.mutateAsync({
      ...formData,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
    });

    navigate('/pro/home');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6 max-w-4xl">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/pro/home')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Modifier mon profil</h1>
          <p className="text-muted-foreground">
            Complétez vos informations professionnelles
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info">Informations</TabsTrigger>
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="contact">Coordonnées</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informations générales</CardTitle>
                <CardDescription>
                  Les informations de base de votre activité
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="business_name">Nom de l'entreprise *</Label>
                  <Input
                    id="business_name"
                    value={formData.business_name}
                    onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="activity">Activité *</Label>
                  <Select value={formData.activity} onValueChange={(value) => setFormData({ ...formData, activity: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ACTIVITIES.map((act) => (
                        <SelectItem key={act.value} value={act.value}>
                          {act.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">Ville</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="siret">SIRET (optionnel)</Label>
                  <Input
                    id="siret"
                    value={formData.siret}
                    onChange={(e) => setFormData({ ...formData, siret: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="radius_km">Rayon d'activité (km)</Label>
                  <Input
                    id="radius_km"
                    type="number"
                    min="5"
                    max="100"
                    value={formData.radius_km}
                    onChange={(e) => setFormData({ ...formData, radius_km: parseInt(e.target.value) })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="description" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Description de votre activité</CardTitle>
                <CardDescription>
                  Présentez vos services et votre expertise
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    rows={8}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Décrivez votre activité, vos services, vos horaires..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Spécialités / Tags</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="Toilettage, Garde, Éducation (séparés par des virgules)"
                  />
                  <p className="text-xs text-muted-foreground">
                    Séparez vos spécialités par des virgules
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Coordonnées</CardTitle>
                <CardDescription>
                  Comment les utilisateurs peuvent vous contacter
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email professionnel</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Site web</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://..."
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="is_published">Publier dans l'annuaire</Label>
                    <p className="text-sm text-muted-foreground">
                      Votre profil sera visible par tous les utilisateurs
                    </p>
                  </div>
                  <Switch
                    id="is_published"
                    checked={formData.is_published}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-4 mt-6">
          <Button type="button" variant="outline" onClick={() => navigate('/pro/home')}>
            Annuler
          </Button>
          <Button type="submit" disabled={upsertProfile.isPending}>
            <Save className="h-4 w-4 mr-2" />
            {upsertProfile.isPending ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </form>
    </div>
  );
}
