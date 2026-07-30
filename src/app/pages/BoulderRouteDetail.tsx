import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ArrowLeft, Hexagon, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { BoulderRouteDetailResponseExtended, boulderRoutesApi } from '../api/boulderRoutes';
import { useAuth } from '../context/AuthContext';
import { LoginRequiredDialog } from '../components/LoginRequiredDialog';

export function BoulderRouteDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [boulderRoute, setBoulderRoute] = useState<BoulderRouteDetailResponseExtended | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  useEffect(() => {
    if (loading || !id || boulderRoute) return;

    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const data = await boulderRoutesApi.getOne(id);
        setBoulderRoute(data);
        setLoading(false);
      } catch (error) {
        if (!cancelled) {
          console.error('Error loading boulder route:', error);
          toast.error('Errore nel caricamento del blocco');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => { cancelled = true; };
  }, [loading]);

  const handleSelectForSend = () => {
    if (!boulderRoute) return;

    if (!user) {
      setShowLoginDialog(true);
      return;
    }

    navigate(`/nuovo-invio/${boulderRoute.id}`, { state: { selectedBoulderRoute: boulderRoute } });
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

  if (!boulderRoute) {
    return (
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <Card className="p-8 sm:p-12 text-center">
          <Hexagon className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Blocco non trovato</h2>
          <p className="text-muted-foreground mb-4">Il blocco che stai cercando non esiste.</p>

            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Torna all'elenco
            </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
            <Button variant="ghost" className="mb-4" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Torna all'elenco
            </Button>

          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Hexagon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl">{boulderRoute.route_name}</h1>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Dettagli del blocco
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Info Card */}
        <Card className="p-5 sm:p-6 mb-4">
          <div className="space-y-4">
            {/* Boulder */}
            <div>
              <p className="text-sm text-muted-foreground mb-1">Boulder</p>
              <p className="text-lg font-semibold">{boulderRoute.boulder_name}</p>
              <p className="text-sm text-muted-foreground">{boulderRoute.boulder_area_name}</p>
            </div>

            {/* Grade */}
            <div>
              <p className="text-sm text-muted-foreground mb-1">Grado</p>
              <span className="inline-flex items-center px-3 py-1.5 bg-primary text-primary-foreground rounded-full text-base font-medium">
                {boulderRoute.grade}
              </span>
            </div>

            {/* Description */}
            {boulderRoute.route_description && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Descrizione</p>
                <p className="text-base">{boulderRoute.route_description}</p>
              </div>
            )}

            {/* Location */}
            {boulderRoute.latitude && boulderRoute.longitude && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Coordinate</p>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <p className="text-xs font-mono">
                    {boulderRoute.latitude.toFixed(4)}, {boulderRoute.longitude.toFixed(4)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button className="w-full" size="lg" onClick={handleSelectForSend}>
            <Hexagon className="w-4 h-4 mr-2" />
            Ho Inviato Questo Blocco
          </Button>
        </div>

      </div>
      <LoginRequiredDialog
        open={showLoginDialog}
        onClose={() => setShowLoginDialog(false)}
        message="Devi accedere per segnare un blocco come inviato."
      />
    </div>
  );
}
