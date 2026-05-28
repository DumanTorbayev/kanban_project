export const POSITION_STEP = 1024;

/**
 * Smallest fractional gap allowed between two neighbouring positions before the
 * list should be renormalized. Float64 keeps ~15-16 significant digits, so once
 * neighbours get this close repeated midpoint inserts start losing precision.
 */
export const MIN_POSITION_GAP = 1 / 1024;

export function getNextPosition(position: number | string | null | undefined) {
  const parsedPosition = Number(position);

  if (!Number.isFinite(parsedPosition)) {
    return POSITION_STEP;
  }

  return parsedPosition + POSITION_STEP;
}

/**
 * Resolves a position for an item inserted between two neighbours using
 * fractional indexing, so reordering never has to rewrite the whole list.
 */
export function getPositionBetween(
  previousPosition: number | undefined,
  nextPosition: number | undefined,
) {
  if (previousPosition !== undefined && nextPosition !== undefined) {
    return (previousPosition + nextPosition) / 2;
  }

  if (previousPosition !== undefined) {
    return previousPosition + POSITION_STEP;
  }

  if (nextPosition !== undefined) {
    return nextPosition / 2;
  }

  return POSITION_STEP;
}

/**
 * Returns true when neighbouring positions have drifted too close together and
 * the ordered list should be renormalized back to evenly spaced steps.
 */
export function needsRenormalization(positions: number[]) {
  for (let index = 1; index < positions.length; index += 1) {
    const previousPosition = positions[index - 1];
    const currentPosition = positions[index];

    if (previousPosition === undefined || currentPosition === undefined) {
      continue;
    }

    if (currentPosition - previousPosition < MIN_POSITION_GAP) {
      return true;
    }
  }

  return false;
}

/**
 * Produces evenly spaced positions (`POSITION_STEP`, `2 * POSITION_STEP`, ...)
 * for `count` items, preserving their current order.
 */
export function renormalizePositions(count: number) {
  const safeCount = Number.isFinite(count) && count > 0 ? Math.floor(count) : 0;

  return Array.from(
    {
      length: safeCount,
    },
    (_value, index) => (index + 1) * POSITION_STEP,
  );
}
