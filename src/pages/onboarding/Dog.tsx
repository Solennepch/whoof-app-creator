import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Dog, Loader2, CalendarIcon, Plus, X, Check } from "lucide-react";
import ErrorBoundary from "@/components/ErrorBoundary";
import { calculateAge } from "@/utils/age";
import { getZodiacSign } from "@/utils/zodiac";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";

const dogSchema = z.object({
  name: z.string().trim().min(2, "Le nom doit contenir au moins 2 caractères").max(50),
  breed: z.string().trim().min(2, "La race est obligatoire").max(100),
  birthdate: z.date({ required_error: "La date de naissance est obligatoire" }),
  temperament: z.string().max(100).optional(),
  size: z.enum(["small", "medium", "large", ""], { errorMap: () => ({ message: "Taille invalide" }) }).optional(),
  anecdote: z.string().max(500).optional(),
  avatar: z.any().optional(),
});

type DogForm = z.infer<typeof dogSchema>;

interface DogProfile extends DogForm {
  vaccinations: string[];
  avatarPreview: string | null;
}

const vaccinations = [
  { id: "rabies", label: "Rage" },
  { id: "distemper", label: "Maladie de Carré" },
  { id: "parvovirus", label: "Parvovirose" },
  { id: "hepatitis", label: "Hépatite" },
  { id: "leptospirosis", label: "Leptospirose" },
];

function DogOnboardingContent() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const setOnboardingCompleted = useAppStore(state => state.setOnboardingCompleted);
  const [isLoading, setIsLoading] = useState(false);
  const [dogCount, setDogCount] = useState<number | null>(null);
  const [currentDogIndex, setCurrentDogIndex] = useState(0);
  const [completedDogs, setCompletedDogs] = useState<DogProfile[]>([]);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [selectedVaccinations, setSelectedVaccinations] = useState<string[]>([]);

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<DogForm>({
    resolver: zodResolver(dogSchema),
  });

  const birthdate = watch("birthdate");

  const toggleVaccination = (id: string) => {
    setSelectedVaccinations((prev) => prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]);
  };

  const saveDogProfile = async (data: DogForm) => {
    if (!session) throw new Error("No session");
    let avatarUrl = null;

    if (data.avatar?.[0]) {
      const file = data.avatar[0];
      const fileName = `dog-${session.user.id}-${Date.now()}.${file.name.split('.').pop()}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file, { upsert: true });
      
      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
        avatarUrl = publicUrl;
      }
    }

    const vaccinationObj: { [key: string]: boolean } = {};
    selectedVaccinations.forEach((vaccId) => { vaccinationObj[vaccId] = true; });

    const { data: dog, error } = await supabase.from("dogs").insert({
      owner_id: session.user.id,
      name: data.name,
      breed: data.breed,
      birthdate: format(data.birthdate, "yyyy-MM-dd"),
      age_years: calculateAge(data.birthdate),
      temperament: data.temperament || null,
      size: data.size || null,
      anecdote: data.anecdote || null,
      avatar_url: avatarUrl,
      zodiac_sign: getZodiacSign(data.birthdate),
      vaccination: vaccinationObj,
      vaccinations: selectedVaccinations,
    }).select().single();

    if (error) throw error;
    return dog.id;
  };

  const onSubmit = async (data: DogForm) => {
    setIsLoading(true);
    try {
      await saveDogProfile(data);
      setCompletedDogs([...completedDogs, { ...data, vaccinations: selectedVaccinations, avatarPreview }]);

      if (dogCount && currentDogIndex + 1 < dogCount) {
        reset();
        setSelectedVaccinations([]);
        setAvatarPreview(null);
        setCurrentDogIndex(currentDogIndex + 1);
        toast.success(`Profil de ${data.name} créé !`);
      } else {
        setOnboardingCompleted(true);
        toast.success("Tous les profils créés !");
        navigate("/onboarding/preferences");
      }
    } catch (error) {
      toast.error("Erreur lors de la création");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  if (dogCount === null) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted">
        <Card className="w-full max-w-md p-8 shadow-[0_20px_50px_rgba(0,0,0,0.15)] border-2">
          <div className="text-center mb-8">
            <Dog className="h-16 w-16 mx-auto mb-4 text-primary" />
            <h1 className="text-3xl font-bold mb-2">Combien de chiens as-tu ?</h1>
            <p className="text-muted-foreground">Nous allons créer un profil pour chacun</p>
          </div>
          <div className="grid gap-3">
            {[1, 2, 3, 4, 5].map((count) => (
              <Button key={count} variant="outline" size="lg" onClick={() => setDogCount(count)} className="h-14 text-lg hover:bg-primary/10 hover:border-primary">
                {count} chien{count > 1 ? "s" : ""}
              </Button>
            ))}
            <Button variant="outline" size="lg" onClick={() => setDogCount(6)} className="h-14 text-lg hover:bg-primary/10 hover:border-primary">
              Plus de 5 chiens
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const progress = ((currentDogIndex + 1) / dogCount) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted">
      <Card className="w-full max-w-2xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.15)] border-2">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-muted-foreground">Chien {currentDogIndex + 1} sur {dogCount}</h2>
            <div className="flex gap-2">
              {completedDogs.map((dog, idx) => (
                <Badge key={idx} variant="default" className="gap-1">{dog.name}<Check className="h-3 w-3" /></Badge>
              ))}
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="text-center mb-8">
          <Dog className="h-12 w-12 mx-auto mb-3 text-primary" />
          <h1 className="text-2xl font-bold mb-2">
            {currentDogIndex === 0 ? "Crée le profil de ton premier chien" : `Ajoute ton chien n°${currentDogIndex + 1}`}
          </h1>
          <p className="text-muted-foreground">Encore {dogCount - currentDogIndex - 1} à ajouter après</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden border-4 border-border">
                {avatarPreview ? <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" /> : <Dog className="h-10 w-10 text-muted-foreground" />}
              </div>
              {avatarPreview && (
                <button type="button" onClick={() => { setAvatarPreview(null); setValue("avatar", undefined); }} className="absolute -top-2 -right-2 p-1 rounded-full bg-destructive text-destructive-foreground">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Label htmlFor="avatar" className="cursor-pointer">
              <div className="px-4 py-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 text-sm font-medium">Ajouter une photo</div>
              <Input id="avatar" type="file" accept="image/*" className="hidden" {...register("avatar")} onChange={handleFileChange} />
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nom *</Label>
            <Input id="name" placeholder="Rex, Luna, Max..." {...register("name")} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="breed">Race *</Label>
            <Input id="breed" placeholder="Labrador..." {...register("breed")} />
            {errors.breed && <p className="text-sm text-destructive">{errors.breed.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Date de naissance *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button type="button" variant="outline" className={cn("w-full justify-start text-left font-normal", !birthdate && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {birthdate ? format(birthdate, "dd/MM/yyyy") : "Sélectionner"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={birthdate} onSelect={(date) => setValue("birthdate", date as Date)} disabled={(date) => date > new Date()} />
              </PopoverContent>
            </Popover>
            {errors.birthdate && <p className="text-sm text-destructive">{errors.birthdate.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="size">Taille</Label>
            <select id="size" className="w-full px-3 py-2 rounded-xl border border-border bg-background" {...register("size")}>
              <option value="">Sélectionner</option>
              <option value="small">Petit (&lt; 10kg)</option>
              <option value="medium">Moyen (10-25kg)</option>
              <option value="large">Grand (&gt; 25kg)</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="temperament">Tempérament</Label>
            <Input id="temperament" placeholder="Joueur, calme..." {...register("temperament")} />
          </div>

          <div className="space-y-2">
            <Label>Vaccinations</Label>
            <div className="flex flex-wrap gap-2">
              {vaccinations.map((vacc) => (
                <Button key={vacc.id} type="button" variant={selectedVaccinations.includes(vacc.id) ? "default" : "outline"} size="sm" onClick={() => toggleVaccination(vacc.id)} className="rounded-full">
                  {vacc.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="anecdote">Une anecdote</Label>
            <Textarea id="anecdote" placeholder="Raconte-nous..." rows={3} {...register("anecdote")} />
          </div>

          <div className="flex gap-3">
            {currentDogIndex > 0 && (
              <Button type="button" variant="outline" onClick={() => { setCurrentDogIndex(currentDogIndex - 1); reset(); setSelectedVaccinations([]); setAvatarPreview(null); }} className="flex-1">Retour</Button>
            )}
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Création...</> : currentDogIndex + 1 < dogCount ? <><>Suivant</><Plus className="ml-2 h-4 w-4" /></> : "Terminer"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default function DogOnboarding() {
  return <ErrorBoundary><DogOnboardingContent /></ErrorBoundary>;
}
