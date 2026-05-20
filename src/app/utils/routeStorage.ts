import { getSupabase } from './supabase';
import { Route } from '../types/route';

export interface SupabaseRoute {
  id: string;
  nome_via: string;
  nome_falesia: string;
  crag_id: string;
  grado: string;
  lunghezza?: number;
  latitudine: number;
  longitudine: number;
  aggiunto_da: string;
  created_at?: string;
  crags?: {
    id: string;
    name: string;
    description: string | null;
    latitude: number;
    longitude: number;
  };
}

const fromSupabase = (dbRoute: SupabaseRoute): Route => ({
  id: dbRoute.id,
  name: dbRoute.nome_via,
  cragId: dbRoute.crag_id || dbRoute.crags?.id || '',
  crag: dbRoute.crags?.name || dbRoute.nome_falesia,
  cragDescription: dbRoute.crags?.description || undefined,
  grade: dbRoute.grado,
  length: dbRoute.lunghezza,
  latitude: dbRoute.crags?.latitude || dbRoute.latitudine,
  longitude: dbRoute.crags?.longitude || dbRoute.longitudine,
  addedBy: dbRoute.aggiunto_da,
  createdAt: dbRoute.created_at,
});

const toSupabase = (route: Partial<Route>) => ({
  id: route.id,
  nome_via: route.name,
  crag_id: route.cragId,
  grado: route.grade,
  lunghezza: route.length,
  aggiunto_da: route.addedBy,
});

export const routeStorage = {
  async getRoutes(): Promise<Route[]> {
    const supabase = getSupabase();
    const token = localStorage.getItem('access_token');

    if (!token) {
      throw new Error('No authentication token found');
    }

    const { data, error } = await supabase
      .from('all_routes')
      .select('*, crags(*)')
      .order('nome_via', { ascending: true });

    if (error) {
      console.error('Error fetching routes:', error);
      throw error;
    }

    return (data || []).map(fromSupabase);
  },

  async getRouteById(id: string): Promise<Route | null> {
    const supabase = getSupabase();
    const token = localStorage.getItem('access_token');

    if (!token) {
      throw new Error('No authentication token found');
    }

    const { data, error } = await supabase
      .from('all_routes')
      .select('*, crags(*)')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching route:', error);
      return null;
    }

    return data ? fromSupabase(data) : null;
  },

  async addRoute(route: Route): Promise<void> {
    const supabase = getSupabase();
    const token = localStorage.getItem('access_token');

    if (!token) {
      throw new Error('No authentication token found');
    }

    const { error } = await supabase
      .from('all_routes')
      .insert([toSupabase(route)]);

    if (error) {
      console.error('Error adding route:', error);
      throw error;
    }
  },

  async updateRoute(route: Route): Promise<void> {
    const supabase = getSupabase();
    const token = localStorage.getItem('access_token');

    if (!token) {
      throw new Error('No authentication token found');
    }

    const { error } = await supabase
      .from('all_routes')
      .update(toSupabase(route))
      .eq('id', route.id);

    if (error) {
      console.error('Error updating route:', error);
      throw error;
    }
  },

  async deleteRoute(id: string): Promise<void> {
    const supabase = getSupabase();
    const token = localStorage.getItem('access_token');

    if (!token) {
      throw new Error('No authentication token found');
    }

    const { error } = await supabase
      .from('all_routes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting route:', error);
      throw error;
    }
  },
};
