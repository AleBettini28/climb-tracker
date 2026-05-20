import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { routeStorage } from '../utils/routeStorage';
import { boulderArchiveStorage } from '../utils/boulderArchiveStorage';
import { cragStorage } from '../utils/cragStorage';
import { zoneStorage } from '../utils/zoneStorage';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Compass, Search, Mountain, MapPin, TrendingUp, Plus } from 'lucide-react';
import { toast } from 'sonner';

type Tab = 'crags' | 'zones';

export function Explore() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('crags');
  const [searchTerm, setSearchTerm] = useState('');
  const [crags, setCrags] = useState<any[]>([]);
  const [zones, setZones] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [boulders, setBoulders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [cragsData, zonesData, routesData, bouldersData] = await Promise.all([
        cragStorage.getCrags(),
        zoneStorage.getZones(),
        routeStorage.getRoutes(),
        boulderArchiveStorage.getBoulders()
      ]);
      setCrags(cragsData);
      setZones(zonesData);
      setRoutes(routesData);
      setBoulders(bouldersData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Errore nel caricamento dei dati');
    } finally {
      setLoading(false);
    }
  };

  const cragStats = useMemo(() => {
    const gradeOrder = ['3B', '3C', '4A', '4B', '4C', '5A', '5A+', '5B', '5B+', '5C', '5C+', '6A', '6A+', '6B', '6B+', '6C', '6C+', '7A', '7A+', '7B', '7B+', '7C', '7C+', '8A', '8A+', '8B', '8B+', '8C', '8C+', '9A', '9A+', '9B', '9B+', '9C'];

    return crags.map(crag => {
      const cragRoutes = routes.filter(r => r.cragId === crag.id || r.crag === crag.name);
      const grades = cragRoutes.map(r => r.grade);
      const sortedGrades = grades.sort((a, b) => gradeOrder.indexOf(b) - gradeOrder.indexOf(a));

      return {
        name: crag.name,
        city: crag.city,
        country: crag.country,
        routeCount: cragRoutes.length,
        hardestGrade: sortedGrades[0] || '-',
        latitude: crag.latitude,
        longitude: crag.longitude,
      };
    }).sort((a, b) => b.routeCount - a.routeCount);
  }, [crags, routes]);

  const zoneStats = useMemo(() => {
    const gradeOrder = ['3c', '4a', '4b', '4c', '5a', '5b', '5c', '6a', '6a+', '6b', '6b+', '6c', '6c+', '7a', '7a+', '7b', '7b+', '7c', '7c+', '8a', '8a+', '8b', '8b+', '8c', '8c+', '9a'];

    return zones.map(zone => {
      const zoneBoulders = boulders.filter(b => b.zoneId === zone.id || b.zone === zone.name);
      const grades = zoneBoulders.map(b => b.grade);
      const sortedGrades = grades.sort((a, b) => gradeOrder.indexOf(b) - gradeOrder.indexOf(a));

      return {
        name: zone.name,
        city: zone.city,
        country: zone.country,
        boulderCount: zoneBoulders.length,
        hardestGrade: sortedGrades[0] || '-',
        latitude: zone.latitude,
        longitude: zone.longitude,
      };
    }).sort((a, b) => b.boulderCount - a.boulderCount);
  }, [zones, boulders]);

  const filteredCrags = useMemo(() => {
    return cragStats.filter(crag => {
      return crag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (crag.city && crag.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (crag.country && crag.country.toLowerCase().includes(searchTerm.toLowerCase()));
    });
  }, [cragStats, searchTerm]);

  const filteredZones = useMemo(() => {
    return zoneStats.filter(zone => {
      return zone.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (zone.city && zone.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (zone.country && zone.country.toLowerCase().includes(searchTerm.toLowerCase()));
    });
  }, [zoneStats, searchTerm]);

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

  const displayData = activeTab === 'crags' ? filteredCrags : filteredZones;

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
          <p className="text-sm sm:text-base text-muted-foreground">Scopri falesie e zone boulder</p>
        </div>

        <div className="flex gap-2 mb-6 border-b border-border">
          <button onClick={() => setActiveTab('crags')} className={`px-4 py-3 font-medium text-sm transition-all relative ${activeTab === 'crags' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
            Falesie ({cragStats.length})
            {activeTab === 'crags' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
          </button>
          <button onClick={() => setActiveTab('zones')} className={`px-4 py-3 font-medium text-sm transition-all relative ${activeTab === 'zones' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
            Zone Boulder ({zoneStats.length})
            {activeTab === 'zones' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
          </button>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={activeTab === 'crags' ? 'Cerca falesie per nome o luogo' : 'Cerca zone per nome o luogo'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <Button onClick={() => navigate(activeTab === 'crags' ? '/nuova-falesia' : '/nuova-zona')}>
            <Plus className="w-4 h-4 mr-2" />
            Nuova {activeTab === 'crags' ? 'Falesia' : 'Zona'}
          </Button>
        </div>

        {displayData.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayData.map((item) => (
              <Card key={item.name} onClick={() => navigate(activeTab === 'crags' ? `/falesia/${encodeURIComponent(item.name)}` : `/zona/${encodeURIComponent(item.name)}`)} className="p-5 hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary group">
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
                    <span className="text-sm text-muted-foreground">{activeTab === 'crags' ? 'Vie' : 'Boulder'}</span>
                    <span className="text-lg font-bold text-primary">{activeTab === 'crags' ? item.routeCount : item.boulderCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />Grado max
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 bg-primary text-primary-foreground rounded-full text-sm font-medium">{item.hardestGrade}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <Compass className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Nessun risultato</h3>
            <p className="text-sm text-muted-foreground">{searchTerm ? 'Prova a modificare la ricerca' : `Nessuna ${activeTab === 'crags' ? 'falesia' : 'zona'} disponibile`}</p>
          </Card>
        )}
      </div>
    </div>
  );
}
