/**
 * XP economy for the shared pet.
 * Kept intentionally simple and generous — this is meant to feel good, not
 * to be a rigorous game system.
 */
export const XP_REWARDS = {
  addGoal: 5,
  completeGoal: 25,
  logMemory: 10, // reserved for future use (e.g. journaling without completing)
} as const;

// XP required cumulatively to REACH each level. Level 1 starts at 0.
// Roughly quadratic so early levels come quickly and later ones take longer.
function xpRequiredForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.round(25 * Math.pow(level - 1, 1.6));
}

export interface LevelInfo {
  level: number;
  xpIntoLevel: number;
  xpForThisLevel: number;
  progressRatio: number; // 0..1
  stage: PetStage;
}

export type PetStage = "egg" | "hatchling" | "companion" | "soulmate";

const MAX_LEVEL = 30;

export function getLevelInfo(totalXp: number): LevelInfo {
  let level = 1;
  while (
    level < MAX_LEVEL &&
    totalXp >= xpRequiredForLevel(level + 1)
  ) {
    level += 1;
  }

  const currentLevelFloor = xpRequiredForLevel(level);
  const nextLevelFloor =
    level >= MAX_LEVEL ? currentLevelFloor : xpRequiredForLevel(level + 1);

  const xpIntoLevel = totalXp - currentLevelFloor;
  const xpForThisLevel = Math.max(1, nextLevelFloor - currentLevelFloor);

  return {
    level,
    xpIntoLevel,
    xpForThisLevel,
    progressRatio:
      level >= MAX_LEVEL ? 1 : Math.min(1, xpIntoLevel / xpForThisLevel),
    stage: stageForLevel(level),
  };
}

function stageForLevel(level: number): PetStage {
  if (level < 3) return "egg";
  if (level < 8) return "hatchling";
  if (level < 16) return "companion";
  return "soulmate";
}

export function nextLevelXp(level: number): number {
  return xpRequiredForLevel(level + 1);
}
