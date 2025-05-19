import dynamic from 'next/dynamic';
const Lottie = dynamic(() => import('./LottieWrapper'), { ssr: false });

export default function HeroAnimation() {
  return (
    <div className="relative group">
      {/* Glowing background effect */}
      <div className="absolute -inset-4 bg-gradient-to-r from-royal-light via-blue-light to-royal rounded-3xl opacity-75 blur-xl group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-gradient"></div>
      
      {/* Main animation container */}
      <div className="relative">
        <div className="w-full max-w-lg mx-auto transform group-hover:scale-102 transition duration-500">
          <div className="relative z-10 rounded-3xl overflow-hidden backdrop-blur-sm border-[6px] border-[#0A1A3F] bg-white p-0">
            <Lottie 
              src="/animations/chinUpAnimation.json"
              className="w-full h-full mix-blend-normal -m-2"
              loop={true}
              autoplay={true}
              speed={1.0}
              style={{
                background: 'white',
                margin: '-8px'
              }}
            />
          </div>
        </div>
        
        {/* Enhanced decorative elements */}
        <div className="absolute -top-8 -right-8 w-32 h-32 bg-gradient-to-br from-royal to-blue-light rounded-full opacity-40 blur-2xl animate-pulse"></div>
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-gradient-to-br from-blue-light to-royal rounded-full opacity-40 blur-2xl animate-pulse delay-700"></div>
        <div className="absolute top-1/2 -translate-y-1/2 -left-4 w-24 h-24 bg-gradient-to-br from-royal-light to-blue rounded-full opacity-30 blur-xl animate-float"></div>
      </div>
    </div>
  );
}