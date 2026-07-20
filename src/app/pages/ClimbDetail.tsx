import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ArrowLeft, Mountain, MapPin, Trash2 } from 'lucide-react';
import { DIFFICULTY_LABELS } from '../types/climb';
import { toast } from 'sonner';
import { ClimbDetailExtendedResponse, routesApi } from '../api/routes';
import { auth } from '../utils/auth';

export function ClimbDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [climb, setClimb] = useState<ClimbDetailExtendedResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClimb = async () => {
      const user = await auth.getSession();
      if (!user || !id) {
        toast.error('Errore nel recuperare i dati dell utente.');
        return;
      }
      try {
        const foundClimb = await routesApi.getOneUserClimb(user.id, id);
        setClimb(foundClimb);
      } catch (error) {
        console.error('Error loading climb:', error);
        toast.error('Errore nel caricamento della scalata');
      } finally {
        setLoading(false);
      }
    };

    fetchClimb();
  }, [id]);

  const handleDelete = async () => {
    if (!climb) return;

    if (confirm(`Sei sicuro di voler eliminare questa scalata?`)) {
      const user = await auth.getSession();
      if (!user) {
        toast.error('Errore nel recuperare i dati dell utente.');
        return;
      }
      try {
        await routesApi.deleteOneClimb(user.id, climb.route.id);
        navigate('/vie');
        toast.success('Scalata eliminata con successo');
      } catch (error) {
        console.error('Error deleting climb:', error);
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
              <h1 className="text-xl sm:text-2xl">{climb.route.nome_via || 'Via sconosciuta'}</h1>
            </div>
            <div className="flex gap-2">
              <Button variant="destructive" size="sm" onClick={handleDelete}>
                <Trash2 className="w-4 h-4 mr-1" />
                Elimina
              </Button>
            </div>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground">
            Visualizza i dettagli della scalata
          </p>
        </div>

        {/* Route Info (Read-only) */}
        <Card className="p-4 sm:p-6 mb-4 bg-accent/10">
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground">INFORMAZIONI VIA</h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Nome Via</p>
              <p className="text-base font-semibold">{climb.route.nome_via || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Falesia</p>
              <p className="text-base font-medium">{climb.route.crag_name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Grado</p>
              <span className="inline-flex items-center px-3 py-1.5 bg-primary text-primary-foreground rounded-full text-sm font-medium">
                {climb.route.grado || 'N/A'}
              </span>
            </div>
            {climb.route.latitude && climb.route.longitude && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Posizione</p>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <p className="text-xs font-mono">
                    {climb.route.latitude.toFixed(4)}, {climb.route.longitude.toFixed(4)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Climb Details */}
        <Card className="p-4 sm:p-6">
          <h3 className="text-sm font-semibold mb-4 text-muted-foreground">I TUOI DATI</h3>
          <div className="space-y-5 sm:space-y-6">
            {/* Lead Type */}
            <div className="space-y-3">
              <p className="text-sm sm:text-base font-medium">Tipologia</p>
              <span className="inline-flex items-center px-3 py-1.5 bg-accent/30 text-accent-foreground rounded-full text-sm">
                {climb.is_lead === true ? '🧗 Da Primo' : '⛓️ Da Secondo'}
              </span>
            </div>

            {/* Perceived Difficulty */}
            <div className="space-y-3">
              <p className="text-sm sm:text-base font-medium">Difficoltà Percepita</p>
              <span className="inline-flex items-center px-3 py-1.5 bg-secondary text-secondary-foreground rounded-full text-sm">
                {DIFFICULTY_LABELS[climb.difficulty as 1 | 2 | 3 | 4 | 5]}
              </span>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Data</p>
              <p className="text-base">
                {new Date(climb.day).toLocaleDateString('it-IT', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Note / Descrizione</p>
              <p className="text-base text-muted-foreground italic">
                {climb.description || 'Nessuna nota'}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
