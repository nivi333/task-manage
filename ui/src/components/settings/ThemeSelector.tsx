import React, { useEffect } from "react";
import { Radio, Space, Typography } from "antd";
import type { ThemeOption } from "../../types/settings";
import { useTheme } from "../../context/ThemeContext";

interface Props {
  value?: ThemeOption;
  onChange?: (value: ThemeOption) => void;
}

const ThemeSelector: React.FC<Props> = ({ value, onChange }) => {
  const { setThemeOption, isDark } = useTheme();
  const contextMode: ThemeOption = isDark ? "dark" : "light";


  return (
    <Space
      direction="vertical"
      style={{ width: "100%", alignItems: "flex-start" }}
    >
      <Typography.Text type="secondary">
        Choose your appearance preference
      </Typography.Text>
      <Radio.Group
        value={typeof value !== 'undefined' ? value : contextMode}
        onChange={(e) => {
          const v = e.target.value as ThemeOption;
          setThemeOption(v);
          onChange?.(v);
        }}
      >
        <Space direction="vertical" align="start">
              <Radio value="light">Light</Radio>
          <Radio value="dark">Dark</Radio>
        </Space>
      </Radio.Group>
    </Space>
  );
};

export default ThemeSelector;
