import dynamic from 'next/dynamic';

const Lottie = dynamic(() => import('./LottieWrapper'), { ssr: false });

export default function CreativeHero() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-blue-900 via-blue-800 to-blue-700 text-white">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <Lottie src="/animations/hero-animated.json" />
      </div>
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-24 flex flex-col md:flex-row items-center gap-12">
        <div className="md:w-1/2 text-center md:text-left">
          <h1 className="text-5xl font-bold leading-tight">Transform Your Body <br /> Without Leaving Home</h1>
          <p className="mt-4 text-lg text-gray-200">
            Personalized training for all ages — specializing in adults 40+. Based on Anna Maria Island with 20 years of expert coaching.
          </p>
          <a href="/booking" className="mt-6 inline-block bg-white text-blue-900 font-bold py-3 px-6 rounded hover:bg-gray-100 transition">
            Book Your Free Call
          </a>
        </div>
        <div className="md:w-1/2 hidden md:block">
          <div className="w-full h-[300px] bg-blue-600 rounded-full opacity-30 blur-2xl"></div>
        </div>
      </div>
    </div>
  );
}