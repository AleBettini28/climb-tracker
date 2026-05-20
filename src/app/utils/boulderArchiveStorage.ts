import { getSupabase } from './supabase';
import { Boulder } from '../types/boulder';

export interface SupabaseBoulder {
  id: string;
  zona: string;
  zone_id: string;
  nome_masso: string;
  numero_via: string;
  grado: string;
  latitudine: number;
  longitudine: number;
  aggiunto_da: string;
  created_at?: string;
  zones?: {
    id: string;
    name: string;
    description: string | null;
    latitude: number;
    longitude: number;
  };
}

const fromSupabase = (dbBoulder: SupabaseBoulder): Boulder => ({
  id: dbBoulder.id,
  zoneId: dbBoulder.zone_id || dbBoulder.zones?.id || '',
  zone: dbBoulder.zones?.name || dbBoulder.zona,
  zoneDescription: dbBoulder.zones?.description || undefined,
  boulderName: dbBoulder.nome_masso,
  problemNumber: dbBoulder.numero_via,
  grade: dbBoulder.grado,
  latitude: dbBoulder.zones?.latitude || dbBoulder.latitudine,
  longitude: dbBoulder.zones?.longitude || dbBoulder.longitudine,
  addedBy: dbBoulder.aggiunto_da,
  createdAt: dbBoulder.created_at,
});

const toSupabase = (boulder: Partial<Boulder>) => ({
  id: boulder.id,
  zone_id: boulder.zoneId,
  nome_masso: boulder.boulderName,
  numero_via: boulder.problemNumber,
  grado: boulder.grade,
  aggiunto_da: boulder.addedBy,
});

export const boulderArchiveStorage = {
  async getBoulders(): Promise<Boulder[]> {
    const supabase = getSupabase();
    const token = localStorage.getItem('access_token');

    if (!token) {
      throw new Error('No authentication token found');
    }

    const { data, error } = await supabase
      .from('all_boulders')
      .select('*, zones(*)')
      .order('nome_masso', { ascending: true });

    if (error) {
      console.error('Error fetching boulders:', error);
      throw error;
    }

    return (data || []).map(fromSupabase);
  },

  async getBoulderById(id: string): Promise<Boulder | null> {
    const supabase = getSupabase();
    const token = localStorage.getItem('access_token');

    if (!token) {
      throw new Error('No authentication token found');
    }

    const { data, error } = await supabase
      .from('all_boulders')
      .select('*, zones(*)')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching boulder:', error);
      return null;
    }

    return data ? fromSupabase(data) : null;
  },

  async addBoulder(boulder: Boulder): Promise<void> {
    const supabase = getSupabase();
    const token = localStorage.getItem('access_token');

    if (!token) {
      throw new Error('No authentication token found');
    }

    const { error } = await supabase
      .from('all_boulders')
      .insert([toSupabase(boulder)]);

    if (error) {
      console.error('Error adding boulder:', error);
      throw error;
    }
  },

  async updateBoulder(boulder: Boulder): Promise<void> {
    const supabase = getSupabase();
    const token = localStorage.getItem('access_token');

    if (!token) {
      throw new Error('No authentication token found');
    }

    const { error } = await supabase
      .from('all_boulders')
      .update(toSupabase(boulder))
      .eq('id', boulder.id);

    if (error) {
      console.error('Error updating boulder:', error);
      throw error;
    }
  },

  async deleteBoulder(id: string): Promise<void> {
    const supabase = getSupabase();
    const token = localStorage.getItem('access_token');

    if (!token) {
      throw new Error('No authentication token found');
    }

    const { error } = await supabase
      .from('all_boulders')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting boulder:', error);
      throw error;
    }
  },
};
