// Deterministic color allocator with collision avoidance per instance
// Usage: const alloc = createColorAllocator(); alloc.getColor(id)

const DEFAULT_PALETTE = [
  "#1E90FF", // dodger blue
  "#FF8C00", // dark orange
  "#2ECC71", // emerald
  "#9B59B6", // amethyst
  "#E74C3C", // alizarin
  "#16A085", // green sea
  "#F39C12", // orange
  "#3498DB", // peter river
  "#8E44AD", // wisteria
  "#27AE60", // nephritis
  "#E67E22", // carrot
  "#D35400", // pumpkin
  "#C0392B", // pomegranate
  "#2980B9", // belize hole
  "#7F8C8D", // concrete
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // Convert to 32bit
  }
  return Math.abs(hash);
}

export function hexToRgba(hex: string, alpha = 1): string {
  const m = hex.replace("#", "");
  const bigint = parseInt(
    m.length === 3
      ? m
          .split("")
          .map((c) => c + c)
          .join("")
      : m,
    16
  );
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export type ColorAllocator = {
  getColor: (id: string) => string;
  getAlternateColor: (current: string) => string; // next color in palette
  palette: string[];
};

export function createColorAllocator(
  palette: string[] = DEFAULT_PALETTE
): ColorAllocator {
  const assigned = new Map<string, string>();
  const used = new Set<string>();

  const getAlternateColor = (current: string) => {
    const idx = palette.indexOf(current);
    return palette[(idx + 1) % palette.length];
  };

  const getColor = (id: string) => {
    if (!id) return palette[0];
    if (assigned.has(id)) return assigned.get(id)!;
    const h = hashString(id);
    // Try preferred color index from hash, then find first free color
    let idx = h % palette.length;
    for (let i = 0; i < palette.length; i++) {
      const color = palette[(idx + i) % palette.length];
      if (!used.has(color)) {
        assigned.set(id, color);
        used.add(color);
        return color;
      }
    }
    // If all used, still assign deterministically by hash
    const color = palette[idx];
    assigned.set(id, color);
    return color;
  };

  return { getColor, getAlternateColor, palette };
}
