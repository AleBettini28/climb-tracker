import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  MapPin,
  Plus,
  Trophy,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  gymsApi,
  gymBouldersApi,
  GymDetailResponse,
  GymBoulderDetailResponse,
  GymLeaderboardEntryResponse,
} from '../api';
import { ApiError } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { GYM_DIFFICULTIES, GYM_DIFFICULTY_META, GymDifficulty } from '../types/gym';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { LoginRequiredDialog } from '../components/LoginRequiredDialog';

export function GymDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [gym, setGym] = useState<GymDetailResponse | null>(null);
  const [boulders, setBoulders] = useState<GymBoulderDetailResponse[]>([]);
  const [leaderboard, setLeaderboard] = useState<GymLeaderboardEntryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  const loadData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [gymData, boulderData, boardData] = await Promise.all([
        gymsApi.getOne(id),
        user
          ? gymsApi.getOneBoulders(id, user.id)
          : gymsApi.getOneBouldersPublic(id),
        gymsApi.getLeaderboard(id),
      ]);
      setGym(gymData);
      setBoulders(boulderData);
      setLeaderboard(boardData);
    } catch (error) {
      console.error('Error loading gym:', error);
      toast.error('Errore nel caricamento della palestra');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user?.id]);

  const bouldersByDifficulty = useMemo(() => {
    const grouped = {} as Record<GymDifficulty, GymBoulderDetailResponse[]>;
    for (const difficulty of GYM_DIFFICULTIES) {
      grouped[difficulty] = [];
    }
    for (const boulder of boulders) {
      if (grouped[boulder.difficulty]) {
        grouped[boulder.difficulty].push(boulder);
      }
    }
    return grouped;
  }, [boulders]);

  const handleSend = async (boulderId: string) => {
    if (!user) {
      setShowLoginDialog(true);
      return;
    }

    setSendingId(boulderId);
    try {
      await gymBouldersApi.sendOne(user.id, {
        gym_boulder_id: boulderId,
        day: new Date().toISOString().slice(0, 10),
      });
      toast.success('Boulder segnato come scalato!');
      await loadData();
    } catch (error) {
      console.error('Error sending gym boulder:', error);
      if (error instanceof ApiError && error.status === 409) {
        toast.error('Hai già scalato questo boulder');
      } else {
        toast.error("Errore durante la registrazione dell'invio");
      }
    } finally {
      setSendingId(null);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center text-muted-foreground">
        Caricamento...
      </div>
    );
  }

  if (!gym) {
    return (
      <div className="container mx-auto px-4 py-12 text-center text-muted-foreground">
        Palestra non trovata
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 space-y-8">
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/palestre')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1 flex flex-col sm:flex-row gap-4 sm:items-start sm:justify-between">
          <div className="flex gap-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-muted flex items-center justify-center shrink-0">
              {gym.logo_url ? (
                <img src={gym.logo_url} alt={gym.name} className="w-full h-full object-cover" />
              ) : (
                <Building2 className="w-8 h-8 text-muted-foreground" />
              )}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold">{gym.name}</h1>
              {(gym.city || gym.address) && (
                <div className="flex items-start gap-1.5 text-sm text-muted-foreground mt-1">
                  <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{[gym.address, gym.city].filter(Boolean).join(', ')}</span>
                </div>
              )}
              {gym.description && (
                <p className="text-sm text-muted-foreground mt-2 max-w-2xl">{gym.description}</p>
              )}
            </div>
          </div>
          {user?.isAdmin && (
            <Button
              onClick={() => navigate(`/nuovo-boulder-palestra/${gym.id}`)}
              className="gap-2 shrink-0"
            >
              <Plus className="w-4 h-4" />
              Aggiungi boulder
            </Button>
          )}
        </div>
      </div>

      <section className="space-y-6">
        <h2 className="text-lg font-semibold">Boulder per grado</h2>
        {boulders.length === 0 ? (
          <Card className="p-6 text-center text-muted-foreground">
            Nessun boulder in questa palestra
          </Card>
        ) : (
          GYM_DIFFICULTIES.map((difficulty) => {
            const group = bouldersByDifficulty[difficulty];
            if (!group.length) return null;
            const meta = GYM_DIFFICULTY_META[difficulty];
            return (
              <div key={difficulty} className="space-y-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${meta.className}`}
                  >
                    {meta.label}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {meta.points} {meta.points === 1 ? 'punto' : 'punti'} · {group.length} boulder
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {group.map((boulder) => (
                    <Card key={boulder.id} className="overflow-hidden">
                      <div className="flex gap-3 p-3">
                        <div className="w-24 h-24 rounded-md overflow-hidden bg-muted flex items-center justify-center shrink-0">
                          {boulder.photo_url ? (
                            <img
                              src={boulder.photo_url}
                              alt={boulder.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Building2 className="w-6 h-6 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 space-y-2">
                          <div>
                            <h3 className="font-medium truncate">{boulder.name}</h3>
                            {boulder.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {boulder.description}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Users className="w-3.5 h-3.5" />
                            <span>
                              {boulder.send_count}{' '}
                              {boulder.send_count === 1 ? 'utente' : 'utenti'} lo{' '}
                              {boulder.send_count === 1 ? 'ha' : 'hanno'} scalato
                            </span>
                          </div>
                          {boulder.is_sent ? (
                            <div className="inline-flex items-center gap-1.5 text-sm text-green-700">
                              <CheckCircle2 className="w-4 h-4" />
                              Già scalato
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handleSend(boulder.id)}
                              disabled={sendingId === boulder.id}
                            >
                              {sendingId === boulder.id ? 'Salvataggio...' : 'Ho scalato'}
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Classifica</h2>
        </div>
        <Card className="overflow-hidden">
          {leaderboard.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              Nessun punteggio ancora. Sii il primo a scalare!
            </div>
          ) : (
            <div className="divide-y divide-border">
              {leaderboard.map((entry) => (
                <div
                  key={entry.user_id}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 text-sm font-semibold text-muted-foreground">
                      #{entry.rank}
                    </span>
                    <span className="font-medium">{entry.name}</span>
                  </div>
                  <span className="text-sm font-semibold">
                    {entry.total_points}{' '}
                    {entry.total_points === 1 ? 'punto' : 'punti'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </section>

      <LoginRequiredDialog
        open={showLoginDialog}
        onClose={() => setShowLoginDialog(false)}
        message="Devi essere autenticato per dire di aver scalato un boulder."
      />
    </div>
  );
}
