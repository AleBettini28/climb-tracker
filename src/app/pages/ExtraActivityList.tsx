import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Button } from '../components/ui/button';
import { Search, Filter, Footprints, ChevronDown, ChevronUp, MapPin, Plus } from 'lucide-react';
import { toast } from 'sonner';
import {
  ExtraActivityDetailResponse,
  ExtraActivityType,
  EXTRA_ACTIVITY_TYPE_LABELS,
  extraActivitiesApi,
} from '../api/extraActivities';
import { auth } from '../utils/auth';
import { outdoorPath } from '../paths';

const FILTERS_STORAGE_KEY = 'extra-activity-list-filters';

function formatPlace(activity: ExtraActivityDetailResponse): string {
  const parts = [activity.city, activity.province, activity.country].filter(Boolean);
  return parts.join(', ');
}

export function ExtraActivityList() {
  const navigate = useNavigate();
  const [activities, setActivities] = useState<ExtraActivityDetailResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSavedFilters = () => {
    try {
      const saved = localStorage.getItem(FILTERS_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading saved filters:', error);
    }
    return null;
  };

  const savedFilters = loadSavedFilters();

  const [searchTerm, setSearchTerm] = useState(savedFilters?.searchTerm || '');
  const [selectedType, setSelectedType] = useState<string>(savedFilters?.selectedType || 'all');
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    const filters = {
      searchTerm,
      selectedType,
    };
    localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(filters));
  }, [searchTerm, selectedType]);

  useEffect(() => {
    const fetchActivities = async () => {
      const user = await auth.getSession();

      if (!user) {
        toast.error("Errore nel recuperare i dati dell'utente.");
        setLoading(false);
        return;
      }

      try {
        const data = await extraActivitiesApi.list(user.id);
        setActivities(data);
      } catch (error) {
        console.error('Error loading extra activities:', error);
        toast.error('Errore nel caricamento delle attivita extra');
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const filteredActivities = useMemo(() => {
    let filtered = [...activities];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((activity) => {
        const place = formatPlace(activity).toLowerCase();
        return activity.name.toLowerCase().includes(term) || place.includes(term);
      });
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter((activity) => activity.activity_type === selectedType);
    }

    return filtered.sort(
      (a, b) => new Date(b.activity_day).getTime() - new Date(a.activity_day).getTime(),
    );
  }, [activities, searchTerm, selectedType]);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedType('all');
  };

  const hasActiveFilters = searchTerm || selectedType !== 'all';

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

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="mb-2 text-xl sm:text-2xl">Attivita Extra</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {activities.length}{' '}
            {activities.length === 1 ? 'attivita registrata' : 'attivita registrate'}
          </p>
        </div>
        <Button onClick={() => navigate(outdoorPath('nuova-attivita'))}>
          <Plus className="w-4 h-4 mr-2" />
          Aggiungi attivita
        </Button>
      </div>

      <Card className="p-4 sm:p-6 mb-6">
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="flex items-center justify-between w-full mb-6 md:cursor-default"
        >
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Filtri</h3>
          </div>
          {filtersOpen ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground md:hidden" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground md:hidden" />
          )}
        </button>

        <div
          className={`space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4 ${filtersOpen ? 'block' : 'hidden md:grid'}`}
        >
          <div className="space-y-2">
            <label className="text-sm font-medium text-stone-700">Ricerca</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Nome o luogo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-stone-700">Tipo</label>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all">
                <SelectValue placeholder="Tutti i tipi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti i tipi</SelectItem>
                {(Object.keys(EXTRA_ACTIVITY_TYPE_LABELS) as ExtraActivityType[]).map((type) => (
                  <SelectItem key={type} value={type}>
                    {EXTRA_ACTIVITY_TYPE_LABELS[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {hasActiveFilters && (
          <div
            className={`mt-6 pt-4 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${filtersOpen ? 'block' : 'hidden md:flex'}`}
          >
            <p className="text-sm text-muted-foreground">
              {filteredActivities.length}{' '}
              {filteredActivities.length === 1 ? 'risultato' : 'risultati'}
            </p>
            <Button variant="outline" size="sm" onClick={resetFilters}>
              Cancella filtri
            </Button>
          </div>
        )}

        {hasActiveFilters && !filtersOpen && (
          <div className="md:hidden flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {filteredActivities.length}{' '}
              {filteredActivities.length === 1 ? 'risultato' : 'risultati'}
            </p>
            <Button variant="outline" size="sm" onClick={resetFilters}>
              Cancella filtri
            </Button>
          </div>
        )}
      </Card>

      {filteredActivities.length > 0 ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {filteredActivities.map((activity) => (
            <Link key={activity.id} to={outdoorPath(`attivita-extra/${activity.id}`)}>
              <Card className="p-4 sm:p-5 hover:shadow-md transition-shadow group cursor-pointer">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                    <Footprints className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base sm:text-lg mb-1 truncate group-hover:text-primary transition-colors">
                      {activity.name}
                    </h3>
                    {formatPlace(activity) && (
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3 truncate">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="truncate">{formatPlace(activity)}</span>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center px-2.5 sm:px-3 py-1 bg-primary text-primary-foreground rounded-full text-xs sm:text-sm font-medium">
                        {EXTRA_ACTIVITY_TYPE_LABELS[activity.activity_type]}
                      </span>
                      {activity.hours_spent != null && (
                        <span className="inline-flex items-center px-2.5 sm:px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-xs sm:text-sm">
                          {activity.hours_spent}h
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground mt-3">
                      {new Date(activity.activity_day).toLocaleDateString('it-IT', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="p-8 sm:p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <Footprints className="w-12 sm:w-16 h-12 sm:h-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-base sm:text-lg font-medium mb-2">Nessuna attivita trovata</h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-4">
              {hasActiveFilters
                ? 'Prova a modificare i filtri di ricerca'
                : 'Inizia ad aggiungere le tue attivita extra'}
            </p>
            {hasActiveFilters ? (
              <Button variant="outline" onClick={resetFilters}>
                Cancella filtri
              </Button>
            ) : (
              <Button onClick={() => navigate(outdoorPath('nuova-attivita'))}>
                <Plus className="w-4 h-4 mr-2" />
                Aggiungi attivita
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
