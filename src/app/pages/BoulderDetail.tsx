import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ArrowLeft, Circle, MapPin, List, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { BoulderDetailResponseExtended, BoulderRouteDetailResponse, bouldersApi } from '../api/boulders';
import { boulderRoutesApi } from '../api/boulderRoutes';
import { useAuth } from '../context/AuthContext';
import { BOULDER_GRADES } from '../types/boulderArea';

export function BoulderDetail() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [boulderRoutes, setBoulderRoutes] = useState<BoulderRouteDetailResponse[]>([]);
  const [boulder, setBoulder] = useState<BoulderDetailResponseExtended | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [loadingRoutes, setLoadingRoutes] = useState(false);

  const id = useParams<{ id: string }>().id;

  useEffect(() => {
    if (loading || !id || boulder) return;

    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const data = await bouldersApi.getOne(id);
        setBoulder(data);
        setLoading(false);
      } catch (error) {
        if (!cancelled) {
          console.error('Error loading boulder:', error);
          toast.error('Errore nel caricamento del boulder');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => { cancelled = true; };
  }, [loading]);

  useEffect(() => {
    if (loadingRoutes || !id || boulder) return;

    let cancelled = false;

    (async () => {
      try {
        setLoadingRoutes(true);
        const data = user
          ? await bouldersApi.getOneRoutes(id, user.id)
          : await bouldersApi.getOneRoutesPublic(id);
        setBoulderRoutes(data);
        setLoadingRoutes(false);
      } catch (error) {
        if (!cancelled) {
          console.error('Error loading boulder routes:', error);
          toast.error('Errore nel caricamento dei blocchi');
        }
      } finally {
        if (!cancelled) {
          setLoadingRoutes(false);
        }
      }
    })();

    return () => { cancelled = true; };
  }, [loadingRoutes, user]);

  const handleAddBoulderRoute = () => {
    if (boulder) {
      navigate(`/nuovo-blocco/${boulder.id}`, { state: { selectedBoulder: boulder } });
    }
  };

  const handleDeleteBoulderRoute = async (boulderRouteId: string, routeName: string) => {
    const confirmed = window.confirm(`Sei sicuro di voler eliminare il blocco "${routeName}"?`);
    if (!confirmed) return;

    try {
      await boulderRoutesApi.deleteOneBoulderRoute(boulderRouteId);
      toast.success('Blocco eliminato con successo!');
    } catch (error) {
      console.error('Error deleting boulder route:', error);
      toast.error('Errore durante l\'eliminazione del blocco');
    }

    setBoulderRoutes(prevRoutes => prevRoutes.filter(route => route.id !== boulderRouteId));
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

  const gradeOrder = [...BOULDER_GRADES];
  const sortedGrades = boulderRoutes.map(r => r.grade).sort((a, b) => gradeOrder.indexOf(a as any) - gradeOrder.indexOf(b as any));
  const minGrade = sortedGrades.length > 0 ? sortedGrades[0] : '-';

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="max-w-6xl mx-auto">
        <Link to={boulder ? `/area-boulder/${boulder.boulder_area_id}` : '/esplora'}>
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Torna all'Area Boulder
          </Button>
        </Link>

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Circle className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold">{boulder ? boulder.name : ''}</h1>
          </div>
          {boulder?.boulder_area_name && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <MapPin className="w-4 h-4" />
              <span>{boulder.boulder_area_name}</span>
            </div>
          )}
          {user && (
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
              <Button onClick={handleAddBoulderRoute} className="flex-1 sm:flex-initial">
                <Plus className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Aggiungi Blocco</span>
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground mb-1">Totale Blocchi</div>
            <div className="text-2xl font-bold text-primary">{boulderRoutes.length}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground mb-1">Grado Minimo</div>
            <div className="text-2xl font-bold">{minGrade}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground mb-1">Grado Massimo</div>
            <div className="text-2xl font-bold">{boulder?.max_grade || '-'}</div>
          </Card>
        </div>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <List className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Blocchi ({boulderRoutes.length})</h2>
          </div>

          {boulderRoutes.length > 0 ? (
            <div className="space-y-2">
              {boulderRoutes.map(route => (
                <div
                  key={route.id}
                  onClick={() => navigate(`/blocco/${route.id}`)}
                  className="flex items-center justify-between p-3 rounded-lg transition-colors border border-border hover:bg-muted cursor-pointer hover:border-primary"
                >
                  <div className="flex-1">
                    <div className="font-medium">{route.route_name}</div>
                    {route.route_description && (
                      <div className="text-sm text-muted-foreground truncate max-w-md">{route.route_description}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {route.is_sent && (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    )}
                    <span className="inline-flex items-center px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm font-medium">
                      {route.grade}
                    </span>
                    {user && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteBoulderRoute(route.id, route.route_name);
                        }}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">Nessun blocco disponibile</p>
          )}
        </Card>
      </div>
    </div>
  );
}
