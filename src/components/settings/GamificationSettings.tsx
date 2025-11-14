import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { useGamification } from '@/contexts/GamificationContext';
import { Sparkles, Target, Users, Trophy, Zap, Star } from 'lucide-react';

export function GamificationSettings() {
  const { preferences, updatePreferences } = useGamification();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Gamification
        </CardTitle>
        <CardDescription>
          Personnalisez votre expérience de jeu et choisissez les éléments que vous souhaitez afficher
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Niveau de gamification */}
        <div className="space-y-3">
          <Label>Niveau de gamification</Label>
          <RadioGroup
            value={preferences.level}
            onValueChange={(value) => {
              const level = value as 'minimal' | 'moderate' | 'complete';
              updatePreferences({ 
                level,
                showXpProgress: level !== 'minimal',
                showBadges: level === 'complete',
                showLeaderboard: level !== 'minimal',
                showChallenges: level !== 'minimal',
                showDailyMissions: level === 'complete',
                showGuilds: level === 'complete',
                showCosmetics: level === 'complete',
              });
            }}
            className="space-y-2"
          >
            <div className="flex items-center space-x-2 p-3 rounded-lg border">
              <RadioGroupItem value="minimal" id="minimal" />
              <Label htmlFor="minimal" className="flex-1 cursor-pointer">
                <div className="font-medium">Minimal</div>
                <div className="text-sm text-muted-foreground">
                  Uniquement les fonctionnalités essentielles
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-3 rounded-lg border">
              <RadioGroupItem value="moderate" id="moderate" />
              <Label htmlFor="moderate" className="flex-1 cursor-pointer">
                <div className="font-medium">Modéré</div>
                <div className="text-sm text-muted-foreground">
                  XP, challenges et classements
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-3 rounded-lg border">
              <RadioGroupItem value="complete" id="complete" />
              <Label htmlFor="complete" className="flex-1 cursor-pointer">
                <div className="font-medium">Complet</div>
                <div className="text-sm text-muted-foreground">
                  Toutes les fonctionnalités de gamification
                </div>
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Options détaillées */}
        <div className="space-y-4 pt-4 border-t">
          <Label>Options détaillées</Label>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="show-xp" className="cursor-pointer">Progression XP</Label>
            </div>
            <Switch
              id="show-xp"
              checked={preferences.showXpProgress}
              onCheckedChange={(checked) => updatePreferences({ showXpProgress: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="show-badges" className="cursor-pointer">Badges</Label>
            </div>
            <Switch
              id="show-badges"
              checked={preferences.showBadges}
              onCheckedChange={(checked) => updatePreferences({ showBadges: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="show-leaderboard" className="cursor-pointer">Classements</Label>
            </div>
            <Switch
              id="show-leaderboard"
              checked={preferences.showLeaderboard}
              onCheckedChange={(checked) => updatePreferences({ showLeaderboard: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="show-challenges" className="cursor-pointer">Challenges</Label>
            </div>
            <Switch
              id="show-challenges"
              checked={preferences.showChallenges}
              onCheckedChange={(checked) => updatePreferences({ showChallenges: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="show-missions" className="cursor-pointer">Missions quotidiennes</Label>
            </div>
            <Switch
              id="show-missions"
              checked={preferences.showDailyMissions}
              onCheckedChange={(checked) => updatePreferences({ showDailyMissions: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="show-guilds" className="cursor-pointer">Guildes</Label>
            </div>
            <Switch
              id="show-guilds"
              checked={preferences.showGuilds}
              onCheckedChange={(checked) => updatePreferences({ showGuilds: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="show-cosmetics" className="cursor-pointer">Cosmétiques</Label>
            </div>
            <Switch
              id="show-cosmetics"
              checked={preferences.showCosmetics}
              onCheckedChange={(checked) => updatePreferences({ showCosmetics: checked })}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
