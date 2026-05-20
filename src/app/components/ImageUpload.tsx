import { useState } from 'react';
import { getSupabase } from '../utils/supabase';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface ImageUploadProps {
  currentImageUrl?: string;
  onImageUrlChange: (url: string | undefined) => void;
  bucketName: string;
  label: string;
}

export function ImageUpload({ currentImageUrl, onImageUrlChange, bucketName, label }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(currentImageUrl);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Per favore seleziona un file immagine');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('L\'immagine deve essere massimo 5MB');
      return;
    }

    setUploading(true);

    try {
      // Convert to base64 and store locally
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreviewUrl(base64String);
        onImageUrlChange(base64String);
        toast.success('Immagine caricata con successo!');
        setUploading(false);
      };
      reader.onerror = () => {
        console.error('Error reading file');
        toast.error('Errore durante la lettura dell\'immagine');
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Errore durante il caricamento dell\'immagine');
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(undefined);
    onImageUrlChange(undefined);
    toast.success('Immagine rimossa');
  };

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}

      {previewUrl ? (
        <div className="relative">
          <img
            src={previewUrl}
            alt="Anteprima mappa"
            className="w-full h-64 object-cover rounded-lg border-2 border-border"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleRemove}
            className="absolute top-2 right-2"
          >
            <X className="w-4 h-4 mr-1" />
            Rimuovi
          </Button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
          <div className="flex flex-col items-center gap-3">
            <ImageIcon className="w-12 h-12 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Carica una foto della mappa delle vie/boulder
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG o JPEG (max 5MB)
              </p>
            </div>
            <label htmlFor="image-upload">
              <Button
                type="button"
                variant="outline"
                disabled={uploading}
                onClick={() => document.getElementById('image-upload')?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                {uploading ? 'Caricamento...' : 'Seleziona Immagine'}
              </Button>
            </label>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </div>
      )}
    </div>
  );
}
