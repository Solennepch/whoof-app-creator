import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Star, Save, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const zodiacSigns = [
  { value: "aries", label: "Bélier", emoji: "♈" },
  { value: "taurus", label: "Taureau", emoji: "♉" },
  { value: "gemini", label: "Gémeaux", emoji: "♊" },
  { value: "cancer", label: "Cancer", emoji: "♋" },
  { value: "leo", label: "Lion", emoji: "♌" },
  { value: "virgo", label: "Vierge", emoji: "♍" },
  { value: "libra", label: "Balance", emoji: "♎" },
  { value: "scorpio", label: "Scorpion", emoji: "♏" },
  { value: "sagittarius", label: "Sagittaire", emoji: "♐" },
  { value: "capricorn", label: "Capricorne", emoji: "♑" },
  { value: "aquarius", label: "Verseau", emoji: "♒" },
  { value: "pisces", label: "Poissons", emoji: "♓" },
];

const moods = [
  "Énergique",
  "Joueur",
  "Calme",
  "Aventureux",
  "Romantique",
  "Curieux",
  "Zen",
  "Dynamique",
];

export default function AstroDogCMS() {
  const { toast } = useToast();
  const [selectedSign, setSelectedSign] = useState(zodiacSigns[0].value);
  const [weekRange, setWeekRange] = useState("");
  const [horoscopeText, setHoroscopeText] = useState("");
  const [mood, setMood] = useState(moods[0]);
  const [preview, setPreview] = useState(false);

  const currentSign = zodiacSigns.find(s => s.value === selectedSign);

  const handleSave = () => {
    if (!weekRange || !horoscopeText) {
      toast({
        title: "Champs manquants",
        description: "Veuillez remplir tous les champs requis",
        variant: "destructive",
      });
      return;
    }

    // TODO: Save to Supabase database
    toast({
      title: "Horoscope enregistré",
      description: `L'horoscope pour ${currentSign?.label} a été sauvegardé`,
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Star className="h-8 w-8 text-primary" />
          AstroDog CMS
        </h1>
        <p className="text-muted-foreground mt-1">
          Gérer les horoscopes canins hebdomadaires
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Editor */}
        <Card>
          <CardHeader>
            <CardTitle>Créer un horoscope</CardTitle>
            <CardDescription>
              Rédiger l'horoscope de la semaine pour chaque signe
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Sign Selection */}
            <div className="space-y-2">
              <Label>Signe du zodiac canin</Label>
              <Select value={selectedSign} onValueChange={setSelectedSign}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {zodiacSigns.map((sign) => (
                    <SelectItem key={sign.value} value={sign.value}>
                      {sign.emoji} {sign.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Week Range */}
            <div className="space-y-2">
              <Label>Période</Label>
              <Input
                placeholder="Ex: Semaine du 27 Jan - 2 Fév"
                value={weekRange}
                onChange={(e) => setWeekRange(e.target.value)}
              />
            </div>

            {/* Mood */}
            <div className="space-y-2">
              <Label>Humeur de la semaine</Label>
              <Select value={mood} onValueChange={setMood}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {moods.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Horoscope Text */}
            <div className="space-y-2">
              <Label>Horoscope</Label>
              <Textarea
                placeholder="Écrivez l'horoscope de la semaine..."
                value={horoscopeText}
                onChange={(e) => setHoroscopeText(e.target.value)}
                rows={8}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                {horoscopeText.length} caractères
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button onClick={handleSave} className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                Enregistrer
              </Button>
              <Button
                variant="outline"
                onClick={() => setPreview(!preview)}
              >
                <Eye className="h-4 w-4 mr-2" />
                {preview ? "Masquer" : "Aperçu"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        {preview && (
          <Card>
            <CardHeader>
              <CardTitle>Aperçu</CardTitle>
              <CardDescription>
                Prévisualisation de l'horoscope
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-2xl border p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">
                      {currentSign?.emoji} {currentSign?.label}
                    </h2>
                    <p className="text-sm mt-1 text-muted-foreground">
                      {weekRange || "Semaine non définie"}
                    </p>
                  </div>
                  <span className="text-sm font-medium px-3 py-1.5 rounded-full bg-primary text-primary-foreground">
                    {mood}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-muted/50 border">
                  <p className="text-base leading-relaxed">
                    {horoscopeText || "Aucun texte d'horoscope..."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Tips */}
        {!preview && (
          <Card>
            <CardHeader>
              <CardTitle>Conseils de rédaction</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div>
                  <h4 className="font-semibold mb-1">✨ Ton enjoué</h4>
                  <p className="text-muted-foreground">
                    Utilisez un ton léger et amusant, comme si vous parliez directement au chien
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">🎯 Précis et concret</h4>
                  <p className="text-muted-foreground">
                    Mentionnez des activités spécifiques : balades, jeux, rencontres
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">💫 Positif</h4>
                  <p className="text-muted-foreground">
                    Gardez un message optimiste et encourageant
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">📏 Longueur idéale</h4>
                  <p className="text-muted-foreground">
                    Entre 150 et 250 caractères pour une lecture agréable
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* All Signs Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Horoscopes de la semaine</CardTitle>
          <CardDescription>
            Vue d'ensemble de tous les signes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {zodiacSigns.map((sign) => (
              <button
                key={sign.value}
                onClick={() => setSelectedSign(sign.value)}
                className={`p-4 rounded-lg border text-left transition-all hover:shadow-md ${
                  selectedSign === sign.value
                    ? "border-primary bg-primary/5"
                    : "border-border"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{sign.emoji}</span>
                  <span className="font-semibold">{sign.label}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Cliquez pour éditer
                </p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
