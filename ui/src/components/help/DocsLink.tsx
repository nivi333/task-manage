import React from "react";
import { Typography } from "antd";

const { Link } = Typography;

export interface DocsLinkProps {
  href: string;
  label: string;
  icon?: React.ReactNode;
}

function isValidUrl(url: string) {
  try {
    const u = new URL(url, window.location.origin);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

const DocsLink: React.FC<DocsLinkProps> = ({ href, label, icon }) => {
  const safe = isValidUrl(href);
  const url = safe ? href : "#";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      {icon}
      <Link href={url} target="_blank" rel="noopener noreferrer" aria-label={`Open documentation: ${label}`}>
        {label}
      </Link>
      {!safe && (
        <span style={{ color: "var(--color-error)", fontSize: 12 }}>(invalid URL)</span>
      )}
    </div>
  );
};

export default DocsLink;
