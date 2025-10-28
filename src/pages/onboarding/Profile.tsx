import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { User, Loader2 } from "lucide-react";
import ErrorBoundary from "@/components/ErrorBoundary";

const profileSchema = z.object({
  display_name: z.string().trim().min(2, "Le nom doit contenir au moins 2 caractères").max(50, "Le nom ne peut pas dépasser 50 caractères"),
  bio: z.string().max(500, "La bio ne peut pas dépasser 500 caractères").optional(),
  avatar: z.any().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

function ProfileOnboardingContent() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
  });

  const onSubmit = async (data: ProfileForm) => {
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
        const fileName = `${session.user.id}-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, file, { upsert: true });

        if (uploadError) {
          console.error('Error uploading avatar:', uploadError);
          toast.error("Erreur lors de l'upload de l'avatar");
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName);
          avatarUrl = publicUrl;
        }
      }

      // Update profile via edge function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/profile`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            display_name: data.display_name,
            bio: data.bio || '',
            avatar_url: avatarUrl,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      toast.success("Profil créé avec succès !");
      navigate('/onboarding/dog');

    } catch (error) {
      console.error('Error creating profile:', error);
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
              Étape 1 sur 2
            </span>
            <span className="text-sm" style={{ color: "var(--ink)", opacity: 0.6 }}>
              50%
            </span>
          </div>
          <Progress value={50} className="h-2" />
        </div>

        <Card className="p-8 rounded-3xl shadow-soft">
          <div className="text-center mb-8">
            <div 
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
              style={{ 
                background: "linear-gradient(135deg, var(--brand-plum) 0%, var(--brand-raspberry) 100%)" 
              }}
            >
              <User className="w-8 h-8 text-white" />
            </div>
            
            <h1 
              className="text-3xl font-bold mb-2" 
              style={{ fontFamily: "Fredoka", color: "var(--ink)" }}
            >
              Crée ton profil
            </h1>
            
            <p className="text-muted-foreground">
              Commence par te présenter à la communauté Whoof
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
                  <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-12 h-12" style={{ color: "var(--brand-plum)", opacity: 0.3 }} />
                  </div>
                )}
              </div>
              
              <Label htmlFor="avatar" className="cursor-pointer">
                <div 
                  className="px-4 py-2 rounded-2xl text-sm font-medium transition hover:opacity-80"
                  style={{ backgroundColor: "var(--brand-plum)20", color: "var(--brand-plum)" }}
                >
                  Choisir une photo
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

            {/* Display Name */}
            <div>
              <Label htmlFor="display_name" className="text-sm font-medium mb-2 block">
                Nom d'affichage <span className="text-red-500">*</span>
              </Label>
              <Input
                id="display_name"
                placeholder="Ton prénom ou pseudo"
                className="rounded-2xl"
                aria-invalid={!!errors.display_name}
                aria-describedby={errors.display_name ? "display_name-error" : undefined}
                {...register("display_name")}
              />
              {errors.display_name && (
                <p id="display_name-error" className="text-sm text-red-500 mt-1">
                  {errors.display_name.message}
                </p>
              )}
            </div>

            {/* Bio */}
            <div>
              <Label htmlFor="bio" className="text-sm font-medium mb-2 block">
                Bio (optionnel)
              </Label>
              <Textarea
                id="bio"
                placeholder="Parle-nous un peu de toi et de ton amour pour les chiens..."
                className="rounded-2xl min-h-[120px]"
                aria-invalid={!!errors.bio}
                aria-describedby={errors.bio ? "bio-error" : undefined}
                {...register("bio")}
              />
              {errors.bio && (
                <p id="bio-error" className="text-sm text-red-500 mt-1">
                  {errors.bio.message}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1 rounded-2xl"
                onClick={() => navigate('/')}
                disabled={isLoading}
              >
                Plus tard
              </Button>
              
              <Button
                type="submit"
                className="flex-1 rounded-2xl text-white font-semibold"
                style={{ backgroundColor: "var(--brand-plum)" }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  "Continuer"
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

export default function ProfileOnboarding() {
  return (
    <ErrorBoundary>
      <ProfileOnboardingContent />
    </ErrorBoundary>
  );
}
