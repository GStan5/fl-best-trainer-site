import Link from 'next/link';

export default function Custom404() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 text-center px-4">
      <h1 className="text-5xl font-bold text-blue-900 mb-4">404</h1>
      <p className="text-gray-600 mb-6">Oops! That page doesn't exist.</p>
      <Link href="/" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Back to Home</Link>
    </div>
  );
}