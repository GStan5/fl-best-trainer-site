import Header from "./Header";
import Footer from "./Footer";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-[#1A1A1A]">
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
