import React from "react";

const Insight: React.FC<{
  icon: string;
  title: string;
  text: string;
  accent: string;
}> = ({ icon, title, text, accent }) => (
  <div className={`bg-gray-800 rounded-xl p-4 border-l-4 ${accent}`}>
    <div className="flex gap-3">
      <span className="text-xl flex-shrink-0">{icon}</span>
      <div>
        <div className="text-white font-semibold text-sm mb-0.5">{title}</div>
        <div className="text-gray-400 text-sm leading-relaxed">{text}</div>
      </div>
    </div>
  </div>
);

export default Insight;
