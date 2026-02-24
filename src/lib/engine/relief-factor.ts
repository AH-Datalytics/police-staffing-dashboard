import type { ReliefFactorInputs } from '@/types/agency';

/**
 * Calculate the relief factor from time-off inputs.
 *
 * Relief Factor = (365 × shiftLength) / (365 × shiftLength - totalTimeOffHours)
 *
 * This represents how many officers you need on the roster for every
 * 1 position that needs to be filled at all times.
 */
export function calculateReliefFactor(
  inputs: ReliefFactorInputs,
  shiftLengthHours: number = 12
): number {
  const totalDaysOff =
    inputs.personalTimeDays +
    inputs.vacationDays +
    inputs.holidayDays +
    inputs.sickLeaveDays +
    inputs.trainingDays +
    inputs.regularDaysOff +
    inputs.otherDaysOut;

  const totalHoursOff = totalDaysOff * shiftLengthHours;
  const totalAvailableHours = 365 * shiftLengthHours;

  if (totalAvailableHours <= totalHoursOff) {
    return Infinity; // Degenerate case
  }

  return totalAvailableHours / (totalAvailableHours - totalHoursOff);
}

/**
 * Get default regular days off for a given shift schedule.
 * For 7 shifts every 2 weeks: 7 × (365/14) = 182.5
 */
export function calculateRegularDaysOff(
  shiftsPerCycle: number = 7,
  cycleDays: number = 14
): number {
  return shiftsPerCycle * (365 / cycleDays);
}
