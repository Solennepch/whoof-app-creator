import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Users, Gift, Copy, Check, UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface Referral {
  id: string;
  referred_id: string;
  status: string;
  created_at: string;
  profile?: {
    display_name: string;
    avatar_url: string;
  };
}

export function ReferralSystem() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);

  const { data: referralCode } = useQuery({
    queryKey: ["referral-code", user?.id],
    enabled: !!user,
    queryFn: async () => {
      if (!user) return null;

      const { data: existing, error: fetchError } = await supabase
        .from('referral_codes' as any)
        .select('code')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

      if (existing) return (existing as any).code as string;

      // Generate new code
      const { data: newCode, error: generateError } = await supabase.rpc(
        'generate_referral_code' as any,
        { p_user_id: user.id }
      );

      if (generateError) throw generateError;

      const { error: insertError } = await supabase
        .from('referral_codes' as any)
        .insert({
          user_id: user.id,
          code: newCode,
        });

      if (insertError) throw insertError;

      return newCode as string;
    },
  });

  const { data: referrals } = useQuery({
    queryKey: ["referrals", user?.id],
    enabled: !!user,
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('referrals' as any)
        .select('*')
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const userIds = data.map((r: any) => r.referred_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url')
        .in('id', userIds);

      const profileMap = new Map(profiles?.map((p) => [p.id, p]));

      return data.map((referral: any) => ({
        ...referral,
        profile: profileMap.get(referral.referred_id),
      })) as Referral[];
    },
  });

  const handleCopyCode = async () => {
    if (!referralCode) return;

    try {
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      toast.success("Code copié !");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Erreur lors de la copie");
    }
  };

  const completedReferrals = referrals?.filter((r) => r.status === "completed").length || 0;
  const pendingReferrals = referrals?.filter((r) => r.status === "pending").length || 0;

  const rewards = [
    { count: 1, reward: "🎁 +100 XP", unlocked: completedReferrals >= 1 },
    { count: 3, reward: "⭐ Badge Recruteur", unlocked: completedReferrals >= 3 },
    { count: 5, reward: "💎 Cosmétique exclusif", unlocked: completedReferrals >= 5 },
    { count: 10, reward: "👑 Badge Ambassadeur", unlocked: completedReferrals >= 10 },
  ];

  return (
    <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-green-500" />
          Parrainage
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Referral Code */}
        <div className="space-y-3">
          <div className="text-sm font-medium">Ton code de parrainage</div>
          <div className="flex gap-2">
            <Input
              value={referralCode || "Chargement..."}
              readOnly
              className="font-mono text-lg text-center"
            />
            <Button
              onClick={handleCopyCode}
              variant="outline"
              className="flex-shrink-0"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Partage ce code avec tes amis pour gagner des récompenses !
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-background/50 text-center">
            <div className="text-2xl font-bold text-green-500">{completedReferrals}</div>
            <div className="text-xs text-muted-foreground">Parrainages réussis</div>
          </div>
          <div className="p-4 rounded-lg bg-background/50 text-center">
            <div className="text-2xl font-bold text-amber-500">{pendingReferrals}</div>
            <div className="text-xs text-muted-foreground">En attente</div>
          </div>
        </div>

        {/* Rewards Progress */}
        <div className="space-y-3">
          <div className="text-sm font-medium flex items-center gap-2">
            <Gift className="h-4 w-4" />
            Récompenses
          </div>
          <div className="space-y-2">
            {rewards.map((reward, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  reward.unlocked
                    ? "bg-green-500/10 border-green-500/30"
                    : "bg-muted/30 border-muted"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center font-bold text-sm">
                    {reward.count}
                  </div>
                  <span className="text-sm">{reward.reward}</span>
                </div>
                {reward.unlocked && (
                  <Badge variant="default" className="bg-green-500">
                    <Check className="h-3 w-3 mr-1" />
                    Débloqué
                  </Badge>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Referrals List */}
        {referrals && referrals.length > 0 && (
          <div className="space-y-3">
            <div className="text-sm font-medium flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Tes filleuls ({referrals.length})
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {referrals.map((referral) => (
                <div
                  key={referral.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-muted"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      {referral.profile?.display_name?.[0] || "?"}
                    </div>
                    <div>
                      <div className="text-sm font-medium">
                        {referral.profile?.display_name || "Nouvel utilisateur"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(referral.created_at).toLocaleDateString("fr-FR")}
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant={
                      referral.status === "completed" ? "default" : "secondary"
                    }
                  >
                    {referral.status === "completed" ? "Actif" : "En attente"}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          Gagne +100 XP par ami qui rejoint l'app avec ton code !
        </div>
      </CardContent>
    </Card>
  );
}
