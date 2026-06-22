export const timeToSeconds = (timeStr: string) => {
  const units = {
    s: 1,
    m: 60, // Mins
    h: 3600, // Hours (60 * 60)
    d: 86400, // Days (24 * 60 * 60)
  };

  const match = timeStr.match(/^(\d+)([smhd])$/);

  if (!match) {
    throw new Error(`Formato inválido: ${timeStr}`);
  }

  const [, value, unit] = match;
  return parseInt(value) * (units[unit as keyof typeof units] || 1);
};
