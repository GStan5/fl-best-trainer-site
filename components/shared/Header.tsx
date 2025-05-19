import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  // Update the scroll detection logic for smoother transitions
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleScroll = () => {
      if (timeoutId) clearTimeout(timeoutId);

      timeoutId = setTimeout(() => {
        const scrollPosition = window.scrollY;
        // Gradual transition threshold
        const isNowScrolled = scrollPosition > 20;
        if (isScrolled !== isNowScrolled) {
          setIsScrolled(isNowScrolled);
        }
      }, 50); // Reduced debounce time for more responsive feel
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isScrolled]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [router.pathname]);

  const navItems = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Services", path: "/services" },
    { name: "Booking", path: "/booking" },
    { name: "Contact", path: "/contact" },
    { name: "Blog", path: "/blog" },
  ];

  return (
    <header className="fixed w-full z-50">
      {/* Energy bar - symbolizing fitness progress */}
      <div className="h-1 bg-gradient-to-r from-royal via-royal-light to-royal">
        <div
          className={`h-full transition-all duration-700 ease-out bg-white/20 ${
            isScrolled ? "w-1/3" : "w-full"
          }`}
        />
      </div>

      {/* Main header content */}
      <div
        className={`transition-all duration-500 ease-out ${
          isScrolled
            ? "bg-navy py-3"
            : "bg-gradient-to-b from-navy/95 to-navy/80 py-6"
        }`}
      >
        <nav className="container mx-auto px-6 flex items-center justify-between">
          {/* Branding */}
          <Link href="/" className="group relative flex items-center space-x-4">
            {/* Logo circle - representing transformation */}
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-royal to-royal-light animate-pulse opacity-70 group-hover:opacity-100 transition-opacity" />
              <div className="absolute inset-0.5 rounded-full bg-navy group-hover:bg-navy/80 transition-colors" />
              <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-royal-light">
                FL
              </span>
            </div>

            {/* Brand text */}
            <div
              className={`transition-all duration-500 ${
                isScrolled ? "scale-95" : "scale-100"
              }`}
            >
              <h1 className="text-2xl font-bold text-white">FL Best Trainer</h1>
              <p className="text-sm text-royal-light/90 font-medium tracking-wide">
                Personal Training Excellence
              </p>
            </div>
          </Link>

          {/* Navigation - Fitness Journey Steps */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.path}
                className={`relative group px-4 py-2 rounded-lg transition-all duration-300 ${
                  router.pathname === item.path
                    ? "text-royal-light"
                    : "text-white/90 hover:text-white"
                }`}
              >
                <span className="relative z-10">{item.name}</span>
                {/* Active/Hover effect - like muscle definition */}
                <span
                  className={`absolute inset-0 rounded-lg transition-all duration-300
                  bg-gradient-to-b from-royal/20 to-transparent opacity-0 scale-90
                  ${
                    router.pathname === item.path
                      ? "opacity-100 scale-100"
                      : "group-hover:opacity-100 group-hover:scale-100"
                  }`}
                />
              </Link>
            ))}

            {/* CTA - Start Your Journey */}
            <button className="ml-6 px-6 py-2.5 rounded-lg relative group overflow-hidden bg-gradient-to-r from-royal to-royal-light hover:from-royal-light hover:to-royal transition-all duration-500 transform hover:scale-105">
              <span className="relative z-10 flex items-center font-medium text-white">
                Start Training
                <svg
                  className="w-4 h-4 ml-2 transition-transform duration-300 transform group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </span>
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}
