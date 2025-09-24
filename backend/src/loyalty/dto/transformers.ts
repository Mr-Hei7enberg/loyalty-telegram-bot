export const sanitizeStringInput = (input: unknown): string => {
  if (typeof input === 'string') {
    return input.trim();
  }

  if (input === undefined || input === null) {
    return '';
  }

  if (typeof input === 'number' || typeof input === 'boolean') {
    return String(input).trim();
  }

  return '';
};
