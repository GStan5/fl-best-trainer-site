import React, { useState, useEffect } from "react";
import { AnalyticsData } from "./analytics/types";
import OverviewTab from "./analytics/tabs/OverviewTab";
import ClassesTab from "./analytics/tabs/ClassesTab";
import ClientsTab from "./analytics/tabs/ClientsTab";
import RevenueTab from "./analytics/tabs/RevenueTab";

type TabId = "overview" | "classes" | "clients" | "revenue";

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "overview", label: "Overview", icon: "📊" },
  { id: "classes", label: "Classes", icon: "🏋️" },
  { id: "clients", label: "Clients", icon: "👥" },
  { id: "revenue", label: "Revenue", icon: "💰" },
];

const AnalyticsTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(setData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-xl p-8 animate-pulse">
        <div className="h-7 bg-gray-700 rounded w-48 mx-auto mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-gray-800 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-52 bg-gray-800 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-gray-900 rounded-xl p-12 text-center">
        <div className="text-5xl mb-4">⚠️</div>
        <p className="text-white font-semibold text-lg mb-2">Failed to load analytics</p>
        <p className="text-gray-400 text-sm">{error ?? "Unknown error"}</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-xl p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white">Business Analytics</h2>
        <p className="text-gray-500 text-sm mt-1">Live data from your database</p>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              activeTab === t.id
                ? "bg-red-600 text-white shadow-lg"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
            }`}
          >
            <span>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && <OverviewTab data={data} />}
      {activeTab === "classes" && <ClassesTab data={data} />}
      {activeTab === "clients" && <ClientsTab data={data} />}
      {activeTab === "revenue" && <RevenueTab data={data} />}
    </div>
  );
};

export default AnalyticsTabs;
