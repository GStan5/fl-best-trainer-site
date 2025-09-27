"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface AddToHomeScreenProps {
  showAsContainer?: boolean;
}

export default function AddToHomeScreenButton({
  showAsContainer = false,
}: AddToHomeScreenProps = {}) {
  const { data: session } = useSession();
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Check if already running as PWA
    const isStandaloneMode = window.matchMedia(
      "(display-mode: standalone)"
    ).matches;
    setIsStandalone(isStandaloneMode);

    // Detect iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    // Load user preferences
    if (session?.user?.email) {
      const savedPrefs = localStorage.getItem(
        `pwa-prefs-${session.user.email}`
      );
      if (savedPrefs) {
        const prefs = JSON.parse(savedPrefs);
        setIsHidden(prefs.isHidden || false);
      }
    }

    // Handle beforeinstallprompt event for Android/Chrome
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, [session]);

  const handleInstallClick = async () => {
    if (isIOS) {
      // Calculate modal position relative to button
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        const scrollTop =
          window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft =
          window.pageXOffset || document.documentElement.scrollLeft;

        // Position modal above button vertically, but center horizontally on screen
        const modalWidth = 320;
        const screenCenterX = window.innerWidth / 2;
        const modalLeft = screenCenterX - modalWidth / 2;

        setModalPosition({
          top: rect.top + scrollTop,
          left: modalLeft + scrollLeft,
        });
      }
      // Show iOS instructions modal
      setShowIOSModal(true);
    } else if (deferredPrompt) {
      // Android/Chrome install
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        setDeferredPrompt(null);
        setIsInstallable(false);
      }
    }
  };

  const closeIOSModal = () => {
    setShowIOSModal(false);
  };

  const saveUserPreferences = (prefs: { isHidden?: boolean }) => {
    if (session?.user?.email) {
      const currentPrefs = localStorage.getItem(
        `pwa-prefs-${session.user.email}`
      );
      const existingPrefs = currentPrefs ? JSON.parse(currentPrefs) : {};
      const newPrefs = { ...existingPrefs, ...prefs };
      localStorage.setItem(
        `pwa-prefs-${session.user.email}`,
        JSON.stringify(newPrefs)
      );
    }
  };

  const handleHide = () => {
    setIsHidden(true);
    saveUserPreferences({ isHidden: true });
  };

  // Don't show if already installed as PWA
  if (isStandalone) {
    return null;
  }

  // Don't show on desktop
  if (!isIOS && !isInstallable) {
    return null;
  }

  // Don't show if user has hidden it
  if (isHidden) {
    return null;
  }

  if (showAsContainer) {
    return (
      <>
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 text-sm">
                  Add FL Best Trainer to your home screen
                </h3>
                <p className="text-gray-600 text-xs">
                  Get quick access like a native app
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                ref={buttonRef}
                onClick={handleInstallClick}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-200"
              >
                Add Now
              </button>
              <div className="relative group">
                <button
                  className="text-gray-400 hover:text-gray-600 p-1"
                  title="Options"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                  </svg>
                </button>
                <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg p-2 min-w-[140px] z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <button
                    onClick={handleHide}
                    className="block w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 rounded"
                  >
                    Hide permanently
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* iOS Instructions Modal */}
        {showIOSModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999]">
            <div
              className="absolute bg-white rounded-lg p-6 max-w-sm w-80 shadow-2xl"
              style={{
                top: Math.max(modalPosition.top - 100, 20),
                left: modalPosition.left,
                transform: "none",
              }}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Add to Home Screen
                </h3>
                <button
                  onClick={closeIOSModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-4 text-sm text-gray-600">
                <div className="flex items-start gap-3">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                    1
                  </span>
                  <div>
                    <p>
                      Tap the <strong>Share</strong> button at the bottom of
                      Safari
                    </p>
                    <div className="mt-1 flex items-center gap-1">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.50-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z" />
                      </svg>
                      <span className="text-xs">Share icon</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                    2
                  </span>
                  <div>
                    <p>
                      Scroll down and tap <strong>"Add to Home Screen"</strong>
                    </p>
                    <div className="mt-1 flex items-center gap-1">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                      <span className="text-xs">Plus icon</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                    3
                  </span>
                  <p>
                    Tap <strong>"Add"</strong> to confirm
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={closeIOSModal}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200"
                >
                  Got it!
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Regular button mode
  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleInstallClick}
        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 shadow-md"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
        Add to Home Screen
      </button>

      {/* iOS Instructions Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999]">
          <div
            className="absolute bg-white rounded-lg p-6 max-w-sm w-80 shadow-2xl"
            style={{
              top: Math.max(modalPosition.top - 100, 20),
              left: modalPosition.left,
              transform: "none",
            }}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Add to Home Screen
              </h3>
              <button
                onClick={closeIOSModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-4 text-sm text-gray-600">
              <div className="flex items-start gap-3">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                  1
                </span>
                <div>
                  <p>
                    Tap the <strong>Share</strong> button at the bottom of
                    Safari
                  </p>
                  <div className="mt-1 flex items-center gap-1">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.50-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z" />
                    </svg>
                    <span className="text-xs">Share icon</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                  2
                </span>
                <div>
                  <p>
                    Scroll down and tap <strong>"Add to Home Screen"</strong>
                  </p>
                  <div className="mt-1 flex items-center gap-1">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    <span className="text-xs">Plus icon</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                  3
                </span>
                <p>
                  Tap <strong>"Add"</strong> to confirm
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={closeIOSModal}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
