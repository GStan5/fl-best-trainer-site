import { FaInstagram } from 'react-icons/fa';

export default function InstagramFeed() {
  return (
    <section className="py-16 bg-[#1A1A1A] relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/pattern.svg')] bg-repeat opacity-5"></div>
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-royal/50 to-transparent"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex items-center justify-center gap-3 mb-10">
          <FaInstagram className="w-6 h-6 text-royal-light" />
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Follow My Fitness Journey
          </h2>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {[1,2,3,4,5,6,7,8].map((item) => (
            <a 
              key={item} 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group block aspect-square bg-gradient-to-br from-royal/20 to-navy/20 rounded-xl overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  View
                </span>
              </div>
            </a>
          ))}
        </div>
        
        <div className="text-center mt-10">
          <a 
            href="https://instagram.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-flex items-center px-6 py-3 bg-royal text-white rounded-xl font-medium hover:bg-royal-light transition-all duration-300"
          >
            Follow on Instagram
            <FaInstagram className="ml-2" />
          </a>
        </div>
      </div>
    </section>
  );
}