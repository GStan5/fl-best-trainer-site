import Header from "./Header";
import Footer from "./Footer";
import { useRouter } from "next/router";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();
  const isAdminRoute = router.pathname.includes("/admin");

  return (
    <div className="min-h-screen flex flex-col bg-[#1A1A1A] overflow-x-hidden">
      <Header />
      <main className="flex-1">{children}</main>
      {!isAdminRoute && <Footer />}
    </div>
  );
}
