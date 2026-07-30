import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { ArrowLeft, Hexagon, MapPin, List, Plus, Edit2, Save, X, Trash2, TrendingUp, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { MapView } from '../components/MapView';
import { MapPicker } from '../components/MapPicker';
import { ImageUpload } from '../components/ImageUpload';
import { BoulderAreaDetailResponse, boulderAreasApi } from '../api';
import { BoulderDetailResponse } from '../api/boulderAreas';
import { bouldersApi } from '../api/boulders';
import { useAuth } from '../context/AuthContext';

export function BoulderAreaDetail() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [boulders, setBoulders] = useState<BoulderDetailResponse[]>([]);
  const [boulderArea, setBoulderArea] = useState<BoulderAreaDetailResponse | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [loadingBoulders, setLoadingBoulders] = useState(false);
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

  const id = useParams<{ id: string }>().id;

  useEffect(() => {
    if (loading || !id || boulderArea) return;

    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const data = await boulderAreasApi.getOne(id);
        setBoulderArea(data);
        setLoading(false);
      } catch (error) {
        if (!cancelled) {
          console.error('Error loading boulder area:', error);
          toast.error('Errore nel caricamento dell\'area boulder');
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
    if (loadingBoulders || !id || boulderArea) return;

    let cancelled = false;

    (async () => {
      try {
        setLoadingBoulders(true);
        const data = await boulderAreasApi.getOneBoulders(id);
        setBoulders(data);
        setLoadingBoulders(false);
      } catch (error) {
        if (!cancelled) {
          console.error('Error loading boulders:', error);
          toast.error('Errore nel caricamento dei boulder');
        }
      } finally {
        if (!cancelled) {
          setLoadingBoulders(false);
        }
      }
    })();

    return () => { cancelled = true; };
  }, [loadingBoulders]);

  const handleAddBoulder = () => {
    if (boulderArea) {
      navigate(`/nuovo-masso/${boulderArea.id}`, { state: { selectedBoulderArea: boulderArea } });
    }
  };

  const handleEditToggle = () => {
    if (boulderArea) {
      setEditForm({
        name: boulderArea.name,
        description: boulderArea.description || '',
        city: boulderArea.city || '',
        country: boulderArea.country || '',
        latitude: boulderArea.latitude,
        longitude: boulderArea.longitude,
        mapImageUrl: boulderArea.map_image_url,
      });
    }
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    if (!boulderArea) return;

    try {
      await boulderAreasApi.updateOneBoulderArea({
        name: editForm.name,
        description: editForm.description,
        city: editForm.city,
        country: editForm.country,
        latitude: editForm.latitude,
        longitude: editForm.longitude,
        map_image_url: editForm.mapImageUrl,
        added_by: boulderArea.added_by,
      }, boulderArea.id);
      toast.success('Area boulder aggiornata con successo!');
      setIsEditing(false);
      navigate(`/area-boulder/${id}`);
    } catch (error) {
      console.error('Error updating boulder area:', error);
      toast.error('Errore durante l\'aggiornamento dell\'area boulder');
    }
  };

  const handleDeleteBoulderArea = async () => {
    if (!boulderArea) return;

    const confirmed = window.confirm(`Sei sicuro di voler eliminare l'area boulder "${boulderArea.name}"?`);
    if (!confirmed) return;

    try {
      await boulderAreasApi.deleteOneBoulderArea(boulderArea.id);
      toast.success('Area boulder eliminata con successo!');
      navigate('/esplora');
    } catch (error) {
      console.error('Error deleting boulder area:', error);
      toast.error('Errore durante l\'eliminazione dell\'area boulder');
    }
  };

  const handleDeleteBoulder = async (boulderId: string, boulderName: string) => {
    const confirmed = window.confirm(`Sei sicuro di voler eliminare il boulder "${boulderName}"? Verranno eliminati anche tutti i suoi blocchi.`);
    if (!confirmed) return;

    try {
      await bouldersApi.deleteOneBoulder(boulderId);
      toast.success('Boulder eliminato con successo!');
    } catch (error) {
      console.error('Error deleting boulder:', error);
      toast.error('Errore durante l\'eliminazione del boulder');
    }

    setBoulders(prevBoulders => prevBoulders.filter(boulder => boulder.id !== boulderId));
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

  const displayLat = boulderArea ? boulderArea.latitude : 0;
  const displayLng = boulderArea ? boulderArea.longitude : 0;

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
              <Hexagon className="w-6 h-6 text-primary" />
            </div>
            {!isEditing ? (
              <h1 className="text-2xl sm:text-3xl font-bold">{boulderArea ? boulderArea.name : ''}</h1>
            ) : (
              <div className="space-y-2 flex-1">
                <Label htmlFor="boulder-area-name">Nome Area Boulder</Label>
                <Input
                  id="boulder-area-name"
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="text-xl font-bold"
                />
              </div>
            )}
          </div>
          {boulderArea && !isEditing && user && (
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
              <Button variant="outline" onClick={handleEditToggle} className="flex-1 sm:flex-initial">
                <Edit2 className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Modifica</span>
              </Button>
              <Button onClick={handleAddBoulder} className="flex-1 sm:flex-initial">
                <Plus className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Aggiungi Boulder</span>
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
              <Button variant="destructive" onClick={handleDeleteBoulderArea} className="flex-1 sm:flex-initial">
                <Trash2 className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Elimina</span>
              </Button>
            </div>
          )}
          {!isEditing && (
            <>
              {boulderArea?.description && (
                <p className="text-sm text-muted-foreground mb-2">{boulderArea.description}</p>
              )}
              {(boulderArea?.city || boulderArea?.country) && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>
                    {boulderArea.city && boulderArea.country ? `${boulderArea.city}, ${boulderArea.country}` : boulderArea.city || boulderArea.country}
                  </span>
                </div>
              )}
            </>
          )}
          {isEditing && (
            <>
              <div className="space-y-2 mt-4">
                <Label htmlFor="boulder-area-description">Descrizione</Label>
                <Textarea
                  id="boulder-area-description"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  placeholder="Descrivi l'area boulder..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="boulder-area-city">Città/Paese</Label>
                  <Input
                    id="boulder-area-city"
                    type="text"
                    value={editForm.city}
                    onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                    placeholder="Es. Arco, Lecco"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="boulder-area-country">Stato</Label>
                  <Input
                    id="boulder-area-country"
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
                <MapView latitude={displayLat} longitude={displayLng} title={boulderArea ? boulderArea.name : ''} height="250px" />
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground mb-1">Totale Boulder</div>
            <div className="text-2xl font-bold text-primary">{boulders.length}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground mb-1">Grado Massimo</div>
            <div className="text-2xl font-bold">{boulderArea?.max_grade || '-'}</div>
          </Card>
        </div>

        <Card className="p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <ImageIcon className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Foto Mappa Boulder</h2>
          </div>
          {!isEditing ? (
            <>
              {boulderArea?.map_image_url ? (
                <img
                  src={boulderArea.map_image_url}
                  alt="Mappa dei boulder"
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
              label=""
            />
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <List className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Boulder ({boulders.length})</h2>
          </div>

          {boulders.length > 0 ? (
            <div className="space-y-2">
              {boulders.map(boulder => (
                <div
                  key={boulder.id}
                  onClick={() => !isEditing && navigate(`/masso/${boulder.id}`)}
                  className={`flex items-center justify-between p-3 rounded-lg transition-colors border border-border ${!isEditing ? 'hover:bg-muted cursor-pointer hover:border-primary' : ''}`}
                >
                  <div className="flex-1">
                    <div className="font-medium">{boulder.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {boulder.number_of_routes} {boulder.number_of_routes === 1 ? 'blocco' : 'blocchi'}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {boulder.max_grade && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm font-medium">
                        <TrendingUp className="w-3 h-3" />
                        {boulder.max_grade}
                      </span>
                    )}
                    {isEditing && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteBoulder(boulder.id, boulder.name);
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
            <p className="text-muted-foreground text-center py-8">Nessun boulder disponibile</p>
          )}
        </Card>
      </div>
    </div>
  );
}
