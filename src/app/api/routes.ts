import { apiRequest } from './client';
import { RouteDetailResponse } from './crags';

export interface RouteDetailResponseExtended {
  id: string;
  nome_via: string;
  grado: string;
  lunghezza: number;
  crag_name: string;
  crag_id: string;
  latitude: number;
  longitude: number;
}

export interface ClimbCreateRequest {
  difficulty: number;
  is_lead: boolean;
  day: string;
  route_id: string;
  description: string;
}

export const routesApi = {
  list: async (): Promise<RouteDetailResponseExtended[]> => {
    const data = await apiRequest<RouteDetailResponseExtended[]>('/routes/list');
    return data;
  },
  getOne: async (id: string): Promise<RouteDetailResponseExtended> => {
    const data = await apiRequest<RouteDetailResponseExtended>(`/routes/one/${id}`);
    return data;
  },
  climbOne: async (userId: string, body: ClimbCreateRequest): Promise<null> => {
    const data = await apiRequest<null>(`/routes/create-one/${userId}/climb-one`, {body: body, method: "POST"});
    return data;
  }
};
