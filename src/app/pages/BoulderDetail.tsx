import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { boulderStorage } from '../utils/boulderStorage';
import { BoulderSend } from '../types/boulder';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { ArrowLeft, Mountain, Trash2, Edit, Save, X, MapPin } from 'lucide-react';
import { toast } from 'sonner';

export function BoulderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [send, setSend] = useState<BoulderSend | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    attempts: 1,
    date: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSend = async () => {
      try {
        const sends = await boulderStorage.getBoulderSends();
        const foundSend = sends.find(s => s.id === id);
        setSend(foundSend || null);
        if (foundSend) {
          setEditForm({
            attempts: foundSend.attempts,
            date: foundSend.date,
          });
        }
      } catch (error) {
        console.error('Error loading boulder send:', error);
        toast.error('Errore nel caricamento del boulder');
      } finally {
        setLoading(false);
      }
    };

    fetchSend();
  }, [id]);

  const handleSave = async () => {
    if (!send) return;

    setSaving(true);
    try {
      const updatedSend: BoulderSend = {
        ...send,
        attempts: editForm.attempts,
        date: editForm.date,
      };
      await boulderStorage.updateBoulderSend(updatedSend);
      setSend(updatedSend);
      setIsEditing(false);
      toast.success('Boulder aggiornato con successo!');
    } catch (error) {
      console.error('Error updating boulder send:', error);
      toast.error('Errore durante l\'aggiornamento');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (send) {
      setEditForm({
        attempts: send.attempts,
        date: send.date,
      });
    }
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (!send) return;

    if (confirm(`Sei sicuro di voler eliminare questo boulder?`)) {
      try {
        await boulderStorage.deleteBoulderSend(send.id);
        toast.success('Boulder eliminato con successo');
        navigate('/boulder');
      } catch (error) {
        console.error('Error deleting boulder send:', error);
        toast.error('Errore durante l\'eliminazione');
      }
    }
  };

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

  if (!send) {
    return (
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <Card className="p-8 sm:p-12 text-center">
          <Mountain className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Boulder non trovato</h2>
          <p className="text-muted-foreground mb-4">Il boulder che stai cercando non esiste.</p>
          <Link to="/boulder">
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
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <Link to="/boulder">
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
              <h1 className="text-xl sm:text-2xl">
                {send.boulderName} - {send.problemNumber}
              </h1>
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
            {isEditing ? 'Modifica i tuoi dati personali' : 'Dettagli del boulder'}
          </p>
        </div>

        {/* Boulder Info Card (Read-only) */}
        <Card className="p-5 sm:p-6 mb-4 bg-accent/10">
          <h2 className="text-base font-semibold mb-4">Informazioni Boulder</h2>
          <div className="space-y-4">
            {/* Zone */}
            <div>
              <p className="text-sm text-muted-foreground mb-1">Zona</p>
              <p className="text-lg font-semibold">{send.boulderZone}</p>
            </div>

            {/* Boulder Name & Problem Number */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Masso</p>
                <p className="text-base font-semibold">{send.boulderName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Numero Via</p>
                <p className="text-base font-semibold">{send.problemNumber}</p>
              </div>
            </div>

            {/* Grade */}
            <div>
              <p className="text-sm text-muted-foreground mb-1">Grado</p>
              <span className="inline-flex items-center px-3 py-1.5 bg-primary text-primary-foreground rounded-full text-base font-medium">
                {send.boulderGrade}
              </span>
            </div>

            {/* Location */}
            {send.boulderLatitude && send.boulderLongitude && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Coordinate</p>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <p className="text-xs font-mono">
                    {send.boulderLatitude.toFixed(4)}, {send.boulderLongitude.toFixed(4)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Personal Data Card (Editable) */}
        <Card className="p-5 sm:p-6">
          <h2 className="text-base font-semibold mb-4">
            {isEditing ? 'Modifica Dati Personali' : 'Dati Personali'}
          </h2>
          <div className="space-y-5 sm:space-y-6">
            {/* Attempts */}
            <div className="space-y-2">
              <Label htmlFor="attempts">Numero di Tentativi *</Label>
              {isEditing ? (
                <Input
                  id="attempts"
                  type="number"
                  min="1"
                  value={editForm.attempts}
                  onChange={(e) => setEditForm({ ...editForm, attempts: parseInt(e.target.value) || 1 })}
                  className="border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  required
                />
              ) : (
                <p className="text-base font-medium">
                  {send.attempts} {send.attempts === 1 ? 'tentativo' : 'tentativi'}
                </p>
              )}
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date">Data *</Label>
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
                  {new Date(send.date).toLocaleDateString('it-IT', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
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
