import { IconComponent } from "./Icons";

interface BenefitCardProps {
  title: string;
  description: string;
  icon: string;
}

export function BenefitCard({ title, description, icon }: BenefitCardProps) {
  return (
    <div className="relative group p-1 rounded-2xl transition-transform duration-500 hover:-translate-y-2">
      <div
        className="absolute inset-0 bg-gradient-to-r from-royal to-royal-light opacity-0 
        group-hover:opacity-100 blur-xl transition-opacity duration-500"
      />
      <div
        className="relative h-full bg-black/40 backdrop-blur-sm rounded-2xl p-8 border 
        border-white/10 group-hover:border-royal/30 transition-all duration-500"
      >
        <div className="text-royal-light mb-6 group-hover:scale-110 transition-transform duration-500">
          <IconComponent name={icon} className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
        <p className="text-white/70 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
