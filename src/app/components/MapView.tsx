import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapViewProps {
  latitude: number;
  longitude: number;
  title?: string;
  height?: string;
}

export function MapView({ latitude, longitude, title, height = '300px' }: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Create map
    const map = L.map(mapContainerRef.current, {
      scrollWheelZoom: false
    }).setView([latitude, longitude], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Add marker
    const marker = L.marker([latitude, longitude]).addTo(map);

    if (title) {
      marker.bindPopup(title);
    }

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [latitude, longitude, title]);

  return (
    <div
      ref={mapContainerRef}
      className="rounded-lg overflow-hidden border border-border"
      style={{ height }}
    />
  );
}
