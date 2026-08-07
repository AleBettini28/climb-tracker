export const AI_PLAN_STYLE_ASPECTS = [
  { value: 'PLACCA', label: 'Placca' },
  { value: 'VERTICALE', label: 'Verticale' },
  { value: 'LEGGERO_STRAPIOMBO', label: 'Leggero strapiombo' },
  { value: 'STRAPIOMBO', label: 'Strapiombo' },
  { value: 'TETTO', label: 'Tetto' },
  { value: 'MOVIMENTI_DINAMICI', label: 'Movimenti dinamici' },
  { value: 'MOVIMENTI_TECNICI', label: 'Movimenti tecnici' },
  { value: 'COMPRESSIONI', label: 'Compressioni' },
  { value: 'TALLONAGGI', label: 'Tallonaggi' },
  { value: 'TACCHE', label: 'Tacche' },
  { value: 'POCKETS', label: 'Pockets' },
  { value: 'SLOPERS', label: 'Slopers' },
  { value: 'GANCI_DI_PUNTA', label: 'Ganci di punta' },
  { value: 'KNEE_BARS', label: 'Knee bars' },
] as const;

export type AiPlanStyleAspect = (typeof AI_PLAN_STYLE_ASPECTS)[number]['value'];

export const AI_PLAN_STYLE_LABELS: Record<AiPlanStyleAspect, string> = Object.fromEntries(
  AI_PLAN_STYLE_ASPECTS.map((item) => [item.value, item.label]),
) as Record<AiPlanStyleAspect, string>;

export const AI_PLAN_LIMITERS = [
  { value: 'POMPA', label: 'Pompa' },
  { value: 'FORZA_DITA', label: 'Forza dita' },
  { value: 'PAURA_DI_CADERE', label: 'Paura di cadere' },
  { value: 'TECNICA', label: 'Tecnica' },
  { value: 'LETTURA_DELLA_VIA', label: 'Lettura della via' },
] as const;

export type AiPlanLimiter = (typeof AI_PLAN_LIMITERS)[number]['value'];

export const AI_PLAN_LIMITER_LABELS: Record<AiPlanLimiter, string> = Object.fromEntries(
  AI_PLAN_LIMITERS.map((item) => [item.value, item.label]),
) as Record<AiPlanLimiter, string>;

export const AI_PLAN_FALL_COMFORT = [
  { value: 'MAI', label: 'Mai' },
  { value: 'POCO', label: 'Poco' },
  { value: 'ABBASTANZA', label: 'Abbastanza' },
  { value: 'MOLTO', label: 'Molto' },
] as const;

export type AiPlanFallComfort = (typeof AI_PLAN_FALL_COMFORT)[number]['value'];

export const AI_PLAN_FALL_COMFORT_LABELS: Record<AiPlanFallComfort, string> = Object.fromEntries(
  AI_PLAN_FALL_COMFORT.map((item) => [item.value, item.label]),
) as Record<AiPlanFallComfort, string>;
