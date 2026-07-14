import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Button } from '../components/ui/button';
import { Search, Filter, Trash2, Mountain, ChevronDown, ChevronUp } from 'lucide-react';
import { CLIMBING_GRADES, DIFFICULTY_LABELS } from '../types/climb';
import { toast } from 'sonner';
import { ClimbDetailExtendedResponse, routesApi } from '../api/routes';
import { auth } from '../utils/auth';

const FILTERS_STORAGE_KEY = 'climb-list-filters';

export function ClimbList() {
  const [climbs, setClimbs] = useState<ClimbDetailExtendedResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // Load filters from localStorage
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
  const [selectedGrade, setSelectedGrade] = useState<string>(savedFilters?.selectedGrade || 'all');
  const [selectedCrag, setSelectedCrag] = useState<string>(savedFilters?.selectedCrag || 'all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>(savedFilters?.selectedPeriod || 'all');
  const [selectedLeadType, setSelectedLeadType] = useState<string>(savedFilters?.selectedLeadType || 'all');
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Save filters to localStorage whenever they change
  useEffect(() => {
    const filters = {
      searchTerm,
      selectedGrade,
      selectedCrag,
      selectedPeriod,
      selectedLeadType
    };
    localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(filters));
  }, [searchTerm, selectedGrade, selectedCrag, selectedPeriod, selectedLeadType]);


  useEffect(() => {
    const fetchClimbs = async () => {
        const user = await auth.getSession();
        
        if(!user) {
          toast.error('Errore nel recuperare i dati dell utente.');
          return;
        }

      try {
        const data = await routesApi.getUserClimbs(user.id);
        setClimbs(data);
      } catch (error) {
        console.error('Error loading climbs:', error);
        toast.error('Errore nel caricamento delle scalate');
      } finally {
        setLoading(false);
      }
    };

    fetchClimbs();
  }, []);

  // Get unique crags
  const crags = useMemo(() => {
    const uniqueCrags = new Set(climbs.map(c => c.route.crag_name).filter(Boolean));
    return Array.from(uniqueCrags).sort();
  }, [climbs]);

  // Filter climbs
  const filteredClimbs = useMemo(() => {
    let filtered = [...climbs];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(climb =>
        (climb.route.nome_via?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
        (climb.route.crag_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
      );
    }

    // Grade filter
    if (selectedGrade !== 'all') {
      filtered = filtered.filter(climb => climb.route.grado === selectedGrade);
    }

    // Crag filter
    if (selectedCrag !== 'all') {
      filtered = filtered.filter(climb => climb.route.crag_name === selectedCrag);
    }

    // Lead type filter
    if (selectedLeadType !== 'all') {
      filtered = filtered.filter(climb => climb.is_lead === (selectedLeadType === 'lead'));
    }

    // Period filter
    if (selectedPeriod !== 'all') {
      const now = new Date();
      const periodMap: { [key: string]: number } = {
        'week': 7,
        'month': 30,
        'year': 365
      };

      const days = periodMap[selectedPeriod];
      if (days) {
        const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(climb => new Date(climb.day) >= cutoffDate);
      }
    }

    // Sort by date (most recent first)
    return filtered.sort((a, b) =>
      new Date(b.day).getTime() - new Date(a.day).getTime()
    );
  }, [climbs, searchTerm, selectedGrade, selectedCrag, selectedLeadType, selectedPeriod]);

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Sei sicuro di voler eliminare la scalata "${name}"?`)) {
      const user = await auth.getSession();
      if (!user) {
        toast.error('Errore nel recuperare i dati dell utente.');
        return;
      }
      try {
        await routesApi.deleteOneClimb(user.id, id);
        toast.success('Scalata eliminata con successo');
      } catch (error) {
        console.error('Error deleting climb:', error);
        toast.error('Errore durante l\'eliminazione');
      }

      const updatedClimbs = await routesApi.getUserClimbs(user.id);
      setClimbs(updatedClimbs);
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedGrade('all');
    setSelectedCrag('all');
    setSelectedLeadType('all');
    setSelectedPeriod('all');
  };

  const hasActiveFilters = searchTerm || selectedGrade !== 'all' || selectedCrag !== 'all' || selectedLeadType !== 'all' || selectedPeriod !== 'all';

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="mb-2 text-xl sm:text-2xl">Le Mie Vie</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          {climbs.length} {climbs.length === 1 ? 'via completata' : 'vie completate'}
        </p>
      </div>

      {/* Filters */}
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

        <div className={`space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 lg:grid-cols-5 sm:gap-4 ${filtersOpen ? 'block' : 'hidden md:grid'}`}>
          {/* Search */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-stone-700">Ricerca</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Nome o falesia..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          {/* Grade Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-stone-700">Grado</label>
            <Select value={selectedGrade} onValueChange={setSelectedGrade}>
              <SelectTrigger className="border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all">
                <SelectValue placeholder="Tutti i gradi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti i gradi</SelectItem>
                {CLIMBING_GRADES.map(grade => (
                  <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Crag Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-stone-700">Falesia</label>
            <Select value={selectedCrag} onValueChange={setSelectedCrag}>
              <SelectTrigger className="border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all">
                <SelectValue placeholder="Tutte le falesie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutte le falesie</SelectItem>
                {crags.map(crag => (
                  <SelectItem key={crag} value={crag}>{crag}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Lead Type Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-stone-700">Tipologia</label>
            <Select value={selectedLeadType} onValueChange={setSelectedLeadType}>
              <SelectTrigger className="border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all">
                <SelectValue placeholder="Tutte" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutte</SelectItem>
                <SelectItem value="lead">Da Primo</SelectItem>
                <SelectItem value="second">Da Secondo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Period Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-stone-700">Periodo</label>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all">
                <SelectValue placeholder="Tutti i periodi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti i periodi</SelectItem>
                <SelectItem value="week">Ultima settimana</SelectItem>
                <SelectItem value="month">Ultimo mese</SelectItem>
                <SelectItem value="year">Ultimo anno</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {hasActiveFilters && (
          <div className={`mt-6 pt-4 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${filtersOpen ? 'block' : 'hidden md:flex'}`}>
            <p className="text-sm text-muted-foreground">
              {filteredClimbs.length} {filteredClimbs.length === 1 ? 'risultato' : 'risultati'}
            </p>
            <Button variant="outline" size="sm" onClick={resetFilters}>
              Cancella filtri
            </Button>
          </div>
        )}

        {/* Active filters indicator when closed on mobile */}
        {hasActiveFilters && !filtersOpen && (
          <div className="md:hidden flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {filteredClimbs.length} {filteredClimbs.length === 1 ? 'risultato' : 'risultati'}
            </p>
            <Button variant="outline" size="sm" onClick={resetFilters}>
              Cancella filtri
            </Button>
          </div>
        )}
      </Card>

      {/* Climbs List */}
      {filteredClimbs.length > 0 ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {filteredClimbs.map((climb) => (
            <Link key={climb.route.id} to={`/vie/${climb.route.id}`}>
              <Card className="p-4 sm:p-5 hover:shadow-md transition-shadow group cursor-pointer">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                        <Mountain className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base sm:text-lg mb-1 truncate group-hover:text-primary transition-colors">{climb.route.nome_via || 'Via sconosciuta'}</h3>
                        <p className="text-sm text-muted-foreground mb-3 truncate">{climb.route.crag_name || 'N/A'}</p>

                        <div className="flex flex-wrap gap-2">
                          <span className="inline-flex items-center px-2.5 sm:px-3 py-1 bg-primary text-primary-foreground rounded-full text-xs sm:text-sm font-medium">
                            {climb.route.grado || 'N/A'}
                          </span>
                          <span className="inline-flex items-center px-2.5 sm:px-3 py-1 bg-accent/30 text-accent-foreground rounded-full text-xs sm:text-sm">
                            {climb.is_lead === true ? '🧗 Primo' : '⛓️ Secondo'}
                          </span>
                          <span className="inline-flex items-center px-2.5 sm:px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-xs sm:text-sm">
                            {DIFFICULTY_LABELS[climb.difficulty.toString() as unknown as 1 | 2 | 3 | 4 | 5] || 'N/A'}
                          </span>
                        </div>

                        <p className="text-xs text-muted-foreground mt-3">
                          {new Date(climb.day).toLocaleDateString('it-IT', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDelete(climb.route.id, climb.route.nome_via || 'questa scalata');
                    }}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="p-8 sm:p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <Mountain className="w-12 sm:w-16 h-12 sm:h-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-base sm:text-lg font-medium mb-2">Nessuna via trovata</h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-4">
              {hasActiveFilters
                ? 'Prova a modificare i filtri di ricerca'
                : 'Inizia ad aggiungere le tue scalate'}
            </p>
            {hasActiveFilters && (
              <Button variant="outline" onClick={resetFilters}>
                Cancella filtri
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}