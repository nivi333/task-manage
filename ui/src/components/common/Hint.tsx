import React from "react";
import { Tooltip } from "antd";

interface HintProps {
  title: React.ReactNode;
  children: React.ReactElement;
  placement?: "top" | "bottom" | "left" | "right" | "topLeft" | "topRight" | "bottomLeft" | "bottomRight";
}

const Hint: React.FC<HintProps> = ({ title, children, placement = "bottom" }) => {
  return (
    <Tooltip title={title} placement={placement} mouseEnterDelay={0.15} destroyTooltipOnHide>
      {children}
    </Tooltip>
  );
};

export default Hint;
