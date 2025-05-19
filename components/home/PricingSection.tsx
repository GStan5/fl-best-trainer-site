import { useState } from 'react';
import { FaChevronDown, FaCheck } from 'react-icons/fa';

export default function PricingSection() {
  const [isOpen, setIsOpen] = useState(false);

  const plans = [
    {
      label: '1 Session',
      price: '$150',
      note: 'Perfect for trying out our services',
      features: ['One 60-minute session', 'Full equipment provided', 'Personalized workout plan'],
    },
    {
      label: '5 Sessions',
      price: '$700',
      note: '$140 per session',
      features: ['Five 60-minute sessions', 'Progress tracking', 'Nutrition guidance'],
      popular: true,
    },
    {
      label: '10 Sessions',
      price: '$1,300',
      note: '$130 per session',
      features: ['Ten 60-minute sessions', 'Body composition analysis', 'Monthly program adjustments'],
    },
    {
      label: '50 Sessions',
      price: '$6,250',
      note: '$125 per session',
      features: ['Never expires', 'Priority scheduling', 'Quarterly fitness assessments'],
    },
    {
      label: '100 Sessions',
      price: '$10,000',
      note: '$100 per session',
      features: ['Best value', 'Never expires', 'VIP benefits & perks'],
    },
  ];

  return (
    <section className="py-24 relative overflow-hidden bg-[#1A1A1A]">
      {/* Section Header */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="container mx-auto px-4 sm:px-6 lg:px-8 cursor-pointer"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Investment in Your Health
            </h2>
            <p className="text-lg text-white/70">
              Choose the package that fits your goals
            </p>
          </div>
          <FaChevronDown 
            className={`text-royal-light w-6 h-6 transition-transform duration-300 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </div>
      </div>

      {/* Pricing Grid */}
      <div className={`transition-all duration-500 ease-in-out overflow-hidden ${
        isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {plans.map((plan, idx) => (
              <div 
                key={idx}
                className={`relative group rounded-2xl bg-black/30 backdrop-blur-sm border transition-all duration-300
                  ${plan.popular 
                    ? 'border-royal-light shadow-lg shadow-royal/20' 
                    : 'border-white/10 hover:border-royal/30'
                  }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-royal-light 
                    rounded-full text-sm font-medium text-white">
                    Most Popular
                  </div>
                )}

                <div className="p-8">
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.label}</h3>
                  <div className="flex items-baseline mb-4">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    <span className="ml-2 text-white/60">{plan.note}</span>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIdx) => (
                      <li key={featureIdx} className="flex items-start gap-3">
                        <FaCheck className="w-5 h-5 text-royal-light flex-shrink-0 mt-0.5" />
                        <span className="text-white/80">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button className={`w-full py-3 px-6 rounded-xl font-medium transition-all duration-300
                    ${plan.popular
                      ? 'bg-royal-light text-white hover:bg-royal'
                      : 'bg-white/10 text-white hover:bg-royal-light'
                    }`}
                  >
                    Get Started
                  </button>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-white/60 text-sm mt-12">
            All packages include personalized training, equipment, and progress tracking.
            <br />Contact us for corporate rates and special arrangements.
          </p>
        </div>
      </div>
    </section>
  );
}