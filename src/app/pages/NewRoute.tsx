import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { routeStorage } from '../utils/routeStorage';
import { cragStorage } from '../utils/cragStorage';
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

export function NewRoute() {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedCrag = (location.state as any)?.selectedCrag;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allCrags, setAllCrags] = useState<any[]>([]);
  const [filteredCrags, setFilteredCrags] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    crag: selectedCrag?.name || '',
    grade: '',
    length: undefined as number | undefined,
    latitude: selectedCrag?.latitude || undefined,
    longitude: selectedCrag?.longitude || undefined,
  });

  useEffect(() => {
    loadExistingCrags();
  }, []);

  const loadExistingCrags = async () => {
    try {
      const crags = await cragStorage.getCrags();
      setAllCrags(crags);
    } catch (error) {
      console.error('Error loading crags:', error);
    }
  };

  const handleCragChange = (value: string) => {
    setFormData({ ...formData, crag: value });

    if (value.trim()) {
      const filtered = allCrags.filter(crag =>
        crag.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredCrags(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectCrag = (crag: any) => {
    setFormData({
      ...formData,
      crag: crag.name,
      latitude: crag.latitude,
      longitude: crag.longitude
    });
    toast.info('Coordinate pre-compilate dalla falesia esistente');
    setShowSuggestions(false);
  };

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
      if (!session?.id) {
        toast.error('Devi essere autenticato per aggiungere una via');
        return;
      }

      // Find or create the crag
      const crag = await cragStorage.findOrCreateCrag(
        formData.crag,
        formData.latitude,
        formData.longitude,
        session.id
      );

      const newRoute = {
        id: crypto.randomUUID(),
        name: formData.name,
        cragId: crag.id,
        crag: crag.name,
        grade: formData.grade,
        length: formData.length,
        latitude: crag.latitude,
        longitude: crag.longitude,
        addedBy: session.id,
      };

      await routeStorage.addRoute(newRoute);
      toast.success('Via aggiunta con successo! 🎉');
      navigate('/tutte-le-vie');
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
                  onChange={(e) => handleCragChange(e.target.value)}
                  onFocus={() => {
                    if (formData.crag && filteredCrags.length > 0) {
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
              {showSuggestions && filteredCrags.length > 0 && (
                <div className="absolute z-[10000] w-full mt-1 bg-card border-2 border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredCrags.map((crag) => (
                    <button
                      key={crag.id}
                      type="button"
                      onClick={() => selectCrag(crag)}
                      className="w-full text-left px-4 py-2.5 hover:bg-accent transition-colors text-sm border-b border-border last:border-b-0"
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{crag.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
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
