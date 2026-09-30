import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ArrowLeft, Footprints, MapPin, Clock, Mountain } from 'lucide-react';
import { toast } from 'sonner';
import {
  ExtraActivityDetailResponse,
  EXTRA_ACTIVITY_TYPE_LABELS,
  PROTECTION_STYLE_LABELS,
  extraActivitiesApi,
} from '../api/extraActivities';
import { auth } from '../utils/auth';
import { outdoorPath } from '../paths';
import { MapView } from '../components/MapView';

function formatPlace(activity: ExtraActivityDetailResponse): string {
  const parts = [activity.city, activity.province, activity.country].filter(Boolean);
  return parts.join(', ');
}

export function ExtraActivityDetail() {
  const { id } = useParams<{ id: string }>();
  const [activity, setActivity] = useState<ExtraActivityDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      const user = await auth.getSession();
      if (!user || !id) {
        toast.error("Errore nel recuperare i dati dell'utente.");
        setLoading(false);
        return;
      }
      try {
        const found = await extraActivitiesApi.getOne(user.id, id);
        setActivity(found);
      } catch (error) {
        console.error('Error loading extra activity:', error);
        toast.error("Errore nel caricamento dell'attivita");
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [id]);

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

  if (!activity) {
    return (
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <Card className="p-8 sm:p-12 text-center">
          <Footprints className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Attivita non trovata</h2>
          <p className="text-muted-foreground mb-4">
            L'attivita che stai cercando non esiste.
          </p>
          <Link to={outdoorPath('attivita-extra')}>
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Torna alla lista
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const place = formatPlace(activity);

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <Link to={outdoorPath('attivita-extra')}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Torna alla lista
            </Button>
          </Link>

          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Footprints className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <h1 className="text-xl sm:text-2xl">{activity.name}</h1>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground">
            Dettaglio dell'attivita extra
          </p>
        </div>

        <Card className="p-4 sm:p-6 mb-4">
          <h3 className="text-sm font-semibold mb-4 text-muted-foreground">INFORMAZIONI</h3>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Tipo</p>
              <span className="inline-flex items-center px-3 py-1.5 bg-primary text-primary-foreground rounded-full text-sm font-medium">
                {EXTRA_ACTIVITY_TYPE_LABELS[activity.activity_type]}
              </span>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">Data</p>
              <p className="text-base">
                {new Date(activity.activity_day).toLocaleDateString('it-IT', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>

            {activity.hours_spent != null && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Ore impiegate</p>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <p className="text-base">{activity.hours_spent} ore</p>
                </div>
              </div>
            )}

            {place && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Luogo</p>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <p className="text-base">{place}</p>
                </div>
              </div>
            )}

            {activity.description && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Descrizione</p>
                <p className="text-base text-muted-foreground whitespace-pre-wrap">
                  {activity.description}
                </p>
              </div>
            )}
          </div>
        </Card>

        {activity.activity_type === 'MULTIPITCH' && (
          <Card className="p-4 sm:p-6 mb-4 bg-accent/10">
            <h3 className="text-sm font-semibold mb-4 text-muted-foreground">MULTIPITCH</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Tiri</p>
                <p className="text-lg font-semibold text-primary">{activity.pitch_count ?? '-'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Lunghezza</p>
                <p className="text-lg font-semibold text-primary">
                  {activity.total_length_meters != null
                    ? `${activity.total_length_meters} m`
                    : '-'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Protezione</p>
                <p className="text-lg font-semibold text-primary">
                  {activity.protection_style
                    ? PROTECTION_STYLE_LABELS[activity.protection_style]
                    : '-'}
                </p>
              </div>
            </div>
          </Card>
        )}

        {activity.activity_type === 'HIKE' && (
          <Card className="p-4 sm:p-6 mb-4 bg-accent/10">
            <h3 className="text-sm font-semibold mb-4 text-muted-foreground">ESCURSIONE</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Altitudine massima</p>
                <div className="flex items-center gap-2">
                  <Mountain className="w-4 h-4 text-muted-foreground" />
                  <p className="text-lg font-semibold text-primary">
                    {activity.max_altitude != null ? `${activity.max_altitude} m` : '-'}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Dislivello</p>
                <p className="text-lg font-semibold text-primary">
                  {activity.elevation_gain != null ? `${activity.elevation_gain} m` : '-'}
                </p>
              </div>
            </div>
          </Card>
        )}

        {activity.image && (
          <Card className="p-4 sm:p-6 mb-4 overflow-hidden">
            <h3 className="text-sm font-semibold mb-4 text-muted-foreground">FOTO</h3>
            <img
              src={activity.image}
              alt={activity.name}
              className="w-full rounded-lg object-cover max-h-[400px]"
            />
          </Card>
        )}

        {activity.latitude != null && activity.longitude != null && (
          <Card className="p-4 sm:p-6 mb-4">
            <h3 className="text-sm font-semibold mb-4 text-muted-foreground">POSIZIONE</h3>
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <p className="text-xs font-mono">
                {Number(activity.latitude).toFixed(4)}, {Number(activity.longitude).toFixed(4)}
              </p>
            </div>
            <MapView
              latitude={Number(activity.latitude)}
              longitude={Number(activity.longitude)}
              title={activity.name}
            />
          </Card>
        )}
      </div>
    </div>
  );
}
