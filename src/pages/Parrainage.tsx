import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Gift, Users, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function Parrainage() {
  const referralCode = "WHOOF-AB12";
  const referralLink = `https://app.whoof.io/i/${referralCode}`;
  const [filleuls] = useState([
    { name: "Sophie M.", date: "15 Jan 2025", xp: 200 },
    { name: "Thomas B.", date: "8 Jan 2025", xp: 200 }
  ]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Rejoins-moi sur Whoof !",
          text: `Utilise mon code ${referralCode} pour rejoindre Whoof et gagner des récompenses !`,
          url: referralLink
        });
        // Track analytics
        console.log('Analytics: share_parrainage');
      } catch (error) {
        console.error('Share failed:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(referralLink);
      toast.success("Lien copié !", {
        icon: <Sparkles className="w-4 h-4 text-accent" />,
        description: "Partage-le avec tes amis pour les parrainer"
      });
      console.log('Analytics: share_parrainage');
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    toast.success("Code copié !", {
      description: "Partage-le avec tes amis"
    });
  };

  return (
    <div className="min-h-screen pb-24" style={{ background: "linear-gradient(135deg, #FFE4C4 0%, #FFD1E8 30%, #E6DBFF 100%)" }}>
      <div className="mx-auto max-w-[720px] px-4 pt-20 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold" style={{ color: "hsl(var(--ink))" }}>
            🎁 Parrainer
          </h1>
          <p className="text-sm mt-2" style={{ color: "hsl(var(--ink) / 0.6)" }}>
            Invite tes amis et gagne des récompenses exclusives
          </p>
        </div>

        {/* Referral Code Card */}
        <Card className="rounded-2xl shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "hsl(var(--brand-plum) / 0.1)" }}
            >
              <Gift className="h-6 w-6" style={{ color: "hsl(var(--brand-plum))" }} />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold" style={{ color: "hsl(var(--ink))" }}>
                Ton code de parrainage
              </h3>
              <p className="text-sm" style={{ color: "hsl(var(--ink) / 0.6)" }}>
                Partage-le avec tes amis
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <code 
              className="flex-1 px-4 py-3 rounded-xl font-mono text-lg font-bold text-center"
              style={{ 
                backgroundColor: "hsl(var(--muted))",
                color: "hsl(var(--brand-plum))"
              }}
            >
              {referralCode}
            </code>
            <Button
              onClick={handleCopyCode}
              variant="outline"
              className="h-11 w-11 p-0 rounded-xl"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>

          <Button
            onClick={handleShare}
            className="w-full h-12 rounded-xl text-white font-medium"
            style={{ backgroundColor: "hsl(var(--brand-plum))" }}
          >
            Partager mon lien
          </Button>
        </Card>

        {/* Rewards Card */}
        <Card className="rounded-2xl shadow-sm p-6 space-y-3">
          <h3 className="text-lg font-semibold" style={{ color: "hsl(var(--ink))" }}>
              <Gift className="w-5 h-5 inline-block mr-2 text-primary" />
              Récompenses
          </h3>
          <ul className="space-y-2">
            <li className="flex items-center gap-3 text-sm">
              <span className="text-xl">⚡</span>
              <span style={{ color: "hsl(var(--ink) / 0.8)" }}>
                <b>+200 XP</b> par filleul inscrit
              </span>
            </li>
            <li className="flex items-center gap-3 text-sm">
              <span className="text-xl">💎</span>
              <span style={{ color: "hsl(var(--ink) / 0.8)" }}>
                Badge <b>"Ambassadeur"</b> à partir de 5 filleuls
              </span>
            </li>
            <li className="flex items-center gap-3 text-sm">
              <span className="text-xl">🎁</span>
              <span style={{ color: "hsl(var(--ink) / 0.8)" }}>
                <b>-10%</b> chez nos partenaires
              </span>
            </li>
          </ul>
        </Card>

        {/* Filleuls List */}
        <Card className="rounded-2xl shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold" style={{ color: "hsl(var(--ink))" }}>
              Mes filleuls
            </h3>
            <div 
              className="flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{ backgroundColor: "hsl(var(--brand-plum) / 0.1)" }}
            >
              <Users className="h-4 w-4" style={{ color: "hsl(var(--brand-plum))" }} />
              <span className="text-sm font-medium" style={{ color: "hsl(var(--brand-plum))" }}>
                {filleuls.length}
              </span>
            </div>
          </div>

          {filleuls.length > 0 ? (
            <ul className="space-y-3">
              {filleuls.map((filleul, index) => (
                <li 
                  key={index}
                  className="flex items-center justify-between p-3 rounded-xl"
                  style={{ backgroundColor: "hsl(var(--muted) / 0.5)" }}
                >
                  <div>
                    <p className="text-sm font-medium" style={{ color: "hsl(var(--ink))" }}>
                      {filleul.name}
                    </p>
                    <p className="text-xs" style={{ color: "hsl(var(--ink) / 0.6)" }}>
                      Inscrit le {filleul.date}
                    </p>
                  </div>
                  <span className="text-sm font-semibold" style={{ color: "hsl(var(--brand-plum))" }}>
                    +{filleul.xp} XP
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-center py-4" style={{ color: "hsl(var(--ink) / 0.6)" }}>
              Aucun filleul pour le moment. Partage ton code pour commencer !
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
