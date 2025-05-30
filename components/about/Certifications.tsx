import Image from "next/image";
import { FaMedal } from "react-icons/fa";

interface Certification {
  name: string;
  organization: string;
  logo: string;
  year: string;
}

export default function Certifications() {
  const certifications: Certification[] = [
    {
      name: "Certified Personal Trainer (CPT)",
      organization: "National Academy of Sports Medicine",
      logo: "/images/certs/nasm.png",
      year: "2015",
    },
    {
      name: "Corrective Exercise Specialist (CES)",
      organization: "National Academy of Sports Medicine",
      logo: "/images/certs/nasm.png",
      year: "2016",
    },
    {
      name: "Fitness Nutrition Specialist",
      organization: "American Council on Exercise",
      logo: "/images/certs/ace.png",
      year: "2018",
    },
    {
      name: "Senior Fitness Specialist",
      organization: "National Academy of Sports Medicine",
      logo: "/images/certs/nasm.png",
      year: "2020",
    },
  ];

  return (
    <div className="py-10">
      <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
        <FaMedal className="text-royal-light" /> Certifications & Education
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {certifications.map((cert, index) => (
          <div 
            key={index} 
            className="bg-gray-900/40 rounded-lg p-5 border border-white/10 hover:border-royal/30 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 relative flex-shrink-0 bg-white rounded-md overflow-hidden">
                <Image 
                  src={cert.logo} 
                  alt={cert.organization}
                  fill
                  style={{ objectFit: "contain" }}
                  className="p-1"
                />
              </div>
              <div>
                <h4 className="text-white font-medium">{cert.name}</h4>
                <div className="text-white/70 text-sm">{cert.organization}</div>
                <div className="text-royal-light text-xs mt-1">{cert.year}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}