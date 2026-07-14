import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router';
import { CLIMBING_GRADES } from '../types/route';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { PlusCircle, Mountain, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { MapPicker } from '../components/MapPicker';
import { auth } from '../utils/auth';
import { routesApi } from '../api/routes';

export function NewRoute() {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedCrag = (location.state as any)?.selectedCrag;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    crag: selectedCrag?.name || '',
    grade: '',
    length: undefined as number | undefined,
    latitude: selectedCrag?.latitude || undefined,
    longitude: selectedCrag?.longitude || undefined,
  });

  const id = useParams<{ id: string }>().id;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.crag || !formData.grade) {
      toast.error('Compila tutti i campi obbligatori');
      return;
    }

    if (!formData.latitude || !formData.longitude) {
      toast.error('Seleziona la posizione sulla mappa');
      return;
    }

    setIsSubmitting(true);

    try {
      const session = await auth.getSession();
      if (!session?.id ) {
        toast.error('Devi essere autenticato per aggiungere una via');
        return;
      }

      if(!id) {
        toast.error('Id via non trovato');
        return;
      }

      await routesApi.createOneRoute(session.id, id, {
        nome_via: formData.name,
        grado: formData.grade,
        lunghezza: formData.length ?? null,
      });

      toast.success('Via aggiunta con successo! 🎉');
      navigate(`/falesia/${id}`);
    } catch (error) {
      console.error('Error adding route:', error);
      toast.error('Errore durante l\'aggiunta della via');
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
            <h1 className="text-xl sm:text-2xl">Aggiungi Nuova Via</h1>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground">Aggiungi una via all'archivio condiviso</p>
        </div>

        {selectedCrag && (
          <Card className="p-4 mb-4 bg-accent/10">
            <div className="flex items-start gap-3">
              <Mountain className="w-5 h-5 text-primary mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Falesia selezionata</h3>
                <p className="text-sm text-muted-foreground">{selectedCrag.name}</p>
              </div>
            </div>
          </Card>
        )}

        <Card className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Nome della Via *</Label>
              <Input
                id="name"
                type="text"
                placeholder="Es. La Fenice"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                required
              />
            </div>

            {/* Crag */}
            {!selectedCrag && (
              <div className="space-y-2 relative">
                <Label htmlFor="crag">Falesia *</Label>
                <Input
                  id="crag"
                  type="text"
                  placeholder="Es. Arco, Val di Mello"
                  value={formData.crag}
                  className="border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  required
                  autoComplete="off"
                />
              </div>
            )}

            {/* Grade */}
            <div className="space-y-2">
              <Label htmlFor="grade">Grado *</Label>
              <Select
                value={formData.grade}
                onValueChange={(value) => setFormData({ ...formData, grade: value })}
                required
              >
                <SelectTrigger id="grade" className="border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all">
                  <SelectValue placeholder="Seleziona il grado" />
                </SelectTrigger>
                <SelectContent>
                  {CLIMBING_GRADES.map(grade => (
                    <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Length (optional) */}
            <div className="space-y-2">
              <Label htmlFor="length">Lunghezza (metri) - Opzionale</Label>
              <Input
                id="length"
                type="number"
                min="1"
                placeholder="Es. 25"
                value={formData.length || ''}
                onChange={(e) => setFormData({ ...formData, length: e.target.value ? parseInt(e.target.value) : undefined })}
                className="border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

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
                Aggiungi Via
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
