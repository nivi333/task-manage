import React from "react";
import { HomeOutlined, UnorderedListOutlined, BellOutlined, SettingOutlined, SearchOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";

const TABS = [
  { key: "/dashboard", label: "Home", icon: <HomeOutlined /> },
  { key: "/tasks", label: "Tasks", icon: <UnorderedListOutlined /> },
  { key: "/search", label: "Search", icon: <SearchOutlined /> },
  { key: "/notifications", label: "Alerts", icon: <BellOutlined /> },
  { key: "/settings", label: "Settings", icon: <SettingOutlined /> },
];

const useIsMobile = () => {
  const [isMobile, setIsMobile] = React.useState<boolean>(window.innerWidth < 992);
  React.useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 992);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return isMobile;
};

const MobileNav: React.FC = () => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();

  if (!isMobile) return null;

  return (
    <nav
      aria-label="Mobile navigation"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: 56,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        background: "var(--color-bg-elevated, #fff)",
        borderTop: "1px solid var(--color-border, #f0f0f0)",
        zIndex: 1000,
      }}
    >
      {TABS.map((t) => {
        const selected = location.pathname.startsWith(t.key);
        return (
          <button
            key={t.key}
            onClick={() => navigate(t.key)}
            aria-current={selected ? "page" : undefined}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              flex: 1,
              height: "100%",
              background: "transparent",
              border: "none",
              color: selected ? "var(--color-primary, #1677ff)" : "var(--color-text, #333)",
              fontSize: 10,
              gap: 2,
            }}
          >
            <span style={{ fontSize: 18, lineHeight: 1 }}>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default MobileNav;
