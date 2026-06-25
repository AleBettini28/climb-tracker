import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { boulderArchiveStorage } from '../utils/boulderArchiveStorage';
import { zoneStorage } from '../utils/zoneStorage';
import { cragsApi, CragDetailResponse } from '../api';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Compass, Search, Mountain, MapPin, TrendingUp, Plus } from 'lucide-react';
import { toast } from 'sonner';

type Tab = 'crags' | 'zones';

interface ZoneListItem {
  name: string;
  city?: string;
  country?: string;
  boulderCount: number;
  hardestGrade: string;
  latitude: number;
  longitude: number;
}

export function Explore() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [crags, setCrags] = useState<CragDetailResponse[]>([]);
  const [loadingCrags, setLoadingCrags] = useState(true);
  const [cragsLoaded, setCragsLoaded] = useState(false);

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

  const filteredCrags = useMemo(() => {
    return crags.filter(crag => {
      return crag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (crag.city && crag.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (crag.country && crag.country.toLowerCase().includes(searchTerm.toLowerCase()));
    });
  }, [crags, searchTerm]);

  const loading = loadingCrags;

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

  const displayData =  filteredCrags;

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
          <p className="text-sm sm:text-base text-muted-foreground">Scopri falesie</p>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={'Cerca falesie per nome o luogo'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <Button onClick={() => navigate('/nuova-falesia')}>
            <Plus className="w-4 h-4 mr-2" />
            Nuova Falesia
          </Button>
        </div>

        {displayData.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayData.map((item) => (
              <Card key={item.name} onClick={() => navigate(`/falesia/${item.id}`)} className="p-5 hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary group">
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
                    <span className="text-lg font-bold text-primary">{(item as CragDetailResponse).number_of_routes }</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />Grado max
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 bg-primary text-primary-foreground rounded-full text-sm font-medium">{'-'}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <Compass className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Nessun risultato</h3>
            <p className="text-sm text-muted-foreground">{searchTerm ? 'Prova a modificare la ricerca' : `Nessuna ${'falesia'} disponibile`}</p>
          </Card>
        )}
      </div>
    </div>
  );
}
