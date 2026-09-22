import { GYM_DIFFICULTY_META, GymDifficulty } from '../../types/gym';

type Props = {
  difficulty: GymDifficulty;
  sent?: boolean;
};

export function GymGradeCircle({ difficulty, sent = false }: Props) {
  const meta = GYM_DIFFICULTY_META[difficulty];
  const short = meta.label.slice(0, 3).toUpperCase();

  return (
    <div
      className="gym-grade-circle"
      style={
        sent
          ? {
              background: `radial-gradient(circle, ${meta.color}ee 0%, ${meta.color}99 100%)`,
              color: meta.textOnFill,
              border: `2px solid ${meta.color}`,
              boxShadow: `0 0 16px ${meta.color}55`,
            }
          : {
              background: `${meta.color}22`,
              color: meta.color,
              border: `2px solid ${meta.color}66`,
            }
      }
      title={meta.label}
    >
      {short}
    </div>
  );
}
