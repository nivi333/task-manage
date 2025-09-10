import React, { useEffect } from "react";
import { Space, Radio, Typography, Tooltip } from "antd";
import type { ThemeColorScheme } from "../../context/ThemeContext";
import { useTheme } from "../../context/ThemeContext";

interface Props {
  value?: ThemeColorScheme;
  onChange?: (value: ThemeColorScheme) => void;
}

const SCHEME_LABELS: Record<ThemeColorScheme, string> = {
  purple: "Purple",
  blue: "Blue",
  green: "Green",
  orange: "Orange",
  pink: "Pink",
};

const SWATCH_STYLE: React.CSSProperties = {
  width: 22,
  height: 22,
  borderRadius: 999,
  border: "none",
  boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
};

// Local copy of scheme colors for preview only (keep in sync with ThemeContext SCHEMES)
const SCHEMES_PREVIEW: Record<
  ThemeColorScheme,
  { start: string; end: string }
> = {
  purple: { start: "#6D28D9", end: "#9333EA" },
  blue: { start: "#1D4ED8", end: "#3B82F6" },
  green: { start: "#16A34A", end: "#10B981" },
  orange: { start: "#EA580C", end: "#F97316" },
  pink: { start: "#BE185D", end: "#EC4899" },
};

const ThemeColorPicker: React.FC<Props> = ({ value, onChange }) => {
  const { colorScheme, setColorScheme } = useTheme();
  const current = value ?? colorScheme;

  return (
    <Space
      direction="vertical"
      style={{ width: "100%", alignItems: "flex-start" }}
    >
      <Typography.Text type="secondary">Primary color</Typography.Text>
      <Radio.Group
        value={typeof value !== "undefined" ? value : colorScheme}
        onChange={(e) => {
          const v = e.target.value as ThemeColorScheme;
          onChange?.(v);
        }}
      >
        <Space wrap size={16}>
          {(Object.keys(SCHEME_LABELS) as ThemeColorScheme[]).map((key) => {
            const grad = SCHEMES_PREVIEW[key];
            return (
              <Tooltip key={key} title={SCHEME_LABELS[key]}>
                <Radio
                  value={key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    border: "none",
                    boxShadow: "none",
                    background: "none",
                  }}
                >
                  <span
                    style={{
                      ...SWATCH_STYLE,
                      background: `linear-gradient(135deg, ${grad.start}, ${grad.end})`,
                      boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
                    }}
                  />
                  {SCHEME_LABELS[key]}
                </Radio>
              </Tooltip>
            );
          })}
        </Space>
      </Radio.Group>
    </Space>
  );
};

export default ThemeColorPicker;
