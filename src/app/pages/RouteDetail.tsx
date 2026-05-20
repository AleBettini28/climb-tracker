import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { routeStorage } from '../utils/routeStorage';
import { storage } from '../utils/storage';
import { reportStorage } from '../utils/reportStorage';
import { Route } from '../types/route';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ReportRouteModal } from '../components/ReportRouteModal';
import { ArrowLeft, Mountain, MapPin, Ruler, Flag } from 'lucide-react';
import { toast } from 'sonner';

export function RouteDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [route, setRoute] = useState<Route | null>(null);
  const [loading, setLoading] = useState(true);
  const [alreadyClimbed, setAlreadyClimbed] = useState(false);
  const [alreadyReported, setAlreadyReported] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    const fetchRoute = async () => {
      try {
        if (!id) return;
        const data = await routeStorage.getRouteById(id);
        setRoute(data);

        // Check if user already climbed this route
        if (data) {
          const climbs = await storage.getClimbs();
          const hasClimbed = climbs.some(climb => climb.routeId === data.id);
          setAlreadyClimbed(hasClimbed);

          // Check if user already reported this route
          const hasReported = await reportStorage.hasUserReportedRoute(data.id);
          setAlreadyReported(hasReported);
        }
      } catch (error) {
        console.error('Error loading route:', error);
        toast.error('Errore nel caricamento della via');
      } finally {
        setLoading(false);
      }
    };

    fetchRoute();
  }, [id]);

  const handleSelectForClimb = () => {
    if (!route) return;

    if (alreadyClimbed) {
      const confirm = window.confirm(
        'Hai già registrato una scalata per questa via. Vuoi aggiungerne un\'altra?'
      );
      if (!confirm) return;
    }

    // Navigate to new climb page with route pre-selected
    navigate('/nuova-salita', { state: { selectedRoute: route } });
  };

  const handleReport = async (reason: string) => {
    if (!route) return;

    try {
      await reportStorage.reportRoute(route.id, reason);
      setAlreadyReported(true);
      toast.success('Segnalazione inviata con successo!');
    } catch (error) {
      console.error('Error reporting route:', error);
      toast.error('Errore durante l\'invio della segnalazione');
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

  if (!route) {
    return (
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <Card className="p-8 sm:p-12 text-center">
          <Mountain className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Via non trovata</h2>
          <p className="text-muted-foreground mb-4">La via che stai cercando non esiste.</p>
          <Link to="/tutte-le-vie">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Torna all'elenco
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
          <Link to="/tutte-le-vie">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Torna all'elenco
            </Button>
          </Link>

          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Mountain className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl">{route.name}</h1>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Dettagli della via
                </p>
              </div>
            </div>

            {/* Report Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReportModal(true)}
              disabled={alreadyReported}
              className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
              title={alreadyReported ? 'Già Segnalata' : 'Segnala Errore'}
            >
              <Flag className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Main Info Card */}
        <Card className="p-5 sm:p-6 mb-4">
          <div className="space-y-4">
            {/* Crag */}
            <div>
              <p className="text-sm text-muted-foreground mb-1">Falesia</p>
              <p className="text-lg font-semibold">{route.crag}</p>
            </div>

            {/* Grade */}
            <div>
              <p className="text-sm text-muted-foreground mb-1">Grado</p>
              <span className="inline-flex items-center px-3 py-1.5 bg-primary text-primary-foreground rounded-full text-base font-medium">
                {route.grade}
              </span>
            </div>

            {/* Length */}
            {route.length && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Lunghezza</p>
                <div className="flex items-center gap-2">
                  <Ruler className="w-4 h-4 text-muted-foreground" />
                  <p className="text-base">{route.length} metri</p>
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
            {alreadyClimbed ? 'Ho Arrampicato Questa Via di Nuovo' : 'Ho Arrampicato Questa Via'}
          </Button>
          {alreadyClimbed && (
            <p className="text-xs text-center text-muted-foreground">
              Hai già registrato una scalata per questa via
            </p>
          )}
        </div>

        {/* Report Modal */}
        <ReportRouteModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          onSubmit={handleReport}
          routeName={route.name}
        />
      </div>
    </div>
  );
}
