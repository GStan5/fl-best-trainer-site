import { useState } from 'react';

export default function Newsletter() {
  const [email, setEmail] = useState("");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Newsletter signup logic
    console.log("Email submitted:", email);
    setEmail("");
    // You would typically send this to your API
  };
  
  return (
    <section className="py-16 bg-[#1A1A1A] relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/pattern.svg')] bg-repeat opacity-5"></div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl relative z-10">
        <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-8 sm:p-10 border border-white/10">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 text-center">
            Stay Updated with Fitness Tips & Special Offers
          </h2>
          <p className="text-white/70 mb-8 text-center">
            Join the newsletter to receive exclusive content and early access to promotions
          </p>
          
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:border-royal-light"
              required
            />
            <button 
              type="submit"
              className="px-6 py-3 bg-royal text-white rounded-xl font-medium hover:bg-royal-light transition-all duration-300"
            >
              Subscribe
            </button>
          </form>
          
          <p className="text-white/50 text-sm mt-4 text-center">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </div>
    </section>
  );
}