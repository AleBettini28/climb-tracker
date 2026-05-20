export interface Route {
  id: string;
  name: string;
  cragId: string;
  crag: string;
  cragDescription?: string;
  grade: string;
  length?: number;
  latitude: number;
  longitude: number;
  addedBy: string;
  createdAt?: string;
}

export const CLIMBING_GRADES = [
  '3B', '3C', '4A', '4B', '4C',
  '5A', '5A+', '5B', '5B+', '5C', '5C+',
  '6A', '6A+', '6B', '6B+', '6C', '6C+',
  '7A', '7A+', '7B', '7B+', '7C', '7C+',
  '8A', '8A+', '8B', '8B+', '8C', '8C+',
  '9A', '9A+', '9B', '9B+', '9C'
] as const;
