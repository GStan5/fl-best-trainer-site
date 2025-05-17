export default function Testimonials() {
  return (
    <section className="py-12 bg-gray-50">
      <h2 className="text-2xl text-center font-bold text-blue-900 mb-6">Client Testimonials</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto px-4">
        <div className="bg-white p-6 rounded shadow text-gray-700">
          <p>"Working with Gavin changed everything for me. I feel stronger and more confident at 65 than I did at 45."</p>
          <span className="block mt-4 font-semibold text-blue-700">— Karen S., Bradenton</span>
        </div>
        <div className="bg-white p-6 rounded shadow text-gray-700">
          <p>"Gavin knows exactly how to train older adults safely and effectively. Every session is tailored to me."</p>
          <span className="block mt-4 font-semibold text-blue-700">— Robert T., Anna Maria Island</span>
        </div>
      </div>
    </section>
  );
}