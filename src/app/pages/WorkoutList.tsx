import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Dumbbell, Calendar, ListChecks, PlusCircle, Trash2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { workoutsApi, WorkoutDetailResponse } from '../api';

export function WorkoutList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<WorkoutDetailResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [workoutToDelete, setWorkoutToDelete] = useState<WorkoutDetailResponse | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const data = await workoutsApi.list(user.id);
        if (!cancelled) setWorkouts(data);
      } catch (error) {
        console.error('Error loading workouts:', error);
        if (!cancelled) toast.error('Errore nel caricamento degli allenamenti');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [user]);

  const handleDeleteWorkout = async () => {
    if (!workoutToDelete) return;

    setIsDeleting(true);
    try {
      await workoutsApi.deleteOne(workoutToDelete.id);
      setWorkouts((prev) => prev.filter((w) => w.id !== workoutToDelete.id));
      toast.success('Allenamento eliminato');
    } catch (error) {
      console.error('Error deleting workout:', error);
      toast.error("Errore durante l'eliminazione dell'allenamento");
    } finally {
      setIsDeleting(false);
      setWorkoutToDelete(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="max-w-6xl mx-auto">
        <Button variant="ghost" className="mb-4" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Torna Indietro
        </Button>

        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg">
                <Dumbbell className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold">I Miei Allenamenti</h1>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground">
              Rivedi lo storico dei tuoi allenamenti: apri un allenamento per vederne i dettagli, riprenderlo se
              è ancora in corso, oppure eliminarlo definitivamente.
            </p>
          </div>
          <Button onClick={() => navigate('/allenamenti/nuovo')}>
            <PlusCircle className="w-4 h-4 mr-2" />
            Nuovo Allenamento
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="text-center">
              <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-amber-700 border-r-transparent"></div>
              <p className="mt-4 text-stone-600">Caricamento...</p>
            </div>
          </div>
        ) : workouts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workouts.map((workout) => (
              <Card
                key={workout.id}
                onClick={() => navigate(workout.open ? '/allenamenti/nuovo' : `/allenamento/${workout.id}`)}
                className="p-5 hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary group relative"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(workout.day).toLocaleDateString('it-IT')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Dumbbell className="w-5 h-5 text-primary" />
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        setWorkoutToDelete(workout);
                      }}
                      title="Elimina allenamento"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                {workout.open && (
                  <span className="inline-flex items-center px-2 py-0.5 mb-3 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    In corso
                  </span>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <ListChecks className="w-3.5 h-3.5" />
                    Invii registrati
                  </span>
                  <span className="text-lg font-bold text-primary">{workout.number_of_sends}</span>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <Dumbbell className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Nessun allenamento</h3>
            <p className="text-sm text-muted-foreground mb-4">Non hai ancora registrato nessun allenamento</p>
            <Button onClick={() => navigate('/allenamenti/nuovo')}>
              <PlusCircle className="w-4 h-4 mr-2" />
              Inizia il tuo primo allenamento
            </Button>
          </Card>
        )}
      </div>

      <ConfirmDialog
        open={!!workoutToDelete}
        title="Elimina allenamento"
        message="Sei sicuro di voler eliminare questo allenamento? Tutti gli invii registrati andranno persi. L'operazione non è reversibile."
        confirmLabel={isDeleting ? 'Eliminazione...' : 'Elimina'}
        icon={Trash2}
        onConfirm={handleDeleteWorkout}
        onClose={() => setWorkoutToDelete(null)}
      />
    </div>
  );
}
