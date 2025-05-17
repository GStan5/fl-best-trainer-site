import dynamic from "next/dynamic";

const Lottie = dynamic(() => import("./LottieWrapper"), { ssr: false });

export default function HeroAnimation() {
  return (
    <div className="w-full max-w-md mx-auto mb-4">
      <Lottie src="/animations/hero-sample.json" />
    </div>
  );
}
