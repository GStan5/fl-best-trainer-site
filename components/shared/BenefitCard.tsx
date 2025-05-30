import { IconComponent } from "./Icons";

interface BenefitCardProps {
  title: string;
  description: string;
  icon: string;
  className?: string;
}

export function BenefitCard({
  title,
  description,
  icon,
  className = "",
}: BenefitCardProps) {
  return (
    <div
      className={`group transition-all duration-300 hover:-translate-y-1 ${className}`}
    >
      <div
        className="relative h-full bg-black/30 backdrop-blur-sm rounded-lg border 
        border-white/5 hover:border-royal/20 p-4 sm:p-5 transition-all duration-300"
      >
        {/* Subtle gradient hover effect */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-royal/5 to-royal-light/5 opacity-0 
          group-hover:opacity-100 rounded-lg transition-opacity duration-300"
        />

        <div className="flex items-start">
          {/* Icon with compact styling */}
          <div className="text-royal-light mr-4 flex-shrink-0">
            <IconComponent name={icon} className="w-6 h-6" />
          </div>

          {/* Content area */}
          <div>
            <h3 className="text-base font-bold text-white mb-1">{title}</h3>
            <p className="text-sm text-white/70 leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
