import { getSupabase } from './supabase';
import { projectId } from '/utils/supabase/info';

const supabase = getSupabase();
const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-261c5efb`;

export interface User {
  id: string;
  email: string;
  name?: string;
}

export const auth = {
  signup: async (email: string, password: string, name?: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwYWRtY3BiZGVsbW5zbml6Y3dlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzNDc1ODAsImV4cCI6MjA5MTkyMzU4MH0.oxm23lI_xtlZu9-RUBgIj1_h9QQx7bXERdahbg91pxg`,
        },
        body: JSON.stringify({ email, password, name }),
      });

      console.log('Signup response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Signup error response:', errorData);
        throw new Error(errorData.error || 'Signup failed');
      }

      const data = await response.json();
      console.log('Signup success:', data);

      // After signup, automatically sign in
      await auth.login(email, password);
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  },

  login: async (email: string, password: string): Promise<User> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.session?.access_token) {
        throw new Error('No access token received');
      }

      // Save access token to localStorage
      localStorage.setItem('access_token', data.session.access_token);

      return {
        id: data.user.id,
        email: data.user.email!,
        name: data.user.user_metadata?.name,
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  logout: async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('access_token');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  getSession: async (): Promise<User | null> => {
    try {
      const { data, error } = await supabase.auth.getSession();

      if (error || !data.session) {
        localStorage.removeItem('access_token');
        return null;
      }

      // Update access token
      localStorage.setItem('access_token', data.session.access_token);

      return {
        id: data.session.user.id,
        email: data.session.user.email!,
        name: data.session.user.user_metadata?.name,
      };
    } catch (error) {
      console.error('Get session error:', error);
      return null;
    }
  },
};
