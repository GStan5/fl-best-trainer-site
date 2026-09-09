import Link from "next/link";
import { useRouter } from "next/router";
import {
  FaCalendarAlt,
  FaChartBar,
  FaChartLine,
  FaDollarSign,
  FaUsers,
} from "react-icons/fa";

const adminLinks = [
  {
    href: "/admin?tab=overview",
    tab: "overview",
    label: "Stats",
    icon: FaChartLine,
  },
  {
    href: "/admin?tab=classes",
    tab: "classes",
    label: "Classes",
    icon: FaCalendarAlt,
  },
  {
    href: "/admin/clients",
    tab: "clients",
    label: "Clients",
    icon: FaUsers,
  },
  {
    href: "/admin?tab=packages",
    tab: "packages",
    label: "Packages",
    icon: FaDollarSign,
  },
  {
    href: "/admin?tab=analytics",
    tab: "analytics",
    label: "Reports",
    icon: FaChartBar,
  },
];

function currentAdminTab(pathname: string, queryTab?: string | string[]) {
  if (pathname.includes("/clients")) return "clients";
  if (typeof queryTab === "string") return queryTab;
  return "overview";
}

export default function AdminNav() {
  const router = useRouter();
  const active = currentAdminTab(router.pathname, router.query.tab);

  return (
    <nav
      aria-label="Admin pages"
      className="sticky top-[3.75rem] sm:top-[4.5rem] z-40 -mx-4 sm:-mx-6 lg:-mx-8 mb-6 sm:mb-8 bg-slate-950/95 backdrop-blur-md border-b border-white/10"
    >
      <div className="px-4 sm:px-6 lg:px-8 overflow-x-auto scrollbar-hide">
        <div className="flex min-w-max">
          {adminLinks.map((link) => {
            const Icon = link.icon;
            const isActive = active === link.tab;
            return (
              <Link
                key={link.tab}
                href={link.href}
                className={`flex items-center justify-center gap-2 px-4 py-3 min-h-[48px] text-sm font-medium whitespace-nowrap border-b-2 transition-colors touch-manipulation ${
                  isActive
                    ? "border-royal-light text-white"
                    : "border-transparent text-white/60 hover:text-white hover:border-white/30"
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
