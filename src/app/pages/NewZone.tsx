import { useState } from 'react';
import { useNavigate } from 'react-router';
import { zoneStorage } from '../utils/zoneStorage';
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

export function NewZone() {
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
      toast.error('Inserisci il nome della zona');
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
        toast.error('Devi essere autenticato per aggiungere una zona');
        return;
      }

      const newZone = await zoneStorage.addZone({
        name: formData.name,
        description: formData.description || undefined,
        city: formData.city || undefined,
        country: formData.country || undefined,
        latitude: formData.latitude,
        longitude: formData.longitude,
        mapImageUrl: formData.mapImageUrl,
        addedBy: session.id,
      });

      toast.success('Zona aggiunta con successo! 🎉');
      navigate(`/zona/${encodeURIComponent(newZone.name)}`);
    } catch (error) {
      console.error('Error adding zone:', error);
      toast.error('Errore durante l\'aggiunta della zona');
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
            <h1 className="text-xl sm:text-2xl">Aggiungi Nuova Zona Boulder</h1>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground">Crea una nuova zona boulder nell'archivio condiviso</p>
        </div>

        <Card className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Nome Zona *</Label>
              <Input
                id="name"
                type="text"
                placeholder="Es. Magic Wood, Fontainebleau, Val di Mello"
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
                placeholder="Descrivi la zona, le caratteristiche, come arrivarci, ecc."
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
                  placeholder="Es. Avers, Fontainebleau"
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
                  placeholder="Es. Svizzera, Francia"
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
              bucketName="zone-maps"
              label="Foto Mappa Boulder (opzionale)"
            />

            {/* Location Map */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-primary" />
                <Label className="text-sm sm:text-base">Posizione Zona *</Label>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Cerca la zona o clicca sulla mappa per impostare la posizione
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
                Aggiungi Zona
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
