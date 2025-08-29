import React from "react";

// Minimal PWA install prompt banner
const InstallPrompt: React.FC = () => {
  const [deferred, setDeferred] = React.useState<any>(null);
  const [visible, setVisible] = React.useState<boolean>(false);

  React.useEffect(() => {
    const handler = (e: any) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      setDeferred(e);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler as any);
    return () => window.removeEventListener("beforeinstallprompt", handler as any);
  }, []);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 16,
        left: 16,
        right: 16,
        background: "#f0f5ff",
        color: "#1d39c4",
        border: "1px solid #adc6ff",
        borderRadius: 8,
        padding: "12px 16px",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
      }}
    >
      <span>Add this app to your home screen for a better experience.</span>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={() => setVisible(false)}
          style={{
            background: "transparent",
            border: "1px solid #adc6ff",
            color: "#1d39c4",
            padding: "6px 10px",
            borderRadius: 6,
          }}
        >
          Not now
        </button>
        <button
          onClick={async () => {
            if (!deferred) return;
            deferred.prompt();
            const { outcome } = await deferred.userChoice;
            // Hide the prompt after user's choice
            setVisible(false);
            setDeferred(null);
            console.log("[PWA] install prompt outcome:", outcome);
          }}
          style={{
            background: "#2f54eb",
            border: "1px solid #2f54eb",
            color: "#fff",
            padding: "6px 10px",
            borderRadius: 6,
          }}
        >
          Install
        </button>
      </div>
    </div>
  );
};

export default InstallPrompt;
