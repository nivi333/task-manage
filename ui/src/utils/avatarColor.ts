// Deterministic per-user avatar color mapping (stateless)
// Usage: getAvatarColor(userId || username || email || fullName)

const PALETTE = [
  "#1E90FF",
  "#FF8C00",
  "#2ECC71",
  "#9B59B6",
  "#E74C3C",
  "#16A085",
  "#F39C12",
  "#3498DB",
  "#8E44AD",
  "#27AE60",
  "#E67E22",
  "#D35400",
  "#C0392B",
  "#2980B9",
  "#7F8C8D",
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getAvatarColor(seed?: string | null): string {
  const s = (seed || "").trim();
  if (!s) return PALETTE[0];
  const h = hashString(s);
  return PALETTE[h % PALETTE.length];
}

export function getUserSeed(u: any): string {
  return (
    u?.id || u?.email || u?.username || `${u?.firstName || ""}${u?.lastName || ""}`
  );
}
