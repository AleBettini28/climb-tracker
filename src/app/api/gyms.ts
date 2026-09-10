import { apiRequest } from './client';
import type { GymDifficulty } from '../types/gym';

export interface GymDetailResponse {
  id: string;
  name: string;
  description?: string;
  city?: string;
  address?: string;
  logo_url?: string;
  added_by?: string;
  number_of_boulders: number;
}

export interface GymCreateUpdateRequest {
  name: string;
  description?: string;
  city?: string;
  address?: string;
  logo_url?: string;
  added_by?: string;
}

export interface GymBoulderDetailResponse {
  id: string;
  gym_id: string;
  name: string;
  description?: string;
  photo_url?: string;
  difficulty: GymDifficulty;
  send_count: number;
  is_sent: boolean;
  gym_name?: string;
}

export interface GymBoulderCreateUpdateRequest {
  name: string;
  description?: string;
  photo_url?: string;
  difficulty: GymDifficulty;
}

export interface GymSendCreateRequest {
  gym_boulder_id: string;
  day?: string;
  description?: string;
}

export interface GymSendDetailExtendedResponse {
  id: string;
  day: string;
  points: number;
  description?: string;
  gym_boulder: GymBoulderDetailResponse;
}

export interface GymLeaderboardEntryResponse {
  user_id: string;
  name: string;
  total_points: number;
  rank: number;
}

export const gymsApi = {
  list: async (): Promise<GymDetailResponse[]> => {
    return apiRequest<GymDetailResponse[]>('/gyms/list');
  },

  getOne: async (id: string): Promise<GymDetailResponse> => {
    return apiRequest<GymDetailResponse>(`/gyms/one/${id}`);
  },

  getOneBoulders: async (id: string, userId: string): Promise<GymBoulderDetailResponse[]> => {
    return apiRequest<GymBoulderDetailResponse[]>(`/gyms/one/${id}/boulders/${userId}`);
  },

  getOneBouldersPublic: async (id: string): Promise<GymBoulderDetailResponse[]> => {
    return apiRequest<GymBoulderDetailResponse[]>(`/gyms/one/${id}/boulders/public`);
  },

  getLeaderboard: async (id: string): Promise<GymLeaderboardEntryResponse[]> => {
    return apiRequest<GymLeaderboardEntryResponse[]>(`/gyms/one/${id}/leaderboard`);
  },

  createOne: async (adminUserId: string, body: GymCreateUpdateRequest): Promise<null> => {
    return apiRequest<null>(`/gyms/create/one/${adminUserId}`, { body, method: 'POST' });
  },

  updateOne: async (
    id: string,
    adminUserId: string,
    body: GymCreateUpdateRequest,
  ): Promise<null> => {
    return apiRequest<null>(`/gyms/update/${id}/${adminUserId}`, { body, method: 'PUT' });
  },

  deleteOne: async (id: string, adminUserId: string): Promise<null> => {
    return apiRequest<null>(`/gyms/one/${id}/delete/${adminUserId}`, { method: 'DELETE' });
  },
};

export const gymBouldersApi = {
  getOne: async (id: string): Promise<GymBoulderDetailResponse> => {
    return apiRequest<GymBoulderDetailResponse>(`/gym-boulders/one/${id}`);
  },

  createOne: async (
    adminUserId: string,
    gymId: string,
    body: GymBoulderCreateUpdateRequest,
  ): Promise<null> => {
    return apiRequest<null>(`/gym-boulders/create-one/${adminUserId}/${gymId}`, {
      body,
      method: 'POST',
    });
  },

  updateOne: async (
    gymBoulderId: string,
    adminUserId: string,
    body: GymBoulderCreateUpdateRequest,
  ): Promise<null> => {
    return apiRequest<null>(`/gym-boulders/update/${gymBoulderId}/${adminUserId}`, {
      body,
      method: 'PUT',
    });
  },

  deleteOne: async (gymBoulderId: string, adminUserId: string): Promise<null> => {
    return apiRequest<null>(`/gym-boulders/one/${gymBoulderId}/delete/${adminUserId}`, {
      method: 'DELETE',
    });
  },

  sendOne: async (userId: string, body: GymSendCreateRequest): Promise<null> => {
    return apiRequest<null>(`/gym-boulders/create-one/${userId}/send-one`, {
      body,
      method: 'POST',
    });
  },

  getUserSends: async (userId: string): Promise<GymSendDetailExtendedResponse[]> => {
    return apiRequest<GymSendDetailExtendedResponse[]>(`/gym-boulders/one/${userId}/sends-list`);
  },

  deleteSend: async (userId: string, gymBoulderId: string): Promise<null> => {
    return apiRequest<null>(`/gym-boulders/one/${userId}/send/${gymBoulderId}/delete`, {
      method: 'DELETE',
    });
  },
};
