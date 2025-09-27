import { useState, useEffect } from "react";

interface Package {
  id: string;
  name: string;
  description: string;
  sessions_included: number;
  price: number;
  duration_days: number;
  is_active: boolean;
}

export function usePackages() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/packages");
      const data = await response.json();

      if (data.success) {
        setPackages(data.data);
      } else {
        setError(data.error || "Failed to fetch packages");
      }
    } catch (err) {
      setError("Network error occurred");
      console.error("Error fetching packages:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  return { packages, loading, error, refetch: fetchPackages };
}

// Helper function to get the weightlifting package
export function useWeightliftingPackage() {
  const { packages, loading, error } = usePackages();

  const weightliftingPackage = packages.find(
    (pkg) =>
      pkg.sessions_included === 10 &&
      pkg.name.toLowerCase().includes("weightlifting")
  );

  return {
    package: weightliftingPackage,
    loading,
    error,
  };
}
