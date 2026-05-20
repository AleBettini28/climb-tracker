import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { routeStorage } from '../utils/routeStorage';
import { cragStorage } from '../utils/cragStorage';
import { storage } from '../utils/storage';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { ArrowLeft, Mountain, MapPin, List, Plus, Edit2, Save, X, Trash2, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { MapView } from '../components/MapView';
import { MapPicker } from '../components/MapPicker';
import { ImageUpload } from '../components/ImageUpload';

export function CragDetail() {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const [routes, setRoutes] = useState<any[]>([]);
  const [crag, setCrag] = useState<any>(null);
  const [climbs, setClimbs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    city: '',
    country: '',
    latitude: 0,
    longitude: 0,
    mapImageUrl: undefined as string | undefined,
  });
  const cragName = decodeURIComponent(name || '');

  useEffect(() => {
    loadCragData();
  }, [name]);

  const loadCragData = async () => {
    try {
      const [allRoutes, cragData, userClimbs] = await Promise.all([
        routeStorage.getRoutes(),
        cragStorage.getCragByName(cragName),
        storage.getClimbs()
      ]);
      const cragRoutes = allRoutes.filter(r => r.crag === cragName);
      setRoutes(cragRoutes);
      setCrag(cragData);
      setClimbs(userClimbs);
      if (cragData) {
        setEditForm({
          name: cragData.name,
          description: cragData.description || '',
          city: cragData.city || '',
          country: cragData.country || '',
          latitude: cragData.latitude,
          longitude: cragData.longitude,
          mapImageUrl: cragData.mapImageUrl,
        });
      }
    } catch (error) {
      console.error('Error loading crag data:', error);
      toast.error('Errore nel caricamento dei dati');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRoute = () => {
    if (crag) {
      navigate('/nuova-via', { state: { selectedCrag: crag } });
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Reset form if canceling
      if (crag) {
        setEditForm({
          name: crag.name,
          description: crag.description || '',
          city: crag.city || '',
          country: crag.country || '',
          latitude: crag.latitude,
          longitude: crag.longitude,
          mapImageUrl: crag.mapImageUrl,
        });
      }
    }
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    if (!crag) return;

    try {
      await cragStorage.updateCrag(crag.id, {
        name: editForm.name,
        description: editForm.description,
        city: editForm.city,
        country: editForm.country,
        latitude: editForm.latitude,
        longitude: editForm.longitude,
        mapImageUrl: editForm.mapImageUrl,
      });
      toast.success('Falesia aggiornata con successo!');
      setIsEditing(false);
      // Navigate to new URL if name changed
      if (editForm.name !== cragName) {
        navigate(`/falesia/${encodeURIComponent(editForm.name)}`, { replace: true });
      } else {
        loadCragData();
      }
    } catch (error) {
      console.error('Error updating crag:', error);
      toast.error('Errore durante l\'aggiornamento della falesia');
    }
  };

  const handleDeleteRoute = async (routeId: string, routeName: string) => {
    const confirmed = window.confirm(`Sei sicuro di voler eliminare la via "${routeName}"?`);
    if (!confirmed) return;

    try {
      await routeStorage.deleteRoute(routeId);
      toast.success('Via eliminata con successo!');
      loadCragData();
    } catch (error) {
      console.error('Error deleting route:', error);
      toast.error('Errore durante l\'eliminazione della via');
    }
  };

  const isRouteClimbed = (routeId: string) => {
    return climbs.some(climb => climb.routeId === routeId);
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

  // Use crag coordinates if available, otherwise calculate from routes
  const displayLat = crag?.latitude || (routes.length > 0 ? routes.reduce((sum, r) => sum + r.latitude, 0) / routes.length : 0);
  const displayLng = crag?.longitude || (routes.length > 0 ? routes.reduce((sum, r) => sum + r.longitude, 0) / routes.length : 0);

  const gradeOrder = ['3B', '3C', '4A', '4B', '4C', '5A', '5A+', '5B', '5B+', '5C', '5C+', '6A', '6A+', '6B', '6B+', '6C', '6C+', '7A', '7A+', '7B', '7B+', '7C', '7C+', '8A', '8A+', '8B', '8B+', '8C', '8C+', '9A', '9A+', '9B', '9B+', '9C'];
  const sortedGrades = routes.map(r => r.grade).sort((a, b) => gradeOrder.indexOf(a) - gradeOrder.indexOf(b));
  const minGrade = sortedGrades.length > 0 ? sortedGrades[0] : '-';
  const maxGrade = sortedGrades.length > 0 ? sortedGrades[sortedGrades.length - 1] : '-';

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="max-w-6xl mx-auto">
        <Link to="/esplora">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Torna a Esplora
          </Button>
        </Link>

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Mountain className="w-6 h-6 text-primary" />
            </div>
            {!isEditing ? (
              <h1 className="text-2xl sm:text-3xl font-bold">{cragName}</h1>
            ) : (
              <div className="space-y-2 flex-1">
                <Label htmlFor="crag-name">Nome Falesia</Label>
                <Input
                  id="crag-name"
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="text-xl font-bold"
                />
              </div>
            )}
          </div>
          {crag && !isEditing && (
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
              <Button variant="outline" onClick={handleEditToggle} className="flex-1 sm:flex-initial">
                <Edit2 className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Modifica</span>
              </Button>
              <Button onClick={handleAddRoute} className="flex-1 sm:flex-initial">
                <Plus className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Aggiungi Via</span>
              </Button>
            </div>
          )}
          {isEditing && (
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
              <Button variant="outline" onClick={handleEditToggle} className="flex-1 sm:flex-initial">
                <X className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Annulla</span>
              </Button>
              <Button onClick={handleSave} className="flex-1 sm:flex-initial">
                <Save className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Salva</span>
              </Button>
            </div>
          )}
          {!isEditing && (
            <>
              {crag?.description && (
                <p className="text-sm text-muted-foreground mb-2">{crag.description}</p>
              )}
              {(crag?.city || crag?.country) && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>
                    {crag.city && crag.country ? `${crag.city}, ${crag.country}` : crag.city || crag.country}
                  </span>
                </div>
              )}
            </>
          )}
          {isEditing && (
            <>
              <div className="space-y-2 mt-4">
                <Label htmlFor="crag-description">Descrizione</Label>
                <Textarea
                  id="crag-description"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  placeholder="Descrivi la falesia..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="crag-city">Città/Paese</Label>
                  <Input
                    id="crag-city"
                    type="text"
                    value={editForm.city}
                    onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                    placeholder="Es. Arco, Lecco"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="crag-country">Stato</Label>
                  <Input
                    id="crag-country"
                    type="text"
                    value={editForm.country}
                    onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                    placeholder="Es. Italia, Francia"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        <Card className="p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Posizione</h2>
          </div>
          {!isEditing ? (
            <>
              {displayLat !== 0 && displayLng !== 0 ? (
                <MapView latitude={displayLat} longitude={displayLng} title={cragName} height="250px" />
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">Posizione non disponibile</p>
              )}
            </>
          ) : (
            <MapPicker
              latitude={editForm.latitude}
              longitude={editForm.longitude}
              onLocationSelect={(lat, lng) => setEditForm({ ...editForm, latitude: lat, longitude: lng })}
            />
          )}
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground mb-1">Totale Vie</div>
            <div className="text-2xl font-bold text-primary">{routes.length}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground mb-1">Grado Minimo</div>
            <div className="text-2xl font-bold">{minGrade}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground mb-1">Grado Massimo</div>
            <div className="text-2xl font-bold">{maxGrade}</div>
          </Card>
        </div>

        <Card className="p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <ImageIcon className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Foto Mappa Vie</h2>
          </div>
          {!isEditing ? (
            <>
              {crag?.mapImageUrl ? (
                <img
                  src={crag.mapImageUrl}
                  alt="Mappa delle vie"
                  className="w-full h-auto rounded-lg border border-border"
                />
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">Nessuna foto mappa caricata</p>
              )}
            </>
          ) : (
            <ImageUpload
              currentImageUrl={editForm.mapImageUrl}
              onImageUrlChange={(url) => setEditForm({ ...editForm, mapImageUrl: url })}
              bucketName="crag-maps"
              label=""
            />
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <List className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Vie ({routes.length})</h2>
          </div>
          
          {routes.length > 0 ? (
            <div className="space-y-2">
              {routes.map(route => (
                <div
                  key={route.id}
                  onClick={() => !isEditing && navigate(`/via/${route.id}`)}
                  className={`flex items-center justify-between p-3 rounded-lg transition-colors border border-border ${!isEditing ? 'hover:bg-muted cursor-pointer hover:border-primary' : ''}`}
                >
                  <div className="flex-1">
                    <div className="font-medium">{route.name}</div>
                    {route.length && (
                      <div className="text-sm text-muted-foreground">{route.length}m</div>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {isRouteClimbed(route.id) && !isEditing && (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    )}
                    <span className="inline-flex items-center px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm font-medium">
                      {route.grade}
                    </span>
                    {isEditing && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteRoute(route.id, route.name);
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
            <p className="text-muted-foreground text-center py-8">Nessuna via disponibile</p>
          )}
        </Card>
      </div>
    </div>
  );
}
