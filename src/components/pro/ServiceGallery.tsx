import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, X, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

interface ServiceGalleryProps {
  serviceId: string;
  galleryUrls: string[];
  onUpdate: (urls: string[]) => void;
  editable?: boolean;
}

export function ServiceGallery({ serviceId, galleryUrls, onUpdate, editable = false }: ServiceGalleryProps) {
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const uploadedUrls: string[] = [];

      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${serviceId}_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `service-gallery/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('public')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('public')
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
      }

      const newUrls = [...galleryUrls, ...uploadedUrls];
      
      const { error: updateError } = await supabase
        .from('pro_services')
        .update({ gallery_urls: newUrls })
        .eq('id', serviceId);

      if (updateError) throw updateError;

      onUpdate(newUrls);
      toast.success('Images ajoutées avec succès');
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async (url: string) => {
    try {
      const newUrls = galleryUrls.filter(u => u !== url);
      
      const { error } = await supabase
        .from('pro_services')
        .update({ gallery_urls: newUrls })
        .eq('id', serviceId);

      if (error) throw error;

      onUpdate(newUrls);
      toast.success('Image supprimée');
    } catch (error) {
      console.error('Error removing image:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handlePrevious = () => {
    if (selectedImage === null) return;
    setSelectedImage(selectedImage === 0 ? galleryUrls.length - 1 : selectedImage - 1);
  };

  const handleNext = () => {
    if (selectedImage === null) return;
    setSelectedImage(selectedImage === galleryUrls.length - 1 ? 0 : selectedImage + 1);
  };

  if (galleryUrls.length === 0 && !editable) {
    return null;
  }

  return (
    <>
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-2">
          {galleryUrls.map((url, index) => (
            <div key={url} className="relative group aspect-square">
              <img
                src={url}
                alt={`Service image ${index + 1}`}
                className="w-full h-full object-cover rounded-lg cursor-pointer"
                onClick={() => setSelectedImage(index)}
              />
              {editable && (
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(url);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}

          {editable && (
            <label className="aspect-square border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleUpload}
                className="hidden"
                disabled={uploading}
              />
              <div className="text-center">
                <Upload className="h-8 w-8 mx-auto mb-1 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">
                  {uploading ? 'Upload...' : 'Ajouter'}
                </p>
              </div>
            </label>
          )}
        </div>
      </div>

      {/* Image Viewer Dialog */}
      <Dialog open={selectedImage !== null} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl p-0">
          {selectedImage !== null && (
            <div className="relative">
              <img
                src={galleryUrls[selectedImage]}
                alt={`Service image ${selectedImage + 1}`}
                className="w-full h-auto max-h-[80vh] object-contain"
              />
              
              {galleryUrls.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                    onClick={handlePrevious}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                    onClick={handleNext}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </>
              )}

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/80 px-3 py-1 rounded-full text-sm">
                {selectedImage + 1} / {galleryUrls.length}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
