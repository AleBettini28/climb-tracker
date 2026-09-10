import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Building2, MapPin, Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { gymsApi, GymDetailResponse } from '../api';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';

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
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold">Palestre</h1>
            <p className="text-sm text-muted-foreground">
              Scegli una palestra e scala i boulder
            </p>
          </div>
        </div>
        {user?.isAdmin && (
          <Button onClick={() => navigate('/nuova-palestra')} className="gap-2">
            <Plus className="w-4 h-4" />
            Nuova palestra
          </Button>
        )}
      </div>

      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Cerca per nome o città..."
          className="pl-9"
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Caricamento palestre...</div>
      ) : filteredGyms.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">Nessuna palestra trovata</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGyms.map((gym) => (
            <Card
              key={gym.id}
              className="overflow-hidden cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => navigate(`/palestra/${gym.id}`)}
            >
              <div className="aspect-[16/10] bg-muted flex items-center justify-center overflow-hidden">
                {gym.logo_url ? (
                  <img
                    src={gym.logo_url}
                    alt={gym.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Building2 className="w-10 h-10 text-muted-foreground" />
                )}
              </div>
              <div className="p-4 space-y-2">
                <h2 className="font-semibold text-lg leading-tight">{gym.name}</h2>
                {(gym.city || gym.address) && (
                  <div className="flex items-start gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>
                      {[gym.address, gym.city].filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}
                <p className="text-sm text-muted-foreground">
                  {gym.number_of_boulders} boulder
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
