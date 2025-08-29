import React from "react";
import { Drawer, Slider, Switch, FloatButton } from "antd";
import { useAccessibility } from "../../context/AccessibilityContext";

// simple inline icon to avoid extra deps
function A11yIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width={20} height={20} fill="currentColor" aria-hidden {...props}>
      <path d="M12 2a2 2 0 110 4 2 2 0 010-4zm-7 5a1 1 0 100 2h5v13a1 1 0 102 0V9h5a1 1 0 100-2H5z" />
    </svg>
  );
}

const AccessibilityPanel: React.FC = () => {
  const { fontScale, reduceMotion, highContrast, setFontScale, setReduceMotion, setHighContrast } = useAccessibility();
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <FloatButton
        aria-label="Accessibility settings"
        tooltip={<span>Accessibility</span>}
        icon={<A11yIcon />}
        style={{ right: 24, bottom: 96 }}
        onClick={() => setOpen(true)}
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
