import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { boulderArchiveStorage } from '../utils/boulderArchiveStorage';
import { boulderStorage } from '../utils/boulderStorage';
import { zoneStorage } from '../utils/zoneStorage';
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

export function ZoneDetail() {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const [boulders, setBoulders] = useState<any[]>([]);
  const [zone, setZone] = useState<any>(null);
  const [sends, setSends] = useState<any[]>([]);
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
  const zoneName = decodeURIComponent(name || '');

  useEffect(() => {
    loadZoneData();
  }, [name]);

  const loadZoneData = async () => {
    try {
      const [allBoulders, zoneData, userSends] = await Promise.all([
        boulderArchiveStorage.getBoulders(),
        zoneStorage.getZoneByName(zoneName),
        boulderStorage.getBoulderSends()
      ]);
      const zoneBoulders = allBoulders.filter(b => b.zone === zoneName);
      setBoulders(zoneBoulders);
      setZone(zoneData);
      setSends(userSends);
      if (zoneData) {
        setEditForm({
          name: zoneData.name,
          description: zoneData.description || '',
          city: zoneData.city || '',
          country: zoneData.country || '',
          latitude: zoneData.latitude,
          longitude: zoneData.longitude,
          mapImageUrl: zoneData.mapImageUrl,
        });
      }
    } catch (error) {
      console.error('Error loading zone data:', error);
      toast.error('Errore nel caricamento dei dati');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBoulder = () => {
    if (zone) {
      navigate('/nuovo-boulder-archivio', { state: { selectedZone: zone } });
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Reset form if canceling
      if (zone) {
        setEditForm({
          name: zone.name,
          description: zone.description || '',
          city: zone.city || '',
          country: zone.country || '',
          latitude: zone.latitude,
          longitude: zone.longitude,
          mapImageUrl: zone.mapImageUrl,
        });
      }
    }
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    if (!zone) return;

    try {
      await zoneStorage.updateZone(zone.id, {
        name: editForm.name,
        description: editForm.description,
        city: editForm.city,
        country: editForm.country,
        latitude: editForm.latitude,
        longitude: editForm.longitude,
        mapImageUrl: editForm.mapImageUrl,
      });
      toast.success('Zona aggiornata con successo!');
      setIsEditing(false);
      // Navigate to new URL if name changed
      if (editForm.name !== zoneName) {
        navigate(`/zona/${encodeURIComponent(editForm.name)}`, { replace: true });
      } else {
        loadZoneData();
      }
    } catch (error) {
      console.error('Error updating zone:', error);
      toast.error('Errore durante l\'aggiornamento della zona');
    }
  };

  const handleDeleteBoulder = async (boulderId: string, boulderName: string) => {
    const confirmed = window.confirm(`Sei sicuro di voler eliminare il boulder "${boulderName}"?`);
    if (!confirmed) return;

    try {
      await boulderArchiveStorage.deleteBoulder(boulderId);
      toast.success('Boulder eliminato con successo!');
      loadZoneData();
    } catch (error) {
      console.error('Error deleting boulder:', error);
      toast.error('Errore durante l\'eliminazione del boulder');
    }
  };

  const isBoulderSent = (boulderId: string) => {
    return sends.some(send => send.boulderId === boulderId);
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

  // Use zone coordinates if available, otherwise calculate from boulders
  const displayLat = zone?.latitude || (boulders.length > 0 ? boulders.reduce((sum, b) => sum + b.latitude, 0) / boulders.length : 0);
  const displayLng = zone?.longitude || (boulders.length > 0 ? boulders.reduce((sum, b) => sum + b.longitude, 0) / boulders.length : 0);

  const gradeOrder = ['3c', '4a', '4b', '4c', '5a', '5b', '5c', '6a', '6a+', '6b', '6b+', '6c', '6c+', '7a', '7a+', '7b', '7b+', '7c', '7c+', '8a', '8a+', '8b', '8b+', '8c', '8c+', '9a'];
  const sortedGrades = boulders.map(b => b.grade).sort((a, b) => gradeOrder.indexOf(a) - gradeOrder.indexOf(b));
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
              <h1 className="text-2xl sm:text-3xl font-bold">{zoneName}</h1>
            ) : (
              <div className="space-y-2 flex-1">
                <Label htmlFor="zone-name">Nome Zona</Label>
                <Input
                  id="zone-name"
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="text-xl font-bold"
                />
              </div>
            )}
          </div>
          {zone && !isEditing && (
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
            </div>
          )}
          {!isEditing && (
            <>
              {zone?.description && (
                <p className="text-sm text-muted-foreground mb-2">{zone.description}</p>
              )}
              {(zone?.city || zone?.country) && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>
                    {zone.city && zone.country ? `${zone.city}, ${zone.country}` : zone.city || zone.country}
                  </span>
                </div>
              )}
            </>
          )}
          {isEditing && (
            <>
              <div className="space-y-2 mt-4">
                <Label htmlFor="zone-description">Descrizione</Label>
                <Textarea
                  id="zone-description"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  placeholder="Descrivi la zona..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="zone-city">Città/Paese</Label>
                  <Input
                    id="zone-city"
                    type="text"
                    value={editForm.city}
                    onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                    placeholder="Es. Avers, Fontainebleau"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zone-country">Stato</Label>
                  <Input
                    id="zone-country"
                    type="text"
                    value={editForm.country}
                    onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                    placeholder="Es. Svizzera, Francia"
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
                <MapView latitude={displayLat} longitude={displayLng} title={zoneName} height="250px" />
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
            <div className="text-sm text-muted-foreground mb-1">Totale Boulder</div>
            <div className="text-2xl font-bold text-primary">{boulders.length}</div>
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
            <h2 className="text-lg font-semibold">Foto Mappa Boulder</h2>
          </div>
          {!isEditing ? (
            <>
              {zone?.mapImageUrl ? (
                <img
                  src={zone.mapImageUrl}
                  alt="Mappa boulder"
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
              bucketName="zone-maps"
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
                  onClick={() => !isEditing && navigate(`/boulder-archivio/${boulder.id}`)}
                  className={`flex items-center justify-between p-3 rounded-lg transition-colors border border-border ${!isEditing ? 'hover:bg-muted cursor-pointer hover:border-primary' : ''}`}
                >
                  <div className="flex-1">
                    <div className="font-medium">{boulder.boulderName} - {boulder.problemNumber}</div>
                    <div className="text-sm text-muted-foreground">{boulder.zone}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    {isBoulderSent(boulder.id) && !isEditing && (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    )}
                    <span className="inline-flex items-center px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm font-medium">
                      {boulder.grade}
                    </span>
                    {isEditing && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteBoulder(boulder.id, `${boulder.boulderName} - ${boulder.problemNumber}`);
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
