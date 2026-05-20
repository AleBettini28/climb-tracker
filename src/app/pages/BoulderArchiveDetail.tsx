import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { boulderArchiveStorage } from '../utils/boulderArchiveStorage';
import { boulderStorage } from '../utils/boulderStorage';
import { Boulder } from '../types/boulder';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ArrowLeft, Mountain, MapPin } from 'lucide-react';
import { toast } from 'sonner';

export function BoulderArchiveDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [boulder, setBoulder] = useState<Boulder | null>(null);
  const [loading, setLoading] = useState(true);
  const [alreadySent, setAlreadySent] = useState(false);

  useEffect(() => {
    const fetchBoulder = async () => {
      try {
        if (!id) return;
        const data = await boulderArchiveStorage.getBoulderById(id);
        setBoulder(data);

        // Check if user already sent this boulder
        if (data) {
          const sends = await boulderStorage.getBoulderSends();
          const hasSent = sends.some(send => send.boulderId === data.id);
          setAlreadySent(hasSent);
        }
      } catch (error) {
        console.error('Error loading boulder:', error);
        toast.error('Errore nel caricamento del boulder');
      } finally {
        setLoading(false);
      }
    };

    fetchBoulder();
  }, [id]);

  const handleSelectForSend = () => {
    if (!boulder) return;

    if (alreadySent) {
      const confirm = window.confirm(
        'Hai già registrato una salita per questo boulder. Vuoi aggiungerne un\'altra?'
      );
      if (!confirm) return;
    }

    // Navigate to new boulder send page with boulder pre-selected
    navigate('/nuovo-boulder', { state: { selectedBoulder: boulder } });
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

  if (!boulder) {
    return (
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <Card className="p-8 sm:p-12 text-center">
          <Mountain className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Boulder non trovato</h2>
          <p className="text-muted-foreground mb-4">Il boulder che stai cercando non esiste.</p>
          <Link to="/tutti-i-boulder">
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
          <Link to="/tutti-i-boulder">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Torna all'elenco
            </Button>
          </Link>

          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Mountain className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <h1 className="text-xl sm:text-2xl">
              {boulder.boulderName} - {boulder.problemNumber}
            </h1>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground">
            Dettagli del boulder
          </p>
        </div>

        {/* Main Info Card */}
        <Card className="p-5 sm:p-6 mb-4">
          <div className="space-y-4">
            {/* Zone */}
            <div>
              <p className="text-sm text-muted-foreground mb-1">Zona</p>
              <p className="text-lg font-semibold">{boulder.zone}</p>
            </div>

            {/* Boulder Name & Problem Number */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Masso</p>
                <p className="text-base font-semibold">{boulder.boulderName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Numero Via</p>
                <p className="text-base font-semibold">{boulder.problemNumber}</p>
              </div>
            </div>

            {/* Grade */}
            <div>
              <p className="text-sm text-muted-foreground mb-1">Grado</p>
              <span className="inline-flex items-center px-3 py-1.5 bg-primary text-primary-foreground rounded-full text-base font-medium">
                {boulder.grade}
              </span>
            </div>

            {/* Location */}
            <div>
              <p className="text-sm text-muted-foreground mb-1">Coordinate</p>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <p className="text-xs font-mono">
                  {boulder.latitude.toFixed(4)}, {boulder.longitude.toFixed(4)}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Action Button */}
        <div className="space-y-3">
          <Button className="w-full" size="lg" onClick={handleSelectForSend}>
            <Mountain className="w-4 h-4 mr-2" />
            {alreadySent ? 'Ho Fatto Questo Boulder di Nuovo' : 'Ho Fatto Questo Boulder'}
          </Button>
          {alreadySent && (
            <p className="text-xs text-center text-muted-foreground">
              Hai già registrato una salita per questo boulder
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
