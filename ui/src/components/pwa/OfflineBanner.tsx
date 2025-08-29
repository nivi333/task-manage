import React from "react";

const OfflineBanner: React.FC = () => {
  const [online, setOnline] = React.useState<boolean>(navigator.onLine);

  React.useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  if (online) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        background: "#fffbe6",
        color: "#614700",
        borderBottom: "1px solid #ffe58f",
        padding: "8px 12px",
        zIndex: 1000,
        textAlign: "center",
        fontSize: 13,
      }}
    >
      You are offline. Some features may be unavailable.
    </div>
  );
};

export default OfflineBanner;
