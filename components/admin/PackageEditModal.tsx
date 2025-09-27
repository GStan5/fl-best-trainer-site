import { useState } from "react";
import { motion } from "framer-motion";
import { FaTimes, FaSave, FaDollarSign, FaHashtag } from "react-icons/fa";

interface Package {
  id: string;
  name: string;
  description: string;
  sessions_included: number;
  price: number;
  duration_days: number;
  is_active: boolean;
}

interface PackageEditModalProps {
  package: Package;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PackageEditModal({
  package: packageData,
  isOpen,
  onClose,
  onSuccess,
}: PackageEditModalProps) {
  const [formData, setFormData] = useState({
    name: packageData.name,
    description: packageData.description,
    sessions_included: packageData.sessions_included,
    price: packageData.price,
    duration_days: packageData.duration_days,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/packages", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: packageData.id,
          ...formData,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        setError(data.error || "Failed to update package");
      }
    } catch (error) {
      console.error("Error updating package:", error);
      setError("Network error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "price" ||
        name === "sessions_included" ||
        name === "duration_days"
          ? parseFloat(value) || 0
          : value,
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-slate-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Edit Package</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-2"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Package Name */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Package Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 10-Class Weightlifting Package"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Package description..."
            />
          </div>

          {/* Price and Sessions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <FaDollarSign className="w-4 h-4 inline mr-1" />
                Price *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="400.00"
              />
            </div>

            {/* Sessions Included */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <FaHashtag className="w-4 h-4 inline mr-1" />
                Sessions Included *
              </label>
              <input
                type="number"
                name="sessions_included"
                value={formData.sessions_included}
                onChange={handleInputChange}
                required
                min="1"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="10"
              />
            </div>
          </div>

          {/* Duration Days */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Duration (Days)
            </label>
            <input
              type="number"
              name="duration_days"
              value={formData.duration_days}
              onChange={handleInputChange}
              min="1"
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="30"
            />
            <p className="text-sm text-slate-400 mt-1">
              Note: Packages never expire. This field is for display purposes
              only.
            </p>
          </div>

          {/* Package Preview */}
          <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
            <h3 className="text-sm font-medium text-slate-300 mb-3">Preview</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Package:</span>
                <span className="text-white">{formData.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Price:</span>
                <span className="text-green-400 font-medium">
                  ${formData.price}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Sessions:</span>
                <span className="text-white">{formData.sessions_included}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Per Session:</span>
                <span className="text-slate-300">
                  ${(formData.price / formData.sessions_included).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Valid for:</span>
                <span className="text-green-400 font-medium">
                  Never expires
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 text-slate-300 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <FaSave className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
