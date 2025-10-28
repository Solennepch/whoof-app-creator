import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building, MapPin, Phone, Mail, Link2, ArrowLeft, Calendar } from "lucide-react";

interface Partnership {
  id: string;
  title: string;
  offer: string;
  start_date?: string;
  end_date?: string;
  pro_id: string;
}

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
  contact_public: boolean;
}

export default function PartenariatDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [partnership, setPartnership] = useState<Partnership | null>(null);
  const [pro, setPro] = useState<ProAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        // Load all partnerships
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/partnerships-public`
        );

        if (!response.ok) {
          throw new Error('Failed to load partnership');
        }

        const partnerships = await response.json();
        const foundPartnership = partnerships.find((p: any) => p.id === id);
        
        if (!foundPartnership) {
          throw new Error('Partnership not found');
        }

        setPartnership(foundPartnership);

        // Load pro account
        const proResponse = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/pro-public/${foundPartnership.pro_id}`
        );

        if (proResponse.ok) {
          const proData = await proResponse.json();
          setPro(proData);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    }

    if (id) {
      loadData();
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #FFE4C4 0%, #FFD1E8 30%, #E6DBFF 100%)" }}>
        <div className="animate-pulse text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  if (!partnership) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #FFE4C4 0%, #FFD1E8 30%, #E6DBFF 100%)" }}>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Offre non trouvée</h2>
          <Button onClick={() => navigate('/partenariats')} className="rounded-2xl">
            Retour aux offres
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
          onClick={() => navigate('/partenariats')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>

        <div className="grid gap-6">
          {/* Partnership Card */}
          <Card className="p-8 rounded-2xl shadow-soft">
            <div className="flex items-start gap-6 mb-6">
              {pro?.logo_url && (
                <img
                  src={pro.logo_url}
                  alt={pro.business_name}
                  className="w-24 h-24 rounded-2xl object-cover"
                />
              )}
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">
                  {partnership.title}
                </h1>
                {pro && (
                  <>
                    <p className="text-lg text-muted-foreground mb-2">
                      par {pro.business_name}
                    </p>
                    <Badge>{pro.category}</Badge>
                  </>
                )}
              </div>
            </div>

            {/* Dates */}
            {(partnership.start_date || partnership.end_date) && (
              <div className="flex items-center gap-2 text-muted-foreground mb-6 p-4 rounded-xl bg-muted/30">
                <Calendar className="w-5 h-5" />
                <span>
                  {partnership.start_date && `Du ${new Date(partnership.start_date).toLocaleDateString()}`}
                  {partnership.start_date && partnership.end_date && ' '}
                  {partnership.end_date && `au ${new Date(partnership.end_date).toLocaleDateString()}`}
                </span>
              </div>
            )}

            {/* Offer Details */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3" style={{ fontFamily: "Fredoka" }}>
                L'offre
              </h2>
              <p className="text-muted-foreground whitespace-pre-line text-lg">
                {partnership.offer}
              </p>
            </div>

            {/* CTA */}
            <div className="pt-6 border-t">
              <Button
                className="w-full rounded-2xl text-lg py-6"
                style={{ backgroundColor: "var(--brand-raspberry)" }}
                onClick={() => {
                  if (pro) {
                    navigate(`/annuaire/${pro.id}`);
                  }
                }}
              >
                Contacter le partenaire
              </Button>
            </div>
          </Card>

          {/* Pro Info Card */}
          {pro && (
            <Card className="p-6 rounded-2xl shadow-soft">
              <h2 className="text-xl font-semibold mb-4" style={{ fontFamily: "Fredoka" }}>
                À propos du partenaire
              </h2>
              
              {pro.description && (
                <p className="text-muted-foreground mb-4">
                  {pro.description}
                </p>
              )}

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

              <Button
                variant="outline"
                className="w-full mt-6 rounded-2xl"
                onClick={() => navigate(`/annuaire/${pro.id}`)}
              >
                Voir la fiche complète
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
