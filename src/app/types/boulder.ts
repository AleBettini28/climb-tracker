// Boulder in the shared archive
export interface Boulder {
  id: string;
  zoneId: string;
  zone: string;
  zoneDescription?: string;
  boulderName: string;
  problemNumber: string; // A, B, C, etc.
  grade: string;
  latitude: number;
  longitude: number;
  addedBy: string;
  createdAt?: string;
}

// User's boulder send
export interface BoulderSend {
  id: string;
  boulderId: string;
  attempts: number;
  date: string;
  // Populated fields from boulder
  boulderZone?: string;
  boulderName?: string;
  problemNumber?: string;
  boulderGrade?: string;
  boulderLatitude?: number;
  boulderLongitude?: number;
}

export const BOULDER_GRADES = [
  '3c', '4a', '4b', '4c',
  '5a', '5b', '5c',
  '6a', '6a+', '6b', '6b+', '6c', '6c+',
  '7a', '7a+', '7b', '7b+', '7c', '7c+',
  '8a', '8a+', '8b', '8b+', '8c', '8c+',
  '9a'
] as const;
