import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Dog, Loader2, CalendarIcon } from "lucide-react";
import ErrorBoundary from "@/components/ErrorBoundary";
import { calculateAge } from "@/utils/age";
import { getZodiacSign } from "@/utils/zodiac";
import { cn } from "@/lib/utils";

const dogSchema = z.object({
  name: z.string().trim().min(2, "Le nom doit contenir au moins 2 caractères").max(50, "Le nom ne peut pas dépasser 50 caractères"),
  breed: z.string().trim().min(2, "La race est obligatoire").max(100, "La race ne peut pas dépasser 100 caractères"),
  birthdate: z.date({
    required_error: "La date de naissance est obligatoire",
  }),
  temperament: z.string().max(100, "Le tempérament ne peut pas dépasser 100 caractères").optional(),
  size: z.enum(["small", "medium", "large", ""], { errorMap: () => ({ message: "Taille invalide" }) }).optional(),
  anecdote: z.string().max(500, "L'anecdote ne peut pas dépasser 500 caractères").optional(),
  avatar: z.any().optional(),
});

type DogForm = z.infer<typeof dogSchema>;

const vaccinations = [
  { id: "rabies", label: "Rage" },
  { id: "distemper", label: "Maladie de Carré" },
  { id: "parvovirus", label: "Parvovirose" },
  { id: "hepatitis", label: "Hépatite" },
  { id: "leptospirosis", label: "Leptospirose" },
];

function DogOnboardingContent() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [selectedVaccinations, setSelectedVaccinations] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<DogForm>({
    resolver: zodResolver(dogSchema),
  });

  const birthdate = watch("birthdate");

  const toggleVaccination = (id: string) => {
    setSelectedVaccinations((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  const onSubmit = async (data: DogForm) => {
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Session expirée, veuillez vous reconnecter");
        navigate('/login');
        return;
      }

      let avatarUrl = null;

      // Upload avatar if provided
      if (data.avatar && data.avatar[0]) {
        const file = data.avatar[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `dog-${session.user.id}-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, file, { upsert: true });

        if (uploadError) {
          console.error('Error uploading avatar:', uploadError);
          toast.error("Erreur lors de l'upload de la photo");
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName);
          avatarUrl = publicUrl;
        }
      }

      // Calculate age and zodiac sign
      const ageYears = calculateAge(data.birthdate);
      const zodiacSign = getZodiacSign(data.birthdate);

      // Create vaccination object
      const vaccinationData: Record<string, boolean> = {};
      vaccinations.forEach((v) => {
        vaccinationData[v.id] = selectedVaccinations.includes(v.id);
      });

      // Create dog via edge function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/dog`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: data.name,
            breed: data.breed,
            birthdate: format(data.birthdate, 'yyyy-MM-dd'),
            age_years: ageYears,
            temperament: data.temperament || '',
            size: data.size || '',
            zodiac_sign: zodiacSign,
            vaccination: vaccinationData,
            anecdote: data.anecdote || '',
            avatar_url: avatarUrl,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create dog');
      }

      toast.success("Profil de ton chien créé avec succès !");
      navigate('/onboarding/preferences');

    } catch (error) {
      console.error('Error creating dog:', error);
      toast.error("Erreur lors de la création du profil");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4" style={{ background: "linear-gradient(135deg, #FFE4C4 0%, #FFD1E8 30%, #E6DBFF 100%)" }}>
      <div className="mx-auto max-w-2xl">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium" style={{ color: "var(--ink)" }}>
              Étape 2 sur 2
            </span>
            <span className="text-sm" style={{ color: "var(--ink)", opacity: 0.6 }}>
              100%
            </span>
          </div>
          <Progress value={100} className="h-2" />
        </div>

        <Card className="p-8 rounded-3xl shadow-soft">
          <div className="text-center mb-8">
            <div 
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
              style={{ 
                background: "linear-gradient(135deg, var(--brand-raspberry) 0%, var(--brand-yellow) 100%)" 
              }}
            >
              <Dog className="w-8 h-8 text-white" />
            </div>
            
            <h1 
              className="text-3xl font-bold mb-2" 
              style={{ fontFamily: "Fredoka", color: "var(--ink)" }}
            >
              Crée le profil de ton chien
            </h1>
            
            <p className="text-muted-foreground">
              Présente ton fidèle compagnon à la communauté
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center gap-4">
              <div 
                className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-soft"
                style={{ backgroundColor: "var(--paper)" }}
              >
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Dog avatar preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Dog className="w-12 h-12" style={{ color: "var(--brand-raspberry)", opacity: 0.3 }} />
                  </div>
                )}
              </div>
              
              <Label htmlFor="avatar" className="cursor-pointer">
                <div 
                  className="px-4 py-2 rounded-2xl text-sm font-medium transition hover:opacity-80"
                  style={{ backgroundColor: "var(--brand-raspberry)20", color: "var(--brand-raspberry)" }}
                >
                  Ajouter une photo
                </div>
                <input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  {...register("avatar")}
                  onChange={(e) => {
                    register("avatar").onChange(e);
                    handleAvatarChange(e);
                  }}
                />
              </Label>
            </div>

            {/* Name */}
            <div>
              <Label htmlFor="name" className="text-sm font-medium mb-2 block">
                Nom <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Rex, Bella, Max..."
                className="rounded-2xl"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "name-error" : undefined}
                {...register("name")}
              />
              {errors.name && (
                <p id="name-error" className="text-sm text-red-500 mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Breed */}
            <div>
              <Label htmlFor="breed" className="text-sm font-medium mb-2 block">
                Race <span className="text-red-500">*</span>
              </Label>
              <Input
                id="breed"
                placeholder="Labrador, Berger Allemand, Croisé..."
                className="rounded-2xl"
                aria-invalid={!!errors.breed}
                aria-describedby={errors.breed ? "breed-error" : undefined}
                {...register("breed")}
              />
              {errors.breed && (
                <p id="breed-error" className="text-sm text-red-500 mt-1">
                  {errors.breed.message}
                </p>
              )}
            </div>

            {/* Birthdate */}
            <div>
              <Label htmlFor="birthdate" className="text-sm font-medium mb-2 block">
                Date de naissance <span className="text-red-500">*</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="birthdate"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal rounded-2xl",
                      !birthdate && "text-muted-foreground"
                    )}
                    aria-invalid={!!errors.birthdate}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {birthdate ? format(birthdate, "dd/MM/yyyy") : <span>Choisir une date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={birthdate}
                    onSelect={(date) => setValue("birthdate", date as Date)}
                    disabled={(date) => date > new Date() || date < new Date("1990-01-01")}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              {birthdate && (
                <p className="text-sm text-muted-foreground mt-1">
                  Âge : {calculateAge(birthdate)} ans • Signe : {getZodiacSign(birthdate)}
                </p>
              )}
              {errors.birthdate && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.birthdate.message}
                </p>
              )}
            </div>

            {/* Size */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Taille</Label>
              <div className="flex gap-2">
                {[
                  { value: "small", label: "Petit" },
                  { value: "medium", label: "Moyen" },
                  { value: "large", label: "Grand" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setValue("size", option.value as any)}
                    className={cn(
                      "flex-1 py-2 px-4 rounded-2xl text-sm font-medium transition",
                      watch("size") === option.value
                        ? "bg-primary text-white"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Temperament */}
            <div>
              <Label htmlFor="temperament" className="text-sm font-medium mb-2 block">
                Tempérament
              </Label>
              <Input
                id="temperament"
                placeholder="Joueur, calme, sociable..."
                className="rounded-2xl"
                {...register("temperament")}
              />
            </div>

            {/* Vaccinations */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Vaccinations</Label>
              <div className="flex flex-wrap gap-2">
                {vaccinations.map((vaccination) => (
                  <button
                    key={vaccination.id}
                    type="button"
                    onClick={() => toggleVaccination(vaccination.id)}
                    className={cn(
                      "py-1.5 px-3 rounded-full text-sm font-medium transition",
                      selectedVaccinations.includes(vaccination.id)
                        ? "text-white"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                    style={
                      selectedVaccinations.includes(vaccination.id)
                        ? { backgroundColor: "var(--brand-plum)" }
                        : {}
                    }
                  >
                    {vaccination.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Anecdote */}
            <div>
              <Label htmlFor="anecdote" className="text-sm font-medium mb-2 block">
                Anecdote
              </Label>
              <Textarea
                id="anecdote"
                placeholder="Raconte-nous une histoire drôle ou touchante..."
                className="rounded-2xl min-h-[100px]"
                {...register("anecdote")}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1 rounded-2xl"
                onClick={() => navigate('/settings')}
                disabled={isLoading}
              >
                Retour
              </Button>
              
              <Button
                type="submit"
                className="flex-1 rounded-2xl text-white font-semibold"
                style={{ backgroundColor: "var(--brand-raspberry)" }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  "Terminer"
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

export default function DogOnboarding() {
  return (
    <ErrorBoundary>
      <DogOnboardingContent />
    </ErrorBoundary>
  );
}
