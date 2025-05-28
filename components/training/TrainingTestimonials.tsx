import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaQuoteLeft, FaStar } from "react-icons/fa";
import Image from "next/image";

export default function TrainingTestimonials() {
  const [current, setCurrent] = useState(0);
  
  const testimonials = [
    {
      name: "Sarah J.",
      role: "Working Professional",
      image: "/testimonial-1.jpg", // You'll need to add these images
      quote: "In-home training has been a game-changer for my busy schedule. My trainer adapts to my limited space and equipment, and I've seen better results in 3 months than I did in years at the gym!",
      rating: 5,
      duration: "Client for 8 months"
    },
    {
      name: "Michael T.",
      role: "Busy Parent",
      image: "/testimonial-2.jpg",
      quote: "With young kids at home, getting to the gym was impossible. Having a trainer come to my house has been the perfect solution. The workouts are challenging and effective, and I love not having to drive anywhere.",
      rating: 5,
      duration: "Client for 1 year"
    },
    {
      name: "Karen L.",
      role: "Retiree",
      image: "/testimonial-3.jpg",
      quote: "At my age, I was intimidated by busy gyms. In-home training gives me professional guidance in a comfortable environment. My balance and strength have improved tremendously.",
      rating: 5,
      duration: "Client for 6 months"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent(prev => (prev === testimonials.length - 1 ? 0 : prev + 1));
    }, 8000);
    
    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <section className="py-20 bg-[#1A1A1A] relative">
      <div className="absolute inset-0 bg-[url('/pattern.svg')] bg-repeat opacity-5"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Success <span className="text-royal-light">Stories</span>
          </h2>
          <p className="text-lg text-white/70">
            Hear from clients who've transformed their fitness through our in-home training
          </p>
        </div>
        
        <div className="max-w-5xl mx-auto overflow-hidden">
          <div className="relative">
            {testimonials.map((testimonial, index) => (
              <motion.div 
                key={index}
                className={`${index === current ? 'block' : 'hidden'}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6 }}
              >
                <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-2xl p-8 md:p-12 flex flex-col md:flex-row gap-8 items-center">
                  <div className="relative w-36 h-36 rounded-full overflow-hidden border-4 border-royal/30 flex-shrink-0 mx-auto md:mx-0">
                    {/* Placeholder for image */}
                    <div className="absolute inset-0 bg-gradient-to-br from-royal/30 to-navy"></div>
                    {testimonial.image && (
                      <Image
                        src={testimonial.image} 
                        alt={testimonial.name}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <FaQuoteLeft className="text-royal/30 text-4xl mb-4" />
                    <p className="text-lg text-white/90 mb-6 italic">{testimonial.quote}</p>
                    
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end">
                      <div>
                        <h4 className="text-xl font-bold text-white mb-1">{testimonial.name}</h4>
                        <p className="text-royal-light text-sm">{testimonial.role}</p>
                        <div className="flex items-center mt-2">
                          {[...Array(5)].map((_, i) => (
                            <FaStar 
                              key={i} 
                              className={`w-4 h-4 ${i < testimonial.rating ? 'text-royal-light' : 'text-gray-600'}`} 
                            />
                          ))}
                          <span className="text-white/60 ml-2 text-sm">{testimonial.duration}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Dots navigation */}
          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button 
                key={index} 
                onClick={() => setCurrent(index)}
                className={`w-3 h-3 rounded-full focus:outline-none transition-colors ${index === current ? 'bg-royal' : 'bg-white/20'}`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}