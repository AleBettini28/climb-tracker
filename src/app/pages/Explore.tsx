import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { cragsApi, CragDetailResponse, boulderAreasApi, BoulderAreaDetailResponse } from '../api';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Compass, Search, Mountain, Hexagon, MapPin, TrendingUp, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';

type ExploreSection = 'falesie' | 'boulder';

export function Explore() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [section, setSection] = useState<ExploreSection>('falesie');

  const [cragSearchTerm, setCragSearchTerm] = useState('');
  const [crags, setCrags] = useState<CragDetailResponse[]>([]);
  const [loadingCrags, setLoadingCrags] = useState(true);
  const [cragsLoaded, setCragsLoaded] = useState(false);

  const [boulderAreaSearchTerm, setBoulderAreaSearchTerm] = useState('');
  const [boulderAreas, setBoulderAreas] = useState<BoulderAreaDetailResponse[]>([]);
  const [loadingBoulderAreas, setLoadingBoulderAreas] = useState(true);
  const [boulderAreasLoaded, setBoulderAreasLoaded] = useState(false);

  useEffect(() => {
    if (cragsLoaded) return;

    let cancelled = false;

    (async () => {
      try {
        setLoadingCrags(true);
        const data = await cragsApi.list();
        if (!cancelled) {
          setCrags(data);
          setCragsLoaded(true);
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Error loading crags:', error);
          toast.error('Errore nel caricamento delle falesie');
        }
      } finally {
        if (!cancelled) setLoadingCrags(false);
      }
    })();

    return () => { cancelled = true; };
  }, [cragsLoaded]);

  useEffect(() => {
    if (boulderAreasLoaded) return;

    let cancelled = false;

    (async () => {
      try {
        setLoadingBoulderAreas(true);
        const data = await boulderAreasApi.list();
        if (!cancelled) {
          setBoulderAreas(data);
          setBoulderAreasLoaded(true);
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Error loading boulder areas:', error);
          toast.error('Errore nel caricamento delle aree boulder');
        }
      } finally {
        if (!cancelled) setLoadingBoulderAreas(false);
      }
    })();

    return () => { cancelled = true; };
  }, [boulderAreasLoaded]);

  const filteredCrags = useMemo(() => {
    return crags.filter(crag => {
      return crag.name.toLowerCase().includes(cragSearchTerm.toLowerCase()) ||
        (crag.city && crag.city.toLowerCase().includes(cragSearchTerm.toLowerCase())) ||
        (crag.country && crag.country.toLowerCase().includes(cragSearchTerm.toLowerCase()));
    });
  }, [crags, cragSearchTerm]);

  const filteredBoulderAreas = useMemo(() => {
    return boulderAreas.filter(area => {
      return area.name.toLowerCase().includes(boulderAreaSearchTerm.toLowerCase()) ||
        (area.city && area.city.toLowerCase().includes(boulderAreaSearchTerm.toLowerCase())) ||
        (area.country && area.country.toLowerCase().includes(boulderAreaSearchTerm.toLowerCase()));
    });
  }, [boulderAreas, boulderAreaSearchTerm]);

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg">
              <Compass className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold">Esplora</h1>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground">Scopri falesie e aree boulder da tutto il mondo</p>
        </div>

        <Tabs value={section} onValueChange={(value) => setSection(value as ExploreSection)}>
          <TabsList className="mb-6 sm:mb-8">
            <TabsTrigger value="falesie">
              <Mountain className="w-4 h-4" />
              Falesie
            </TabsTrigger>
            <TabsTrigger value="boulder">
              <Hexagon className="w-4 h-4" />
              Aree Boulder
            </TabsTrigger>
          </TabsList>

          {/* Falesie */}
          <TabsContent value="falesie">
            <section>
              <div className="mb-6 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder={'Cerca falesie per nome o luogo'}
                    value={cragSearchTerm}
                    onChange={(e) => setCragSearchTerm(e.target.value)}
                    className="pl-10 border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                {user && (
                  <Button onClick={() => navigate('/nuova-falesia')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nuova Falesia
                  </Button>
                )}
              </div>

              {loadingCrags ? (
                <div className="flex items-center justify-center min-h-[200px]">
                  <div className="text-center">
                    <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-amber-700 border-r-transparent"></div>
                    <p className="mt-4 text-stone-600">Caricamento...</p>
                  </div>
                </div>
              ) : filteredCrags.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredCrags.map((item) => (
                    <Card key={item.id} onClick={() => navigate(`/falesia/${item.id}`)} className="p-5 hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary group">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold mb-1 group-hover:text-primary transition-colors">{item.name}</h3>
                          {(item.city || item.country) && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <MapPin className="w-3 h-3" />
                              <span>
                                {item.city && item.country ? `${item.city}, ${item.country}` : item.city || item.country}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Mountain className="w-5 h-5 text-primary" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">{'Vie'}</span>
                          <span className="text-lg font-bold text-primary">{item.number_of_routes}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />Grado max
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 bg-primary text-primary-foreground rounded-full text-sm font-medium">{item.max_grade}</span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-12 text-center">
                  <Mountain className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Nessun risultato</h3>
                  <p className="text-sm text-muted-foreground">{cragSearchTerm ? 'Prova a modificare la ricerca' : 'Nessuna falesia disponibile'}</p>
                </Card>
              )}
            </section>
          </TabsContent>

          {/* Aree Boulder */}
          <TabsContent value="boulder">
            <section>
              <div className="mb-6 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder={'Cerca aree boulder per nome o luogo'}
                    value={boulderAreaSearchTerm}
                    onChange={(e) => setBoulderAreaSearchTerm(e.target.value)}
                    className="pl-10 border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                {user && (
                  <Button onClick={() => navigate('/nuova-area-boulder')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nuova Area Boulder
                  </Button>
                )}
              </div>

              {loadingBoulderAreas ? (
                <div className="flex items-center justify-center min-h-[200px]">
                  <div className="text-center">
                    <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-amber-700 border-r-transparent"></div>
                    <p className="mt-4 text-stone-600">Caricamento...</p>
                  </div>
                </div>
              ) : filteredBoulderAreas.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredBoulderAreas.map((item) => (
                    <Card key={item.id} onClick={() => navigate(`/area-boulder/${item.id}`)} className="p-5 hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary group">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold mb-1 group-hover:text-primary transition-colors">{item.name}</h3>
                          {(item.city || item.country) && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <MapPin className="w-3 h-3" />
                              <span>
                                {item.city && item.country ? `${item.city}, ${item.country}` : item.city || item.country}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Hexagon className="w-5 h-5 text-primary" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">{'Boulder'}</span>
                          <span className="text-lg font-bold text-primary">{item.number_of_boulders}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />Grado max
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 bg-primary text-primary-foreground rounded-full text-sm font-medium">{item.max_grade}</span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-12 text-center">
                  <Hexagon className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Nessun risultato</h3>
                  <p className="text-sm text-muted-foreground">{boulderAreaSearchTerm ? 'Prova a modificare la ricerca' : 'Nessuna area boulder disponibile'}</p>
                </Card>
              )}
            </section>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
