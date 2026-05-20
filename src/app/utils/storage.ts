import { Climb } from '../types/climb';
import { getSupabase } from './supabase';

interface SupabaseClimb {
  id: string;
  route_uuid: string;
  is_lead: '0' | '1';
  difficulty: number;
  day: string;
  description?: string;
  user_id?: string;
  created_at?: string;
  all_routes?: {
    id: string;
    nome_via: string;
    nome_falesia: string;
    grado: string;
    latitudine?: number;
    longitudine?: number;
    crags?: {
      id: string;
      name: string;
      description: string | null;
      latitude: number;
      longitude: number;
    };
  };
}

const STORAGE_KEY = 'climbing-app-data';

// Get Supabase client (uses singleton)
const getSupabaseClient = () => {
  return getSupabase();
};

// Convert Supabase format to app format
const fromSupabase = (dbClimb: SupabaseClimb): Climb => ({
  id: dbClimb.id,
  routeId: dbClimb.route_uuid,
  leadType: dbClimb.is_lead === '1' ? 'lead' : 'second',
  perceivedDifficulty: dbClimb.difficulty as 1 | 2 | 3 | 4 | 5,
  date: dbClimb.day,
  description: dbClimb.description,
  // Populate from joined route data
  routeName: dbClimb.all_routes?.nome_via,
  routeCrag: dbClimb.all_routes?.crags?.name || dbClimb.all_routes?.nome_falesia,
  routeGrade: dbClimb.all_routes?.grado,
  routeLatitude: dbClimb.all_routes?.crags?.latitude || dbClimb.all_routes?.latitudine,
  routeLongitude: dbClimb.all_routes?.crags?.longitude || dbClimb.all_routes?.longitudine,
});

// Convert app format to Supabase format
const toSupabase = (climb: Partial<Climb>): Partial<SupabaseClimb> => ({
  id: climb.id,
  route_uuid: climb.routeId,
  is_lead: climb.leadType === 'lead' ? '1' : '0',
  difficulty: climb.perceivedDifficulty,
  day: climb.date,
  description: climb.description,
});

export const storage = {
  getClimbs: async (): Promise<Climb[]> => {
    try {
      const supabase = getSupabaseClient();

      const { data, error } = await supabase
        .from('climbs')
        .select('*, all_routes(*, crags(*))')
        .order('day', { ascending: false });

      if (error) {
        console.error('Error fetching climbs from Supabase:', error);
        return [];
      }

      return data ? data.map(fromSupabase) : [];
    } catch (error) {
      console.error('Error reading from Supabase:', error);
      return [];
    }
  },

  getClimbsFromLocalStorage: (): Climb[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return [];
    }
  },

  saveClimbs: (climbs: Climb[]): void => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(climbs));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  },

  addClimb: async (climb: Partial<Climb>): Promise<void> => {
    try {
      const supabase = getSupabaseClient();
      const climbData = toSupabase(climb);

      const { error } = await supabase
        .from('climbs')
        .insert([climbData]);

      if (error) {
        console.error('Error adding climb to Supabase:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error adding climb:', error);
      throw error;
    }
  },

  updateClimb: async (climb: Partial<Climb>): Promise<void> => {
    try {
      const supabase = getSupabaseClient();
      const { id, ...climbData } = toSupabase(climb);

      const { error } = await supabase
        .from('climbs')
        .update(climbData)
        .eq('id', id);

      if (error) {
        console.error('Error updating climb in Supabase:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error updating climb:', error);
      throw error;
    }
  },

  deleteClimb: async (id: string): Promise<void> => {
    try {
      const supabase = getSupabaseClient();

      const { error } = await supabase
        .from('climbs')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting climb from Supabase:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error deleting climb:', error);
      throw error;
    }
  }
};