import { apiRequest } from './client';

export interface CragDetailResponse {
  id: string;
  name: string;
  description: string;
  city?: string;
  country?: string;
  map_image_url?: string;
  number_of_routes: number;
  added_by: string;
  latitude: number;
  longitude: number;
}

export interface RouteDetailResponse {
  id: string;
  nome_via: string;
  grado: string;
  lunghezza: number;
}

export const cragsApi = {
  list: async (): Promise<CragDetailResponse[]> => {
    const data = await apiRequest<CragDetailResponse[]>('/crags/list');
    return data.sort((a, b) => b.number_of_routes - a.number_of_routes);
  },
  getOne: async (id: string): Promise<CragDetailResponse> => {
    const data = await apiRequest<CragDetailResponse>(`/crags/one/${id}`);
    return data;
  },
  getOneRoutes: async (id: string): Promise<RouteDetailResponse[]> => {
    const data = await apiRequest<RouteDetailResponse[]>(`/crags/one/${id}/routes`);
    return data;
  },
};
