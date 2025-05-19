import { FaPhone, FaDumbbell, FaChartLine } from 'react-icons/fa';

export default function HowItWorks() {
  const steps = [
    {
      title: "Book a Free Call",
      desc: "Schedule a consultation to discuss your goals and fitness level.",
      icon: <FaPhone className="w-6 h-6" />
    },
    {
      title: "Start In-Home Training",
      desc: "Experience personalized training sessions in your space, with all equipment provided.",
      icon: <FaDumbbell className="w-6 h-6" />
    },
    {
      title: "Progress & Results",
      desc: "Track your achievements and build lasting strength, confidence, and health.",
      icon: <FaChartLine className="w-6 h-6" />
    },
  ];

  return (
    <section className="relative py-24 bg-[#1A1A1A] overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[url('/pattern.svg')] bg-repeat opacity-5"></div>
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-royal/50 to-transparent"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            How It Works
          </h2>
          <p className="text-lg text-white/70">
            Simple steps to start your fitness journey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, idx) => (
            <div 
              key={idx} 
              className="group relative bg-black/30 backdrop-blur-sm rounded-2xl p-8 
                border border-white/10 hover:border-royal/30 transition-all duration-300"
            >
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl 
                  bg-royal/10 text-royal-light mb-6 group-hover:scale-110 transition-transform duration-300">
                  {step.icon}
                </div>
                <div className="text-4xl font-bold text-royal-light/50 mb-4">
                  {String(idx + 1).padStart(2, '0')}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-white/70 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}