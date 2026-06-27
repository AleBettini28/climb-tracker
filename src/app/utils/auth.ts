// auth.ts
const API_BASE = 'http://192.168.1.80:8080/auth'; // il tuo Spring Boot backend

export interface User {
  id: string;
  email: string;
  name?: string;
}

export const auth = {
  signup: async (email: string, password: string, name?: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Signup failed');
      }

      const data = await response.json();
      localStorage.setItem('access_token', data.token);
      localStorage.setItem('user', JSON.stringify({ id: String(data.userId), email, name }));
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  },

  login: async (email: string, password: string): Promise<User> => {
    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }

      const data = await response.json();
      const user: User = { id: String(data.userId), email, name: data.name };

      localStorage.setItem('access_token', data.token);
      localStorage.setItem('user', JSON.stringify(user));

      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  logout: async (): Promise<void> => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  },

  getSession: async (): Promise<User | null> => {
    try {
      const token = localStorage.getItem('access_token');
      const userStr = localStorage.getItem('user');

      if (!token || !userStr) return null;

      // Verifica che il token non sia scaduto controllando il campo exp nel payload JWT
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp * 1000 < Date.now()) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        return null;
      }

      return JSON.parse(userStr) as User;
    } catch (error) {
      console.error('Get session error:', error);
      return null;
    }
  },
};