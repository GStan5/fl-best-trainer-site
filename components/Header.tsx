import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-blue-900 text-white p-4">
      <nav className="max-w-6xl mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">FL Best Trainer</h1>
        <div className="space-x-4">
          <Link href="/">Home</Link>
          <Link href="/about">About</Link>
          <Link href="/services">Services</Link>
          <Link href="/booking">Booking</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/blog">Blog</Link>
        </div>
      </nav>
    </header>
  );
}
