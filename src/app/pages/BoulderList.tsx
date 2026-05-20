import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { boulderStorage } from '../utils/boulderStorage';
import { BoulderSend, BOULDER_GRADES } from '../types/boulder';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Mountain, PlusCircle, Search, Filter, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const FILTERS_STORAGE_KEY = 'boulder-list-filters';

export function BoulderList() {
  const [boulderSends, setBoulderSends] = useState<BoulderSend[]>([]);
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
  const [maxAttempts, setMaxAttempts] = useState<string>(savedFilters?.maxAttempts || '');
  const [showFilters, setShowFilters] = useState(false);

  // Save filters to localStorage whenever they change
  useEffect(() => {
    const filters = {
      searchTerm,
      selectedGrade,
      maxAttempts
    };
    localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(filters));
  }, [searchTerm, selectedGrade, maxAttempts]);

  useEffect(() => {
    loadBoulderSends();
  }, []);

  const loadBoulderSends = async () => {
    try {
      const data = await boulderStorage.getBoulderSends();
      setBoulderSends(data);
    } catch (error) {
      console.error('Error loading boulder sends:', error);
      toast.error('Errore nel caricamento dei boulder');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (confirm('Sei sicuro di voler eliminare questo boulder?')) {
      try {
        await boulderStorage.deleteBoulderSend(id);
        setBoulderSends(boulderSends.filter(b => b.id !== id));
        toast.success('Boulder eliminato con successo');
      } catch (error) {
        console.error('Error deleting boulder send:', error);
        toast.error('Errore durante l\'eliminazione');
      }
    }
  };

  const filteredBoulderSends = boulderSends.filter(send => {
    const matchesSearch =
      send.boulderName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      send.boulderZone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      send.problemNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = selectedGrade === 'all' || send.boulderGrade === selectedGrade;
    const matchesAttempts = !maxAttempts || send.attempts <= parseInt(maxAttempts);

    return matchesSearch && matchesGrade && matchesAttempts;
  });

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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Mountain className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <h1 className="text-xl sm:text-2xl">I Miei Boulder</h1>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground">
              {filteredBoulderSends.length} {filteredBoulderSends.length === 1 ? 'boulder' : 'boulder'} completati
            </p>
          </div>
          <Link to="/tutti-i-boulder">
            <Button>
              <Mountain className="w-4 h-4 mr-2" />
              Archivio Boulder
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card className="p-4 sm:p-5 mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full sm:hidden flex items-center justify-between mb-4"
          >
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <span className="font-medium">Filtri</span>
            </div>
            {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          <div className={`${showFilters ? 'block' : 'hidden'} sm:block`}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Search */}
              <div className="space-y-2">
                <Label htmlFor="search" className="text-sm font-medium">Cerca</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="search"
                    type="text"
                    placeholder="Masso, zona, numero..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
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
                    {BOULDER_GRADES.map(grade => (
                      <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Attempts Filter */}
              <div className="space-y-2">
                <Label htmlFor="attempts-filter" className="text-sm font-medium">Max Tentativi</Label>
                <Input
                  id="attempts-filter"
                  type="number"
                  min="1"
                  placeholder="Tutti"
                  value={maxAttempts}
                  onChange={(e) => setMaxAttempts(e.target.value)}
                  className="border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Boulder List */}
        {filteredBoulderSends.length === 0 ? (
          <Card className="p-8 sm:p-12 text-center">
            <Mountain className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Nessun boulder trovato</h2>
            <p className="text-muted-foreground mb-4">
              {boulderSends.length === 0
                ? 'Vai all\'archivio boulder e seleziona i boulder che hai fatto!'
                : 'Prova a modificare i filtri di ricerca'}
            </p>
            {boulderSends.length === 0 && (
              <Link to="/tutti-i-boulder">
                <Button>
                  <Mountain className="w-4 h-4 mr-2" />
                  Vai all'Archivio
                </Button>
              </Link>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {filteredBoulderSends.map(send => (
              <Link key={send.id} to={`/boulder/${send.id}`}>
                <Card className="p-4 sm:p-5 hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-base sm:text-lg font-semibold mb-1">
                        {send.boulderName} - {send.problemNumber}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                        {send.boulderZone}
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {new Date(send.date).toLocaleDateString('it-IT', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleDelete(e, send.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm font-medium">
                      {send.boulderGrade}
                    </span>
                    <span className="inline-flex items-center px-3 py-1 bg-accent text-accent-foreground rounded-full text-sm">
                      {send.attempts} {send.attempts === 1 ? 'tentativo' : 'tentativi'}
                    </span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
