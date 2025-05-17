export default function ContactForm() {
  return (
    <form className="max-w-xl mx-auto bg-white p-6 rounded shadow space-y-4">
      <div>
        <label className="block text-sm font-medium">Name</label>
        <input type="text" className="w-full border border-gray-300 p-2 rounded mt-1" required />
      </div>
      <div>
        <label className="block text-sm font-medium">Email</label>
        <input type="email" className="w-full border border-gray-300 p-2 rounded mt-1" required />
      </div>
      <div>
        <label className="block text-sm font-medium">Message</label>
        <textarea rows={4} className="w-full border border-gray-300 p-2 rounded mt-1" required></textarea>
      </div>
      <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition">Send Message</button>
    </form>
  );
}
