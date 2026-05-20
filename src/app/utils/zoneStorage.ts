import { getSupabase } from './supabase';
import { Zone, fromSupabaseZone, toSupabaseZone } from '../types/zone';

export const zoneStorage = {
  async getZones(): Promise<Zone[]> {
    const supabase = getSupabase();
    const token = localStorage.getItem('access_token');

    if (!token) {
      throw new Error('No authentication token found');
    }

    const { data, error } = await supabase
      .from('zones')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return (data || []).map(fromSupabaseZone);
  },

  async getZoneById(id: string): Promise<Zone | null> {
    const supabase = getSupabase();
    const token = localStorage.getItem('access_token');

    if (!token) {
      throw new Error('No authentication token found');
    }

    const { data, error } = await supabase
      .from('zones')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data ? fromSupabaseZone(data) : null;
  },

  async getZoneByName(name: string): Promise<Zone | null> {
    const supabase = getSupabase();
    const token = localStorage.getItem('access_token');

    if (!token) {
      throw new Error('No authentication token found');
    }

    const { data, error } = await supabase
      .from('zones')
      .select('*')
      .eq('name', name)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data ? fromSupabaseZone(data) : null;
  },

  async addZone(zone: Partial<Zone>): Promise<Zone> {
    const supabase = getSupabase();
    const token = localStorage.getItem('access_token');

    if (!token) {
      throw new Error('No authentication token found');
    }

    const { data, error } = await supabase
      .from('zones')
      .insert([toSupabaseZone(zone)])
      .select()
      .single();

    if (error) throw error;
    return fromSupabaseZone(data);
  },

  async updateZone(id: string, updates: Partial<Zone>): Promise<Zone> {
    const supabase = getSupabase();
    const token = localStorage.getItem('access_token');

    if (!token) {
      throw new Error('No authentication token found');
    }

    const { data, error } = await supabase
      .from('zones')
      .update(toSupabaseZone(updates))
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return fromSupabaseZone(data);
  },

  async findOrCreateZone(name: string, latitude: number, longitude: number, addedBy: string): Promise<Zone> {
    const existing = await this.getZoneByName(name);
    if (existing) return existing;

    return this.addZone({ name, latitude, longitude, addedBy });
  }
};
