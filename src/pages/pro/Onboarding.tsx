import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building, Mail, Phone, Link2, MapPin, Upload } from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = [
  { value: 'vet', label: 'Vétérinaire' },
  { value: 'toiletteur', label: 'Toiletteur' },
  { value: 'educateur', label: 'Éducateur canin' },
  { value: 'sitter', label: 'Pet-sitter / Promeneur' },
  { value: 'pension', label: 'Pension / Garde' },
  { value: 'marque', label: 'Marque / Boutique' },
  { value: 'autre', label: 'Autre' },
];

export default function ProOnboarding() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    business_name: '',
    category: '',
    description: '',
    website: '',
    phone: '',
    email: '',
    address: '',
    lat: '',
    lng: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      // Create pro profile
      const { error } = await supabase
        .from('pro_profiles')
        .insert({
          user_id: user.id,
          business_name: formData.business_name,
          activity: formData.category,
          description: formData.description || null,
          website: formData.website || null,
          phone: formData.phone || null,
          email: formData.email || null,
          city: formData.address || null,
          lat: formData.lat ? parseFloat(formData.lat) : null,
          lng: formData.lng ? parseFloat(formData.lng) : null,
          is_published: false, // Draft by default
        });

      if (error) throw error;

      toast.success('Profil professionnel créé ! Vous pouvez maintenant le personnaliser.');
      navigate('/pro/home');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erreur lors de la création du profil');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #FFE4C4 0%, #FFD1E8 30%, #E6DBFF 100%)" }}>
      <div className="mx-auto max-w-3xl px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 text-foreground">
            Devenir Partenaire Certifié
          </h1>
          <p className="text-muted-foreground">
            Rejoignez le réseau de professionnels de confiance Whoof
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-soft space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="business_name" className="flex items-center gap-2">
                <Building className="w-4 h-4" />
                Nom de l'établissement *
              </Label>
              <Input
                id="business_name"
                required
                value={formData.business_name}
                onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                placeholder="Mon cabinet vétérinaire"
                className="rounded-2xl"
              />
            </div>

            <div>
              <Label htmlFor="category">Catégorie *</Label>
              <Select
                required
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger className="rounded-2xl">
                  <SelectValue placeholder="Sélectionnez une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Présentez votre établissement, vos services..."
                rows={4}
                className="rounded-2xl"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contact@exemple.fr"
                  className="rounded-2xl"
                />
              </div>

              <div>
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Téléphone
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="01 23 45 67 89"
                  className="rounded-2xl"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="website" className="flex items-center gap-2">
                <Link2 className="w-4 h-4" />
                Site web
              </Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://mon-site.fr"
                className="rounded-2xl"
              />
            </div>

            <div>
              <Label htmlFor="address" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Adresse
              </Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="123 Rue Exemple, 75001 Paris"
                className="rounded-2xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="lat">Latitude (optionnel)</Label>
                <Input
                  id="lat"
                  type="number"
                  step="any"
                  value={formData.lat}
                  onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                  placeholder="48.8566"
                  className="rounded-2xl"
                />
              </div>
              <div>
                <Label htmlFor="lng">Longitude (optionnel)</Label>
                <Input
                  id="lng"
                  type="number"
                  step="any"
                  value={formData.lng}
                  onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                  placeholder="2.3522"
                  className="rounded-2xl"
                />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              className="w-full rounded-2xl"
              disabled={isLoading}
              style={{ backgroundColor: "var(--brand-plum)" }}
            >
              <Building className="mr-2 h-5 w-5" />
              {isLoading ? 'Envoi en cours...' : 'Devenir partenaire certifié'}
            </Button>
          </div>

          <p className="text-sm text-center text-muted-foreground">
            Nous vérifions votre fiche sous 48h ⚡
          </p>
        </form>
      </div>
    </div>
  );
}
