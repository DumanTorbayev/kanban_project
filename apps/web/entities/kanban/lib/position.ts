export const POSITION_STEP = 1024;

export const MIN_POSITION_GAP = 1 / 1024;

export function getNextPosition(position: number | string | null | undefined) {
  const parsedPosition = Number(position);

  if (!Number.isFinite(parsedPosition)) {
    return POSITION_STEP;
  }

  return parsedPosition + POSITION_STEP;
}

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

export function renormalizePositions(count: number) {
  const safeCount = Number.isFinite(count) && count > 0 ? Math.floor(count) : 0;

  return Array.from(
    {
      length: safeCount,
    },
    (_value, index) => (index + 1) * POSITION_STEP,
  );
}
