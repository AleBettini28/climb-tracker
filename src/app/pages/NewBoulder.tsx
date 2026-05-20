import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router';
import { boulderStorage } from '../utils/boulderStorage';
import { Boulder } from '../types/boulder';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { PlusCircle, Mountain, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export function NewBoulder() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedBoulder, setSelectedBoulder] = useState<Boulder | null>(null);
  const [formData, setFormData] = useState({
    attempts: 1,
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    // Check if a boulder was passed from BoulderArchiveDetail page
    if (location.state?.selectedBoulder) {
      setSelectedBoulder(location.state.selectedBoulder as Boulder);
    }
  }, [location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedBoulder) {
      toast.error('Seleziona un boulder dall\'archivio');
      return;
    }

    setIsSubmitting(true);

    const newSend = {
      id: crypto.randomUUID(),
      boulderId: selectedBoulder.id,
      attempts: formData.attempts,
      date: formData.date,
    };

    try {
      await boulderStorage.addBoulderSend(newSend);
      toast.success('Boulder aggiunto con successo! 🎉');
      navigate('/boulder');
    } catch (error) {
      console.error('Error adding boulder send:', error);
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
            <h1 className="text-xl sm:text-2xl">Nuovo Boulder</h1>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground">Registra un boulder completato</p>
        </div>

        {/* Selected Boulder Info */}
        {selectedBoulder ? (
          <Card className="p-4 sm:p-5 mb-6 bg-accent/10">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-1">Boulder Selezionato</p>
                <h3 className="text-lg font-semibold mb-1">
                  {selectedBoulder.boulderName} - {selectedBoulder.problemNumber}
                </h3>
                <p className="text-sm text-muted-foreground mb-2">{selectedBoulder.zone}</p>
                <span className="inline-flex items-center px-2.5 py-1 bg-primary text-primary-foreground rounded-full text-sm font-medium">
                  {selectedBoulder.grade}
                </span>
              </div>
              <Link to="/tutti-i-boulder">
                <Button variant="outline" size="sm">
                  Cambia Boulder
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <Card className="p-6 sm:p-8 mb-6 text-center">
            <Mountain className="w-12 sm:w-16 h-12 sm:h-16 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-medium mb-2">Seleziona un Boulder</h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-4">
              Per registrare un boulder, prima selezionalo dall'archivio
            </p>
            <Link to="/tutti-i-boulder">
              <Button>
                <ArrowRight className="w-4 h-4 mr-2" />
                Vai all'Archivio
              </Button>
            </Link>
          </Card>
        )}

        {/* Personal Data Form */}
        {selectedBoulder && (
          <Card className="p-4 sm:p-6">
            <h2 className="text-base font-semibold mb-4">Dati Personali</h2>
            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
              {/* Attempts */}
              <div className="space-y-2">
                <Label htmlFor="attempts">Numero di Tentativi *</Label>
                <Input
                  id="attempts"
                  type="number"
                  min="1"
                  value={formData.attempts}
                  onChange={(e) => setFormData({ ...formData, attempts: parseInt(e.target.value) || 1 })}
                  className="border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  required
                />
              </div>

              {/* Date */}
              <div className="space-y-2">
                <Label htmlFor="date">Data *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  max={new Date().toISOString().split('T')[0]}
                  className="border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  required
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
        )}
      </div>
    </div>
  );
}
