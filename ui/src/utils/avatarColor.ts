// Deterministic per-user avatar color mapping (stateless)
// Usage: getAvatarColor(userId || username || email || fullName)

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Generate a pleasant, high-contrast color deterministically using HSL
// Hue spread uses modulo of large range; saturation/lightness fixed for readability
export function getAvatarColor(seed?: string | null): string {
  const s = (seed || "").trim();
  if (!s) return "#1E90FF";
  const h = hashString(s);
  const hue = h % 360; // 0..359
  // Slightly lower saturation and higher lightness to avoid overly dark chips
  const saturation = 55; // was 65
  const lightness = 64; // was 52
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

export function getUserSeed(u: any): string {
  return (
    u?.id ||
    u?.email ||
    u?.username ||
    `${u?.firstName || ""}${u?.lastName || ""}`
  );
}
