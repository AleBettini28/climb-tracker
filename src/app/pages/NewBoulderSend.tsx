import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link, useParams } from 'react-router';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { PlusCircle, Hexagon, ArrowRight } from 'lucide-react';
import { DIFFICULTY_LABELS } from '../types/climb';
import { toast } from 'sonner';
import { BoulderSendCreateRequest, BoulderRouteDetailResponseExtended, boulderRoutesApi } from '../api/boulderRoutes';
import { auth } from '../utils/auth';

export function NewBoulderSend() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedBoulderRoute, setSelectedBoulderRoute] = useState<BoulderRouteDetailResponseExtended | null>(null);
  const [formData, setFormData] = useState({
    sendType: 'flash' as 'flash' | 'attempts',
    perceivedDifficulty: '3' as '1' | '2' | '3' | '4' | '5',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  useEffect(() => {
    if (location.state?.selectedBoulderRoute) {
      setSelectedBoulderRoute(location.state.selectedBoulderRoute as BoulderRouteDetailResponseExtended);
    }
  }, [location.state]);

  const { id: boulderRouteId } = useParams<{ id: string }>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedBoulderRoute || !boulderRouteId) {
      toast.error('Seleziona un blocco dall\'archivio');
      return;
    }

    const user = await auth.getSession();

    if (!user) {
      toast.error('Errore nel recuperare i dati dell utente.');
      return;
    }

    setIsSubmitting(true);

    const newBoulderSend: BoulderSendCreateRequest = {
      boulder_route_id: boulderRouteId,
      is_flash: formData.sendType === "flash" ? true : false,
      difficulty: parseInt(formData.perceivedDifficulty) as 1 | 2 | 3 | 4 | 5,
      day: formData.date,
      description: formData.description || "",
    };

    try {
      await boulderRoutesApi.sendOne(user.id, newBoulderSend);
      toast.success('Invio aggiunto con successo! 🎉');
      navigate(`/masso/${selectedBoulderRoute.boulder_id}`);
    } catch (error) {
      console.error('Error adding boulder send:', error);
      toast.error('Errore durante l\'aggiunta dell\'invio');
    } finally {
      setIsSubmitting(false);
    }
  };

  const difficultyOptions: Array<1 | 2 | 3 | 4 | 5> = [1, 2, 3, 4, 5];

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Hexagon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <h1 className="text-xl sm:text-2xl">Nuovo Invio</h1>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground">Registra un nuovo blocco completato</p>
        </div>

        {/* Selected Boulder Route Info */}
        {selectedBoulderRoute ? (
          <Card className="p-4 sm:p-5 mb-6 bg-accent/10">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-1">Blocco Selezionato</p>
                <h3 className="text-lg font-semibold mb-1">{selectedBoulderRoute.route_name}</h3>
                <p className="text-sm text-muted-foreground mb-2">{selectedBoulderRoute.boulder_name} · {selectedBoulderRoute.boulder_area_name}</p>
                <span className="inline-flex items-center px-2.5 py-1 bg-primary text-primary-foreground rounded-full text-sm font-medium">
                  {selectedBoulderRoute.grade}
                </span>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="p-6 sm:p-8 mb-6 text-center">
            <Hexagon className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
            <h3 className="text-lg font-semibold mb-2">Nessun blocco selezionato</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Seleziona un blocco dall'archivio per registrare il tuo invio
            </p>
            <Link to="/esplora">
              <Button>
                <Hexagon className="w-4 h-4 mr-2" />
                Cerca Boulder nell'Archivio
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </Card>
        )}

        {/* Send Form */}
        {selectedBoulderRoute && (
          <Card className="p-4 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
              {/* Send Type */}
              <div className="space-y-3">
                <Label className="text-sm sm:text-base">Tipologia *</Label>
                <RadioGroup
                  value={formData.sendType}
                  onValueChange={(value) => setFormData({ ...formData, sendType: value as 'flash' | 'attempts' })}
                  className="flex flex-col sm:flex-row gap-3 sm:gap-4"
                >
                  <div className="flex items-center space-x-2 flex-1">
                    <div className="relative flex items-center">
                      <RadioGroupItem value="flash" id="flash" />
                    </div>
                    <Label
                      htmlFor="flash"
                      className="flex-1 cursor-pointer p-3 sm:p-4 border-2 border-border rounded-lg hover:bg-accent/10 transition-colors"
                      style={{
                        backgroundColor: formData.sendType === 'flash' ? 'var(--accent)' : 'transparent',
                        borderColor: formData.sendType === 'flash' ? 'var(--primary)' : 'var(--border)'
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg sm:text-xl">⚡</span>
                        <div>
                          <p className="font-medium text-sm sm:text-base">Flash</p>
                          <p className="text-xs text-muted-foreground">Primo tentativo</p>
                        </div>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 flex-1">
                    <div className="relative flex items-center">
                      <RadioGroupItem value="attempts" id="attempts" />
                    </div>
                    <Label
                      htmlFor="attempts"
                      className="flex-1 cursor-pointer p-3 sm:p-4 border-2 border-border rounded-lg hover:bg-accent/10 transition-colors"
                      style={{
                        backgroundColor: formData.sendType === 'attempts' ? 'var(--accent)' : 'transparent',
                        borderColor: formData.sendType === 'attempts' ? 'var(--primary)' : 'var(--border)'
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg sm:text-xl">🔁</span>
                        <div>
                          <p className="font-medium text-sm sm:text-base">Dopo Tentativi</p>
                          <p className="text-xs text-muted-foreground">Progressione</p>
                        </div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Perceived Difficulty */}
              <div className="space-y-3">
                <Label className="text-sm sm:text-base">Difficoltà Percepita *</Label>
                <RadioGroup
                  value={formData.perceivedDifficulty}
                  onValueChange={(value) => setFormData({ ...formData, perceivedDifficulty: value as '1' | '2' | '3' | '4' | '5' })}
                  className="grid grid-cols-5 gap-2 sm:gap-3"
                >
                  {difficultyOptions.map((level) => (
                    <div key={level} className="relative">
                      <RadioGroupItem
                        value={level.toString()}
                        id={`difficulty-${level}`}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={`difficulty-${level}`}
                        className="flex flex-col items-center justify-center p-2 sm:p-3 border-2 border-border rounded-lg cursor-pointer hover:bg-accent/10 transition-colors peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground peer-data-[state=checked]:border-primary"
                      >
                        <span className="text-xl sm:text-2xl font-bold mb-0.5 sm:mb-1">{level}</span>
                        <span className="text-[0.65rem] sm:text-xs text-center leading-tight">
                          {DIFFICULTY_LABELS[level].split(' ').map((word, i) => (
                            <span key={i} className="block">{word}</span>
                          ))}
                        </span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
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

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Note / Descrizione (Opzionale)</Label>
                <Textarea
                  id="description"
                  placeholder="Es. Bel boulder tecnico, crux al primo movimento..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all min-h-[100px]"
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
                  Aggiungi Invio
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}
