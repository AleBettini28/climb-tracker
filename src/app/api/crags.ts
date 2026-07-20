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
  max_grade: string;
}

export interface CragCreateUpdateRequest {
  name: string;
  description: string;
  city?: string;
  country?: string;
  map_image_url?: string;
  added_by: string;
  latitude: number;
  longitude: number;
}


export interface RouteDetailResponse {
  id: string;
  nome_via: string;
  grado: string;
  lunghezza: number;
  number: number;
  is_climbed: boolean;
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
  getOneRoutes: async (id: string, userId: string): Promise<RouteDetailResponse[]> => {
    const data = await apiRequest<RouteDetailResponse[]>(`/crags/one/${id}/routes/${userId}`);
    return data;
  },
  createOneCrag: async (body: CragCreateUpdateRequest): Promise<null> => {
      const data = await apiRequest<null>(`/crags/create/one`, {body: body, method: "POST"});
      return data;
  },
  updateOneCrag: async (body: CragCreateUpdateRequest, id: string): Promise<null> => {
      const data = await apiRequest<null>(`/crags/update/${id}`, {body: body, method: "PUT"});
      return data;
  },
};
