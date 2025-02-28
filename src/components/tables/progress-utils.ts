
import { KeyResult } from "@/lib/types";

/**
 * Calculate the progress percentage for a key result
 */
export const calculateProgress = (kr: KeyResult): string => {
  if (kr.currentValue === undefined) return "Not started";
  
  const total = kr.goalValue - kr.startingValue;
  const current = kr.currentValue - kr.startingValue;
  const percentage = (current / total) * 100;
  
  return Math.round(percentage) + "%";
};
