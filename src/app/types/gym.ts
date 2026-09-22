export const GYM_DIFFICULTIES = [
  'BIANCO',
  'BLU',
  'VERDE',
  'GIALLO',
  'ROSSO',
  'NERO',
] as const;

export type GymDifficulty = (typeof GYM_DIFFICULTIES)[number];

/** Visual tokens for gym difficulty (Figma Make grade-circle language, color grades). */
export const GYM_DIFFICULTY_META: Record<
  GymDifficulty,
  {
    label: string;
    points: number;
    /** CSS color used for circle border / fill accents */
    color: string;
    textOnFill: string;
    className: string;
  }
> = {
  BIANCO: {
    label: 'Bianco',
    points: 1,
    color: '#e5e5e5',
    textOnFill: '#0c0c0c',
    className: 'gym-grade-chip bg-[#e5e5e5]/20 text-[#e5e5e5] border border-[#e5e5e5]/40',
  },
  BLU: {
    label: 'Blu',
    points: 2,
    color: '#3b82f6',
    textOnFill: '#ffffff',
    className: 'gym-grade-chip bg-[#3b82f6]/20 text-[#3b82f6] border border-[#3b82f6]/40',
  },
  VERDE: {
    label: 'Verde',
    points: 3,
    color: '#22c55e',
    textOnFill: '#000000',
    className: 'gym-grade-chip bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/40',
  },
  GIALLO: {
    label: 'Giallo',
    points: 4,
    color: '#fbbf24',
    textOnFill: '#000000',
    className: 'gym-grade-chip bg-[#fbbf24]/20 text-[#fbbf24] border border-[#fbbf24]/40',
  },
  ROSSO: {
    label: 'Rosso',
    points: 5,
    color: '#ef4444',
    textOnFill: '#ffffff',
    className: 'gym-grade-chip bg-[#ef4444]/20 text-[#ef4444] border border-[#ef4444]/40',
  },
  NERO: {
    label: 'Nero',
    points: 6,
    color: '#a3a3a3',
    textOnFill: '#ffffff',
    className: 'gym-grade-chip bg-[#222] text-[#a3a3a3] border border-[#444]',
  },
};
