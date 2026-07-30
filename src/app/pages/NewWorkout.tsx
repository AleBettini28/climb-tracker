import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Dumbbell, PlusCircle, Calendar, Trash2, CheckCircle2, XCircle, Flag, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { workoutsApi, workoutSendsApi, WorkoutSendDetailResponse } from '../api';
import {
  WORKOUT_SEND_KINDS,
  WORKOUT_SEND_KIND_LABELS,
  CLIMBING_TYPES,
  CLIMBING_TYPE_LABELS,
  WorkoutSendKind,
  ClimbingType,
} from '../types/workout';
import { CLIMBING_GRADES } from '../types/route';
import { BOULDER_GRADES } from '../types/boulderArea';

export function NewWorkout() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [day, setDay] = useState(new Date().toISOString().split('T')[0]);
  const [workoutId, setWorkoutId] = useState<string | null>(null);
  const [isCheckingOpenWorkout, setIsCheckingOpenWorkout] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeletingWorkout, setIsDeletingWorkout] = useState(false);

  const [sends, setSends] = useState<WorkoutSendDetailResponse[]>([]);
  const [isAddingSend, setIsAddingSend] = useState(false);

  const [sendForm, setSendForm] = useState({
    kind: 'BOULDER' as WorkoutSendKind,
    grade: '',
    numberOfTries: '1',
    sent: true,
    climbingType: '' as ClimbingType | '',
  });

  // Resume an already-open workout (if any) so the user can keep adding sends
  // across app restarts / devices without having to keep the page open.
  useEffect(() => {
    if (!user) {
      setIsCheckingOpenWorkout(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        setIsCheckingOpenWorkout(true);
        const openWorkout = await workoutsApi.getOpenOne(user.id);
        if (cancelled) return;

        if (openWorkout) {
          setWorkoutId(openWorkout.id);
          setDay(openWorkout.day);
          const existingSends = await workoutSendsApi.list(openWorkout.id);
          if (!cancelled) setSends(existingSends);
        }
      } catch (error) {
        console.error('Error checking for open workout:', error);
      } finally {
        if (!cancelled) setIsCheckingOpenWorkout(false);
      }
    })();

    return () => { cancelled = true; };
  }, [user]);

  const handleStartWorkout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('Devi essere autenticato per iniziare un allenamento');
      return;
    }

    setIsStarting(true);
    try {
      const id = await workoutsApi.createOne({ user_id: user.id, day });
      setWorkoutId(id);
      toast.success('Allenamento iniziato! 💪');
    } catch (error) {
      console.error('Error creating workout:', error);
      toast.error("Errore durante l'avvio dell'allenamento");
    } finally {
      setIsStarting(false);
    }
  };

  const handleAddSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workoutId) return;

    setIsAddingSend(true);
    try {
      const id = await workoutSendsApi.createOne({
        workout_id: workoutId,
        grade: sendForm.grade || undefined,
        kind: sendForm.kind,
        number_of_tries: sendForm.numberOfTries ? parseInt(sendForm.numberOfTries, 10) : undefined,
        sent: sendForm.sent,
        climbing_type: sendForm.climbingType || undefined,
      });

      setSends((prev) => [
        ...prev,
        {
          id,
          workout_id: workoutId,
          grade: sendForm.grade || undefined,
          kind: sendForm.kind,
          number_of_tries: sendForm.numberOfTries ? parseInt(sendForm.numberOfTries, 10) : undefined,
          sent: sendForm.sent,
          climbing_type: sendForm.climbingType || undefined,
        },
      ]);

      setSendForm({ kind: 'BOULDER', grade: '', numberOfTries: '1', sent: true, climbingType: '' });
      toast.success('Invio aggiunto');
    } catch (error) {
      console.error('Error adding send:', error);
      toast.error("Errore durante l'aggiunta dell'invio");
    } finally {
      setIsAddingSend(false);
    }
  };

  const handleDeleteSend = async (sendId: string) => {
    try {
      await workoutSendsApi.deleteOne(sendId);
      setSends((prev) => prev.filter((s) => s.id !== sendId));
      toast.success('Invio rimosso');
    } catch (error) {
      console.error('Error deleting send:', error);
      toast.error("Errore durante la rimozione dell'invio");
    }
  };

  const handleDeleteWorkout = async () => {
    if (!workoutId) return;

    setIsDeletingWorkout(true);
    try {
      await workoutsApi.deleteOne(workoutId);
      toast.success('Allenamento eliminato');
      navigate('/allenamenti');
    } catch (error) {
      console.error('Error deleting workout:', error);
      toast.error("Errore durante l'eliminazione dell'allenamento");
    } finally {
      setIsDeletingWorkout(false);
      setShowDeleteDialog(false);
    }
  };

  const handleCloseWorkout = async () => {
    if (!workoutId) return;

    setIsClosing(true);
    try {
      await workoutsApi.closeOne(workoutId);
      toast.success('Allenamento chiuso! 🎉');
      navigate(`/allenamento/${workoutId}`);
    } catch (error) {
      console.error('Error closing workout:', error);
      toast.error("Errore durante la chiusura dell'allenamento");
    } finally {
      setIsClosing(false);
    }
  };

  if (isCheckingOpenWorkout) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-amber-700 border-r-transparent"></div>
          <p className="mt-4 text-stone-600">Caricamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="max-w-2xl mx-auto">
        <Button variant="ghost" className="mb-4" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Torna Indietro
        </Button>

        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Dumbbell className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <h1 className="text-xl sm:text-2xl">{workoutId ? 'Allenamento in Corso' : 'Nuovo Allenamento'}</h1>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground">
            {workoutId
              ? "Il tuo allenamento resta aperto anche se chiudi l'app: continua ad aggiungere invii quando vuoi"
              : 'Imposta la data e inizia il tuo allenamento'}
          </p>
        </div>

        {!workoutId ? (
          <Card className="p-4 sm:p-6">
            <form onSubmit={handleStartWorkout} className="space-y-5 sm:space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <Label htmlFor="day">Data Allenamento *</Label>
                </div>
                <Input
                  id="day"
                  type="date"
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => navigate(-1)} className="flex-1">
                  Annulla
                </Button>
                <Button type="submit" className="flex-1" disabled={isStarting}>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Inizia Allenamento
                </Button>
              </div>
            </form>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Sends list */}
            {sends.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-base font-semibold">Invii Registrati ({sends.length})</h3>
                {sends.map((send) => (
                  <Card key={send.id} className="p-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {send.sent ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-muted-foreground shrink-0" />
                      )}
                      <div>
                        <p className="font-medium text-sm">
                          {WORKOUT_SEND_KIND_LABELS[send.kind]}
                          {send.grade ? ` · ${send.grade}` : ''}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {send.number_of_tries ? `${send.number_of_tries} tentativi` : ''}
                          {send.climbing_type ? ` · ${CLIMBING_TYPE_LABELS[send.climbing_type]}` : ''}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleDeleteSend(send.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </Card>
                ))}
              </div>
            )}

            {/* Add send form */}
            <Card className="p-4 sm:p-6">
              <h3 className="text-base font-semibold mb-1">Aggiungi Invio</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Registra ogni boulder o via provata durante l'allenamento: grado, numero di tentativi e se sei
                riuscito a chiuderla.
              </p>
              <form onSubmit={handleAddSend} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo *</Label>
                    <Select
                      value={sendForm.kind}
                      onValueChange={(value) =>
                        setSendForm({ ...sendForm, kind: value as WorkoutSendKind, grade: '' })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {WORKOUT_SEND_KINDS.map((kind) => (
                          <SelectItem key={kind} value={kind}>
                            {WORKOUT_SEND_KIND_LABELS[kind]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Grado</Label>
                    <Select
                      value={sendForm.grade}
                      onValueChange={(value) => setSendForm({ ...sendForm, grade: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona il grado" />
                      </SelectTrigger>
                      <SelectContent>
                        {(sendForm.kind === 'BOULDER' ? BOULDER_GRADES : CLIMBING_GRADES).map((grade) => (
                          <SelectItem key={grade} value={grade}>
                            {grade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tries">Numero di Tentativi</Label>
                    <Input
                      id="tries"
                      type="number"
                      min={1}
                      value={sendForm.numberOfTries}
                      onChange={(e) => setSendForm({ ...sendForm, numberOfTries: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Tipologia di Arrampicata</Label>
                    <Select
                      value={sendForm.climbingType}
                      onValueChange={(value) => setSendForm({ ...sendForm, climbingType: value as ClimbingType })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona (opzionale)" />
                      </SelectTrigger>
                      <SelectContent>
                        {CLIMBING_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {CLIMBING_TYPE_LABELS[type]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Esito *</Label>
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant={sendForm.sent ? 'default' : 'outline'}
                      className="flex-1"
                      onClick={() => setSendForm({ ...sendForm, sent: true })}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Chiuso
                    </Button>
                    <Button
                      type="button"
                      variant={!sendForm.sent ? 'default' : 'outline'}
                      className="flex-1"
                      onClick={() => setSendForm({ ...sendForm, sent: false })}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Non Chiuso
                    </Button>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isAddingSend}>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Aggiungi Invio
                </Button>
              </form>
            </Card>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Elimina Allenamento
              </Button>
              <Button
                className="flex-1"
                onClick={handleCloseWorkout}
                disabled={isClosing}
              >
                <Flag className="w-4 h-4 mr-2" />
                Chiudi Allenamento
              </Button>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={showDeleteDialog}
        title="Elimina allenamento"
        message="Sei sicuro di voler eliminare questo allenamento? Tutti gli invii registrati andranno persi. L'operazione non è reversibile."
        confirmLabel={isDeletingWorkout ? 'Eliminazione...' : 'Elimina'}
        icon={Trash2}
        onConfirm={handleDeleteWorkout}
        onClose={() => setShowDeleteDialog(false)}
      />
    </div>
  );
}
