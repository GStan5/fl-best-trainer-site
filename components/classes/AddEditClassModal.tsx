import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaSave, FaCalendarAlt } from "react-icons/fa";
import { Class, RecurringTemplate } from "@/types";

// Import our modular components
import InputField from "../shared/form/InputField";
import TextAreaField from "../shared/form/TextAreaField";
import SelectField from "../shared/form/SelectField";
import CheckboxField from "../shared/form/CheckboxField";
import RecurringClassSettings from "../shared/form/RecurringClassSettings";

interface AddEditClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (classData: Class) => void;
  onSaveRecurring?: (templateData: RecurringTemplate) => void;
  editingClass?: Class | null;
  editingRecurringTemplate?: RecurringTemplate | null;
  isLoading?: boolean;
  mode?: "class" | "recurring";
}

const defaultClass: Class = {
  title: "Intro Weight Lifting – Exclusive 4-Person Training",
  description:
    "Perfect introduction to weight lifting in a small group setting. Learn proper form, basic exercises, and build confidence in the gym.",
  instructor: "Gavin Stanifer, NASM-CPT",
  date: "",
  start_time: "07:30",
  end_time: "08:30",
  max_participants: 4,
  location: "Bayfront Park Recreation Center",
  class_type: "Strength Training",
  difficulty_level: "Beginner",
  equipment_needed: "Dumbbells, barbells, weight plates, bench, squat rack",
  price_per_session: 40.0,
  credits_required: 1,
  duration_minutes: 60,
  prerequisites:
    "No prior weight lifting experience required. Must complete health questionnaire.",
  class_goals:
    "Learn fundamental movement patterns, proper form, basic strength exercises, and gym safety protocols.",
  intensity_level: 4,
  waitlist_enabled: true,
  waitlist_capacity: 2,
  auto_confirm_booking: true,
  cancellation_deadline_hours: 24,
  safety_requirements:
    "Please inform instructor of any injuries or health conditions. Proper athletic wear and closed-toe shoes required.",
  age_restrictions:
    "Ages 16 and up (under 18 requires parent/guardian consent)",
  modifications_available:
    "Exercises can be modified for different fitness levels and physical limitations",
  is_active: true,
  // Recurring defaults
  is_recurring: false,
  recurring_days: [],
  recurring_start_date: "",
  recurring_end_date: "",
  daily_schedule: {},
};

export default function AddEditClassModal({
  isOpen,
  onClose,
  onSave,
  onSaveRecurring,
  editingClass,
  editingRecurringTemplate,
  isLoading = false,
  mode = "class",
}: AddEditClassModalProps) {
  const [formData, setFormData] = useState<Class>(defaultClass);
  const [activeTab, setActiveTab] = useState<"basic" | "details" | "advanced">(
    "basic"
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updateFutureClasses, setUpdateFutureClasses] = useState(false);

  // Initialize form data when modal opens or editing item changes
  useEffect(() => {
    console.log("🔄 Modal useEffect running:", {
      mode,
      editingRecurringTemplate: !!editingRecurringTemplate,
    });

    if (mode === "recurring" && editingRecurringTemplate) {
      console.log("📋 Template data:", editingRecurringTemplate);

      // Build daily_schedule from template data if it doesn't exist
      let dailySchedule = editingRecurringTemplate.daily_schedule || {};

      // If no daily_schedule exists, build it from recurring_days and start/end time
      if (
        Object.keys(dailySchedule).length === 0 &&
        editingRecurringTemplate.recurring_days
      ) {
        console.log("🏗️ Building daily_schedule from template data");
        editingRecurringTemplate.recurring_days.forEach((day) => {
          dailySchedule[day] = {
            start_time: editingRecurringTemplate.start_time || "07:30",
            end_time: editingRecurringTemplate.end_time || "08:30",
          };
        });
        console.log("📅 Built daily_schedule:", dailySchedule);
      } else {
        console.log("📅 Using existing daily_schedule:", dailySchedule);
      }

      // Convert recurring template to class format for form
      setFormData({
        ...defaultClass,
        id: editingRecurringTemplate.id,
        title: editingRecurringTemplate.title,
        description: editingRecurringTemplate.description,
        instructor: editingRecurringTemplate.instructor,
        class_type: editingRecurringTemplate.class_type,
        difficulty_level: editingRecurringTemplate.difficulty_level,
        location: editingRecurringTemplate.location,
        duration_minutes: editingRecurringTemplate.duration_minutes,
        max_participants: editingRecurringTemplate.max_participants,
        price_per_session: editingRecurringTemplate.price_per_session,
        credits_required: editingRecurringTemplate.credits_required,
        equipment_needed: editingRecurringTemplate.equipment_needed,
        prerequisites: editingRecurringTemplate.prerequisites,
        class_goals: editingRecurringTemplate.class_goals,
        intensity_level: editingRecurringTemplate.intensity_level,
        waitlist_enabled: editingRecurringTemplate.waitlist_enabled,
        waitlist_capacity: editingRecurringTemplate.waitlist_capacity,
        auto_confirm_booking: editingRecurringTemplate.auto_confirm_booking,
        cancellation_deadline_hours:
          editingRecurringTemplate.cancellation_deadline_hours,
        safety_requirements: editingRecurringTemplate.safety_requirements,
        age_restrictions: editingRecurringTemplate.age_restrictions,
        modifications_available:
          editingRecurringTemplate.modifications_available,
        is_active: editingRecurringTemplate.is_active,
        is_recurring: true,
        recurring_days: editingRecurringTemplate.recurring_days,
        daily_schedule: dailySchedule,
        start_time: editingRecurringTemplate.start_time,
        end_time: editingRecurringTemplate.end_time,
        recurring_start_date: editingRecurringTemplate.start_date,
        recurring_end_date: editingRecurringTemplate.end_date || "",
        date: editingRecurringTemplate.start_date,
      });
    } else if (mode === "class" && editingClass) {
      setFormData(editingClass);
    } else if (mode === "recurring") {
      // New recurring class - set default start date to today
      const today = new Date().toISOString().split("T")[0];
      setFormData({
        ...defaultClass,
        is_recurring: true,
        recurring_start_date: today,
        date: today,
      });
    } else {
      // New regular class
      setFormData(defaultClass);
    }
    setErrors({});
  }, [editingClass, editingRecurringTemplate, isOpen, mode]);

  // Stable field update handler
  const updateField = useCallback((field: keyof Class, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  // Recurring day toggle handler
  const handleRecurringDayToggle = useCallback(
    (day: string, checked: boolean) => {
      const currentDays = formData.recurring_days || [];
      let newDays: string[];

      if (checked) {
        // Prevent duplicate day selection
        if (currentDays.includes(day)) {
          console.warn(`Day ${day} is already selected`);
          return;
        }
        newDays = [...currentDays, day];
        // Initialize daily schedule for this day
        const newSchedule = {
          ...formData.daily_schedule,
          [day]: {
            start_time: formData.start_time,
            end_time: formData.end_time,
          },
        };
        setFormData((prev) => ({
          ...prev,
          recurring_days: newDays,
          daily_schedule: newSchedule,
        }));
      } else {
        newDays = currentDays.filter((d) => d !== day);
        // Remove from daily schedule
        const newSchedule = { ...formData.daily_schedule };
        delete newSchedule[day];
        setFormData((prev) => ({
          ...prev,
          recurring_days: newDays,
          daily_schedule: newSchedule,
        }));
      }
    },
    [
      formData.recurring_days,
      formData.daily_schedule,
      formData.start_time,
      formData.end_time,
    ]
  );

  // Daily schedule time change handler
  const handleDailyScheduleChange = useCallback(
    (day: string, field: "start_time" | "end_time", value: string) => {
      console.log("🔄 Daily schedule change:", { day, field, value });

      setFormData((prev) => {
        const currentSchedule = prev.daily_schedule || {};
        const daySchedule = currentSchedule[day] || {};

        const newDailySchedule = {
          ...currentSchedule,
          [day]: {
            ...daySchedule,
            [field]: value,
          },
        };

        console.log("📅 Updated daily schedule:", newDailySchedule);

        return {
          ...prev,
          daily_schedule: newDailySchedule,
        };
      });
    },
    []
  );

  // Handle day change for recurring templates
  const handleDayChange = useCallback(
    async (
      oldDay: string,
      newDay: string,
      newStartTime?: string,
      newEndTime?: string
    ) => {
      if (!editingRecurringTemplate?.id) {
        console.error("No template ID for day change");
        return;
      }

      try {
        console.log(
          "🔄 Changing day from",
          oldDay,
          "to",
          newDay,
          "with times",
          newStartTime,
          newEndTime
        );

        // Call the API to handle the day change
        const response = await fetch(`/api/admin/recurring-classes`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: editingRecurringTemplate.id,
            action: "change_day",
            oldDay,
            newDay,
            newStartTime: newStartTime || "07:30",
            newEndTime: newEndTime || "08:30",
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to change day: ${response.statusText}`);
        }

        const result = await response.json();
        console.log("🎉 Day change API response:", result);

        if (!result.success) {
          throw new Error(result.error || "Unknown error");
        }

        // Calculate the updated values
        const currentRecurringDays = formData.recurring_days || [];
        const currentDailySchedule = { ...formData.daily_schedule };

        // Remove old day, add new day
        const newRecurringDays = currentRecurringDays.filter(
          (day) => day !== oldDay
        );
        if (!newRecurringDays.includes(newDay)) {
          newRecurringDays.push(newDay);
        }

        // Update schedule
        delete currentDailySchedule[oldDay];
        currentDailySchedule[newDay] = {
          start_time: newStartTime || "07:30",
          end_time: newEndTime || "08:30",
        };

        // Update the form data locally only after successful API response
        setFormData((prev) => ({
          ...prev,
          recurring_days: newRecurringDays,
          daily_schedule: currentDailySchedule,
        }));

        // Close the modal and refresh the page to show updated data
        console.log("🔄 Day change completed - closing modal and refreshing");
        onClose();

        // Refresh the page to ensure clean state
        if (typeof window !== "undefined") {
          window.location.reload();
        }

        console.log("✅ Day change completed successfully");
      } catch (error) {
        console.error("❌ Error changing day:", error);
        // Show user-friendly error message
        alert(
          `Failed to change day: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    },
    [editingRecurringTemplate?.id]
  );

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.start_time) newErrors.start_time = "Start time is required";
    if (!formData.end_time) newErrors.end_time = "End time is required";
    if (formData.max_participants < 1)
      newErrors.max_participants = "Must allow at least 1 participant";
    if (!formData.instructor.trim())
      newErrors.instructor = "Instructor is required";
    if (!formData.location.trim()) newErrors.location = "Location is required";

    // Recurring class validation
    if (formData.is_recurring) {
      if (!formData.recurring_days?.length) {
        newErrors.recurring_days =
          "Select at least one day for recurring classes";
      }
      if (!formData.recurring_start_date) {
        newErrors.recurring_start_date =
          "Start date is required for recurring classes";
      }
      // End date is optional - classes continue until manually stopped
    } else {
      if (!formData.date)
        newErrors.date = "Date is required for single classes";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("🚨 MODAL SUBMIT STARTED");
    console.log("🔍 Modal submit debug - formData:", {
      id: formData.id,
      is_recurring: formData.is_recurring,
      mode,
      editingRecurringTemplate: !!editingRecurringTemplate,
      editingClass: !!editingClass,
    });

    if (isSubmitting) return; // Prevent duplicate submissions

    if (validateForm()) {
      try {
        setIsSubmitting(true);

        console.log("🔍 Modal save debug:", {
          mode,
          hasOnSaveRecurring: !!onSaveRecurring,
          formDataIsRecurring: formData.is_recurring,
          willUseRecurringPath: mode === "recurring" && !!onSaveRecurring,
        });

        if (mode === "recurring" && onSaveRecurring) {
          console.log(
            "💾 Saving recurring template with daily_schedule:",
            formData.daily_schedule
          );
          // Convert form data to recurring template format
          const templateData: RecurringTemplate = {
            id: formData.id,
            title: formData.title,
            description: formData.description,
            instructor: formData.instructor,
            class_type: formData.class_type,
            difficulty_level: formData.difficulty_level,
            location: formData.location,
            duration_minutes: formData.duration_minutes,
            max_participants: formData.max_participants,
            price_per_session: formData.price_per_session,
            credits_required: formData.credits_required,
            equipment_needed: formData.equipment_needed,
            prerequisites: formData.prerequisites,
            class_goals: formData.class_goals,
            intensity_level: formData.intensity_level,
            waitlist_enabled: formData.waitlist_enabled,
            waitlist_capacity: formData.waitlist_capacity,
            auto_confirm_booking: formData.auto_confirm_booking,
            cancellation_deadline_hours: formData.cancellation_deadline_hours,
            safety_requirements: formData.safety_requirements,
            age_restrictions: formData.age_restrictions,
            modifications_available: formData.modifications_available,
            is_active: formData.is_active,
            recurring_days: formData.recurring_days || [],
            daily_schedule: formData.daily_schedule,
            start_time: formData.start_time,
            end_time: formData.end_time,
            start_date: formData.recurring_start_date || formData.date,
            end_date: formData.recurring_end_date || null,
            updateFutureClasses: updateFutureClasses,
          };
          await onSaveRecurring({ ...templateData, is_recurring: true } as any);
        } else {
          console.log("💾 Using regular save path with formData:", {
            id: formData.id,
            is_recurring: formData.is_recurring,
            mode,
            hasOnSaveRecurring: !!onSaveRecurring,
          });
          await onSave(formData);
        }
      } catch (error) {
        console.error("Error saving:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const classTypes = [
    "Strength Training",
    "HIIT",
    "Cardio",
    "Yoga",
    "Pilates",
    "Boxing",
    "Functional Training",
    "Mobility",
    "Bootcamp",
    "Personal Training",
  ];

  const difficultyLevels = [
    "Beginner",
    "Intermediate",
    "Advanced",
    "All Levels",
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999999]"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FaCalendarAlt className="mr-3 text-xl" />
                  <h2 className="text-2xl font-bold">
                    {mode === "recurring"
                      ? editingRecurringTemplate
                        ? "Edit Recurring Class Template"
                        : "Create Recurring Class Template"
                      : editingClass
                      ? "Edit Class"
                      : "Add New Class"}
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>

              {/* Tabs */}
              <div className="mt-6">
                <div className="flex flex-wrap gap-2">
                  {["basic", "details", "advanced"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab as any)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                        activeTab === tab
                          ? "bg-white text-blue-600 shadow-md"
                          : "bg-white bg-opacity-20 text-white hover:bg-opacity-30"
                      }`}
                    >
                      {tab === "basic" && "Basic Info"}
                      {tab === "details" && "Details"}
                      {tab === "advanced" && "Advanced"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Content and Footer wrapped in form */}
            <form onSubmit={handleSubmit} className="flex flex-col">
              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-240px)]">
                <div className="space-y-6">
                  {/* Basic Tab */}
                  {activeTab === "basic" && (
                    <div className="space-y-6">
                      <InputField
                        label="Class Title"
                        value={formData.title}
                        onChange={(value) => updateField("title", value)}
                        required
                        placeholder="Enter class title"
                        error={errors.title}
                      />

                      <InputField
                        label="Instructor"
                        value={formData.instructor}
                        onChange={(value) => updateField("instructor", value)}
                        required
                        placeholder="Enter instructor name"
                        error={errors.instructor}
                      />

                      <SelectField
                        label="Class Type"
                        value={formData.class_type}
                        onChange={(value) => updateField("class_type", value)}
                        options={classTypes.map((type) => ({
                          value: type,
                          label: type,
                        }))}
                        required
                        error={errors.class_type}
                      />

                      <SelectField
                        label="Difficulty Level"
                        value={formData.difficulty_level}
                        onChange={(value) =>
                          updateField("difficulty_level", value)
                        }
                        options={difficultyLevels.map((level) => ({
                          value: level,
                          label: level,
                        }))}
                        required
                        error={errors.difficulty_level}
                      />

                      <TextAreaField
                        label="Description"
                        value={formData.description}
                        onChange={(value) => updateField("description", value)}
                        placeholder="Enter class description"
                        error={errors.description}
                      />

                      <InputField
                        label="Location"
                        value={formData.location}
                        onChange={(value) => updateField("location", value)}
                        required
                        placeholder="Enter location"
                        error={errors.location}
                      />

                      {/* Recurring Class Settings */}
                      <RecurringClassSettings
                        isRecurring={
                          mode === "recurring"
                            ? true
                            : formData.is_recurring || false
                        }
                        recurringDays={formData.recurring_days || []}
                        recurringStartDate={formData.recurring_start_date || ""}
                        recurringEndDate={formData.recurring_end_date || ""}
                        dailySchedule={formData.daily_schedule || {}}
                        errors={errors}
                        onRecurringToggle={
                          mode === "recurring"
                            ? undefined
                            : (checked) => updateField("is_recurring", checked)
                        }
                        onDayToggle={handleRecurringDayToggle}
                        onTimeChange={handleDailyScheduleChange}
                        onStartDateChange={(value) =>
                          updateField("recurring_start_date", value)
                        }
                        onEndDateChange={(value) =>
                          updateField("recurring_end_date", value)
                        }
                        hideToggle={mode === "recurring"}
                        isEditing={!!editingRecurringTemplate}
                        onDayChange={handleDayChange}
                      />

                      {/* Date/Time for Single Classes */}
                      {!(mode === "recurring"
                        ? true
                        : formData.is_recurring) && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <InputField
                            label="Date"
                            type="date"
                            value={formData.date}
                            onChange={(value) => updateField("date", value)}
                            required
                            error={errors.date}
                          />
                          <InputField
                            label="Start Time"
                            type="time"
                            value={formData.start_time}
                            onChange={(value) =>
                              updateField("start_time", value)
                            }
                            required
                            error={errors.start_time}
                          />
                          <InputField
                            label="End Time"
                            type="time"
                            value={formData.end_time}
                            onChange={(value) => updateField("end_time", value)}
                            required
                            error={errors.end_time}
                          />
                        </div>
                      )}

                      <InputField
                        label="Max Participants"
                        type="number"
                        value={formData.max_participants}
                        onChange={(value) =>
                          updateField("max_participants", value)
                        }
                        required
                        min={1}
                        error={errors.max_participants}
                      />
                    </div>
                  )}

                  {/* Details Tab */}
                  {activeTab === "details" && (
                    <div className="space-y-6">
                      <TextAreaField
                        label="Equipment Needed"
                        value={formData.equipment_needed}
                        onChange={(value) =>
                          updateField("equipment_needed", value)
                        }
                        placeholder="List required equipment"
                      />

                      <TextAreaField
                        label="Prerequisites"
                        value={formData.prerequisites}
                        onChange={(value) =>
                          updateField("prerequisites", value)
                        }
                        placeholder="Enter prerequisites"
                      />

                      <TextAreaField
                        label="Class Goals"
                        value={formData.class_goals}
                        onChange={(value) => updateField("class_goals", value)}
                        placeholder="What will participants achieve?"
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField
                          label="Price per Session"
                          type="number"
                          value={formData.price_per_session}
                          onChange={(value) =>
                            updateField("price_per_session", value)
                          }
                          min={0}
                          step={0.01}
                        />
                        <InputField
                          label="Credits Required"
                          type="number"
                          value={formData.credits_required}
                          onChange={(value) =>
                            updateField("credits_required", value)
                          }
                          min={0}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField
                          label="Duration (minutes)"
                          type="number"
                          value={formData.duration_minutes}
                          onChange={(value) =>
                            updateField("duration_minutes", value)
                          }
                          min={1}
                        />
                        <InputField
                          label="Intensity Level (1-10)"
                          type="number"
                          value={formData.intensity_level}
                          onChange={(value) =>
                            updateField("intensity_level", value)
                          }
                          min={1}
                          max={10}
                        />
                      </div>
                    </div>
                  )}

                  {/* Advanced Tab */}
                  {activeTab === "advanced" && (
                    <div className="space-y-6">
                      <TextAreaField
                        label="Safety Requirements"
                        value={formData.safety_requirements}
                        onChange={(value) =>
                          updateField("safety_requirements", value)
                        }
                        placeholder="Safety requirements and guidelines"
                      />

                      <InputField
                        label="Age Restrictions"
                        value={formData.age_restrictions}
                        onChange={(value) =>
                          updateField("age_restrictions", value)
                        }
                        placeholder="Age requirements"
                      />

                      <TextAreaField
                        label="Modifications Available"
                        value={formData.modifications_available}
                        onChange={(value) =>
                          updateField("modifications_available", value)
                        }
                        placeholder="Available modifications for different fitness levels"
                      />

                      {/* Waitlist Settings */}
                      <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                        <h3 className="font-medium text-gray-800">
                          Waitlist Settings
                        </h3>

                        <CheckboxField
                          label="Enable Waitlist"
                          value={formData.waitlist_enabled}
                          onChange={(value) =>
                            updateField("waitlist_enabled", value)
                          }
                          description="Allow participants to join waitlist when class is full"
                        />

                        {formData.waitlist_enabled && (
                          <InputField
                            label="Waitlist Capacity"
                            type="number"
                            value={formData.waitlist_capacity}
                            onChange={(value) =>
                              updateField("waitlist_capacity", value)
                            }
                            min={0}
                          />
                        )}
                      </div>

                      {/* Booking Settings */}
                      <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                        <h3 className="font-medium text-gray-800">
                          Booking Settings
                        </h3>

                        <CheckboxField
                          label="Auto-confirm Bookings"
                          value={formData.auto_confirm_booking}
                          onChange={(value) =>
                            updateField("auto_confirm_booking", value)
                          }
                          description="Automatically confirm bookings without manual approval"
                        />

                        <InputField
                          label="Cancellation Deadline (hours before)"
                          type="number"
                          value={formData.cancellation_deadline_hours}
                          onChange={(value) =>
                            updateField("cancellation_deadline_hours", value)
                          }
                          min={0}
                        />
                      </div>

                      <CheckboxField
                        label="Active Class"
                        value={formData.is_active}
                        onChange={(value) => updateField("is_active", value)}
                        description="Inactive classes won't be visible to participants"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-6 py-4">
                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full sm:w-auto px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || isSubmitting}
                    className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2.5 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-medium"
                  >
                    {isLoading || isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <FaSave className="mr-2" />
                        {mode === "recurring"
                          ? editingRecurringTemplate
                            ? "Update Template"
                            : "Create Template"
                          : editingClass
                          ? "Update Class"
                          : "Create Class"}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
