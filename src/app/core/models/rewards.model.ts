export interface Tier {
  level: number;      // 1, 2, 3
  name: string;       // "Nivel 1"
  percent: number;    // 2, 5, 8
  color: string;      // css var / hex
}

export interface PointsSummary {
  points: number;             // puntos actuales
  tierLevel: number;          // nivel actual
  pointsToNextTier: number;   // faltantes para el siguiente nivel
  nextRewardHint?: string;    // "¡50 puntos más y llévate 5 litros gratis!"
}

export interface WeeklyStreak {
  currentDay: number;   // días completados (1..7)
  totalDays: number;    // 7
}

/** Premio dado de alta en la plataforma (aparece en "Reclama tus premios"). */
export interface Reward {
  id: string;
  name: string;
  desc: string;
  points: number;   // puntos necesarios para canjear
  image: string;    // URL absoluta (puede venir vacía)
}

export const TIERS: Tier[] = [
  { level: 1, name: 'Nivel 1', percent: 2, color: 'var(--tier-1)' },
  { level: 2, name: 'Nivel 2', percent: 5, color: 'var(--tier-2)' },
  { level: 3, name: 'Nivel 3', percent: 8, color: 'var(--tier-3)' },
];
