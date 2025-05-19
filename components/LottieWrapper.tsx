import { useEffect, useRef } from 'react';
import lottie from 'lottie-web';
export default function LottieWrapper({ src }: { src: string }) {
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (container.current) {
      lottie.loadAnimation({ container: container.current, renderer: 'svg', loop: true, autoplay: true, path: src });
    }
  }, [src]);
  return <div ref={container} className="w-full h-64" />;
}