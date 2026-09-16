import { ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";

let lockCount = 0;
let savedScrollY = 0;
let savedBodyCss = "";
let savedHtmlOverflow = "";

function lockViewport() {
  if (typeof document === "undefined") return;
  if (lockCount === 0) {
    savedScrollY = window.scrollY;
    savedBodyCss = document.body.style.cssText;
    savedHtmlOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${savedScrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";
  }
  lockCount += 1;
}

function unlockViewport() {
  if (typeof document === "undefined") return;
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount > 0) return;
  document.documentElement.style.overflow = savedHtmlOverflow;
  document.body.style.cssText = savedBodyCss;
  window.scrollTo(0, savedScrollY);
}

interface ViewportOverlayProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  zIndex?: number;
  dimClassName?: string;
}

export default function ViewportOverlay({
  open,
  onClose,
  children,
  zIndex = 9999999,
  dimClassName = "bg-black/80",
}: ViewportOverlayProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    lockViewport();
    return () => unlockViewport();
  }, [open]);

  if (!mounted) return null;

  if (!open) return null;

  return createPortal(
    <div
      role="presentation"
      onClick={onClose}
      className="flex items-center justify-center p-4"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        minHeight: "100vh",
        height: "100dvh",
        maxHeight: "100dvh",
        zIndex,
        transform: "none",
        overflowY: "auto",
        overscrollBehavior: "contain",
        WebkitOverflowScrolling: "touch",
        margin: 0,
      }}
    >
      <div
        aria-hidden
        className={dimClassName}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
        }}
      />
      <div
        className="relative z-10 w-full flex justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}
