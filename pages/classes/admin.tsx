import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Layout from "../../components/Layout";
import SEO from "../../components/shared/SEO";
import AddEditClassModal from "../../components/classes/AddEditClassModal";
import ClassInstancesTable from "../../components/classes/ClassInstancesTable";
import ClassCompletionModal from "../../components/admin/ClassCompletionModal";
import PackageEditModal from "../../components/admin/PackageEditModal";
import AnalyticsTabs from "../../components/admin/AnalyticsTabsNew";
import {
  FaPlus,
  FaUsers,
  FaCalendarAlt,
  FaDollarSign,
  FaChartLine,
  FaEdit,
  FaTrash,
  FaCopy,
  FaEye,
  FaUserPlus,
  FaUserMinus,
  FaExclamationTriangle,
  FaClock,
  FaMapMarkerAlt,
  FaRedoAlt,
  FaCalendarWeek,
  FaCheck,
  FaHashtag,
} from "react-icons/fa";

interface RecurringTemplate {
  id: string;
  title: string;
  description: string;
  instructor: string;
  class_type: string;
  difficulty_level: string;
  location: string;
  duration_minutes: number;
  max_participants: number;
  price_per_session: number;
  credits_required: number;
  equipment_needed: string;
  prerequisites: string;
  class_goals: string;
  intensity_level: number;
  waitlist_enabled: boolean;
  waitlist_capacity: number;
  auto_confirm_booking: boolean;
  cancellation_deadline_hours: number;
  safety_requirements: string;
  age_restrictions: string;
  modifications_available: string;
  is_active: boolean;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  recurring_days: string[];
  created_at: string;
  updated_at: string;
}

// Template Card Component
const TemplateCard = ({
  template,
  onRefresh,
  onEdit,
}: {
  template: RecurringTemplate;
  onRefresh: () => void;
  onEdit: (template: RecurringTemplate) => void;
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteTemplate = async () => {
    try {
      const response = await fetch("/api/admin/recurring-classes", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: template.id,
          deleteFutureClasses: true, // Delete the template and all future instances
        }),
      });

      if (response.ok) {
        onRefresh();
        alert("Recurring template and all future classes deleted successfully");
      } else {
        alert("Failed to delete recurring template");
      }
    } catch (error) {
      console.error("Error deleting template:", error);
      alert("Error deleting recurring template");
    }
  };

  const formatDays = (days: string[]) => {
    return days
      .map((day) => day.charAt(0).toUpperCase() + day.slice(1))
      .join(", ");
  };

  return (
    <div className="bg-slate-900 rounded-lg p-6 border border-slate-700">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h4 className="text-lg font-semibold text-white mb-2">
            {template.title}
          </h4>
          <p className="text-slate-300 mb-3">{template.description}</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-slate-400">Instructor:</span>
              <p className="text-white">{template.instructor}</p>
            </div>
            <div>
              <span className="text-slate-400">Type:</span>
              <p className="text-white">{template.class_type}</p>
            </div>
            <div>
              <span className="text-slate-400">Time:</span>
              <div className="text-white">
                {(template as any).daily_schedule &&
                Object.keys((template as any).daily_schedule).length > 0 ? (
                  <div className="space-y-1">
                    {Object.entries((template as any).daily_schedule).map(
                      ([day, schedule]: [string, any]) => (
                        <div key={day} className="text-xs">
                          <span className="capitalize">{day}:</span>{" "}
                          {schedule.start_time} - {schedule.end_time}
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <p>
                    {template.start_time} - {template.end_time}
                  </p>
                )}
              </div>
            </div>
            <div>
              <span className="text-slate-400">Days:</span>
              <p className="text-white">
                {formatDays(template.recurring_days)}
              </p>
            </div>
            <div>
              <span className="text-slate-400">Location:</span>
              <p className="text-white">{template.location}</p>
            </div>
            <div>
              <span className="text-slate-400">Capacity:</span>
              <p className="text-white">{template.max_participants} people</p>
            </div>
            <div>
              <span className="text-slate-400">Price:</span>
              <p className="text-white">${template.price_per_session}</p>
            </div>
            <div>
              <span className="text-slate-400">Duration:</span>
              <p className="text-white">{template.duration_minutes} min</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              <FaRedoAlt className="w-3 h-3 mr-1" />
              Recurring Template
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {template.difficulty_level}
            </span>
            {template.is_active && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                Active
              </span>
            )}
          </div>
        </div>

        <div className="flex space-x-2 ml-4">
          <button
            onClick={() => onEdit(template)}
            className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition-colors"
            title="Edit Template"
          >
            <FaEdit className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
            title="Delete Template & Future Classes"
          >
            <FaTrash className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">
              Delete Recurring Template?
            </h3>
            <p className="text-slate-300 mb-6">
              This will delete the recurring template "{template.title}" and all
              future class instances. Past and current classes will remain
              unchanged.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 text-slate-300 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleDeleteTemplate();
                  setShowDeleteConfirm(false);
                }}
                className="flex-1 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface Class {
  id?: string;
  title: string;
  description: string;
  instructor: string;
  date: string;
  start_time: string;
  end_time: string;
  max_participants: number;
  current_participants?: number;
  location: string;
  class_type: string;
  difficulty_level?: string;
  equipment_needed?: string;
  price_per_session?: number;
  credits_required?: number;
  duration_minutes?: number;
  prerequisites?: string;
  class_goals?: string;
  intensity_level?: number;
  waitlist_enabled?: boolean;
  waitlist_capacity?: number;
  auto_confirm_booking?: boolean;
  cancellation_deadline_hours?: number;
  safety_requirements?: string;
  age_restrictions?: string;
  modifications_available?: string;
  is_active: boolean;
  // Recurring class fields
  is_recurring?: boolean;
  recurring_days?: string[];
  recurring_start_date?: string;
  recurring_end_date?: string;
  parent_recurring_id?: string;
  daily_schedule?: {
    [day: string]: {
      start_time: string;
      end_time: string;
    };
  };
}

interface Package {
  id: string;
  name: string;
  description: string;
  sessions_included: number;
  price: number;
  duration_days: number;
  is_active: boolean;
}

interface DashboardStats {
  totalClasses: number;
  upcomingClasses: number;
  totalParticipants: number;
  monthlyRevenue: number;
  averageCapacity: number;
  waitlistTotal: number;
  completedClasses: number;
}

export default function ClassesAdmin() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [completedClasses, setCompletedClasses] = useState<Class[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalClasses: 0,
    upcomingClasses: 0,
    totalParticipants: 0,
    monthlyRevenue: 0,
    averageCapacity: 0,
    waitlistTotal: 0,
    completedClasses: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "overview" | "classes" | "packages" | "analytics"
  >("overview");
  const [viewMode, setViewMode] = useState<
    "instances" | "templates" | "completed"
  >("instances");
  const [recurringTemplates, setRecurringTemplates] = useState<
    RecurringTemplate[]
  >([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [showAddClass, setShowAddClass] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [editingTemplate, setEditingTemplate] =
    useState<RecurringTemplate | null>(null);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [showClassCompletion, setShowClassCompletion] = useState(false);
  const [completionClassId, setCompletionClassId] = useState<string | null>(
    null
  );

  // Debug state changes
  useEffect(() => {
    console.log("showAddClass changed to:", showAddClass);
  }, [showAddClass]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        // Fetch packages if in packages tab
        if (activeTab === "packages") {
          const packageResponse = await fetch("/api/packages");
          const packageData = await packageResponse.json();
          if (packageData.success) {
            setPackages(packageData.data);
          }
        }

        // Fetch classes based on view mode
        if (viewMode === "completed") {
          // Fetch completed classes
          const completedResponse = await fetch("/api/classes?completed=true");
          const completedData = await completedResponse.json();
          if (completedData.success) {
            setCompletedClasses(completedData.data);
          }
        } else {
          // Fetch active classes
          const classResponse = await fetch("/api/classes");
          const classData = await classResponse.json();
          if (classData.success) {
            setClasses(classData.data);
          }
        }

        // Fetch templates if in template mode
        if (viewMode === "templates") {
          const templateResponse = await fetch("/api/admin/recurring-classes");
          const templateData = await templateResponse.json();
          if (templateData.success) {
            setRecurringTemplates(templateData.data);
          }
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [viewMode, activeTab]);

  // Calculate stats whenever classes or completed classes data changes
  useEffect(() => {
    if (classes.length > 0 || completedClasses.length > 0) {
      const today = new Date();
      const upcoming = classes.filter(
        (cls: Class) => new Date(cls.date) >= today
      );
      const totalParticipants = classes.reduce(
        (sum: number, cls: Class) => sum + (cls.current_participants || 0),
        0
      );
      const totalRevenue = classes.reduce(
        (sum: number, cls: Class) =>
          sum + (cls.current_participants || 0) * (cls.price_per_session || 0),
        0
      );
      const avgCapacity =
        classes.length > 0
          ? (totalParticipants /
              classes.reduce(
                (sum: number, cls: Class) => sum + cls.max_participants,
                0
              )) *
            100
          : 0;

      setStats({
        totalClasses: classes.length,
        upcomingClasses: upcoming.length,
        totalParticipants,
        monthlyRevenue: totalRevenue,
        averageCapacity: Math.round(avgCapacity),
        waitlistTotal: 0,
        completedClasses: completedClasses.length,
      });
    }
  }, [classes, completedClasses]);

  // Simple refresh functions for manual updates
  const fetchClasses = async () => {
    try {
      const response = await fetch("/api/classes");
      const data = await response.json();
      if (data.success) {
        setClasses(data.data);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  const fetchRecurringTemplates = async () => {
    try {
      const response = await fetch("/api/admin/recurring-classes");
      const data = await response.json();
      if (data.success) {
        setRecurringTemplates(data.data);
      }
    } catch (error) {
      console.error("Error fetching recurring templates:", error);
    }
  };

  const fetchCompletedClasses = async () => {
    try {
      const response = await fetch("/api/classes?completed=true");
      const data = await response.json();
      if (data.success) {
        setCompletedClasses(data.data);
      }
    } catch (error) {
      console.error("Error fetching completed classes:", error);
    }
  };

  const fetchPackages = async () => {
    try {
      const response = await fetch("/api/packages");
      const data = await response.json();
      if (data.success) {
        setPackages(data.data);
      }
    } catch (error) {
      console.error("Error fetching packages:", error);
    }
  };

  const handleDeleteClass = async (classId: string | undefined) => {
    if (!classId) return;

    if (
      window.confirm(
        "Are you sure you want to cancel this class? This action cannot be undone."
      )
    ) {
      try {
        const response = await fetch(`/api/admin/classes?id=${classId}`, {
          method: "DELETE",
        });

        const data = await response.json();

        if (data.success) {
          await fetchClasses(); // Refresh data
        } else {
          alert("Failed to cancel class: " + data.error);
        }
      } catch (error) {
        console.error("Error deleting class:", error);
        alert("Failed to cancel class");
      }
    }
  };

  const handleEditTemplate = (template: RecurringTemplate) => {
    // Convert RecurringTemplate to Class format for the modal
    const classData: Class = {
      id: template.id,
      title: template.title,
      description: template.description,
      instructor: template.instructor,
      date: template.start_date,
      start_time: template.start_time,
      end_time: template.end_time,
      max_participants: template.max_participants,
      location: template.location,
      class_type: template.class_type,
      difficulty_level: template.difficulty_level,
      equipment_needed: template.equipment_needed,
      price_per_session: template.price_per_session,
      credits_required: template.credits_required,
      duration_minutes: template.duration_minutes,
      prerequisites: template.prerequisites,
      class_goals: template.class_goals,
      intensity_level: template.intensity_level,
      waitlist_enabled: template.waitlist_enabled,
      waitlist_capacity: template.waitlist_capacity,
      auto_confirm_booking: template.auto_confirm_booking,
      cancellation_deadline_hours: template.cancellation_deadline_hours,
      safety_requirements: template.safety_requirements,
      age_restrictions: template.age_restrictions,
      modifications_available: template.modifications_available,
      is_active: template.is_active,
      is_recurring: true,
      recurring_days: template.recurring_days,
      recurring_start_date: template.start_date,
      recurring_end_date: template.end_date,
    };

    setEditingTemplate(template);
    setSelectedClass(classData);
    setShowAddClass(true);
  };

  const handleSaveClass = async (classData: Class) => {
    try {
      const isEditing = !!classData.id;

      console.log("💾 handleSaveClass called with:", {
        isEditing,
        isRecurring: classData.is_recurring,
        hasEditingTemplate: !!editingTemplate,
        classId: classData.id,
        templateId: editingTemplate?.id,
      });

      // For recurring classes
      if (classData.is_recurring) {
        if (editingTemplate) {
          // Editing an existing recurring template
          console.log("📝 Editing recurring template:", editingTemplate.id);
          console.log(
            "⏰ New times:",
            classData.start_time,
            "to",
            classData.end_time
          );
          console.log(
            "📅 Daily schedule:",
            JSON.stringify(classData.daily_schedule, null, 2)
          );

          console.log(
            "🚀 Making PUT request to /api/admin/recurring-classes with ID:",
            editingTemplate.id
          );

          console.log("🔍 Available classData fields:", Object.keys(classData));
          console.log("📅 Looking for date fields:", {
            date: classData.date,
            recurring_start_date: (classData as any).recurring_start_date,
            recurring_end_date: (classData as any).recurring_end_date,
          });

          const response = await fetch("/api/admin/recurring-classes", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              id: editingTemplate.id,
              title: classData.title,
              description: classData.description,
              instructor: classData.instructor,
              class_type: classData.class_type,
              difficulty_level: classData.difficulty_level,
              location: classData.location,
              duration_minutes: classData.duration_minutes,
              max_participants: classData.max_participants,
              price_per_session: classData.price_per_session,
              credits_required: classData.credits_required,
              equipment_needed: classData.equipment_needed,
              prerequisites: classData.prerequisites,
              class_goals: classData.class_goals,
              intensity_level: classData.intensity_level,
              waitlist_enabled: classData.waitlist_enabled,
              waitlist_capacity: classData.waitlist_capacity,
              auto_confirm_booking: classData.auto_confirm_booking,
              cancellation_deadline_hours:
                classData.cancellation_deadline_hours,
              safety_requirements: classData.safety_requirements,
              age_restrictions: classData.age_restrictions,
              modifications_available: classData.modifications_available,
              is_active: classData.is_active,
              start_date: (classData as any).start_date,
              end_date: (classData as any).end_date,
              daily_schedule: classData.daily_schedule,
              start_time: classData.start_time, // Keep for backward compatibility
              end_time: classData.end_time, // Keep for backward compatibility
              recurring_days: classData.recurring_days,
              updateFutureClasses: true, // Update all future instances
            }),
          });

          console.log("📡 Response status:", response.status);
          console.log("📡 Response ok:", response.ok);

          if (response.ok) {
            console.log("✅ Template update successful");
            setShowAddClass(false);
            setSelectedClass(null);
            setEditingTemplate(null);
            await fetchRecurringTemplates(); // Refresh templates
            alert("Recurring template updated successfully!");
          } else {
            console.log("❌ Template update failed");
            const data = await response.json();
            console.log("❌ Error response:", data);
            alert("Failed to update recurring template: " + data.error);
            throw new Error(data.error);
          }
          return;
        } else {
          // Creating a new recurring template
          const response = await fetch("/api/admin/recurring-classes", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(classData),
          });

          const data = await response.json();

          if (response.ok) {
            setShowAddClass(false);
            setSelectedClass(null);
            await fetchClasses(); // Refresh data
            alert(
              `Successfully created ${data.classCount} recurring class instances!`
            );
          } else {
            alert("Failed to create recurring classes: " + data.error);
            throw new Error(data.error);
          }
          return;
        }
      }

      // For single classes or editing existing classes
      const url = isEditing
        ? `/api/admin/classes?id=${classData.id}`
        : "/api/admin/classes";

      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(classData),
      });

      const data = await response.json();

      if (data.success) {
        setShowAddClass(false);
        setSelectedClass(null);
        await fetchClasses(); // Refresh data
      } else {
        alert("Failed to save class: " + data.error);
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Error saving class:", error);
      throw error;
    }
  };

  // Participant management functions
  const handleAddParticipant = async (classId: string) => {
    try {
      const response = await fetch(`/api/classes/${classId}/participants`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "add" }),
      });

      if (response.ok) {
        // Refresh the classes data to show updated participant count
        const response = await fetch("/api/classes");
        const data = await response.json();
        if (data.success) {
          setClasses(data.data);
        }
        console.log("✅ Participant added successfully");
      } else {
        const data = await response.json();
        console.error("❌ Failed to add participant:", data.error);
        alert("Failed to add participant: " + data.error);
      }
    } catch (error) {
      console.error("Error adding participant:", error);
      alert("Error adding participant. Please try again.");
    }
  };

  const handleRemoveParticipant = async (classId: string) => {
    try {
      const response = await fetch(`/api/classes/${classId}/participants`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "remove" }),
      });

      if (response.ok) {
        // Refresh the classes data to show updated participant count
        const response = await fetch("/api/classes");
        const data = await response.json();
        if (data.success) {
          setClasses(data.data);
        }
        console.log("✅ Participant removed successfully");
      } else {
        const data = await response.json();
        console.error("❌ Failed to remove participant:", data.error);
        alert("Failed to remove participant: " + data.error);
      }
    } catch (error) {
      console.error("Error removing participant:", error);
      alert("Error removing participant. Please try again.");
    }
  };

  const handleCompleteClass = (classId: string) => {
    setCompletionClassId(classId);
    setShowClassCompletion(true);
  };

  const handleClassCompleted = async () => {
    if (completionClassId) {
      // Find the completed class in the active classes list
      const completedClass = classes.find(
        (cls) => cls.id === completionClassId
      );
      if (completedClass) {
        // Remove from active classes list immediately
        setClasses((prev) =>
          prev.filter((cls) => cls.id !== completionClassId)
        );

        // Switch to completed tab to show the newly completed class
        setViewMode("completed");
      }
    }

    // Refresh both active and completed classes from server to ensure consistency
    try {
      const [activeResponse, completedResponse] = await Promise.all([
        fetch("/api/classes"),
        fetch("/api/classes?completed=true"),
      ]);

      const [activeData, completedData] = await Promise.all([
        activeResponse.json(),
        completedResponse.json(),
      ]);

      if (activeData.success) {
        setClasses(activeData.data);
      }
      if (completedData.success) {
        setCompletedClasses(completedData.data);
      }
    } catch (error) {
      console.error("Error refreshing classes after completion:", error);
    }
  };

  const handleEditClass = async (classData: Class) => {
    try {
      const response = await fetch("/api/classes", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(classData),
      });

      if (!response.ok) {
        throw new Error("Failed to update class");
      }

      const result = await response.json();

      if (result.success) {
        // Update the classes in the local state
        setClasses((prevClasses) =>
          prevClasses.map((cls) =>
            cls.id === classData.id ? result.data : cls
          )
        );

        // Show success message
        alert("Class updated successfully!");
      } else {
        throw new Error(result.error || "Failed to update class");
      }
    } catch (error) {
      console.error("Error updating class:", error);
      alert("Failed to update class. Please try again.");
    }
  };

  // Wrapper function to handle the type compatibility between our Class interface and component expectations
  const handleEditClassWrapper = (classData: any) => {
    handleEditClass(classData);
  };

  const StatCard = ({
    title,
    value,
    icon,
    color,
    change,
  }: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    change?: string;
  }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-slate-800 rounded-xl shadow-lg p-4 sm:p-6 border border-slate-700"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-slate-400 text-xs sm:text-sm font-medium truncate">
            {title}
          </p>
          <p className="text-xl sm:text-2xl font-bold text-white mt-1">
            {value}
          </p>
          {change && (
            <p className="text-green-400 text-xs sm:text-sm mt-1">{change}</p>
          )}
        </div>
        <div className={`p-2 sm:p-3 rounded-lg ${color} flex-shrink-0 ml-2`}>
          <div className="text-sm sm:text-base">{icon}</div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <Layout>
      <SEO
        title="Classes Admin Dashboard - FL Best Trainer"
        description="Manage fitness classes, participants, and schedules"
      />

      <div className="min-h-screen bg-slate-900 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          {/* Mobile-Enhanced Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  Classes Admin
                </h1>
                <p className="text-slate-300 mt-1 text-sm sm:text-base">
                  Manage your fitness classes and participants
                </p>
              </div>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    window.location.href = "/admin/clients";
                  }}
                  className="bg-green-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium flex items-center justify-center space-x-2 hover:bg-green-700 transition-colors shadow-lg text-sm sm:text-base"
                >
                  <FaUsers />
                  <span>Clients</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    console.log(
                      "Add New Class button clicked! Current tab:",
                      activeTab,
                      "View mode:",
                      viewMode
                    );
                    setShowAddClass(true);
                  }}
                  className="bg-blue-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium flex items-center justify-center space-x-2 hover:bg-blue-700 transition-colors shadow-lg text-sm sm:text-base"
                >
                  <FaPlus />
                  <span className="hidden sm:inline">Add New Class</span>
                  <span className="sm:hidden">Add Class</span>
                </motion.button>
              </div>
            </div>
          </div>

          {/* Mobile-Enhanced Navigation Tabs */}
          <div className="border-b border-slate-700 mb-6 sm:mb-8">
            <nav className="-mb-px flex overflow-x-auto scrollbar-hide">
              {[
                {
                  id: "overview",
                  name: "Overview",
                  icon: FaChartLine,
                  shortName: "Stats",
                },
                {
                  id: "classes",
                  name: "Manage Classes",
                  icon: FaCalendarAlt,
                  shortName: "Classes",
                },
                {
                  id: "packages",
                  name: "Packages",
                  icon: FaDollarSign,
                  shortName: "Packages",
                },
                {
                  id: "analytics",
                  name: "Analytics",
                  icon: FaChartLine,
                  shortName: "Reports",
                },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-3 sm:py-4 px-3 sm:px-4 border-b-2 font-medium text-sm flex items-center space-x-2 flex-shrink-0 min-w-[80px] sm:min-w-0 justify-center sm:justify-start ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-400"
                        : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-600"
                    }`}
                  >
                    <Icon className="text-base sm:text-sm" />
                    <span className="hidden sm:inline">{tab.name}</span>
                    <span className="sm:hidden text-xs">{tab.shortName}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              {/* Stats Grid - Mobile Optimized */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <StatCard
                  title="Total Classes"
                  value={stats.totalClasses}
                  icon={<FaCalendarAlt className="text-white" />}
                  color="bg-blue-500"
                  change="+12% this month"
                />
                <StatCard
                  title="Completed Classes"
                  value={stats.completedClasses}
                  icon={<FaCheck className="text-white" />}
                  color="bg-emerald-500"
                />
                <StatCard
                  title="Upcoming Classes"
                  value={stats.upcomingClasses}
                  icon={<FaClock className="text-white" />}
                  color="bg-green-500"
                />
                <StatCard
                  title="Total Participants"
                  value={stats.totalParticipants}
                  icon={<FaUsers className="text-white" />}
                  color="bg-purple-500"
                  change="+8% this week"
                />
                <StatCard
                  title="Monthly Revenue"
                  value={`$${stats.monthlyRevenue.toFixed(2)}`}
                  icon={<FaDollarSign className="text-white" />}
                  color="bg-yellow-500"
                  change="+15% vs last month"
                />
                <StatCard
                  title="Average Capacity"
                  value={`${stats.averageCapacity}%`}
                  icon={<FaChartLine className="text-white" />}
                  color="bg-indigo-500"
                />
                <StatCard
                  title="Waitlist Total"
                  value={stats.waitlistTotal}
                  icon={<FaExclamationTriangle className="text-white" />}
                  color="bg-red-500"
                />
              </div>

              {/* Quick Actions - Mobile Optimized */}
              <div className="bg-slate-800 rounded-xl shadow-lg p-4 sm:p-6 border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Quick Actions
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <button
                    onClick={() => setShowAddClass(true)}
                    className="flex items-center space-x-2 sm:space-x-3 p-3 sm:p-4 border border-slate-600 rounded-lg hover:bg-slate-700 transition-colors touch-manipulation"
                  >
                    <FaPlus className="text-blue-400 text-sm sm:text-base" />
                    <span className="font-medium text-white text-sm sm:text-base">
                      Add Class
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedClass({
                        title:
                          "Intro Weight Lifting – Exclusive 4-Person Training",
                        description:
                          "Perfect introduction to weight lifting in a small group setting.",
                        instructor: "Gavin Stanifer",
                        date: "",
                        start_time: "18:00",
                        end_time: "19:00",
                        max_participants: 4,
                        location: "FL Best Trainer Studio",
                        class_type: "Strength Training",
                        difficulty_level: "Beginner",
                        equipment_needed:
                          "Dumbbells, barbells, weight plates, bench, squat rack",
                        price_per_session: 35.0,
                        credits_required: 1,
                        duration_minutes: 60,
                        is_active: true,
                        is_recurring: true,
                        recurring_days: [],
                        recurring_start_date: new Date()
                          .toISOString()
                          .split("T")[0],
                      });
                      setShowAddClass(true);
                    }}
                    className="flex items-center space-x-2 sm:space-x-3 p-3 sm:p-4 border border-slate-600 rounded-lg hover:bg-slate-700 transition-colors touch-manipulation"
                  >
                    <FaRedoAlt className="text-purple-400 text-sm sm:text-base" />
                    <span className="font-medium text-white text-sm sm:text-base">
                      Create Recurring
                    </span>
                  </button>
                  <button className="flex items-center space-x-2 sm:space-x-3 p-3 sm:p-4 border border-slate-600 rounded-lg hover:bg-slate-700 transition-colors touch-manipulation">
                    <FaUsers className="text-green-400 text-sm sm:text-base" />
                    <span className="font-medium text-white text-sm sm:text-base">
                      Manage Participants
                    </span>
                  </button>
                  <button className="flex items-center space-x-2 sm:space-x-3 p-3 sm:p-4 border border-slate-600 rounded-lg hover:bg-slate-700 transition-colors touch-manipulation">
                    <FaChartLine className="text-orange-400 text-sm sm:text-base" />
                    <span className="font-medium text-white text-sm sm:text-base">
                      View Reports
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Classes Management Tab */}
          {activeTab === "classes" && (
            <div className="bg-slate-800 rounded-xl shadow-lg overflow-hidden border border-slate-700">
              <div className="px-6 py-4 border-b border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      Class Management
                    </h3>
                    <p className="text-sm text-slate-400">
                      View, edit, and manage all your classes
                    </p>
                  </div>

                  {/* View Mode Toggle */}
                  <div className="flex bg-slate-700 rounded-lg p-1 w-full sm:w-auto">
                    <button
                      onClick={() => setViewMode("instances")}
                      className={`flex-1 sm:flex-none px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors touch-manipulation ${
                        viewMode === "instances"
                          ? "bg-blue-600 text-white"
                          : "text-slate-300 hover:text-white hover:bg-slate-600"
                      }`}
                    >
                      <FaCalendarAlt className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 inline" />
                      <span className="hidden sm:inline">Class </span>Instances
                    </button>
                    <button
                      onClick={() => setViewMode("completed")}
                      className={`flex-1 sm:flex-none px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors touch-manipulation ${
                        viewMode === "completed"
                          ? "bg-blue-600 text-white"
                          : "text-slate-300 hover:text-white hover:bg-slate-600"
                      }`}
                    >
                      <FaCheck className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 inline" />
                      <span className="hidden sm:inline">Completed </span>
                      Classes
                    </button>
                    <button
                      onClick={() => setViewMode("templates")}
                      className={`flex-1 sm:flex-none px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors touch-manipulation ${
                        viewMode === "templates"
                          ? "bg-blue-600 text-white"
                          : "text-slate-300 hover:text-white hover:bg-slate-600"
                      }`}
                    >
                      <FaRedoAlt className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 inline" />
                      <span className="hidden sm:inline">Recurring </span>
                      Templates
                    </button>
                  </div>
                </div>
              </div>

              {/* Class Instances View */}
              {viewMode === "instances" && (
                <ClassInstancesTable
                  classes={classes}
                  isLoading={isLoading}
                  onEditClass={handleEditClassWrapper}
                  onDeleteClass={handleDeleteClass}
                  onAddParticipant={handleAddParticipant}
                  onRemoveParticipant={handleRemoveParticipant}
                  onRefreshClasses={fetchClasses}
                  onCompleteClass={handleCompleteClass}
                />
              )}

              {/* Completed Classes View */}
              {viewMode === "completed" && (
                <ClassInstancesTable
                  classes={completedClasses}
                  isLoading={isLoading}
                  onEditClass={() => {}} // Completed classes can't be edited
                  onDeleteClass={() => {}} // Completed classes can't be deleted
                  onAddParticipant={() => {}} // Can't modify participants on completed classes
                  onRemoveParticipant={() => {}} // Can't modify participants on completed classes
                  onRefreshClasses={() => {}} // No need to refresh completed classes
                  onCompleteClass={undefined} // Already completed
                />
              )}

              {/* Recurring Templates View */}
              {viewMode === "templates" && (
                <div className="space-y-4 p-6">
                  {isLoading ? (
                    <div className="text-center text-slate-400 py-12">
                      Loading recurring templates...
                    </div>
                  ) : recurringTemplates.length === 0 ? (
                    <div className="text-center text-slate-400 py-12">
                      No recurring templates found. Create your first recurring
                      class to get started.
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {recurringTemplates.map((template) => (
                        <TemplateCard
                          key={template.id}
                          template={template}
                          onRefresh={fetchRecurringTemplates}
                          onEdit={handleEditTemplate}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Packages Management Tab */}
          {activeTab === "packages" && (
            <div className="space-y-6">
              <div className="bg-slate-800 rounded-xl shadow-lg overflow-hidden border border-slate-700">
                <div className="px-6 py-4 border-b border-slate-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        Package Management
                      </h3>
                      <p className="text-sm text-slate-400">
                        Manage pricing and details for all training packages
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {packages.map((pkg) => (
                        <motion.div
                          key={pkg.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-slate-900 rounded-lg p-6 border border-slate-700 hover:border-slate-600 transition-colors"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <h4 className="text-lg font-semibold text-white mb-2">
                                {pkg.name}
                              </h4>
                              <p className="text-slate-300 text-sm mb-3">
                                {pkg.description}
                              </p>
                            </div>
                            <button
                              onClick={() => setEditingPackage(pkg)}
                              className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition-colors ml-2"
                              title="Edit Package"
                            >
                              <FaEdit className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-slate-400 text-sm flex items-center">
                                <FaDollarSign className="w-3 h-3 mr-1" />
                                Price:
                              </span>
                              <span className="text-green-400 font-semibold">
                                ${pkg.price}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-slate-400 text-sm flex items-center">
                                <FaHashtag className="w-3 h-3 mr-1" />
                                Sessions:
                              </span>
                              <span className="text-white">
                                {pkg.sessions_included}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-slate-400 text-sm">
                                Per Session:
                              </span>
                              <span className="text-slate-300">
                                $
                                {(pkg.price / pkg.sessions_included).toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-slate-400 text-sm">
                                Valid for:
                              </span>
                              <span className="text-white">Never expires</span>
                            </div>
                          </div>

                          <div className="mt-4 pt-4 border-t border-slate-700">
                            <div className="flex items-center justify-between">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  pkg.is_active
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {pkg.is_active ? "Active" : "Inactive"}
                              </span>
                              <button
                                onClick={() => setEditingPackage(pkg)}
                                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                              >
                                Edit Package →
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === "analytics" && (
            <div className="space-y-8">
              <AnalyticsTabs />
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Class Modal */}
      <AddEditClassModal
        isOpen={showAddClass}
        onClose={() => {
          setShowAddClass(false);
          setSelectedClass(null);
          setEditingTemplate(null);
        }}
        onSave={handleSaveClass}
        onSaveRecurring={handleSaveClass as any}
        editingClass={selectedClass as any}
        editingRecurringTemplate={editingTemplate}
        mode={editingTemplate ? "recurring" : "class"}
      />

      {/* Class Completion Modal */}
      <ClassCompletionModal
        isOpen={showClassCompletion}
        onClose={() => {
          setShowClassCompletion(false);
          setCompletionClassId(null);
        }}
        classId={completionClassId || ""}
        onClassCompleted={handleClassCompleted}
      />

      {/* Package Edit Modal */}
      {editingPackage && (
        <PackageEditModal
          package={editingPackage}
          isOpen={!!editingPackage}
          onClose={() => setEditingPackage(null)}
          onSuccess={fetchPackages}
        />
      )}
    </Layout>
  );
}
