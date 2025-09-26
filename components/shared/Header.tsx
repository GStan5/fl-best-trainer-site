import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSession, signOut } from "next-auth/react";
import {
  FaBars,
  FaTimes,
  FaDumbbell,
  FaPhone,
  FaHome,
  FaRunning,
  FaUserAlt,
  FaArrowRight,
  FaBlog,
  FaUsers,
  FaSignOutAlt,
  FaSignInAlt,
} from "react-icons/fa";

export default function Header() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [router.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      // Make it more sensitive to start fading almost instantly
      setScrolled(window.scrollY > 5);

      // Force a reflow to ensure the header updates properly
      document.querySelector("header")?.classList.add("force-reflow");
      setTimeout(() => {
        document.querySelector("header")?.classList.remove("force-reflow");
      }, 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Add body scroll lock when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Function to handle smooth scrolling to contact section
  const scrollToContact = (e) => {
    e.preventDefault();

    // Close mobile menu if open
    if (isOpen) {
      setIsOpen(false);
    }

    // First check if we're on a page that has the contact section
    const contactSection = document.getElementById("contact");

    if (contactSection) {
      // We're on a page with the contact section
      const headerHeight = 80; // Adjust based on your header height
      const contactPosition =
        contactSection.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: contactPosition - headerHeight,
        behavior: "smooth",
      });
    } else {
      // Navigate to home page with contact hash if not on a page with contact section
      router.push("/#contact").then(() => {
        // This will run after navigation is complete
        setTimeout(() => {
          const contactSection = document.getElementById("contact");
          if (contactSection) {
            const headerHeight = 80;
            const contactPosition =
              contactSection.getBoundingClientRect().top + window.pageYOffset;
            window.scrollTo({
              top: contactPosition - headerHeight,
              behavior: "smooth",
            });
          }
        }, 500); // Give some time for the page to load
      });
    }
  };

  const navLinks = [
    { name: "Home", path: "/", icon: <FaHome className="mr-1.5" /> },
    { name: "Classes", path: "/classes", icon: <FaUsers className="mr-1.5" /> },
    {
      name: "In-Home Training",
      path: "/training",
      icon: <FaRunning className="mr-1.5" />,
      highlight: true,
      special: "popular",
    },
    {
      name: "Workout Plans",
      path: "/plans",
      icon: <FaDumbbell className="mr-1.5" />,
      highlight: true,
      special: "Remote",
    },
    { name: "Blog", path: "/blog", icon: <FaBlog className="mr-1.5" /> },
    { name: "About", path: "/about", icon: <FaUserAlt className="mr-1.5" /> },
  ];

  return (
    <>
      <header
        id="top"
        className={`fixed w-full z-50 transition-all duration-300 ${
          scrolled
            ? "py-2 backdrop-blur-md bg-gradient-to-r from-black/95 to-navy/95 shadow-lg shadow-black/30"
            : "py-3 sm:py-4 bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <nav className="flex justify-between items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center group z-20">
              <div className="relative w-7 h-7 sm:w-8 sm:h-8 mr-2 group-hover:scale-105 transition-transform">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-royal to-royal-light opacity-70" />
                <div className="absolute inset-0.5 rounded-full bg-black/80" />
                <span className="absolute inset-0 flex items-center justify-center text-base sm:text-lg font-bold text-royal-light">
                  FL
                </span>
              </div>
              <span className="text-lg sm:text-xl font-bold text-white group-hover:text-royal-light transition-colors">
                <span className="hidden xs:inline">FL </span>Best Trainer
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`px-3 lg:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center relative
                  ${
                    router.pathname === link.path
                      ? "text-royal-light bg-white/5"
                      : "text-white/70 hover:text-white hover:bg-white/5"
                  }
                  ${
                    link.highlight
                      ? "text-royal-light border-b border-royal/30 pb-1"
                      : ""
                  }
                  ${link.special ? "px-4 lg:px-5" : ""}
                `}
                >
                  {link.icon}
                  {link.name}
                  {link.special && (
                    <span className="absolute -top-2 -right-1 px-1  bg-royal text-[10px] font-bold text-white rounded-sm">
                      {link.special}
                    </span>
                  )}
                  {link.highlight && (
                    <FaArrowRight className="ml-1.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                  )}
                </Link>
              ))}
            </div>

            {/* CTA Button and Mobile Menu Button */}
            <div className="flex items-center z-20">
              {/* Authentication Buttons */}
              {status !== "loading" && (
                <>
                  {session ? (
                    <div className="hidden lg:flex items-center gap-3 mr-4">
                      <Link
                        href="/account"
                        className="flex items-center px-3 py-2 bg-royal text-white rounded-lg text-sm font-medium hover:bg-royal-light transition-all duration-300"
                      >
                        <FaUserAlt className="mr-1.5 text-xs" />
                        View Account
                      </Link>
                      <button
                        onClick={() => signOut({ callbackUrl: "/classes" })}
                        className="flex items-center px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-all duration-300"
                      >
                        <FaSignOutAlt className="mr-1.5 text-xs" />
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <div className="hidden lg:flex items-center gap-2 mr-4">
                      <Link
                        href="/auth/signin"
                        className="flex items-center px-3 py-2 bg-transparent border border-royal-light text-royal-light rounded-lg text-sm font-medium hover:bg-royal-light hover:text-royal-dark transition-all duration-300"
                      >
                        <FaSignInAlt className="mr-1.5 text-xs" />
                        Sign In
                      </Link>
                    </div>
                  )}
                </>
              )}

              {/* Call Now Button - Visible on medium screens but not large */}
              <a
                href="#contact"
                onClick={scrollToContact}
                className="hidden md:lg:hidden flex items-center mr-3 px-3 py-1.5 bg-royal text-white rounded-md text-xs font-medium hover:bg-royal-light transition-all duration-300"
              >
                <FaPhone className="mr-1 text-[10px]" />
                Call
              </a>

              {/* Full Call Now Button - Only visible on large screens */}
              <a
                href="#contact"
                onClick={scrollToContact}
                className="hidden lg:flex items-center px-5 py-2.5 bg-royal text-white rounded-lg text-sm font-medium hover:bg-royal-light transition-all duration-300"
              >
                <FaPhone className="mr-1.5 text-xs" />
                Contact
              </a>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden text-white p-2 rounded-lg focus:outline-none hover:bg-white/10 transition-colors"
                aria-label="Toggle menu"
                aria-expanded={isOpen}
              >
                {isOpen ? (
                  <FaTimes className="h-5 w-5 sm:h-6 sm:w-6" />
                ) : (
                  <FaBars className="h-5 w-5 sm:h-6 sm:w-6" />
                )}
              </button>
            </div>
          </nav>

          {/* Excellence Tagline with trophy-like design */}
          <Link
            href="/training"
            className={`
              hidden lg:block text-center 
              absolute left-1/2 -translate-x-1/2 w-auto
              transform transition-all duration-150 ease-out
              hover:scale-105
              ${
                scrolled
                  ? "opacity-0 -translate-y-8"
                  : "opacity-100 -bottom-14 animate-slight-bounce"
              }
            `}
          >
            <div className="relative">
              {/* Top connector - made longer */}
              <div className="absolute left-1/2 -top-2 w-px h-5 bg-gradient-to-b from-royal to-transparent"></div>

              {/* Medal/Trophy-like shape */}
              <div className="relative">
                {/* Star accent */}
                <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-royal-light rounded-full transform rotate-45"></div>

                {/* Main container with gold accent */}
                <div className="bg-gradient-to-b from-black/90 to-black/70 backdrop-blur-md border border-royal/30 shadow-lg shadow-royal/20 px-10 py-2 pt-3">
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-royal-light to-transparent"></div>

                  {/* Text with medal-like styling */}
                  <span className="text-white/90 font-medium tracking-wider text-sm uppercase flex items-center justify-center gap-1">
                    <span className="bg-gradient-to-r from-royal to-royal-light bg-clip-text text-transparent font-bold">
                      Personal
                    </span>
                    <span className="text-white font-medium mx-1">
                      Training
                    </span>
                    <span className="bg-gradient-to-r from-royal-light to-royal bg-clip-text text-transparent font-bold flex items-center">
                      Excellence
                      <span className="inline-flex ml-1">
                        <span className="w-1 h-1 bg-royal-light rounded-full animate-ping opacity-75"></span>
                      </span>
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </header>

      {/* Fixed Call Button - Now OUTSIDE the header component flow */}
      <div
        className="fixed-call-button"
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          zIndex: 9999,
        }}
      >
        <a
          href="#contact"
          onClick={scrollToContact}
          className="md:hidden flex items-center justify-center w-14 h-14 bg-gradient-to-r from-royal to-royal-light rounded-full shadow-lg shadow-black/30 animate-slight-bounce"
          aria-label="Contact Now"
        >
          <FaPhone className="text-white text-xl" />
        </a>
      </div>

      {/* Mobile Navigation Overlay */}
      <div
        className={`lg:hidden fixed inset-0 z-40 bg-gradient-to-br from-black/95 to-navy/95 backdrop-blur-lg transform transition-all duration-300 ease-in-out ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        style={{ height: "100vh", overflowY: "auto" }}
        aria-hidden={!isOpen}
      >
        <div className="container mx-auto px-4 sm:px-6 pt-20 sm:pt-24 pb-36 min-h-screen">
          <div className="flex flex-col space-y-3 sm:space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                onClick={() => setIsOpen(false)}
                className={`px-4 py-2.5 sm:py-3 text-base sm:text-lg font-medium rounded-xl flex items-center justify-between
                  ${
                    router.pathname === link.path
                      ? "text-royal-light bg-white/5"
                      : "text-white/80 hover:text-white hover:bg-white/5"
                  }
                  ${link.highlight ? "border-l-2 border-royal-light pl-3" : ""}
                  ${link.special ? "bg-black/40" : ""}
                `}
                aria-current={
                  router.pathname === link.path ? "page" : undefined
                }
              >
                <div className="flex items-center">
                  <div
                    className={`${
                      link.highlight ? "text-royal-light" : ""
                    } mr-3`}
                  >
                    {link.icon}
                  </div>
                  <div>
                    {link.name}
                    {link.special && (
                      <div className="text-xs text-royal-light font-normal mt-0.5">
                        {link.special}
                      </div>
                    )}
                  </div>
                </div>
                {link.highlight && <FaArrowRight className="opacity-50" />}
              </Link>
            ))}

            {/* Authentication section for mobile */}
            {status !== "loading" && (
              <div className="mt-6 pt-6 border-t border-white/10">
                {session ? (
                  <div className="space-y-3">
                    <Link
                      href="/account"
                      onClick={() => setIsOpen(false)}
                      className="w-full px-4 py-3 bg-royal text-white rounded-xl text-center text-lg font-medium hover:bg-royal-light transition-all duration-300 flex items-center justify-center"
                    >
                      <FaUserAlt className="mr-2" />
                      View Account
                    </Link>
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        signOut({ callbackUrl: "/classes" });
                      }}
                      className="w-full px-4 py-3 bg-red-600 text-white rounded-xl text-center text-lg font-medium hover:bg-red-700 transition-all duration-300 flex items-center justify-center"
                    >
                      <FaSignOutAlt className="mr-2" />
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/auth/signin"
                    onClick={() => setIsOpen(false)}
                    className="block w-full px-4 py-3 bg-transparent border-2 border-royal-light text-royal-light rounded-xl text-center text-lg font-medium hover:bg-royal-light hover:text-royal-dark transition-all duration-300 flex items-center justify-center"
                  >
                    <FaSignInAlt className="mr-2" />
                    Sign In with Google
                  </Link>
                )}
              </div>
            )}

            <a
              href="#contact"
              onClick={scrollToContact}
              className="mt-6 px-4 py-3 bg-gradient-to-r from-royal to-royal-light text-white rounded-xl text-center text-lg font-medium hover:from-royal-light hover:to-royal transition-all duration-300 flex items-center justify-center"
            >
              <FaPhone className="mr-2" />
              Contact
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
