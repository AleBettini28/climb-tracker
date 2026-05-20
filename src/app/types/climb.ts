export interface Climb {
  id: string;
  routeId: string;
  leadType: 'lead' | 'second';
  perceivedDifficulty: 1 | 2 | 3 | 4 | 5;
  date: string;
  description?: string;
  // Populated fields from route
  routeName?: string;
  routeCrag?: string;
  routeGrade?: string;
  routeLatitude?: number;
  routeLongitude?: number;
}

export const CLIMBING_GRADES = [
  '3B', '3C', '4A', '4B', '4C',
  '5A', '5A+', '5B', '5B+', '5C', '5C+',
  '6A', '6A+', '6B', '6B+', '6C', '6C+',
  '7A', '7A+', '7B', '7B+', '7C', '7C+',
  '8A', '8A+', '8B', '8B+', '8C', '8C+',
  '9A', '9A+', '9B', '9B+', '9C'
];

export const DIFFICULTY_LABELS = {
  1: 'Molto Facile',
  2: 'Facile',
  3: 'Nella Media',
  4: 'Difficile',
  5: 'Molto Difficile'
};
