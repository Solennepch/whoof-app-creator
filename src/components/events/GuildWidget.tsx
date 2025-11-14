import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { Users, Crown, TrendingUp, Plus, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface Guild {
  id: string;
  name: string;
  description: string;
  emblem_url: string;
  leader_id: string;
  total_xp: number;
  level: number;
  member_count?: number;
  max_members: number;
}

export function GuildWidget() {
  const { user } = useAuth();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [guildName, setGuildName] = useState("");
  const [guildDescription, setGuildDescription] = useState("");

  const { data: userGuild, refetch: refetchUserGuild } = useQuery({
    queryKey: ["user-guild", user?.id],
    enabled: !!user,
    queryFn: async () => {
      if (!user) return null;

      const { data: memberData, error: memberError } = await supabase
        .from("guild_members")
        .select("guild_id, role, xp_contributed")
        .eq("user_id", user.id)
        .maybeSingle();

      if (memberError && memberError.code !== "PGRST116") throw memberError;
      if (!memberData) return null;

      const { data: guildData, error: guildError } = await supabase
        .from("guilds")
        .select("*")
        .eq("id", memberData.guild_id)
        .single();

      if (guildError) throw guildError;

      const { count } = await supabase
        .from("guild_members")
        .select("*", { count: "exact", head: true })
        .eq("guild_id", guildData.id);

      return { ...guildData, member_count: count || 0, user_role: memberData.role, user_xp: memberData.xp_contributed };
    },
  });

  const { data: availableGuilds } = useQuery({
    queryKey: ["available-guilds"],
    enabled: !userGuild,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("guilds")
        .select("*")
        .eq("is_public", true)
        .order("total_xp", { ascending: false })
        .limit(10);

      if (error) throw error;

      const guildsWithCount = await Promise.all(
        data.map(async (guild) => {
          const { count } = await supabase
            .from("guild_members")
            .select("*", { count: "exact", head: true })
            .eq("guild_id", guild.id);
          return { ...guild, member_count: count || 0 };
        })
      );

      return guildsWithCount as Guild[];
    },
  });

  const handleCreateGuild = async () => {
    if (!user || !guildName.trim()) return;

    try {
      const { data: guildData, error: guildError } = await supabase
        .from("guilds")
        .insert({
          name: guildName,
          description: guildDescription,
          leader_id: user.id,
        })
        .select()
        .single();

      if (guildError) throw guildError;

      const { error: memberError } = await supabase
        .from("guild_members")
        .insert({
          guild_id: guildData.id,
          user_id: user.id,
          role: "leader",
        });

      if (memberError) throw memberError;

      toast.success("Guilde créée avec succès ! 🎉");
      setCreateDialogOpen(false);
      setGuildName("");
      setGuildDescription("");
      refetchUserGuild();
    } catch (error: any) {
      console.error("Error creating guild:", error);
      toast.error(error.message || "Erreur lors de la création");
    }
  };

  const handleJoinGuild = async (guildId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("guild_members")
        .insert({
          guild_id: guildId,
          user_id: user.id,
        });

      if (error) throw error;

      toast.success("Vous avez rejoint la guilde ! 🎊");
      setJoinDialogOpen(false);
      refetchUserGuild();
    } catch (error: any) {
      console.error("Error joining guild:", error);
      toast.error(error.message || "Erreur lors de l'inscription");
    }
  };

  if (!user) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Ma Guilde
            </CardTitle>
            {!userGuild && (
              <div className="flex gap-2">
                <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-1" />
                      Créer
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Créer une guilde</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Nom de la guilde</label>
                        <Input
                          value={guildName}
                          onChange={(e) => setGuildName(e.target.value)}
                          placeholder="Les Guerriers du Parc"
                          maxLength={50}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Description</label>
                        <Textarea
                          value={guildDescription}
                          onChange={(e) => setGuildDescription(e.target.value)}
                          placeholder="Une guilde pour les amateurs de longues promenades..."
                          rows={3}
                        />
                      </div>
                      <Button onClick={handleCreateGuild} className="w-full">
                        Créer la guilde
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Search className="h-4 w-4 mr-1" />
                      Rejoindre
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Guildes disponibles</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                      {availableGuilds?.map((guild) => (
                        <div
                          key={guild.id}
                          className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="font-semibold">{guild.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {guild.description || "Pas de description"}
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                              <span>{guild.member_count}/{guild.max_members} membres</span>
                              <span>Niveau {guild.level}</span>
                              <span>{guild.total_xp.toLocaleString()} XP</span>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleJoinGuild(guild.id)}
                            disabled={guild.member_count >= guild.max_members}
                          >
                            Rejoindre
                          </Button>
                        </div>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {userGuild ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold">{userGuild.name}</h3>
                  {userGuild.description && (
                    <p className="text-sm text-muted-foreground">{userGuild.description}</p>
                  )}
                </div>
                {userGuild.user_role === "leader" && (
                  <Badge variant="default" className="gap-1">
                    <Crown className="h-3 w-3" />
                    Chef
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <div className="text-xs text-muted-foreground mb-1">Niveau</div>
                  <div className="text-xl font-bold text-primary">{userGuild.level}</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <div className="text-xs text-muted-foreground mb-1">Membres</div>
                  <div className="text-xl font-bold">{userGuild.member_count}/{userGuild.max_members}</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <div className="text-xs text-muted-foreground mb-1">XP Total</div>
                  <div className="text-xl font-bold text-accent">{userGuild.total_xp.toLocaleString()}</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Votre contribution</span>
                </div>
                <span className="text-lg font-bold text-primary">
                  {userGuild.user_xp?.toLocaleString() || 0} XP
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
              <p className="text-sm text-muted-foreground mb-4">
                Vous n'appartenez à aucune guilde
              </p>
              <p className="text-xs text-muted-foreground">
                Créez votre propre guilde ou rejoignez-en une !
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
