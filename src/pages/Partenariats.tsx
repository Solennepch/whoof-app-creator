import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Percent, Calendar, ExternalLink, Building } from "lucide-react";

interface Partnership {
  id: string;
  title: string;
  offer: string;
  start_date?: string;
  end_date?: string;
  pro_accounts: {
    id: string;
    business_name: string;
    category: string;
    logo_url?: string;
  };
}

export default function Partenariats() {
  const navigate = useNavigate();
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadPartnerships() {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/partnerships-public`
        );

        if (!response.ok) {
          throw new Error('Failed to load partnerships');
        }

        const data = await response.json();
        setPartnerships(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadPartnerships();
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--paper)" }}>
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl"
              style={{
                background: "linear-gradient(135deg, var(--brand-raspberry) 0%, var(--brand-yellow) 100%)",
              }}
            >
              <Percent className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-2" style={{ color: "var(--ink)", fontFamily: "Fredoka" }}>
            Offres Partenaires
          </h1>
          <p className="text-lg text-muted-foreground">
            Profitez d'avantages exclusifs avec nos partenaires de confiance
          </p>
        </div>

        {/* Partnerships Grid */}
        {isLoading ? (
          <div className="text-center text-muted-foreground">Chargement...</div>
        ) : partnerships.length === 0 ? (
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Aucune offre disponible pour le moment</p>
            <p className="text-sm text-muted-foreground">
              Les partenaires Whoof ajouteront bientôt des offres exclusives !
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {partnerships.map((partnership) => (
              <Card
                key={partnership.id}
                className="p-6 rounded-2xl shadow-soft hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/partenariats/${partnership.id}`)}
              >
                {/* Partner Logo */}
                {partnership.pro_accounts.logo_url && (
                  <div className="mb-4">
                    <img
                      src={partnership.pro_accounts.logo_url}
                      alt={partnership.pro_accounts.business_name}
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                  </div>
                )}

                {/* Title */}
                <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "Fredoka" }}>
                  {partnership.title}
                </h3>

                {/* Partner Name */}
                <div className="flex items-center gap-2 mb-3">
                  <Building className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {partnership.pro_accounts.business_name}
                  </span>
                </div>

                {/* Category Badge */}
                <Badge variant="outline" className="mb-3">
                  {partnership.pro_accounts.category}
                </Badge>

                {/* Offer Preview */}
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                  {partnership.offer}
                </p>

                {/* Dates */}
                {(partnership.start_date || partnership.end_date) && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                    <Calendar className="w-3 h-3" />
                    {partnership.start_date && (
                      <span>Du {new Date(partnership.start_date).toLocaleDateString()}</span>
                    )}
                    {partnership.end_date && (
                      <span>au {new Date(partnership.end_date).toLocaleDateString()}</span>
                    )}
                  </div>
                )}

                {/* CTA */}
                <Button
                  className="w-full rounded-2xl"
                  style={{ backgroundColor: "var(--brand-raspberry)" }}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Voir l'offre
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
