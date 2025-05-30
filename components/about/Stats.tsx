import { FaUserFriends, FaClock, FaStar, FaShieldAlt } from "react-icons/fa";
import { motion } from "framer-motion";

interface Stat {
  value: string;
  label: string;
  icon: JSX.Element;
  highlight?: boolean;
}

export default function Stats() {
  const stats: Stat[] = [
    // NASM certification moved to first position
    {
      value: "NASM",
      label: "Gold Standard Certification",
      icon: <FaShieldAlt className="text-white w-6 h-6" />,
      highlight: true,
    },
    {
      value: "500+",
      label: "Happy Clients",
      icon: <FaUserFriends className="text-royal w-6 h-6" />,
    },
    {
      value: "10+",
      label: "Years Experience",
      icon: <FaClock className="text-royal w-6 h-6" />,
    },
    {
      value: "5,000+",
      label: "Training Sessions",
      icon: <FaStar className="text-royal w-6 h-6" />,
    },
  ];

  return (
    <section className="py-16 relative">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`text-center ${
                stat.highlight ? "stat-highlight" : ""
              }`}
            >
              <div
                className={`inline-flex items-center justify-center rounded-full p-4 mb-5 ${
                  stat.highlight
                    ? "bg-gradient-to-br from-royal to-navy border border-white/20 shadow-lg shadow-royal/20"
                    : "bg-black/50 border border-royal/20"
                }`}
              >
                {stat.icon}
              </div>
              <div className="text-3xl font-bold text-white mb-2">
                {stat.value}
              </div>
              <div
                className={`${
                  stat.highlight ? "text-white font-medium" : "text-white/70"
                }`}
              >
                {stat.label}
              </div>
              {stat.highlight && (
                <div className="mt-2 text-xs text-royal-light">
                  Industry's premier fitness credential
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      <style jsx global>{`
        .stat-highlight {
          position: relative;
        }

        .stat-highlight::after {
          content: "";
          position: absolute;
          inset: -0.5rem;
          border-radius: 0.75rem;
          background: radial-gradient(
            circle at center,
            rgba(65, 105, 225, 0.08) 0%,
            transparent 70%
          );
          z-index: -1;
        }

        .bg-grid-pattern {
          background-image: url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.15' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='1'/%3E%3C/g%3E%3C/svg%3E");
          background-size: 20px 20px;
        }

        @media (hover: hover) {
          .stat-highlight:hover::after {
            background: radial-gradient(
              circle at center,
              rgba(65, 105, 225, 0.15) 0%,
              transparent 70%
            );
            transition: background 0.3s ease;
          }
        }
      `}</style>
    </section>
  );
}
