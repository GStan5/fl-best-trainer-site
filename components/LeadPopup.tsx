import { useEffect, useState } from 'react';

export default function LeadPopup() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 5000); // show after 5 seconds
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
      <div className="bg-white p-6 rounded shadow max-w-sm w-full relative text-center">
        <button className="absolute top-2 right-2 text-gray-400" onClick={() => setVisible(false)}>✕</button>
        <h2 className="text-lg font-bold text-blue-800">Let’s Get You Moving</h2>
        <p className="text-sm text-gray-700 mt-2">Book your first session or ask a question — no pressure!</p>
        <a href="/booking" className="mt-4 inline-block bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition">Book Now</a>
      </div>
    </div>
  );
}
