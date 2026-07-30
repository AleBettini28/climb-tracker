import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Dumbbell, Calendar, CheckCircle2, XCircle, Sparkles, ListChecks, PlayCircle, Trash2, ArrowLeft } from 'lucide-react';
import { workoutsApi, workoutSendsApi, WorkoutDetailResponse, WorkoutSendDetailResponse } from '../api';
import { WORKOUT_SEND_KIND_LABELS, CLIMBING_TYPE_LABELS } from '../types/workout';

export function WorkoutDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [workout, setWorkout] = useState<WorkoutDetailResponse | null>(null);
  const [sends, setSends] = useState<WorkoutSendDetailResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const [workoutData, sendsData] = await Promise.all([
          workoutsApi.getOne(id),
          workoutSendsApi.list(id),
        ]);
        if (!cancelled) {
          setWorkout(workoutData);
          setSends(sendsData);
        }
      } catch (error) {
        console.error('Error loading workout:', error);
        if (!cancelled) toast.error("Errore nel caricamento dell'allenamento");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [id]);

  const handleDeleteWorkout = async () => {
    if (!id) return;

    setIsDeleting(true);
    try {
      await workoutsApi.deleteOne(id);
      toast.success('Allenamento eliminato');
      navigate('/allenamenti/lista');
    } catch (error) {
      console.error('Error deleting workout:', error);
      toast.error("Errore durante l'eliminazione dell'allenamento");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleGenerateReport = () => {
    setIsGeneratingReport(true);
    // TODO: hook up AI report generation once available.
    setTimeout(() => {
      setIsGeneratingReport(false);
      toast.info('Generazione report AI in arrivo prossimamente! 🤖');
    }, 600);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-amber-700 border-r-transparent"></div>
          <p className="mt-4 text-stone-600">Caricamento...</p>
        </div>
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <Card className="p-12 text-center max-w-2xl mx-auto">
          <Dumbbell className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Allenamento non trovato</h3>
          <Button onClick={() => navigate('/allenamenti/lista')}>Torna ai Miei Allenamenti</Button>
        </Card>
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

        <div className="mb-6 sm:mb-8 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Dumbbell className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <h1 className="text-xl sm:text-2xl">Allenamento</h1>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Calendar className="w-4 h-4" />
              <span>{new Date(workout.day).toLocaleDateString('it-IT')}</span>
              {workout.open && (
                <span className="inline-flex items-center px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                  In corso
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {workout.open
                ? 'Allenamento ancora aperto: puoi riprenderlo per aggiungere altri invii o eliminarlo.'
                : 'Riepilogo degli invii registrati durante questo allenamento. Genera un report AI per analizzare i tuoi progressi.'}
            </p>
          </div>
          <Button variant="outline" size="icon" onClick={() => setShowDeleteDialog(true)} title="Elimina allenamento">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        <Card className="p-4 sm:p-6 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <ListChecks className="w-4 h-4" />
              Invii registrati
            </span>
            <span className="text-lg font-bold text-primary">{sends.length}</span>
          </div>
        </Card>

        <h3 className="text-base font-semibold mb-3">Invii</h3>
        {sends.length > 0 ? (
          <div className="space-y-3 mb-8">
            {sends.map((send) => (
              <Card key={send.id} className="p-4 flex items-center gap-3">
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
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center mb-8">
            <p className="text-sm text-muted-foreground">Nessun invio registrato in questo allenamento</p>
          </Card>
        )}

        {workout.open ? (
          <Button className="w-full" onClick={() => navigate('/allenamenti/nuovo')}>
            <PlayCircle className="w-4 h-4 mr-2" />
            Riprendi Allenamento
          </Button>
        ) : (
          <Button className="w-full" onClick={handleGenerateReport} disabled={isGeneratingReport}>
            <Sparkles className="w-4 h-4 mr-2" />
            Genera Report AI
          </Button>
        )}
      </div>

      <ConfirmDialog
        open={showDeleteDialog}
        title="Elimina allenamento"
        message="Sei sicuro di voler eliminare questo allenamento? Tutti gli invii registrati andranno persi. L'operazione non è reversibile."
        confirmLabel={isDeleting ? 'Eliminazione...' : 'Elimina'}
        icon={Trash2}
        onConfirm={handleDeleteWorkout}
        onClose={() => setShowDeleteDialog(false)}
      />
    </div>
  );
}
