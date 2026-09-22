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
import { GymGradeCircle } from '../components/gym/GymGradeCircle';
import { LoginRequiredDialog } from '../components/LoginRequiredDialog';
import { gymPath } from '../paths';

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

  const sentCount = useMemo(
    () => boulders.filter((b) => b.is_sent).length,
    [boulders],
  );

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
        toast.error('Hai gia scalato questo boulder');
      } else {
        toast.error("Errore durante la registrazione dell'invio");
      }
    } finally {
      setSendingId(null);
    }
  };

  if (loading) {
    return <div className="gym-empty">Caricamento...</div>;
  }

  if (!gym) {
    return <div className="gym-empty">Palestra non trovata</div>;
  }

  return (
    <div className="gym-page gym-page--wide">
      <div className="flex items-start gap-3 px-4 sm:px-5 pb-4 border-b border-[var(--gym-border)]">
        <button
          type="button"
          onClick={() => navigate(gymPath('palestre'))}
          className="gym-nav-link p-2 mt-1"
          aria-label="Indietro"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex-1 min-w-0 flex flex-col sm:flex-row gap-4 sm:items-start sm:justify-between">
          <div className="flex gap-4 min-w-0">
            <div className="gym-thumb !w-20 !h-20 sm:!w-24 sm:!h-24 !rounded-2xl">
              {gym.logo_url ? (
                <img src={gym.logo_url} alt={gym.name} />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Building2 className="w-8 h-8" style={{ color: 'var(--gym-text-ghost)' }} />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="gym-eyebrow mb-1">Settore</p>
              <h1 className="gym-title text-3xl sm:text-4xl truncate">{gym.name}</h1>
              {(gym.city || gym.address) && (
                <p className="gym-list-row__meta flex items-start gap-1.5 mt-2">
                  <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <span>{[gym.address, gym.city].filter(Boolean).join(', ')}</span>
                </p>
              )}
              {gym.description && (
                <p className="text-sm mt-2 max-w-xl" style={{ color: 'var(--gym-text-dim)' }}>
                  {gym.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="gym-stat-badge">
              <span className="gym-stat-badge__value">{sentCount}</span>
              <span className="gym-stat-badge__label">sends</span>
            </div>
            {user?.isAdmin && (
              <button
                type="button"
                onClick={() => navigate(gymPath(`nuovo-boulder-palestra/${gym.id}`))}
                className="gym-send-btn !py-2.5 !px-3 !text-xs inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Boulder
              </button>
            )}
          </div>
        </div>
      </div>

      <section>
        <div className="flex items-center justify-between px-4 sm:px-5 py-4">
          <h2 className="gym-section-title">Boulder</h2>
          <p className="text-xs" style={{ color: 'var(--gym-text-faint)' }}>
            <span style={{ color: 'var(--gym-success)', fontFamily: 'var(--gym-font-display)', fontWeight: 900 }}>
              {sentCount}
            </span>
            <span style={{ color: 'var(--gym-text-ghost)' }}> / </span>
            <span style={{ fontFamily: 'var(--gym-font-display)', fontWeight: 900 }}>
              {boulders.length}
            </span>
            {' '}sent
          </p>
        </div>

        {boulders.length === 0 ? (
          <div className="gym-empty">Nessun boulder in questa palestra</div>
        ) : (
          GYM_DIFFICULTIES.map((difficulty) => {
            const group = bouldersByDifficulty[difficulty];
            if (!group.length) return null;
            const meta = GYM_DIFFICULTY_META[difficulty];
            return (
              <div key={difficulty}>
                <div className="flex items-center gap-2 px-4 sm:px-5 py-2 border-y border-[var(--gym-border)] bg-[var(--gym-bg-deep)]">
                  <span className={meta.className}>{meta.label}</span>
                  <span className="text-xs" style={{ color: 'var(--gym-text-dim)' }}>
                    {meta.points} {meta.points === 1 ? 'punto' : 'punti'} · {group.length}
                  </span>
                </div>
                <div className="gym-list">
                  {group.map((boulder) => (
                    <div key={boulder.id} className="gym-list-row !cursor-default hover:!bg-transparent">
                      <div className={`gym-thumb ${boulder.is_sent ? 'gym-thumb--sent' : ''}`}>
                        {boulder.photo_url ? (
                          <img src={boulder.photo_url} alt={boulder.name} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Building2
                              className="w-6 h-6"
                              style={{ color: 'var(--gym-text-ghost)' }}
                            />
                          </div>
                        )}
                        {boulder.is_sent && (
                          <div className="gym-thumb__sent-overlay">✓</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <p
                          className={`gym-list-row__title truncate ${
                            boulder.is_sent ? 'is-sent' : ''
                          }`}
                        >
                          {boulder.name}
                        </p>
                        {boulder.description && (
                          <p className="gym-list-row__meta line-clamp-2">{boulder.description}</p>
                        )}
                        <p className="gym-list-row__sub flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {boulder.send_count}{' '}
                          {boulder.send_count === 1 ? 'utente' : 'utenti'}
                        </p>
                        {boulder.is_sent ? (
                          <div className="gym-sent-badge">
                            <CheckCircle2 className="w-4 h-4" />
                            Gia scalato
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="gym-send-btn !py-2 !text-xs"
                            onClick={() => handleSend(boulder.id)}
                            disabled={sendingId === boulder.id}
                          >
                            {sendingId === boulder.id ? 'Salvataggio...' : 'Ho scalato'}
                          </button>
                        )}
                      </div>
                      <GymGradeCircle
                        difficulty={boulder.difficulty}
                        sent={Boolean(boulder.is_sent)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </section>

      <section className="mt-2">
        <div className="gym-leaderboard-banner">
          <p className="gym-eyebrow mb-1">Classifica</p>
          <h2 className="gym-title text-3xl sm:text-4xl flex items-center gap-2">
            <Trophy className="w-7 h-7" style={{ color: 'var(--gym-accent)' }} />
            Top Climbers
          </h2>
        </div>

        {leaderboard.length === 0 ? (
          <div className="gym-empty">Nessun punteggio ancora. Sii il primo a scalare!</div>
        ) : (
          <div className="px-4 sm:px-5 pb-6">
            {leaderboard.map((entry) => {
              const initials = entry.name
                .split(/\s+/)
                .filter(Boolean)
                .slice(0, 2)
                .map((part) => part[0]?.toUpperCase() ?? '')
                .join('');
              const isTop = entry.rank <= 3;
              return (
                <div key={entry.user_id} className="gym-leaderboard-row">
                  <span className={`gym-leaderboard-rank ${isTop ? 'is-top' : ''}`}>
                    {entry.rank}
                  </span>
                  <div className="gym-leaderboard-avatar">{initials || '?'}</div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-bold text-sm truncate"
                      style={{
                        fontFamily: 'var(--gym-font-display)',
                        color: 'var(--gym-text-secondary)',
                      }}
                    >
                      {entry.name}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--gym-text-faint)' }}>
                      {entry.total_points} {entry.total_points === 1 ? 'punto' : 'punti'}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="gym-leaderboard-points">{entry.total_points}</span>
                    <span className="text-xs" style={{ color: 'var(--gym-text-faint)' }}>
                      pts
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <LoginRequiredDialog
        open={showLoginDialog}
        onClose={() => setShowLoginDialog(false)}
        message="Devi essere autenticato per dire di aver scalato un boulder."
      />
    </div>
  );
}
