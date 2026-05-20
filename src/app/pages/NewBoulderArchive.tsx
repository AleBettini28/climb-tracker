import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { boulderArchiveStorage } from '../utils/boulderArchiveStorage';
import { zoneStorage } from '../utils/zoneStorage';
import { BOULDER_GRADES } from '../types/boulder';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { PlusCircle, Mountain, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { MapPicker } from '../components/MapPicker';
import { auth } from '../utils/auth';

export function NewBoulderArchive() {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedZone = (location.state as any)?.selectedZone;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allZones, setAllZones] = useState<any[]>([]);
  const [filteredZones, setFilteredZones] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [formData, setFormData] = useState({
    zone: selectedZone?.name || '',
    boulderName: '',
    problemNumber: '',
    grade: '',
    latitude: selectedZone?.latitude || undefined,
    longitude: selectedZone?.longitude || undefined,
  });

  useEffect(() => {
    loadExistingZones();
  }, []);

  const loadExistingZones = async () => {
    try {
      const zones = await zoneStorage.getZones();
      setAllZones(zones);
    } catch (error) {
      console.error('Error loading zones:', error);
    }
  };

  const handleZoneChange = (value: string) => {
    setFormData({ ...formData, zone: value });

    if (value.trim()) {
      const filtered = allZones.filter(zone =>
        zone.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredZones(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectZone = (zone: any) => {
    setFormData({
      ...formData,
      zone: zone.name,
      latitude: zone.latitude,
      longitude: zone.longitude
    });
    toast.info('Coordinate pre-compilate dalla zona esistente');
    setShowSuggestions(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.zone || !formData.boulderName || !formData.problemNumber || !formData.grade) {
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
      if (!session?.id) {
        toast.error('Devi essere autenticato per aggiungere un boulder');
        return;
      }

      // Find or create the zone
      const zone = await zoneStorage.findOrCreateZone(
        formData.zone,
        formData.latitude,
        formData.longitude,
        session.id
      );

      const newBoulder = {
        id: crypto.randomUUID(),
        zoneId: zone.id,
        zone: zone.name,
        boulderName: formData.boulderName,
        problemNumber: formData.problemNumber,
        grade: formData.grade,
        latitude: zone.latitude,
        longitude: zone.longitude,
        addedBy: session.id,
      };

      await boulderArchiveStorage.addBoulder(newBoulder);
      toast.success('Boulder aggiunto con successo! 🎉');
      navigate('/tutti-i-boulder');
    } catch (error) {
      console.error('Error adding boulder:', error);
      toast.error('Errore durante l\'aggiunta del boulder');
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
            <h1 className="text-xl sm:text-2xl">Aggiungi Nuovo Boulder</h1>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground">Aggiungi un boulder all'archivio condiviso</p>
        </div>

        {selectedZone && (
          <Card className="p-4 mb-4 bg-accent/10">
            <div className="flex items-start gap-3">
              <Mountain className="w-5 h-5 text-primary mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Zona selezionata</h3>
                <p className="text-sm text-muted-foreground">{selectedZone.name}</p>
              </div>
            </div>
          </Card>
        )}

        <Card className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            {/* Zone */}
            {!selectedZone && (
              <div className="space-y-2 relative">
                <Label htmlFor="zone">Zona *</Label>
                <Input
                  id="zone"
                  type="text"
                  placeholder="Es. Magic Wood, Fontainebleau"
                  value={formData.zone}
                  onChange={(e) => handleZoneChange(e.target.value)}
                  onFocus={() => {
                    if (formData.zone && filteredZones.length > 0) {
                    setShowSuggestions(true);
                  }
                }}
                onBlur={() => {
                  // Delay to allow click on suggestion
                  setTimeout(() => setShowSuggestions(false), 200);
                }}
                className="border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                required
                autoComplete="off"
              />

              {/* Autocomplete Suggestions */}
              {showSuggestions && filteredZones.length > 0 && (
                <div className="absolute z-[10000] w-full mt-1 bg-card border-2 border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredZones.map((zone) => (
                    <button
                      key={zone.id}
                      type="button"
                      onClick={() => selectZone(zone)}
                      className="w-full text-left px-4 py-2.5 hover:bg-accent transition-colors text-sm border-b border-border last:border-b-0"
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{zone.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              </div>
            )}

            {/* Boulder Name */}
            <div className="space-y-2">
              <Label htmlFor="boulderName">Nome Masso *</Label>
              <Input
                id="boulderName"
                type="text"
                placeholder="Es. The Big Island"
                value={formData.boulderName}
                onChange={(e) => setFormData({ ...formData, boulderName: e.target.value })}
                className="border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                required
              />
            </div>

            {/* Problem Number */}
            <div className="space-y-2">
              <Label htmlFor="problemNumber">Numero Via *</Label>
              <Input
                id="problemNumber"
                type="text"
                placeholder="Es. A, B, C, 1, 2"
                value={formData.problemNumber}
                onChange={(e) => setFormData({ ...formData, problemNumber: e.target.value })}
                className="border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                required
              />
            </div>

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
                  {BOULDER_GRADES.map(grade => (
                    <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
                Aggiungi Boulder
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
