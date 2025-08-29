import React from "react";
import { Drawer, Slider, Switch, FloatButton } from "antd";
import { useAccessibility } from "../../context/AccessibilityContext";

// Universal accessibility icon (head + arms outstretched + legs)
function A11yIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={20}
      height={20}
      stroke="currentColor"
      fill="none"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <circle cx="12" cy="4" r="2" />
      <path d="M4 8h16" />
      <path d="M12 6v12" />
      <path d="M7 10l-3 10" />
      <path d="M17 10l3 10" />
    </svg>
  );
}

const STORAGE_KEY = "tt_a11y_btn_pos";

const AccessibilityPanel: React.FC = () => {
  const { fontScale, reduceMotion, highContrast, setFontScale, setReduceMotion, setHighContrast } = useAccessibility();
  const [open, setOpen] = React.useState(false);
  const btnRef = React.useRef<HTMLDivElement | null>(null);
  const [dragging, setDragging] = React.useState(false);
  const [pos, setPos] = React.useState<{ x: number; y: number }>(() => {
    // default bottom-right; will correct in effect if needed
    return { x: window.innerWidth - 88, y: window.innerHeight - 160 };
  });
  const posRef = React.useRef(pos);
  React.useEffect(() => { posRef.current = pos; }, [pos]);

  // load saved position once
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as { x: number; y: number };
        setPos(saved);
      }
    } catch {}
    // ensure in bounds on mount/resize
    const handleResize = () => {
      setPos((p) => clampToViewport(p));
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const clampToViewport = React.useCallback((p: { x: number; y: number }) => {
    const margin = 12;
    const size = 56; // FloatButton default
    const maxX = Math.max(margin, window.innerWidth - size - margin);
    const maxY = Math.max(margin, window.innerHeight - size - margin);
    return {
      x: Math.min(Math.max(p.x, margin), maxX),
      y: Math.min(Math.max(p.y, margin), maxY),
    };
  }, []);

  const startDrag = (clientX: number, clientY: number) => {
    setDragging(true);
    const rect = btnRef.current?.getBoundingClientRect();
    const offsetX = rect ? clientX - rect.left : 0;
    const offsetY = rect ? clientY - rect.top : 0;

    const onMove = (e: MouseEvent | TouchEvent) => {
      const point = 'touches' in e ? e.touches[0] : (e as MouseEvent);
      const next = clampToViewport({ x: point.clientX - offsetX, y: point.clientY - offsetY });
      setPos(next);
      posRef.current = next;
    };
    const onUp = () => {
      setDragging(false);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(posRef.current)); } catch {}
      document.removeEventListener('mousemove', onMove as any);
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('touchmove', onMove as any);
      document.removeEventListener('touchend', onUp);
    };

    document.addEventListener('mousemove', onMove as any);
    document.addEventListener('mouseup', onUp);
    document.addEventListener('touchmove', onMove as any, { passive: false });
    document.addEventListener('touchend', onUp);
  };

  return (
    <>
      <FloatButton
        ref={btnRef as any}
        aria-label="Accessibility settings"
        tooltip={<span>Accessibility</span>}
        icon={<A11yIcon />}
        style={{
          left: pos.x,
          top: pos.y,
          background: "var(--color-surface)",
          color: "var(--color-text-primary)",
          border: "1px solid var(--color-border)",
        }}
        onClick={() => { if (!dragging) setOpen(true); }}
        onMouseDown={(e) => startDrag(e.clientX, e.clientY)}
        onTouchStart={(e) => startDrag(e.touches[0].clientX, e.touches[0].clientY)}
      />
      <Drawer
        title="Accessibility Settings"
        open={open}
        onClose={() => setOpen(false)}
        placement="right"
      >
        <div style={{ display: "grid", gap: 16 }}>
          <div>
            <label htmlFor="font-scale" style={{ display: "block", marginBottom: 8 }}>
              Font size: {Math.round(fontScale * 100)}%
            </label>
            <Slider
              id="font-scale"
              min={87.5}
              max={150}
              step={2.5}
              value={fontScale * 100}
              onChange={(v) => setFontScale((Number(v) || 100) / 100)}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontWeight: 600 }}>Reduce motion</div>
              <div style={{ color: "var(--color-text-secondary)" }}>Disable most animations and transitions</div>
            </div>
            <Switch checked={reduceMotion} onChange={setReduceMotion} />
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontWeight: 600 }}>High contrast</div>
              <div style={{ color: "var(--color-text-secondary)" }}>Increase contrast for improved readability</div>
            </div>
            <Switch checked={highContrast} onChange={setHighContrast} />
          </div>
        </div>
      </Drawer>
    </>
  );
};

export default AccessibilityPanel;
