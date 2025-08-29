import React from "react";
import { Tooltip } from "antd";
import { hexToRgba } from "../../utils/colorAllocator";

interface Props {
  keyText: string;
  color: string; // hex
  name?: string; // full project name for tooltip
  className?: string;
}

const ProjectKeyBadge: React.FC<Props> = ({ keyText, color, name, className }) => {
  const style: React.CSSProperties = {
    border: `1px solid ${color}`,
    backgroundColor: hexToRgba(color, 0.1),
    color,
  };
  const content = (
    <span className={`project-key-pill ${className || ""}`.trim()} style={style}>
      {keyText}
    </span>
  );
  return name ? <Tooltip title={name}>{content}</Tooltip> : content;
};

export default ProjectKeyBadge;
