import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { storage } from '../utils/storage';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { ArrowLeft, Mountain, MapPin, Trash2, Edit, Save, X } from 'lucide-react';
import { DIFFICULTY_LABELS, Climb } from '../types/climb';
import { toast } from 'sonner';

export function ClimbDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [climb, setClimb] = useState<Climb | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    leadType: 'lead' as 'lead' | 'second',
    perceivedDifficulty: 3 as 1 | 2 | 3 | 4 | 5,
    date: '',
    description: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchClimb = async () => {
      try {
        const climbs = await storage.getClimbs();
        const foundClimb = climbs.find(c => c.id === id);
        if (foundClimb) {
          setClimb(foundClimb);
          setEditForm({
            leadType: foundClimb.leadType,
            perceivedDifficulty: foundClimb.perceivedDifficulty,
            date: foundClimb.date,
            description: foundClimb.description || ''
          });
        }
      } catch (error) {
        console.error('Error loading climb:', error);
        toast.error('Errore nel caricamento della scalata');
      } finally {
        setLoading(false);
      }
    };

    fetchClimb();
  }, [id]);

  const handleSave = async () => {
    if (!climb) return;

    setSaving(true);
    try {
      const updatedClimb = {
        id: climb.id,
        routeId: climb.routeId,
        leadType: editForm.leadType,
        perceivedDifficulty: editForm.perceivedDifficulty,
        date: editForm.date,
        description: editForm.description || undefined,
      };

      await storage.updateClimb(updatedClimb);

      // Update local state
      setClimb({
        ...climb,
        ...updatedClimb
      });
      setIsEditing(false);
      toast.success('Scalata aggiornata con successo!');
    } catch (error) {
      console.error('Error updating climb:', error);
      toast.error('Errore durante l\'aggiornamento');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (climb) {
      setEditForm({
        leadType: climb.leadType,
        perceivedDifficulty: climb.perceivedDifficulty,
        date: climb.date,
        description: climb.description || ''
      });
    }
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (!climb) return;

    if (confirm(`Sei sicuro di voler eliminare questa scalata?`)) {
      try {
        await storage.deleteClimb(climb.id);
        toast.success('Scalata eliminata con successo');
        navigate('/vie');
      } catch (error) {
        console.error('Error deleting climb:', error);
        toast.error('Errore durante l\'eliminazione');
      }
    }
  };

  const difficultyOptions: Array<1 | 2 | 3 | 4 | 5> = [1, 2, 3, 4, 5];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-amber-700 border-r-transparent"></div>
            <p className="mt-4 text-stone-600">Caricamento...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!climb) {
    return (
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <Card className="p-8 sm:p-12 text-center">
          <Mountain className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Scalata non trovata</h2>
          <p className="text-muted-foreground mb-4">La scalata che stai cercando non esiste.</p>
          <Link to="/vie">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Torna alla lista
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <Link to="/vie">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Torna alla lista
            </Button>
          </Link>

          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Mountain className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <h1 className="text-xl sm:text-2xl">{isEditing ? 'Modifica Scalata' : climb.routeName || 'Via sconosciuta'}</h1>
            </div>
            {!isEditing && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit className="w-4 h-4 mr-1" />
                  Modifica
                </Button>
                <Button variant="destructive" size="sm" onClick={handleDelete}>
                  <Trash2 className="w-4 h-4 mr-1" />
                  Elimina
                </Button>
              </div>
            )}
          </div>
          <p className="text-sm sm:text-base text-muted-foreground">
            {isEditing ? 'Modifica i dati della tua scalata' : 'Visualizza i dettagli della scalata'}
          </p>
        </div>

        {/* Route Info (Read-only) */}
        <Card className="p-4 sm:p-6 mb-4 bg-accent/10">
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground">INFORMAZIONI VIA</h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Nome Via</p>
              <p className="text-base font-semibold">{climb.routeName || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Falesia</p>
              <p className="text-base font-medium">{climb.routeCrag || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Grado</p>
              <span className="inline-flex items-center px-3 py-1.5 bg-primary text-primary-foreground rounded-full text-sm font-medium">
                {climb.routeGrade || 'N/A'}
              </span>
            </div>
            {climb.routeLatitude && climb.routeLongitude && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Posizione</p>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <p className="text-xs font-mono">
                    {climb.routeLatitude.toFixed(4)}, {climb.routeLongitude.toFixed(4)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Climb Details (Editable) */}
        <Card className="p-4 sm:p-6">
          <h3 className="text-sm font-semibold mb-4 text-muted-foreground">I TUOI DATI</h3>
          <div className="space-y-5 sm:space-y-6">
            {/* Lead Type */}
            <div className="space-y-3">
              <Label className="text-sm sm:text-base">Tipologia</Label>
              {isEditing ? (
                <RadioGroup
                  value={editForm.leadType}
                  onValueChange={(value) => setEditForm({ ...editForm, leadType: value as 'lead' | 'second' })}
                  className="flex flex-col sm:flex-row gap-3 sm:gap-4"
                >
                  <div className="flex items-center space-x-2 flex-1">
                    <div className="relative flex items-center">
                      <RadioGroupItem value="lead" id="lead" />
                    </div>
                    <Label
                      htmlFor="lead"
                      className="flex-1 cursor-pointer p-3 sm:p-4 border-2 border-border rounded-lg hover:bg-accent/10 transition-colors"
                      style={{
                        backgroundColor: editForm.leadType === 'lead' ? 'var(--accent)' : 'transparent',
                        borderColor: editForm.leadType === 'lead' ? 'var(--primary)' : 'var(--border)'
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg sm:text-xl">🧗</span>
                        <div>
                          <p className="font-medium text-sm sm:text-base">Da Primo</p>
                          <p className="text-xs text-muted-foreground">Lead climbing</p>
                        </div>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 flex-1">
                    <div className="relative flex items-center">
                      <RadioGroupItem value="second" id="second" />
                    </div>
                    <Label
                      htmlFor="second"
                      className="flex-1 cursor-pointer p-3 sm:p-4 border-2 border-border rounded-lg hover:bg-accent/10 transition-colors"
                      style={{
                        backgroundColor: editForm.leadType === 'second' ? 'var(--accent)' : 'transparent',
                        borderColor: editForm.leadType === 'second' ? 'var(--primary)' : 'var(--border)'
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg sm:text-xl">⛓️</span>
                        <div>
                          <p className="font-medium text-sm sm:text-base">Da Secondo</p>
                          <p className="text-xs text-muted-foreground">Top rope</p>
                        </div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              ) : (
                <span className="inline-flex items-center px-3 py-1.5 bg-accent/30 text-accent-foreground rounded-full text-sm">
                  {climb.leadType === 'lead' ? '🧗 Da Primo' : '⛓️ Da Secondo'}
                </span>
              )}
            </div>

            {/* Perceived Difficulty */}
            <div className="space-y-3">
              <Label className="text-sm sm:text-base">Difficoltà Percepita</Label>
              {isEditing ? (
                <RadioGroup
                  value={editForm.perceivedDifficulty.toString()}
                  onValueChange={(value) => setEditForm({ ...editForm, perceivedDifficulty: parseInt(value) as 1 | 2 | 3 | 4 | 5 })}
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
              ) : (
                <span className="inline-flex items-center px-3 py-1.5 bg-secondary text-secondary-foreground rounded-full text-sm">
                  {DIFFICULTY_LABELS[climb.perceivedDifficulty]}
                </span>
              )}
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              {isEditing ? (
                <Input
                  id="date"
                  type="date"
                  value={editForm.date}
                  onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                  max={new Date().toISOString().split('T')[0]}
                  className="border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  required
                />
              ) : (
                <p className="text-base">
                  {new Date(climb.date).toLocaleDateString('it-IT', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Note / Descrizione</Label>
              {isEditing ? (
                <Textarea
                  id="description"
                  placeholder="Es. Ottima via, crux al secondo tiro..."
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all min-h-[100px]"
                />
              ) : (
                <p className="text-base text-muted-foreground italic">
                  {climb.description || 'Nessuna nota'}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  className="flex-1"
                  disabled={saving}
                >
                  <X className="w-4 h-4 mr-2" />
                  Annulla
                </Button>
                <Button
                  type="button"
                  onClick={handleSave}
                  className="flex-1"
                  disabled={saving}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Salvataggio...' : 'Salva Modifiche'}
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
