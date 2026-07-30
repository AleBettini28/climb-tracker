export const WORKOUT_SEND_KINDS = ['BOULDER', 'ROUTE'] as const;
export type WorkoutSendKind = (typeof WORKOUT_SEND_KINDS)[number];

export const WORKOUT_SEND_KIND_LABELS: Record<WorkoutSendKind, string> = {
  BOULDER: 'Boulder',
  ROUTE: 'Via',
};

export const CLIMBING_TYPES = [
  'PLACCA',
  'VERTICALE',
  'STRAPIOMBO',
  'TETTO',
  'DINAMICO',
  'TECNICO',
] as const;
export type ClimbingType = (typeof CLIMBING_TYPES)[number];

export const CLIMBING_TYPE_LABELS: Record<ClimbingType, string> = {
  PLACCA: 'Placca',
  VERTICALE: 'Verticale',
  STRAPIOMBO: 'Strapiombo',
  TETTO: 'Tetto',
  DINAMICO: 'Dinamico',
  TECNICO: 'Tecnico',
};
