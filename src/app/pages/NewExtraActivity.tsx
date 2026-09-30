import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { PlusCircle, Footprints, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { MapPicker } from '../components/MapPicker';
import { ImageUpload } from '../components/ImageUpload';
import { auth } from '../utils/auth';
import {
  extraActivitiesApi,
  ExtraActivityCreateRequest,
  ExtraActivityType,
  ProtectionStyle,
  EXTRA_ACTIVITY_TYPE_LABELS,
  PROTECTION_STYLE_LABELS,
} from '../api/extraActivities';
import { outdoorPath } from '../paths';

export function NewExtraActivity() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    activityType: '' as ExtraActivityType | '',
    description: '',
    image: undefined as string | undefined,
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
    city: '',
    province: '',
    country: '',
    activityDay: new Date().toISOString().split('T')[0],
    hoursSpent: '',
    pitchCount: '',
    totalLengthMeters: '',
    protectionStyle: '' as ProtectionStyle | '',
    maxAltitude: '',
    elevationGain: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      toast.error("Inserisci il nome dell'attivita");
      return;
    }

    if (!formData.activityType) {
      toast.error("Seleziona il tipo di attivita");
      return;
    }

    if (!formData.latitude || !formData.longitude) {
      toast.error('Seleziona la posizione sulla mappa');
      return;
    }

    if (!formData.activityDay) {
      toast.error("Inserisci il giorno dell'attivita");
      return;
    }

    if (formData.activityType === 'MULTIPITCH') {
      if (!formData.pitchCount) {
        toast.error('Inserisci il numero di tiri');
        return;
      }
      if (!formData.totalLengthMeters) {
        toast.error('Inserisci la lunghezza totale in metri');
        return;
      }
      if (!formData.protectionStyle) {
        toast.error('Seleziona se la via e spittata o trad');
        return;
      }
    }

    if (formData.activityType === 'HIKE') {
      if (!formData.maxAltitude) {
        toast.error("Inserisci l'altitudine massima");
        return;
      }
      if (!formData.elevationGain) {
        toast.error('Inserisci il dislivello fatto');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const session = await auth.getSession();
      if (!session?.id) {
        toast.error('Devi essere autenticato per aggiungere un attivita');
        return;
      }

      const body: ExtraActivityCreateRequest = {
        name: formData.name,
        activity_type: formData.activityType,
        description: formData.description || undefined,
        image: formData.image || undefined,
        latitude: formData.latitude,
        longitude: formData.longitude,
        city: formData.city || undefined,
        province: formData.province || undefined,
        country: formData.country || undefined,
        activity_day: formData.activityDay,
        hours_spent: formData.hoursSpent ? Number(formData.hoursSpent) : undefined,
      };

      if (formData.activityType === 'MULTIPITCH') {
        body.pitch_count = Number(formData.pitchCount);
        body.total_length_meters = Number(formData.totalLengthMeters);
        body.protection_style = formData.protectionStyle as ProtectionStyle;
      }

      if (formData.activityType === 'HIKE') {
        body.max_altitude = Number(formData.maxAltitude);
        body.elevation_gain = Number(formData.elevationGain);
      }

      const activityId = await extraActivitiesApi.createOne(session.id, body);

      toast.success('Attivita aggiunta con successo!');
      navigate(outdoorPath(`attivita-extra/${activityId}`));
    } catch (error) {
      console.error('Error adding extra activity:', error);
      toast.error("Errore durante l'aggiunta dell'attivita");
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
              <Footprints className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <h1 className="text-xl sm:text-2xl">Aggiungi Attivita</h1>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground">
            Registra vie lunghe, multipitch o escursioni fuori dal catalogo falesie
          </p>
        </div>

        <Card className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                type="text"
                placeholder="Es. Via delle Guide, Cresta del Sole"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Tipo di via *</Label>
              <Select
                value={formData.activityType}
                onValueChange={(value) =>
                  setFormData({ ...formData, activityType: value as ExtraActivityType })
                }
              >
                <SelectTrigger className="border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all">
                  <SelectValue placeholder="Seleziona il tipo" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(EXTRA_ACTIVITY_TYPE_LABELS) as ExtraActivityType[]).map((type) => (
                    <SelectItem key={type} value={type}>
                      {EXTRA_ACTIVITY_TYPE_LABELS[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrizione</Label>
              <Textarea
                id="description"
                placeholder="Racconta l'esperienza, le condizioni, la compagnia..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all min-h-[120px]"
                rows={5}
              />
            </div>

            <ImageUpload
              currentImageUrl={formData.image}
              onImageUrlChange={(url) => setFormData({ ...formData, image: url })}
              label="Foto (opzionale)"
            />

            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-primary" />
                <Label className="text-sm sm:text-base">Posizione *</Label>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Cerca il luogo o clicca sulla mappa per impostare latitudine e longitudine
              </p>
              <MapPicker
                latitude={formData.latitude}
                longitude={formData.longitude}
                onLocationSelect={(lat, lng) =>
                  setFormData({ ...formData, latitude: lat, longitude: lng })
                }
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">Citta</Label>
                <Input
                  id="city"
                  type="text"
                  placeholder="Es. Courmayeur"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="province">Provincia</Label>
                <Input
                  id="province"
                  type="text"
                  placeholder="Es. AO"
                  value={formData.province}
                  onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                  className="border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Stato</Label>
                <Input
                  id="country"
                  type="text"
                  placeholder="Es. Italia"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="activityDay">Giorno dell'attivita *</Label>
                <Input
                  id="activityDay"
                  type="date"
                  value={formData.activityDay}
                  onChange={(e) => setFormData({ ...formData, activityDay: e.target.value })}
                  className="border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hoursSpent">Ore impiegate</Label>
                <Input
                  id="hoursSpent"
                  type="number"
                  min="0"
                  step="0.5"
                  placeholder="Es. 6"
                  value={formData.hoursSpent}
                  onChange={(e) => setFormData({ ...formData, hoursSpent: e.target.value })}
                  className="border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>

            {formData.activityType === 'MULTIPITCH' && (
              <div className="space-y-4 rounded-lg border-2 border-border p-4 bg-accent/5">
                <p className="text-sm font-semibold text-muted-foreground">Dettagli multipitch</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pitchCount">Numero di tiri *</Label>
                    <Input
                      id="pitchCount"
                      type="number"
                      min="1"
                      placeholder="Es. 8"
                      value={formData.pitchCount}
                      onChange={(e) => setFormData({ ...formData, pitchCount: e.target.value })}
                      className="border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="totalLengthMeters">Lunghezza totale (m) *</Label>
                    <Input
                      id="totalLengthMeters"
                      type="number"
                      min="1"
                      placeholder="Es. 350"
                      value={formData.totalLengthMeters}
                      onChange={(e) =>
                        setFormData({ ...formData, totalLengthMeters: e.target.value })
                      }
                      className="border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Protezione *</Label>
                  <Select
                    value={formData.protectionStyle}
                    onValueChange={(value) =>
                      setFormData({ ...formData, protectionStyle: value as ProtectionStyle })
                    }
                  >
                    <SelectTrigger className="border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all">
                      <SelectValue placeholder="Spittato o Trad" />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(PROTECTION_STYLE_LABELS) as ProtectionStyle[]).map((style) => (
                        <SelectItem key={style} value={style}>
                          {PROTECTION_STYLE_LABELS[style]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {formData.activityType === 'HIKE' && (
              <div className="space-y-4 rounded-lg border-2 border-border p-4 bg-accent/5">
                <p className="text-sm font-semibold text-muted-foreground">Dettagli escursione</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="maxAltitude">Altitudine massima (m) *</Label>
                    <Input
                      id="maxAltitude"
                      type="number"
                      min="0"
                      placeholder="Es. 2800"
                      value={formData.maxAltitude}
                      onChange={(e) => setFormData({ ...formData, maxAltitude: e.target.value })}
                      className="border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="elevationGain">Dislivello (m) *</Label>
                    <Input
                      id="elevationGain"
                      type="number"
                      min="0"
                      placeholder="Es. 1200"
                      value={formData.elevationGain}
                      onChange={(e) => setFormData({ ...formData, elevationGain: e.target.value })}
                      className="border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                className="flex-1"
              >
                Annulla
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                <PlusCircle className="w-4 h-4 mr-2" />
                Aggiungi Attivita
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
