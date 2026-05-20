import { getSupabase } from './supabase';
import { Crag, fromSupabaseCrag, toSupabaseCrag } from '../types/crag';

export const cragStorage = {
  async getCrags(): Promise<Crag[]> {
    const supabase = getSupabase();
    const token = localStorage.getItem('access_token');

    if (!token) {
      throw new Error('No authentication token found');
    }

    const { data, error } = await supabase
      .from('crags')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return (data || []).map(fromSupabaseCrag);
  },

  async getCragById(id: string): Promise<Crag | null> {
    const supabase = getSupabase();
    const token = localStorage.getItem('access_token');

    if (!token) {
      throw new Error('No authentication token found');
    }

    const { data, error } = await supabase
      .from('crags')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data ? fromSupabaseCrag(data) : null;
  },

  async getCragByName(name: string): Promise<Crag | null> {
    const supabase = getSupabase();
    const token = localStorage.getItem('access_token');

    if (!token) {
      throw new Error('No authentication token found');
    }

    const { data, error } = await supabase
      .from('crags')
      .select('*')
      .eq('name', name)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data ? fromSupabaseCrag(data) : null;
  },

  async addCrag(crag: Partial<Crag>): Promise<Crag> {
    const supabase = getSupabase();
    const token = localStorage.getItem('access_token');

    if (!token) {
      throw new Error('No authentication token found');
    }

    const { data, error } = await supabase
      .from('crags')
      .insert([toSupabaseCrag(crag)])
      .select()
      .single();

    if (error) throw error;
    return fromSupabaseCrag(data);
  },

  async updateCrag(id: string, updates: Partial<Crag>): Promise<Crag> {
    const supabase = getSupabase();
    const token = localStorage.getItem('access_token');

    if (!token) {
      throw new Error('No authentication token found');
    }

    const { data, error } = await supabase
      .from('crags')
      .update(toSupabaseCrag(updates))
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return fromSupabaseCrag(data);
  },

  async findOrCreateCrag(name: string, latitude: number, longitude: number, addedBy: string): Promise<Crag> {
    const existing = await this.getCragByName(name);
    if (existing) return existing;

    return this.addCrag({ name, latitude, longitude, addedBy });
  }
};
