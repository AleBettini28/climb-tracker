export interface Zone {
  id: string;
  name: string;
  description?: string;
  city?: string;
  country?: string;
  latitude: number;
  longitude: number;
  mapImageUrl?: string;
  addedBy: string;
  createdAt?: string;
}

interface SupabaseZone {
  id: string;
  name: string;
  description: string | null;
  city: string | null;
  country: string | null;
  latitude: number;
  longitude: number;
  map_image_url: string | null;
  added_by: string;
  created_at: string;
}

export const fromSupabaseZone = (dbZone: SupabaseZone): Zone => ({
  id: dbZone.id,
  name: dbZone.name,
  description: dbZone.description || undefined,
  city: dbZone.city || undefined,
  country: dbZone.country || undefined,
  latitude: dbZone.latitude,
  longitude: dbZone.longitude,
  mapImageUrl: dbZone.map_image_url || undefined,
  addedBy: dbZone.added_by,
  createdAt: dbZone.created_at,
});

export const toSupabaseZone = (zone: Partial<Zone>) => ({
  name: zone.name,
  description: zone.description || null,
  city: zone.city || null,
  country: zone.country || null,
  latitude: zone.latitude,
  longitude: zone.longitude,
  map_image_url: zone.mapImageUrl || null,
  added_by: zone.addedBy,
});
