import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building, MapPin, Phone, Mail, Link2, ArrowLeft } from "lucide-react";

interface ProAccount {
  id: string;
  business_name: string;
  category: string;
  description?: string;
  website?: string;
  phone?: string;
  email?: string;
  address?: string;
  logo_url?: string;
  gallery_urls?: string[];
  contact_public: boolean;
}

export default function AnnuaireDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pro, setPro] = useState<ProAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadPro() {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/pro-public/${id}`
        );

        if (!response.ok) {
          throw new Error('Pro not found');
        }

        const data = await response.json();
        setPro(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    }

    if (id) {
      loadPro();
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #FFE4C4 0%, #FFD1E8 30%, #E6DBFF 100%)" }}>
        <div className="animate-pulse text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  if (!pro) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #FFE4C4 0%, #FFD1E8 30%, #E6DBFF 100%)" }}>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Professionnel non trouvé</h2>
          <Button onClick={() => navigate('/annuaire')} className="rounded-2xl">
            Retour à l'annuaire
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #FFE4C4 0%, #FFD1E8 30%, #E6DBFF 100%)" }}>
      <div className="mx-auto max-w-4xl px-4 py-8">
        <Button
          variant="ghost"
          className="mb-4 rounded-2xl"
          onClick={() => navigate('/annuaire')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>

        <Card className="p-8 rounded-2xl shadow-soft">
          {/* Header */}
          <div className="flex items-start gap-6 mb-6">
            {pro.logo_url && (
              <img
                src={pro.logo_url}
                alt={pro.business_name}
                className="w-24 h-24 rounded-2xl object-cover"
              />
            )}
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "Fredoka" }}>
                {pro.business_name}
              </h1>
              <Badge className="mb-3">{pro.category}</Badge>
            </div>
          </div>

          {/* Description */}
          {pro.description && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3" style={{ fontFamily: "Fredoka" }}>
                À propos
              </h2>
              <p className="text-muted-foreground whitespace-pre-line">
                {pro.description}
              </p>
            </div>
          )}

          {/* Contact Info */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3" style={{ fontFamily: "Fredoka" }}>
              Coordonnées
            </h2>
            <div className="space-y-3">
              {pro.address && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <MapPin className="w-5 h-5" />
                  <span>{pro.address}</span>
                </div>
              )}
              {pro.contact_public && pro.phone && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Phone className="w-5 h-5" />
                  <a href={`tel:${pro.phone}`} className="hover:underline">
                    {pro.phone}
                  </a>
                </div>
              )}
              {pro.contact_public && pro.email && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Mail className="w-5 h-5" />
                  <a href={`mailto:${pro.email}`} className="hover:underline">
                    {pro.email}
                  </a>
                </div>
              )}
              {pro.website && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Link2 className="w-5 h-5" />
                  <a
                    href={pro.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {pro.website}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Gallery */}
          {pro.gallery_urls && pro.gallery_urls.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-3" style={{ fontFamily: "Fredoka" }}>
                Galerie
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {pro.gallery_urls.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`${pro.business_name} ${index + 1}`}
                    className="w-full h-40 object-cover rounded-xl"
                  />
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="mt-8 pt-6 border-t">
            <Button
              className="w-full rounded-2xl"
              style={{ backgroundColor: "var(--brand-plum)" }}
              onClick={() => {
                if (pro.contact_public && pro.phone) {
                  window.location.href = `tel:${pro.phone}`;
                } else if (pro.website) {
                  window.open(pro.website, '_blank');
                }
              }}
            >
              <Phone className="w-5 h-5 mr-2" />
              Contacter
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
