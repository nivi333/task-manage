import React from "react";
import { Button, Tooltip } from "antd";
import { CopyOutlined, CheckOutlined } from "@ant-design/icons";
import { notificationService } from "../../services/notificationService";

interface CopyButtonProps {
  value: string;
  size?: "small" | "middle" | "large";
}

const CopyButton: React.FC<CopyButtonProps> = ({ value, size = "small" }) => {
  const [copied, setCopied] = React.useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      notificationService.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      notificationService.error("Failed to copy");
    }
  };

  return (
    <Tooltip title={copied ? "Copied" : "Copy"}>
      <Button size={size} icon={copied ? <CheckOutlined /> : <CopyOutlined />} onClick={onCopy} />
    </Tooltip>
  );
};

export default CopyButton;
