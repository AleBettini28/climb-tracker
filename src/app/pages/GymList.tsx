import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Building2, MapPin, Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { gymsApi, GymDetailResponse } from '../api';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/ui/input';
import { gymPath } from '../paths';

export function GymList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [gyms, setGyms] = useState<GymDetailResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await gymsApi.list();
        if (!cancelled) setGyms(data);
      } catch (error) {
        if (!cancelled) {
          console.error('Error loading gyms:', error);
          toast.error('Errore nel caricamento delle palestre');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredGyms = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return gyms.filter(
      (gym) =>
        gym.name.toLowerCase().includes(term) ||
        (gym.city && gym.city.toLowerCase().includes(term)) ||
        (gym.address && gym.address.toLowerCase().includes(term)),
    );
  }, [gyms, searchTerm]);

  return (
    <div className="gym-page gym-page--wide">
      <div className="flex items-end justify-between gap-4 px-4 sm:px-5 pb-4 border-b border-[var(--gym-border)]">
        <div>
          <p className="gym-eyebrow mb-1">Catalogo</p>
          <h1 className="gym-title text-3xl sm:text-4xl">Palestre</h1>
          <p className="text-sm mt-2" style={{ color: 'var(--gym-text-dim)' }}>
            Scegli una palestra e scala i boulder
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="gym-stat-badge hidden sm:flex">
            <span className="gym-stat-badge__value">{gyms.length}</span>
            <span className="gym-stat-badge__label">gym</span>
          </div>
          {user?.isAdmin && (
            <button
              type="button"
              onClick={() => navigate(gymPath('nuova-palestra'))}
              className="gym-send-btn !py-2.5 !px-3 !text-xs inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Nuova
            </button>
          )}
        </div>
      </div>

      <div className="relative px-4 sm:px-5 py-3 border-b border-[var(--gym-border)]">
        <Search
          className="absolute left-7 sm:left-8 top-1/2 -translate-y-1/2 w-4 h-4"
          style={{ color: 'var(--gym-text-dim)' }}
        />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Cerca per nome o citta'..."
          className="pl-9 bg-[var(--gym-surface)] border-[var(--gym-border-strong)]"
        />
      </div>

      {loading ? (
        <div className="gym-empty">Caricamento palestre...</div>
      ) : filteredGyms.length === 0 ? (
        <div className="gym-empty">Nessuna palestra trovata</div>
      ) : (
        <div className="gym-list">
          {filteredGyms.map((gym) => (
            <button
              key={gym.id}
              type="button"
              className="gym-list-row"
              onClick={() => navigate(gymPath(`palestra/${gym.id}`))}
            >
              <div className="gym-thumb">
                {gym.logo_url ? (
                  <img src={gym.logo_url} alt={gym.name} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Building2 className="w-8 h-8" style={{ color: 'var(--gym-text-ghost)' }} />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="gym-list-row__title is-sent truncate">{gym.name}</p>
                {(gym.city || gym.address) && (
                  <p className="gym-list-row__meta flex items-center gap-1 truncate">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span>{[gym.address, gym.city].filter(Boolean).join(', ')}</span>
                  </p>
                )}
                <p className="gym-list-row__sub">{gym.number_of_boulders} boulder</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
