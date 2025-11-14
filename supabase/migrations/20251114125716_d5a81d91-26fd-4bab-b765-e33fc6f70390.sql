-- Événements spéciaux limités dans le temps
CREATE TABLE IF NOT EXISTS public.special_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  xp_multiplier DECIMAL(3,2) NOT NULL DEFAULT 1.0,
  challenges JSONB NOT NULL DEFAULT '[]'::jsonb,
  rewards JSONB NOT NULL DEFAULT '[]'::jsonb,
  theme TEXT,
  icon TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_special_events_dates ON public.special_events(start_date, end_date);
CREATE INDEX idx_special_events_active ON public.special_events(is_active) WHERE is_active = true;

-- Participation aux événements spéciaux
CREATE TABLE IF NOT EXISTS public.special_event_participation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  event_id UUID NOT NULL REFERENCES public.special_events(id) ON DELETE CASCADE,
  challenges_completed JSONB DEFAULT '[]'::jsonb,
  total_xp_earned INTEGER DEFAULT 0,
  rewards_claimed JSONB DEFAULT '[]'::jsonb,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, event_id)
);

CREATE INDEX idx_event_participation_user ON public.special_event_participation(user_id);
CREATE INDEX idx_event_participation_event ON public.special_event_participation(event_id);

-- Guildes/Équipes
CREATE TABLE IF NOT EXISTS public.guilds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  emblem_url TEXT,
  banner_url TEXT,
  leader_id UUID NOT NULL,
  max_members INTEGER DEFAULT 50,
  is_public BOOLEAN DEFAULT true,
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_guilds_leader ON public.guilds(leader_id);
CREATE INDEX idx_guilds_public ON public.guilds(is_public) WHERE is_public = true;

-- Membres de guilde
CREATE TABLE IF NOT EXISTS public.guild_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id UUID NOT NULL REFERENCES public.guilds(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  xp_contributed INTEGER DEFAULT 0,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

CREATE INDEX idx_guild_members_guild ON public.guild_members(guild_id);
CREATE INDEX idx_guild_members_user ON public.guild_members(user_id);

-- Récompenses cosmétiques de saison
CREATE TABLE IF NOT EXISTS public.season_cosmetics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id UUID NOT NULL REFERENCES public.seasons(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'avatar_frame', 'badge', 'profile_banner', 'animated_badge'
  name TEXT NOT NULL,
  description TEXT,
  rarity TEXT NOT NULL DEFAULT 'common', -- 'common', 'rare', 'epic', 'legendary'
  unlock_requirement JSONB NOT NULL,
  preview_url TEXT,
  animation_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_season_cosmetics_season ON public.season_cosmetics(season_id);
CREATE INDEX idx_season_cosmetics_type ON public.season_cosmetics(type);

-- Cosmétiques débloqués par utilisateur
CREATE TABLE IF NOT EXISTS public.user_cosmetics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  cosmetic_id UUID NOT NULL REFERENCES public.season_cosmetics(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, cosmetic_id)
);

CREATE INDEX idx_user_cosmetics_user ON public.user_cosmetics(user_id);

-- Cosmétiques actuellement équipés
CREATE TABLE IF NOT EXISTS public.user_active_cosmetics (
  user_id UUID PRIMARY KEY,
  active_avatar_frame UUID REFERENCES public.season_cosmetics(id),
  active_badge UUID REFERENCES public.season_cosmetics(id),
  active_banner UUID REFERENCES public.season_cosmetics(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS Policies pour special_events
ALTER TABLE public.special_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active special events"
  ON public.special_events FOR SELECT
  USING (is_active = true AND now() BETWEEN start_date AND end_date);

CREATE POLICY "Admins can manage special events"
  ON public.special_events FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies pour special_event_participation
ALTER TABLE public.special_event_participation ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their event participation"
  ON public.special_event_participation FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their event participation"
  ON public.special_event_participation FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their event participation"
  ON public.special_event_participation FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies pour guilds
ALTER TABLE public.guilds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public guilds"
  ON public.guilds FOR SELECT
  USING (is_public = true);

CREATE POLICY "Guild members can view their guild"
  ON public.guilds FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.guild_members
    WHERE guild_members.guild_id = guilds.id
    AND guild_members.user_id = auth.uid()
  ));

CREATE POLICY "Guild leaders can update their guild"
  ON public.guilds FOR UPDATE
  USING (auth.uid() = leader_id);

CREATE POLICY "Users can create guilds"
  ON public.guilds FOR INSERT
  WITH CHECK (auth.uid() = leader_id);

-- RLS Policies pour guild_members
ALTER TABLE public.guild_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Guild members can view their guild members"
  ON public.guild_members FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.guild_members gm
    WHERE gm.guild_id = guild_members.guild_id
    AND gm.user_id = auth.uid()
  ));

CREATE POLICY "Users can join guilds"
  ON public.guild_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Guild leaders can manage members"
  ON public.guild_members FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.guilds
    WHERE guilds.id = guild_members.guild_id
    AND guilds.leader_id = auth.uid()
  ));

-- RLS Policies pour season_cosmetics
ALTER TABLE public.season_cosmetics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view season cosmetics"
  ON public.season_cosmetics FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage cosmetics"
  ON public.season_cosmetics FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies pour user_cosmetics
ALTER TABLE public.user_cosmetics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their cosmetics"
  ON public.user_cosmetics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can unlock cosmetics"
  ON public.user_cosmetics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies pour user_active_cosmetics
ALTER TABLE public.user_active_cosmetics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their active cosmetics"
  ON public.user_active_cosmetics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their active cosmetics"
  ON public.user_active_cosmetics FOR ALL
  USING (auth.uid() = user_id);

-- Fonction pour mettre à jour les XP de la guilde
CREATE OR REPLACE FUNCTION public.update_guild_xp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.guilds
  SET 
    total_xp = (
      SELECT COALESCE(SUM(xp_contributed), 0)
      FROM public.guild_members
      WHERE guild_id = NEW.guild_id
    ),
    updated_at = now()
  WHERE id = NEW.guild_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_update_guild_xp
AFTER INSERT OR UPDATE OF xp_contributed ON public.guild_members
FOR EACH ROW
EXECUTE FUNCTION public.update_guild_xp();