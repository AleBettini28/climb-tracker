export interface Crag {
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

interface SupabaseCrag {
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

export const fromSupabaseCrag = (dbCrag: SupabaseCrag): Crag => ({
  id: dbCrag.id,
  name: dbCrag.name,
  description: dbCrag.description || undefined,
  city: dbCrag.city || undefined,
  country: dbCrag.country || undefined,
  latitude: dbCrag.latitude,
  longitude: dbCrag.longitude,
  mapImageUrl: dbCrag.map_image_url || undefined,
  addedBy: dbCrag.added_by,
  createdAt: dbCrag.created_at,
});

export const toSupabaseCrag = (crag: Partial<Crag>) => ({
  name: crag.name,
  description: crag.description || null,
  city: crag.city || null,
  country: crag.country || null,
  latitude: crag.latitude,
  longitude: crag.longitude,
  map_image_url: crag.mapImageUrl || null,
  added_by: crag.addedBy,
});
