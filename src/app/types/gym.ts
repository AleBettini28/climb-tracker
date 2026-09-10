export const GYM_DIFFICULTIES = [
  'BIANCO',
  'BLU',
  'VERDE',
  'GIALLO',
  'ROSSO',
  'NERO',
] as const;

export type GymDifficulty = (typeof GYM_DIFFICULTIES)[number];

export const GYM_DIFFICULTY_META: Record<
  GymDifficulty,
  { label: string; points: number; className: string }
> = {
  BIANCO: {
    label: 'Bianco',
    points: 1,
    className: 'bg-stone-100 text-stone-800 border border-stone-300',
  },
  BLU: {
    label: 'Blu',
    points: 2,
    className: 'bg-blue-100 text-blue-800 border border-blue-300',
  },
  VERDE: {
    label: 'Verde',
    points: 3,
    className: 'bg-green-100 text-green-800 border border-green-300',
  },
  GIALLO: {
    label: 'Giallo',
    points: 4,
    className: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
  },
  ROSSO: {
    label: 'Rosso',
    points: 5,
    className: 'bg-red-100 text-red-800 border border-red-300',
  },
  NERO: {
    label: 'Nero',
    points: 6,
    className: 'bg-zinc-900 text-white border border-zinc-700',
  },
};
