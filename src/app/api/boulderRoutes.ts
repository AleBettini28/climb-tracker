import { apiRequest } from './client';

export interface BoulderRouteDetailResponseExtended {
  id: string;
  route_name: string;
  route_description: string;
  grade: string;
  boulder_name: string;
  boulder_id: string;
  boulder_area_name: string;
  boulder_area_id: string;
  latitude: number;
  longitude: number;
}

export interface BoulderRouteCreateUpdateRequest {
  route_name: string;
  route_description: string;
  grade: string;
}

export interface BoulderSendCreateRequest {
  difficulty: number;
  is_flash: boolean;
  day: string;
  boulder_route_id: string;
  description: string;
}

export interface BoulderSendDetailExtendedResponse {
  difficulty: number;
  is_flash: boolean;
  day: string;
  description: string;
  boulder_route: BoulderRouteDetailResponseExtended;
}

export const boulderRoutesApi = {
  list: async (): Promise<BoulderRouteDetailResponseExtended[]> => {
    const data = await apiRequest<BoulderRouteDetailResponseExtended[]>('/boulder-routes/list');
    return data;
  },
  getOne: async (id: string): Promise<BoulderRouteDetailResponseExtended> => {
    const data = await apiRequest<BoulderRouteDetailResponseExtended>(`/boulder-routes/one/${id}`);
    return data;
  },
  deleteOneBoulderRoute: async (boulderRouteId: string): Promise<null> => {
    const data = await apiRequest<null>(`/boulder-routes/one/${boulderRouteId}/delete`, { method: "DELETE"});
    return data;
  },
  sendOne: async (userId: string, body: BoulderSendCreateRequest): Promise<null> => {
    const data = await apiRequest<null>(`/boulder-routes/create-one/${userId}/send-one`, {body: body, method: "POST"});
    return data;
  },
  createOneBoulderRoute: async (userId: string, boulderId: string, body: BoulderRouteCreateUpdateRequest): Promise<null> => {
    const data = await apiRequest<null>(`/boulder-routes/create-one/${userId}/${boulderId}`, {body: body, method: "POST"});
    return data;
  },
  getUserBoulderSends: async (userId: string): Promise<BoulderSendDetailExtendedResponse[]> => {
    const data = await apiRequest<BoulderSendDetailExtendedResponse[]>(`/boulder-routes/one/${userId}/sends-list`);
    return data;
  },
  getOneUserBoulderSend: async (userId: string, boulderRouteId: string): Promise<BoulderSendDetailExtendedResponse> => {
    const data = await apiRequest<BoulderSendDetailExtendedResponse>(`/boulder-routes/one/${userId}/send/${boulderRouteId}`);
    return data;
  },
  deleteOneBoulderSend: async (userId: string, boulderRouteId: string): Promise<null> => {
    const data = await apiRequest<null>(`/boulder-routes/one/${userId}/send/${boulderRouteId}/delete`, { method: "DELETE"});
    return data;
  },
};
