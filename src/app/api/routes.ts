import { apiRequest } from './client';

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

export interface RouteCreateUpdateRequest {
  nome_via: string;
  grado: string;
  lunghezza: number | null;
}

export interface ClimbCreateRequest {
  difficulty: number;
  is_lead: boolean;
  day: string;
  route_id: string;
  description: string;
}

export interface ClimbDetailExtendedResponse {
  difficulty: number;
  is_lead: boolean;
  day: string;
  description: string;
  route: RouteDetailResponseExtended;
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
  deleteOneRoute: async (routeId: string): Promise<null> => {
    const data = await apiRequest<null>(`/routes/one/${routeId}/delete`, { method: "DELETE"});
    return data;
  },
  climbOne: async (userId: string, body: ClimbCreateRequest): Promise<null> => {
    const data = await apiRequest<null>(`/routes/create-one/${userId}/climb-one`, {body: body, method: "POST"});
    return data;
  },
  createOneRoute: async (userId: string, cragId: string, body: RouteCreateUpdateRequest): Promise<null> => {
    const data = await apiRequest<null>(`/routes/create-one/${userId}/${cragId}`, {body: body, method: "POST"});
    return data;
  },
  getUserClimbs: async (userId: string): Promise<ClimbDetailExtendedResponse[]> => {
    const data = await apiRequest<ClimbDetailExtendedResponse[]>(`/routes/one/${userId}/climbs-list`);
    return data;
  },
  getOneUserClimb: async (userId: string, routeId: string): Promise<ClimbDetailExtendedResponse> => {
    const data = await apiRequest<ClimbDetailExtendedResponse>(`/routes/one/${userId}/climb/${routeId}`);
    return data;
  },
  deleteOneClimb: async (userId: string, routeId: string): Promise<null> => {
    const data = await apiRequest<null>(`/routes/one/${userId}/climb/${routeId}/delete`, { method: "DELETE"});
    return data;
  },
};
