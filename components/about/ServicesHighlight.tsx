import Link from "next/link";
import { motion } from "framer-motion";
import {
  FaDumbbell,
  FaClipboardList,
  FaAppleAlt,
  FaChartLine,
  FaArrowRight,
} from "react-icons/fa";

interface ServiceCard {
  icon: JSX.Element;
  title: string;
  description: string;
  link: string;
}

export default function ServicesHighlight() {
  const services: ServiceCard[] = [
    {
      icon: <FaDumbbell className="w-7 h-7 text-royal" />,
      title: "In-Home Training",
      description:
        "Personalized training sessions in the comfort of your home with expert guidance.",
      link: "/training",
    },
    {
      icon: <FaClipboardList className="w-7 h-7 text-royal" />,
      title: "Custom Workout Plans",
      description:
        "Tailored workout programs designed specifically for your goals and preferences.",
      link: "/plans",
    },
    {
      icon: <FaAppleAlt className="w-7 h-7 text-royal" />,
      title: "Nutrition Coaching",
      description:
        "Expert guidance on nutrition to complement your fitness journey and enhance results.",
      link: "/training",
    },
    {
      icon: <FaChartLine className="w-7 h-7 text-royal" />,
      title: "Fitness Assessments",
      description:
        "Comprehensive evaluations to track progress and optimize your training program.",
      link: "/training",
    },
  ];

  return (
    <section className="py-16 relative">
      {/* Background accent - UPDATED WITH SCOPED CLASS NAME */}
      <div className="absolute inset-0 services-bg-pattern opacity-5"></div>

      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mb-12 max-w-3xl mx-auto text-center"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            {"Premium "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-royal-light to-royal">
              Fitness Services
            </span>
          </h2>
          <p className="text-white/70 text-lg">
            Professional training solutions tailored to help you achieve your
            fitness goals
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative h-full"
            >
              <Link
                href={service.link}
                className="block h-full relative bg-gradient-to-br from-gray-900 to-black/60 rounded-xl p-6 border border-white/5 shadow-lg group hover:shadow-royal/10 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              >
                {/* Accent border top */}
                <div className="absolute top-0 left-8 right-8 h-0.5 bg-gradient-to-r from-transparent via-royal/30 to-transparent"></div>

                <div className="relative z-10">
                  <div className="bg-black/30 rounded-full w-16 h-16 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg border border-royal/10">
                    {service.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-royal-light transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-white/70 mb-6">{service.description}</p>
                  <span className="inline-flex items-center text-royal-light group-hover:text-royal-light/90 transition-colors group-hover:translate-x-1 duration-300">
                    Learn More <FaArrowRight className="ml-2 w-3 h-3" />
                  </span>
                </div>

                {/* Inner highlight effect */}
                <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-royal/5 to-transparent rounded-b-xl"></div>

                {/* Card hover state overlay */}
                <div className="absolute inset-0 bg-royal/0 group-hover:bg-royal/5 rounded-xl transition-colors duration-300"></div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      <style jsx>{`
        /* Scoped (non-global) styles for this component only */
        .services-bg-pattern {
          background-image: url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.15' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='1'/%3E%3C/g%3E%3C/svg%3E");
          background-size: 20px 20px;
        }
      `}</style>
    </section>
  );
}
