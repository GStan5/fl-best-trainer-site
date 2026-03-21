import React from "react";

const Card: React.FC<{
  title: string;
  children: React.ReactNode;
  className?: string;
}> = ({ title, children, className = "" }) => (
  <div className={`bg-gray-800 rounded-xl p-5 ${className}`}>
    <h4 className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-4">{title}</h4>
    {children}
  </div>
);

export default Card;
