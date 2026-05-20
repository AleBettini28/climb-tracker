import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Search } from 'lucide-react';

interface MapPickerProps {
  latitude?: number;
  longitude?: number;
  onLocationSelect: (lat: number, lng: number) => void;
}

export function MapPicker({ latitude, longitude, onLocationSelect }: MapPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const defaultCenter: [number, number] = [45.4642, 9.1900]; // Milan, Italy

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Create map
    const map = L.map(mapContainerRef.current).setView(
      latitude && longitude ? [latitude, longitude] : defaultCenter,
      latitude && longitude ? 13 : 6
    );

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Add click handler
    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      onLocationSelect(lat, lng);

      // Remove old marker
      if (markerRef.current) {
        markerRef.current.remove();
      }

      // Add new marker
      markerRef.current = L.marker([lat, lng]).addTo(map);
    });

    mapRef.current = map;

    // Add marker if coordinates exist
    if (latitude && longitude) {
      markerRef.current = L.marker([latitude, longitude]).addTo(map);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    if (latitude && longitude) {
      mapRef.current.setView([latitude, longitude], 13);

      // Remove old marker
      if (markerRef.current) {
        markerRef.current.remove();
      }

      // Add new marker
      markerRef.current = L.marker([latitude, longitude]).addTo(mapRef.current);
    }
  }, [latitude, longitude]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        onLocationSelect(lat, lng);
      }
    } catch (error) {
      console.error('Error searching location:', error);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Cerca falesia (es. Arco, Val di Mello)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={handleSearch}
          disabled={searching}
        >
          Cerca
        </Button>
      </div>

      <div
        ref={mapContainerRef}
        className="rounded-lg overflow-hidden border border-border h-[300px] sm:h-[400px]"
      />

      {latitude && longitude && (
        <p className="text-xs text-muted-foreground text-center">
          Coordinate: {latitude.toFixed(4)}, {longitude.toFixed(4)}
        </p>
      )}
    </div>
  );
}
