import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router';
import { routeStorage } from '../utils/routeStorage';
import { Route, CLIMBING_GRADES } from '../types/route';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Mountain, PlusCircle, Search, Filter, ChevronDown, ChevronUp, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { toast } from 'sonner';

type SortField = 'grade' | 'length' | null;
type SortDirection = 'asc' | 'desc';

const FILTERS_STORAGE_KEY = 'all-routes-filters';

export function AllRoutesList() {
  const navigate = useNavigate();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);

  // Load filters from localStorage on mount
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
  const [maxLength, setMaxLength] = useState<string>(savedFilters?.maxLength || '');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortField, setSortField] = useState<SortField>(savedFilters?.sortField || null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(savedFilters?.sortDirection || 'asc');

  // Save filters to localStorage whenever they change
  useEffect(() => {
    const filters = {
      searchTerm,
      selectedGrade,
      selectedCrag,
      maxLength,
      sortField,
      sortDirection
    };
    localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(filters));
  }, [searchTerm, selectedGrade, selectedCrag, maxLength, sortField, sortDirection]);

  useEffect(() => {
    loadRoutes();
  }, []);

  const loadRoutes = async () => {
    try {
      const data = await routeStorage.getRoutes();
      setRoutes(data);
    } catch (error) {
      console.error('Error loading routes:', error);
      toast.error('Errore nel caricamento delle vie');
    } finally {
      setLoading(false);
    }
  };

  // Get unique crags
  const crags = useMemo(() => {
    const uniqueCrags = new Set(routes.map(r => r.crag));
    return Array.from(uniqueCrags).sort();
  }, [routes]);

  // Filter and sort routes
  const filteredRoutes = useMemo(() => {
    let filtered = [...routes];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(route =>
        route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        route.crag.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Grade filter
    if (selectedGrade !== 'all') {
      filtered = filtered.filter(route => route.grade === selectedGrade);
    }

    // Crag filter
    if (selectedCrag !== 'all') {
      filtered = filtered.filter(route => route.crag === selectedCrag);
    }

    // Length filter
    if (maxLength) {
      const maxLen = parseInt(maxLength);
      filtered = filtered.filter(route => !route.length || route.length <= maxLen);
    }

    // Sorting
    if (sortField) {
      const gradeOrder = CLIMBING_GRADES;

      filtered.sort((a, b) => {
        let comparison = 0;

        if (sortField === 'grade') {
          const indexA = gradeOrder.indexOf(a.grade as any);
          const indexB = gradeOrder.indexOf(b.grade as any);
          comparison = indexA - indexB;
        } else if (sortField === 'length') {
          const lengthA = a.length || 0;
          const lengthB = b.length || 0;
          comparison = lengthA - lengthB;
        }

        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    return filtered;
  }, [routes, searchTerm, selectedGrade, selectedCrag, maxLength, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 ml-1 opacity-50" />;
    }
    return sortDirection === 'asc'
      ? <ArrowUp className="w-4 h-4 ml-1" />
      : <ArrowDown className="w-4 h-4 ml-1" />;
  };

  const hasActiveFilters = searchTerm || selectedGrade !== 'all' || selectedCrag !== 'all' || maxLength;

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedGrade('all');
    setSelectedCrag('all');
    setMaxLength('');
    setSortField(null);
    setSortDirection('asc');
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

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Mountain className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <h1 className="text-xl sm:text-2xl">Tutte le Vie</h1>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground">
            {filteredRoutes.length} {filteredRoutes.length === 1 ? 'via disponibile' : 'vie disponibili'}
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

          <div className={`space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-4 ${filtersOpen ? 'block' : 'hidden md:grid'}`}>
            {/* Search */}
            <div className="space-y-2">
              <Label htmlFor="search" className="text-sm font-medium">Cerca</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="search"
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
              <Label htmlFor="grade-filter" className="text-sm font-medium">Grado</Label>
              <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                <SelectTrigger id="grade-filter" className="border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all">
                  <SelectValue />
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
              <Label htmlFor="crag-filter" className="text-sm font-medium">Falesia</Label>
              <Select value={selectedCrag} onValueChange={setSelectedCrag}>
                <SelectTrigger id="crag-filter" className="border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutte le falesie</SelectItem>
                  {crags.map(crag => (
                    <SelectItem key={crag} value={crag}>{crag}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Length Filter */}
            <div className="space-y-2">
              <Label htmlFor="length-filter" className="text-sm font-medium">Lunghezza Max (m)</Label>
              <Input
                id="length-filter"
                type="number"
                min="1"
                placeholder="Tutte"
                value={maxLength}
                onChange={(e) => setMaxLength(e.target.value)}
                className="border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          {hasActiveFilters && (
            <div className={`mt-6 pt-4 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${filtersOpen ? 'block' : 'hidden md:flex'}`}>
              <p className="text-sm text-muted-foreground">
                {filteredRoutes.length} {filteredRoutes.length === 1 ? 'risultato' : 'risultati'}
              </p>
              <Button variant="outline" size="sm" onClick={resetFilters}>
                Cancella filtri
              </Button>
            </div>
          )}
        </Card>

        {/* Routes Table */}
        {filteredRoutes.length > 0 ? (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted border-b border-border">
                  <tr>
                    <th className="text-left p-4 font-semibold">Nome Via</th>
                    <th className="text-left p-4 font-semibold">Falesia</th>
                    <th
                      className="text-left p-4 font-semibold cursor-pointer hover:bg-muted-foreground/10 transition-colors select-none"
                      onClick={() => handleSort('grade')}
                    >
                      <div className="flex items-center">
                        Grado
                        {getSortIcon('grade')}
                      </div>
                    </th>
                    <th
                      className="text-left p-4 font-semibold cursor-pointer hover:bg-muted-foreground/10 transition-colors select-none"
                      onClick={() => handleSort('length')}
                    >
                      <div className="flex items-center">
                        Lunghezza
                        {getSortIcon('length')}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRoutes.map((route) => (
                    <tr
                      key={route.id}
                      onClick={() => navigate(`/via/${route.id}`)}
                      className="border-b border-border hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <td className="p-4 font-medium">{route.name}</td>
                      <td className="p-4 text-muted-foreground">{route.crag}</td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-2.5 py-1 bg-primary text-primary-foreground rounded-full text-sm font-medium">
                          {route.grade}
                        </span>
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {route.length ? `${route.length}m` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ) : (
          <Card className="p-8 sm:p-12">
            <div className="flex flex-col items-center justify-center text-center">
              <Mountain className="w-12 sm:w-16 h-12 sm:h-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-base sm:text-lg font-medium mb-2">Nessuna via trovata</h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-4">
                {hasActiveFilters
                  ? 'Prova a modificare i filtri di ricerca'
                  : 'Inizia ad aggiungere vie all\'archivio'}
              </p>
              {!hasActiveFilters && (
                <Link to="/nuova-via">
                  <Button>
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Aggiungi la prima via
                  </Button>
                </Link>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
