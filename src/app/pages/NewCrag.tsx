import { useState } from 'react';
import { useNavigate } from 'react-router';
import { cragStorage } from '../utils/cragStorage';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { PlusCircle, Mountain, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { MapPicker } from '../components/MapPicker';
import { ImageUpload } from '../components/ImageUpload';
import { auth } from '../utils/auth';

export function NewCrag() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    city: '',
    country: '',
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
    mapImageUrl: undefined as string | undefined,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      toast.error('Inserisci il nome della falesia');
      return;
    }

    if (!formData.latitude || !formData.longitude) {
      toast.error('Seleziona la posizione sulla mappa');
      return;
    }

    setIsSubmitting(true);

    try {
      const session = await auth.getSession();
      if (!session?.id) {
        toast.error('Devi essere autenticato per aggiungere una falesia');
        return;
      }

      const newCrag = await cragStorage.addCrag({
        name: formData.name,
        description: formData.description || undefined,
        city: formData.city || undefined,
        country: formData.country || undefined,
        latitude: formData.latitude,
        longitude: formData.longitude,
        mapImageUrl: formData.mapImageUrl,
        addedBy: session.id,
      });

      toast.success('Falesia aggiunta con successo! 🎉');
      navigate(`/falesia/${encodeURIComponent(newCrag.name)}`);
    } catch (error) {
      console.error('Error adding crag:', error);
      toast.error('Errore durante l\'aggiunta della falesia');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Mountain className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <h1 className="text-xl sm:text-2xl">Aggiungi Nuova Falesia</h1>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground">Crea una nuova falesia nell'archivio condiviso</p>
        </div>

        <Card className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Nome Falesia *</Label>
              <Input
                id="name"
                type="text"
                placeholder="Es. Arco, Val di Mello, Finale Ligure"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Descrizione (opzionale)</Label>
              <Textarea
                id="description"
                placeholder="Descrivi la falesia, le caratteristiche, come arrivarci, ecc."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all min-h-[100px]"
                rows={4}
              />
            </div>

            {/* City and Country */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">Città/Paese (opzionale)</Label>
                <Input
                  id="city"
                  type="text"
                  placeholder="Es. Arco, Lecco"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Stato (opzionale)</Label>
                <Input
                  id="country"
                  type="text"
                  placeholder="Es. Italia, Francia"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>

            {/* Map Image Upload */}
            <ImageUpload
              currentImageUrl={formData.mapImageUrl}
              onImageUrlChange={(url) => setFormData({ ...formData, mapImageUrl: url })}
              bucketName="crag-maps"
              label="Foto Mappa Vie (opzionale)"
            />

            {/* Location Map */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-primary" />
                <Label className="text-sm sm:text-base">Posizione Falesia *</Label>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Cerca la falesia o clicca sulla mappa per impostare la posizione
              </p>
              <MapPicker
                latitude={formData.latitude}
                longitude={formData.longitude}
                onLocationSelect={(lat, lng) => setFormData({ ...formData, latitude: lat, longitude: lng })}
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                className="flex-1"
              >
                Annulla
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isSubmitting}
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Aggiungi Falesia
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
