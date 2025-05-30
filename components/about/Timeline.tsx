import { FaTrophy } from "react-icons/fa";

interface TimelineEvent {
  year: string;
  title: string;
  description: string;
  highlight?: boolean;
}

export default function Timeline() {
  const timelineEvents: TimelineEvent[] = [
    {
      year: "2012",
      title: "Started Fitness Journey",
      description: "Began personal training career after completing initial certification",
    },
    {
      year: "2015",
      title: "NASM Certification",
      description: "Earned National Academy of Sports Medicine certification",
      highlight: true,
    },
    {
      year: "2018",
      title: "Specialized in In-Home Training",
      description: "Shifted focus to providing personalized training in clients' homes",
    },
    {
      year: "2021",
      title: "Founded FL Best Trainer",
      description: "Launched FL Best Trainer to serve Southwest Florida with premium in-home personal training",
      highlight: true,
    },
    {
      year: "2023",
      title: "Expanded Services",
      description: "Introduced custom workout plan offerings and nutrition coaching",
    },
  ];

  return (
    <div className="py-10">
      <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
        <FaTrophy className="text-royal-light" /> My Journey
      </h3>

      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-4 top-1 h-full w-0.5 bg-gradient-to-b from-royal via-royal-light to-royal opacity-30"></div>

        {/* Timeline events */}
        <div className="space-y-10 relative">
          {timelineEvents.map((event, index) => (
            <div key={index} className="flex gap-6">
              <div className="relative flex-shrink-0">
                {/* Year circle */}
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center z-10 relative
                  ${event.highlight 
                    ? "bg-royal" 
                    : "bg-gray-800"
                  }
                `}>
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <div className={`
                bg-gray-900/40 rounded-lg p-5 border border-white/10 flex-grow
                ${event.highlight ? "shadow-lg shadow-royal/10" : ""}
              `}>
                <div className="text-royal-light font-mono text-sm mb-1">{event.year}</div>
                <h4 className="text-white font-medium text-lg mb-2">{event.title}</h4>
                <p className="text-white/70">{event.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}