import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RecurringTemplate } from "@/types";
import {
  FaEdit,
  FaTrash,
  FaCalendarAlt,
  FaClock,
  FaUsers,
  FaMapMarkerAlt,
  FaDollarSign,
  FaPlus,
  FaExclamationTriangle,
} from "react-icons/fa";

interface RecurringClassManagerProps {
  onEdit: (template: RecurringTemplate) => void;
  onCreateNew: () => void;
}

export default function RecurringClassManager({
  onEdit,
  onCreateNew,
}: RecurringClassManagerProps) {
  const [templates, setTemplates] = useState<RecurringTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null
  );
  const [deleteFutureClasses, setDeleteFutureClasses] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/recurring-classes");
      const data = await response.json();

      if (data.success) {
        setTemplates(data.data);
      } else {
        console.error("Failed to fetch templates:", data.error);
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      const response = await fetch("/api/admin/recurring-classes", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          deleteFutureClasses,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setTemplates(templates.filter((t) => t.id !== id));
        setShowDeleteConfirm(null);
        setDeleteFutureClasses(false);
      } else {
        console.error("Failed to delete template:", data.error);
        alert("Failed to delete recurring class template");
      }
    } catch (error) {
      console.error("Error deleting template:", error);
      alert("Error deleting recurring class template");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDays = (days: string[]) => {
    const dayNames = {
      sunday: "Sun",
      monday: "Mon",
      tuesday: "Tue",
      wednesday: "Wed",
      thursday: "Thu",
      friday: "Fri",
      saturday: "Sat",
    };
    return days.map((day) => dayNames[day as keyof typeof dayNames]).join(", ");
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FaCalendarAlt className="mr-3 text-xl" />
            <h2 className="text-2xl font-bold">Recurring Class Templates</h2>
          </div>
          <button
            onClick={onCreateNew}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
          >
            <FaPlus className="mr-2" />
            Create New
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {templates.length === 0 ? (
          <div className="text-center py-12">
            <FaCalendarAlt className="mx-auto text-6xl text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No Recurring Classes
            </h3>
            <p className="text-gray-500 mb-6">
              Create your first recurring class template to get started.
            </p>
            <button
              onClick={onCreateNew}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all flex items-center mx-auto"
            >
              <FaPlus className="mr-2" />
              Create Recurring Class
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {templates.map((template) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="text-xl font-semibold text-gray-900 mr-3">
                        {template.title}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          template.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {template.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <p className="text-gray-600 mb-4">{template.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center text-gray-700">
                        <FaUsers className="mr-2 text-blue-500" />
                        <span>
                          {template.instructor} • {template.class_type}
                        </span>
                      </div>

                      <div className="flex items-center text-gray-700">
                        <FaCalendarAlt className="mr-2 text-green-500" />
                        <span>{formatDays(template.recurring_days)}</span>
                      </div>

                      <div className="flex items-center text-gray-700">
                        <FaClock className="mr-2 text-orange-500" />
                        <span>
                          {formatTime(template.start_time)} -{" "}
                          {formatTime(template.end_time)}
                        </span>
                      </div>

                      <div className="flex items-center text-gray-700">
                        <FaMapMarkerAlt className="mr-2 text-red-500" />
                        <span>{template.location}</span>
                      </div>

                      <div className="flex items-center text-gray-700">
                        <FaDollarSign className="mr-2 text-green-600" />
                        <span>${template.price_per_session}</span>
                      </div>

                      <div className="flex items-center text-gray-700">
                        <FaUsers className="mr-2 text-purple-500" />
                        <span>
                          Max {template.max_participants} participants
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 text-sm text-gray-500">
                      <span>
                        Active from{" "}
                        {new Date(template.start_date).toLocaleDateString()}
                        {template.end_date &&
                          ` to ${new Date(
                            template.end_date
                          ).toLocaleDateString()}`}
                      </span>
                    </div>
                  </div>

                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => onEdit(template)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Template"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() =>
                        template.id && setShowDeleteConfirm(template.id)
                      }
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Template"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[10000]"
            onClick={() => setShowDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center mb-4">
                <FaExclamationTriangle className="text-red-500 text-2xl mr-3" />
                <h3 className="text-xl font-bold text-gray-900">
                  Delete Recurring Class
                </h3>
              </div>

              <p className="text-gray-600 mb-4">
                Are you sure you want to delete this recurring class template?
                This action cannot be undone.
              </p>

              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={deleteFutureClasses}
                    onChange={(e) => setDeleteFutureClasses(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">
                    Also delete all future individual class instances
                  </span>
                </label>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  disabled={deletingId === showDeleteConfirm}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {deletingId === showDeleteConfirm ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
