import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAccessibility } from "../../context/AccessibilityContext";

interface AnimationWrapperProps {
  children: React.ReactNode;
  motionKey?: React.Key;
  durationMs?: number;
}

const AnimationWrapper: React.FC<AnimationWrapperProps> = ({
  children,
  motionKey,
  durationMs = 180,
}) => {
  const { reduceMotion } = useAccessibility();
  const [visible, setVisible] = useState(true);
  const keyRef = useRef<React.Key | undefined>(motionKey);

  useEffect(() => {
    if (reduceMotion) return;
    if (keyRef.current !== motionKey) {
      // trigger fade-in on key change
      keyRef.current = motionKey;
      setVisible(false);
      const id = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(id);
    }
  }, [motionKey, reduceMotion]);

  const style = useMemo<React.CSSProperties>(() => {
    if (reduceMotion) return {};
    return {
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0px)" : "translateY(6px)",
      transition: `opacity ${durationMs}ms ease, transform ${durationMs}ms ease`,
    };
  }, [visible, durationMs, reduceMotion]);

  return <div style={style}>{children}</div>;
};

export default AnimationWrapper;
