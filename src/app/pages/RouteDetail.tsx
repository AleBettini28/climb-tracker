import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ArrowLeft, Mountain, MapPin, Ruler } from 'lucide-react';
import { toast } from 'sonner';
import { RouteDetailResponseExtended, routesApi } from '../api/routes';

export function RouteDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [route, setRoute] = useState<RouteDetailResponseExtended | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (loading || !id || route) return;

    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const data = await routesApi.getOne(id);
        setRoute(data);
        setLoading(false);
      } catch (error) {
        if (!cancelled) {
          console.error('Error loading route:', error);
          toast.error('Errore nel caricamento della via');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => { cancelled = true; };
  }, [loading]);

  const handleSelectForClimb = () => {
    if (!route) return;

    // Navigate to new climb page with route pre-selected
    navigate(`/nuova-salita/${route.id}`, { state: { selectedRoute: route } });
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

  if (!route) {
    return (
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <Card className="p-8 sm:p-12 text-center">
          <Mountain className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Via non trovata</h2>
          <p className="text-muted-foreground mb-4">La via che stai cercando non esiste.</p>
          
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
                <Mountain className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl">{route.nome_via}</h1>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Dettagli della via
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Info Card */}
        <Card className="p-5 sm:p-6 mb-4">
          <div className="space-y-4">
            {/* Crag */}
            <div>
              <p className="text-sm text-muted-foreground mb-1">Falesia</p>
              <p className="text-lg font-semibold">{route.crag_name}</p>
            </div>

            {/* Grade */}
            <div>
              <p className="text-sm text-muted-foreground mb-1">Grado</p>
              <span className="inline-flex items-center px-3 py-1.5 bg-primary text-primary-foreground rounded-full text-base font-medium">
                {route.grado}
              </span>
            </div>

            {/* Length */}
            {route.lunghezza && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Lunghezza</p>
                <div className="flex items-center gap-2">
                  <Ruler className="w-4 h-4 text-muted-foreground" />
                  <p className="text-base">{route.lunghezza} metri</p>
                </div>
              </div>
            )}

            {/* Location */}
            <div>
              <p className="text-sm text-muted-foreground mb-1">Coordinate</p>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <p className="text-xs font-mono">
                  {route.latitude.toFixed(4)}, {route.longitude.toFixed(4)}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button className="w-full" size="lg" onClick={handleSelectForClimb}>
            <Mountain className="w-4 h-4 mr-2" />
            Ho Arrampicato Questa Via
          </Button>
        </div>

      </div>
    </div>
  );
}
