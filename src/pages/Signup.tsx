import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Building2, User, ArrowLeft } from "lucide-react";
import logoWhoof from "@/assets/logo-whoof.png";

type AccountType = "user" | "pro";

const CATEGORIES = [
  { value: "veterinaire", label: "Vétérinaire" },
  { value: "toiletteur", label: "Toiletteur" },
  { value: "educateur", label: "Éducateur canin" },
  { value: "refuge", label: "Refuge" },
  { value: "boutique", label: "Boutique" },
  { value: "pension", label: "Pension" },
  { value: "photographe", label: "Photographe animalier" },
];

export default function Signup() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"type" | "form">("type");
  const [accountType, setAccountType] = useState<AccountType | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Common fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // User fields
  const [firstName, setFirstName] = useState("");
  const [city, setCity] = useState("");

  // Pro fields
  const [businessName, setBusinessName] = useState("");
  const [category, setCategory] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [instagram, setInstagram] = useState("");
  const [address, setAddress] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [hours, setHours] = useState("");

  const handleTypeSelection = (type: AccountType) => {
    setAccountType(type);
    console.log('Analytics: signup_select_' + type);
  };

  const handleContinue = () => {
    if (!accountType) return;
    setStep("form");
  };

  const validateProFields = () => {
    const errors: Record<string, string> = {};
    if (!businessName.trim()) errors.businessName = "Nom d'établissement requis";
    if (!category) errors.category = "Catégorie requise";
    if (!email.trim()) errors.email = "Email requis";
    if (password.length < 8) errors.password = "Mot de passe trop court (min 8 caractères)";
    if (shortDesc.length > 200) errors.shortDesc = "Description trop longue (max 200 caractères)";
    return errors;
  };

  const validateUserFields = () => {
    const errors: Record<string, string> = {};
    if (!email.trim()) errors.email = "Email requis";
    if (password.length < 8) errors.password = "Mot de passe trop court (min 8 caractères)";
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate fields
      const errors = accountType === "pro" ? validateProFields() : validateUserFields();
      if (Object.keys(errors).length > 0) {
        const firstError = Object.values(errors)[0];
        toast.error(firstError);
        setIsLoading(false);
        return;
      }

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            account_type: accountType,
            first_name: accountType === "user" ? firstName : undefined,
            business_name: accountType === "pro" ? businessName : undefined,
          },
          emailRedirectTo: `${window.location.origin}/onboarding/profile`,
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("User creation failed");

      // Create profile with account type
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: authData.user.id,
          display_name: accountType === "user" ? firstName : businessName,
          city: accountType === "user" ? city : undefined,
          updated_at: new Date().toISOString(),
        });

      if (profileError) throw profileError;

      // If pro, create pro_account
      if (accountType === "pro") {
        const { error: proError } = await supabase
          .from("pro_accounts")
          .insert({
            user_id: authData.user.id,
            business_name: businessName,
            category,
            phone: phone || undefined,
            website: website || undefined,
            email: email,
            address: address || undefined,
            description: shortDesc || undefined,
            status: "pending", // Will need admin approval
          });

        if (proError) throw proError;
        
        console.log('Analytics: pro_onboarding_started');
        toast.success("Compte pro créé ! Un admin validera votre inscription.");
        navigate("/pro/onboarding");
      } else {
        toast.success("Compte créé ! Vérifiez votre e-mail.");
        navigate("/onboarding/profile");
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      toast.error(error.message || "Une erreur est survenue lors de l'inscription");
    } finally {
      setIsLoading(false);
    }
  };

  if (step === "type") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "hsl(var(--paper))" }}>
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <img src={logoWhoof} alt="Whoof Logo" className="w-24 h-24 mx-auto mb-4" />
            <h1 className="text-3xl font-bold" style={{ color: "hsl(var(--ink))" }}>
              Inscription
            </h1>
            <p className="text-sm mt-2" style={{ color: "hsl(var(--ink) / 0.6)" }}>
              Choisis ton type de compte
            </p>
          </div>

          <div className="space-y-4">
            {/* User Card */}
            <Card
              className={`p-6 cursor-pointer transition-all ${
                accountType === "user"
                  ? "ring-2 shadow-lg"
                  : "hover:shadow-md"
              }`}
              style={{
                borderColor: accountType === "user" ? "hsl(var(--brand-plum))" : "hsl(var(--border))",
              }}
              onClick={() => handleTypeSelection("user")}
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: "hsl(var(--brand-plum) / 0.1)" }}
                >
                  <User className="h-6 w-6" style={{ color: "hsl(var(--brand-plum))" }} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-1" style={{ color: "hsl(var(--ink))" }}>
                    🐶 Particulier
                  </h3>
                  <p className="text-sm" style={{ color: "hsl(var(--ink) / 0.7)" }}>
                    Pour les propriétaires de chiens qui veulent rencontrer d'autres passionnés et profiter des services
                  </p>
                </div>
              </div>
            </Card>

            {/* Pro Card */}
            <Card
              className={`p-6 cursor-pointer transition-all ${
                accountType === "pro"
                  ? "ring-2 shadow-lg"
                  : "hover:shadow-md"
              }`}
              style={{
                borderColor: accountType === "pro" ? "hsl(var(--brand-plum))" : "hsl(var(--border))",
              }}
              onClick={() => handleTypeSelection("pro")}
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: "hsl(var(--brand-yellow) / 0.1)" }}
                >
                  <Building2 className="h-6 w-6" style={{ color: "hsl(var(--brand-yellow))" }} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-1" style={{ color: "hsl(var(--ink))" }}>
                    🏪 Professionnel
                  </h3>
                  <p className="text-sm" style={{ color: "hsl(var(--ink) / 0.7)" }}>
                    Pour les vétérinaires, toiletteurs, éducateurs et autres pros qui veulent être visibles dans l'annuaire
                  </p>
                </div>
              </div>
            </Card>

            <Button
              onClick={handleContinue}
              disabled={!accountType}
              className="w-full h-12 rounded-xl text-white font-medium"
              style={{ backgroundColor: "hsl(var(--brand-plum))" }}
            >
              Continuer
            </Button>

            <div className="text-center">
              <button
                onClick={() => navigate("/login")}
                className="text-sm hover:underline"
                style={{ color: "hsl(var(--ink) / 0.6)" }}
              >
                Déjà un compte ? Se connecter
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Form Step
  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: "hsl(var(--paper))" }}>
      <div className="mx-auto max-w-[600px] px-4 pt-8">
        <button
          onClick={() => setStep("type")}
          className="flex items-center gap-2 mb-6 text-sm font-medium hover:opacity-70 transition"
          style={{ color: "hsl(var(--brand-plum))" }}
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </button>

        <div className="text-center mb-8">
          <img src={logoWhoof} alt="Whoof Logo" className="w-20 h-20 mx-auto mb-4" />
          <h1 className="text-2xl font-bold" style={{ color: "hsl(var(--ink))" }}>
            {accountType === "pro" ? "Inscription Professionnel" : "Inscription"}
          </h1>
        </div>

        <Card className="rounded-2xl shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Common Fields */}
            <div className="space-y-2">
              <Label htmlFor="email">E-mail *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe * (min 8 caractères)</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="rounded-xl"
              />
            </div>

            {/* User-specific fields */}
            {accountType === "user" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">Ville</Label>
                  <Input
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Paris, Lyon, Marseille..."
                    className="rounded-xl"
                  />
                </div>
              </>
            )}

            {/* Pro-specific fields */}
            {accountType === "pro" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="businessName">Nom de l'établissement *</Label>
                  <Input
                    id="businessName"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    required
                    maxLength={60}
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Catégorie *</Label>
                  <Select value={category} onValueChange={setCategory} required>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Sélectionne une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Adresse</Label>
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="123 Rue de la Paix, 75001 Paris"
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01 23 45 67 89"
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Site web</Label>
                  <Input
                    id="website"
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://mon-site.fr"
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="@mon_etablissement"
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shortDesc">
                    Description courte ({shortDesc.length}/200)
                  </Label>
                  <Textarea
                    id="shortDesc"
                    value={shortDesc}
                    onChange={(e) => setShortDesc(e.target.value)}
                    maxLength={200}
                    rows={3}
                    placeholder="Décris ton activité en quelques mots..."
                    className="rounded-xl resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hours">Horaires d'ouverture</Label>
                  <Input
                    id="hours"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    placeholder="Lun-Ven: 9h-18h, Sam: 10h-17h"
                    className="rounded-xl"
                  />
                </div>
              </>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-xl text-white font-medium"
              style={{ backgroundColor: "hsl(var(--brand-plum))" }}
            >
              {isLoading ? "Création du compte..." : "Créer mon compte"}
            </Button>

            <p className="text-xs text-center" style={{ color: "hsl(var(--ink) / 0.5)" }}>
              {accountType === "pro" && "Ton compte sera validé par un administrateur avant d'apparaître dans l'annuaire."}
            </p>
          </form>
        </Card>
      </div>
    </div>
  );
}
