import { apiRequest } from './client';

export type ExtraActivityType = 'SINGLE_PITCH' | 'MULTIPITCH' | 'HIKE';
export type ProtectionStyle = 'BOLTED' | 'TRAD';

export interface ExtraActivityDetailResponse {
  id: string;
  user_id: string;
  name: string;
  activity_type: ExtraActivityType;
  description?: string;
  image?: string;
  latitude?: number;
  longitude?: number;
  city?: string;
  province?: string;
  country?: string;
  activity_day: string;
  hours_spent?: number;
  pitch_count?: number;
  total_length_meters?: number;
  protection_style?: ProtectionStyle;
  max_altitude?: number;
  elevation_gain?: number;
}

export interface ExtraActivityCreateRequest {
  name: string;
  activity_type: ExtraActivityType;
  description?: string;
  image?: string;
  latitude: number;
  longitude: number;
  city?: string;
  province?: string;
  country?: string;
  activity_day: string;
  hours_spent?: number;
  pitch_count?: number;
  total_length_meters?: number;
  protection_style?: ProtectionStyle;
  max_altitude?: number;
  elevation_gain?: number;
}

export const EXTRA_ACTIVITY_TYPE_LABELS: Record<ExtraActivityType, string> = {
  SINGLE_PITCH: 'Tiro singolo',
  MULTIPITCH: 'Multipitch',
  HIKE: 'Escursione',
};

export const PROTECTION_STYLE_LABELS: Record<ProtectionStyle, string> = {
  BOLTED: 'Spittato',
  TRAD: 'Trad',
};

export const extraActivitiesApi = {
  list: async (userId: string): Promise<ExtraActivityDetailResponse[]> => {
    return apiRequest<ExtraActivityDetailResponse[]>(`/extra-activities/one/${userId}/list`);
  },
  getOne: async (userId: string, id: string): Promise<ExtraActivityDetailResponse> => {
    return apiRequest<ExtraActivityDetailResponse>(`/extra-activities/one/${userId}/${id}`);
  },
  createOne: async (userId: string, body: ExtraActivityCreateRequest): Promise<string> => {
    return apiRequest<string>(`/extra-activities/create-one/${userId}`, {
      body,
      method: 'POST',
    });
  },
};
