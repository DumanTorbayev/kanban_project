export const TITLE_MAX_LENGTH = 120;
export const DESCRIPTION_MAX_LENGTH = 2000;

export function assertRequired(value: string, message: string) {
  if (!value.trim()) {
    throw new Error(message);
  }
}

export function assertMaxLength(
  value: string,
  maxLength: number,
  message: string,
) {
  if (value.trim().length > maxLength) {
    throw new Error(message);
  }
}

export function assertNonNegativeNumber(value: number, message: string) {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(message);
  }
}
