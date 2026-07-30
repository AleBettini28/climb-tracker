import { apiRequest } from './client';
import { ClimbingType, WorkoutSendKind } from '../types/workout';

export interface WorkoutDetailResponse {
  id: string;
  user_id: string;
  day: string;
  number_of_sends: number;
  closed_at?: string | null;
  open: boolean;
}

export interface WorkoutCreateUpdateRequest {
  user_id: string;
  day: string;
}

export interface WorkoutSendDetailResponse {
  id: string;
  workout_id: string;
  grade?: string;
  kind: WorkoutSendKind;
  number_of_tries?: number;
  sent: boolean;
  climbing_type?: ClimbingType;
}

export interface WorkoutSendCreateUpdateRequest {
  workout_id: string;
  grade?: string;
  kind: WorkoutSendKind;
  number_of_tries?: number;
  sent: boolean;
  climbing_type?: ClimbingType;
}

export const workoutsApi = {
  list: async (userId: string): Promise<WorkoutDetailResponse[]> => {
    const data = await apiRequest<WorkoutDetailResponse[]>(`/workouts/list/${userId}`);
    return data.sort((a, b) => (a.day < b.day ? 1 : -1));
  },
  getOne: async (id: string): Promise<WorkoutDetailResponse> => {
    return apiRequest<WorkoutDetailResponse>(`/workouts/one/${id}`);
  },
  getOpenOne: async (userId: string): Promise<WorkoutDetailResponse | null> => {
    return apiRequest<WorkoutDetailResponse | null>(`/workouts/open/${userId}`);
  },
  createOne: async (body: WorkoutCreateUpdateRequest): Promise<string> => {
    return apiRequest<string>(`/workouts/create/one`, { body, method: 'POST' });
  },
  updateOne: async (id: string, body: WorkoutCreateUpdateRequest): Promise<null> => {
    return apiRequest<null>(`/workouts/update/${id}`, { body, method: 'PUT' });
  },
  deleteOne: async (id: string): Promise<null> => {
    return apiRequest<null>(`/workouts/delete/${id}`, { method: 'DELETE' });
  },
  closeOne: async (id: string): Promise<null> => {
    return apiRequest<null>(`/workouts/close/${id}`, { method: 'PUT' });
  },
};

export const workoutSendsApi = {
  list: async (workoutId: string): Promise<WorkoutSendDetailResponse[]> => {
    return apiRequest<WorkoutSendDetailResponse[]>(`/workout-sends/list/${workoutId}`);
  },
  getOne: async (id: string): Promise<WorkoutSendDetailResponse> => {
    return apiRequest<WorkoutSendDetailResponse>(`/workout-sends/one/${id}`);
  },
  createOne: async (body: WorkoutSendCreateUpdateRequest): Promise<string> => {
    return apiRequest<string>(`/workout-sends/create/one`, { body, method: 'POST' });
  },
  updateOne: async (id: string, body: WorkoutSendCreateUpdateRequest): Promise<null> => {
    return apiRequest<null>(`/workout-sends/update/${id}`, { body, method: 'PUT' });
  },
  deleteOne: async (id: string): Promise<null> => {
    return apiRequest<null>(`/workout-sends/delete/${id}`, { method: 'DELETE' });
  },
};
