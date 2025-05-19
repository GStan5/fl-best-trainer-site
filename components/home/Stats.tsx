import { stats } from "@/data/stats";

export default function Stats() {
  return (
    <section className="relative bg-[#1A1A1A] py-20 lg:py-28 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-[#222222]/50 to-transparent" />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-12 gap-x-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center group">
              <div className="mb-2 relative">
                <div
                  className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white via-gray-200 to-white 
                  bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-500"
                >
                  {stat.value}
                </div>
              </div>
              <div className="text-lg font-medium text-white mb-1">
                {stat.label}
              </div>
              <div className="text-sm text-gray-400">{stat.description}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
