import { useState, useRef } from "react";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyProProfile } from "@/hooks/usePro";
import { QRCodeSVG } from "qrcode.react";
import { Download, Share2, Copy, Instagram, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import logoWhoof from "@/assets/logo-whoof-v3.png";

export default function ProQRCode() {
  const { data: profile, isLoading } = useMyProProfile();
  const [isExporting, setIsExporting] = useState(false);
  const qrCardRef = useRef<HTMLDivElement>(null);

  // Redirect to pro onboarding if no profile
  if (!isLoading && !profile) {
    return <Navigate to="/pro/onboarding" replace />;
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  // Generate the profile URL
  const profileUrl = `${window.location.origin}/annuaire/${profile?.id}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      toast.success("Lien copié dans le presse-papier !");
    } catch (error) {
      toast.error("Erreur lors de la copie du lien");
    }
  };

  const handleExportQR = async () => {
    if (!qrCardRef.current) return;
    
    setIsExporting(true);
    try {
      const canvas = await html2canvas(qrCardRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        logging: false,
      });
      
      // Convert canvas to blob and download
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = `whoof-qr-${profile?.business_name?.toLowerCase().replace(/\s+/g, "-")}.png`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        toast.success("QR code téléchargé avec succès !");
      });
    } catch (error) {
      console.error("Error exporting QR code:", error);
      toast.error("Erreur lors de l'export du QR code");
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async (platform: "instagram" | "whatsapp" | "facebook") => {
    const text = `Découvrez ${profile?.business_name} sur Whoof Apps ! 🐾`;
    const encodedText = encodeURIComponent(text);
    const encodedUrl = encodeURIComponent(profileUrl);

    let shareUrl = "";
    switch (platform) {
      case "whatsapp":
        shareUrl = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case "instagram":
        toast.info("Copiez le lien et partagez-le sur Instagram !");
        await handleCopyLink();
        return;
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank");
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-4xl mb-20">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "Fredoka" }}>
          Mon QR Code Pro
        </h1>
        <p className="text-muted-foreground">
          Partagez votre profil facilement avec un QR code personnalisé
        </p>
      </div>

      {/* QR Code Card - For display and export */}
      <div className="flex justify-center">
        <div
          ref={qrCardRef}
          className="relative p-8 rounded-3xl shadow-2xl"
          style={{
            background: "linear-gradient(135deg, #7B61FF 0%, #FF5DA2 50%, #FFC14D 100%)",
            maxWidth: "400px",
          }}
        >
          {/* Inner white card */}
          <div className="bg-white rounded-2xl p-8 space-y-6">
            {/* Logo and Title */}
            <div className="text-center space-y-2">
              <img 
                src={logoWhoof} 
                alt="Whoof Apps" 
                className="h-12 w-12 mx-auto"
              />
              <h2 className="text-xl font-bold" style={{ fontFamily: "Fredoka" }}>
                {profile?.business_name}
              </h2>
              <p className="text-sm text-muted-foreground capitalize">
                {profile?.activity}
              </p>
            </div>

            {/* QR Code with logo in center */}
            <div className="flex justify-center">
              <div className="relative bg-white p-4 rounded-2xl border-4 border-gray-100">
                <QRCodeSVG
                  value={profileUrl}
                  size={200}
                  level="H"
                  includeMargin={false}
                  imageSettings={{
                    src: logoWhoof,
                    height: 40,
                    width: 40,
                    excavate: true,
                  }}
                />
              </div>
            </div>

            {/* Call to action */}
            <div className="text-center">
              <p className="text-sm font-medium">
                Scannez pour découvrir mon profil
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                sur Whoof Apps 💜🐾
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
          <CardDescription>
            Exportez ou partagez votre QR code
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            onClick={handleExportQR}
            disabled={isExporting}
            className="w-full bg-gradient-to-r from-[#7B61FF] to-[#FF5DA2] text-white"
          >
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? "Export en cours..." : "Exporter le QR code (PNG)"}
          </Button>

          <Button
            onClick={handleCopyLink}
            variant="outline"
            className="w-full"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copier le lien du profil
          </Button>

          <div className="grid grid-cols-3 gap-2 pt-2">
            <Button
              onClick={() => handleShare("whatsapp")}
              variant="outline"
              className="flex-col h-auto py-3"
            >
              <MessageCircle className="h-5 w-5 mb-1" />
              <span className="text-xs">WhatsApp</span>
            </Button>
            <Button
              onClick={() => handleShare("facebook")}
              variant="outline"
              className="flex-col h-auto py-3"
            >
              <Share2 className="h-5 w-5 mb-1" />
              <span className="text-xs">Facebook</span>
            </Button>
            <Button
              onClick={() => handleShare("instagram")}
              variant="outline"
              className="flex-col h-auto py-3"
            >
              <Instagram className="h-5 w-5 mb-1" />
              <span className="text-xs">Instagram</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Use cases */}
      <Card>
        <CardHeader>
          <CardTitle>💡 Comment utiliser mon QR code ?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
              1
            </div>
            <div>
              <p className="font-medium">Imprimez-le</p>
              <p className="text-sm text-muted-foreground">
                Sur votre comptoir, vitrine, flyer ou carte de visite
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
              2
            </div>
            <div>
              <p className="font-medium">Partagez-le en ligne</p>
              <p className="text-sm text-muted-foreground">
                Sur vos réseaux sociaux, dans vos emails ou messages
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
              3
            </div>
            <div>
              <p className="font-medium">Vos clients scannent</p>
              <p className="text-sm text-muted-foreground">
                Accès direct à votre profil Whoof avec toutes vos infos
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
