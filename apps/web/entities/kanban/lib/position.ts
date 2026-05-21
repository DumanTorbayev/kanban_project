const POSITION_STEP = 1024;

export function getNextPosition(position: number | string | null | undefined) {
  const parsedPosition = Number(position);

  if (!Number.isFinite(parsedPosition)) {
    return POSITION_STEP;
  }

  return parsedPosition + POSITION_STEP;
}
