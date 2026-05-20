import { BoulderSend } from '../types/boulder';
import { getSupabase } from './supabase';

interface SupabaseBoulderSend {
  id: string;
  boulder_uuid: string;
  attempts: number;
  day: string;
  user_id?: string;
  created_at?: string;
  all_boulders?: {
    id: string;
    zona: string;
    nome_masso: string;
    numero_via: string;
    grado: string;
    latitudine?: number;
    longitudine?: number;
  };
}

const getSupabaseClient = () => {
  return getSupabase();
};

const fromSupabase = (dbSend: SupabaseBoulderSend): BoulderSend => ({
  id: dbSend.id,
  boulderId: dbSend.boulder_uuid,
  attempts: dbSend.attempts,
  date: dbSend.day,
  // Populate from joined boulder data
  boulderZone: dbSend.all_boulders?.zona,
  boulderName: dbSend.all_boulders?.nome_masso,
  problemNumber: dbSend.all_boulders?.numero_via,
  boulderGrade: dbSend.all_boulders?.grado,
  boulderLatitude: dbSend.all_boulders?.latitudine,
  boulderLongitude: dbSend.all_boulders?.longitudine,
});

const toSupabase = (send: Partial<BoulderSend>): Partial<SupabaseBoulderSend> => ({
  id: send.id,
  boulder_uuid: send.boulderId,
  attempts: send.attempts,
  day: send.date,
});

export const boulderStorage = {
  async getBoulderSends(): Promise<BoulderSend[]> {
    try {
      const supabase = getSupabaseClient();

      const { data, error } = await supabase
        .from('boulder_sends')
        .select('*, all_boulders(*)')
        .order('day', { ascending: false });

      if (error) {
        console.error('Error fetching boulder sends from Supabase:', error);
        return [];
      }

      return data ? data.map(fromSupabase) : [];
    } catch (error) {
      console.error('Error reading from Supabase:', error);
      return [];
    }
  },

  async addBoulderSend(send: Partial<BoulderSend>): Promise<void> {
    try {
      const supabase = getSupabaseClient();
      const sendData = toSupabase(send);

      const { error } = await supabase
        .from('boulder_sends')
        .insert([sendData]);

      if (error) {
        console.error('Error adding boulder send to Supabase:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error adding boulder send:', error);
      throw error;
    }
  },

  async updateBoulderSend(send: Partial<BoulderSend>): Promise<void> {
    try {
      const supabase = getSupabaseClient();
      const { id, ...sendData } = toSupabase(send);

      const { error } = await supabase
        .from('boulder_sends')
        .update(sendData)
        .eq('id', id);

      if (error) {
        console.error('Error updating boulder send in Supabase:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error updating boulder send:', error);
      throw error;
    }
  },

  async deleteBoulderSend(id: string): Promise<void> {
    try {
      const supabase = getSupabaseClient();

      const { error } = await supabase
        .from('boulder_sends')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting boulder send from Supabase:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error deleting boulder send:', error);
      throw error;
    }
  }
};
