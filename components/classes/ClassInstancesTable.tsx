import { useState } from "react";
import ClassInstanceRow from "./ClassInstanceRow";
import UpgradedClassDetailsModal from "./UpgradedClassDetailsModal";
import { motion } from "framer-motion";

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
  prerequisites?: string;
  price_per_session?: number;
  is_active?: boolean;
  is_recurring?: boolean;
  recurring_days?: string[];
}

interface ClassInstancesTableProps {
  classes: Class[];
  isLoading: boolean;
  onEditClass: (classData: Class) => void;
  onDeleteClass: (classId: string) => void;
  onAddParticipant: (classId: string) => void;
  onRemoveParticipant: (classId: string) => void;
  onRefreshClasses: () => void;
  onCompleteClass?: (classId: string) => void;
}

export default function ClassInstancesTable({
  classes,
  isLoading,
  onEditClass,
  onDeleteClass,
  onAddParticipant,
  onRemoveParticipant,
  onRefreshClasses,
  onCompleteClass,
}: ClassInstancesTableProps) {
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const handleViewDetails = (classData: Class) => {
    setSelectedClass(classData);
    setShowDetailsModal(true);
  };

  const handleCloseDetails = () => {
    setShowDetailsModal(false);
    setSelectedClass(null);
  };

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-700">
          <thead className="bg-slate-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                Class
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                Date & Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                Participants
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-slate-800 divide-y divide-slate-700">
            {isLoading ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-slate-400"
                >
                  Loading classes...
                </td>
              </tr>
            ) : classes.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-slate-400"
                >
                  No classes found. Add your first class to get started.
                </td>
              </tr>
            ) : (
              classes
                .filter((cls) => cls.id) // Only render classes with valid ids
                .map((classData) => (
                  <ClassInstanceRow
                    key={classData.id}
                    classData={classData}
                    onViewDetails={handleViewDetails}
                    onEditClass={onEditClass}
                    onDeleteClass={onDeleteClass}
                    onAddParticipant={onAddParticipant}
                    onRemoveParticipant={onRemoveParticipant}
                    onCompleteClass={onCompleteClass}
                  />
                ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {isLoading ? (
          <div className="bg-slate-800 rounded-xl p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-royal-light mx-auto mb-4"></div>
            <p className="text-slate-400">Loading classes...</p>
          </div>
        ) : classes.length === 0 ? (
          <div className="bg-slate-800 rounded-xl p-6 text-center">
            <p className="text-slate-400">
              No classes found. Add your first class to get started.
            </p>
          </div>
        ) : (
          classes
            .filter((cls) => cls.id) // Only render classes with valid ids
            .map((classData, index) => {
              // Calculate class status (same logic as ClassInstanceRow)
              let classDateTime;
              let isPastClass = false;
              let canCompleteClass = false;

              try {
                let dateStr: string;
                if (
                  classData.date &&
                  typeof classData.date === "object" &&
                  "toISOString" in classData.date
                ) {
                  dateStr = (classData.date as Date)
                    .toISOString()
                    .split("T")[0];
                } else {
                  dateStr = String(classData.date).split("T")[0];
                }

                classDateTime = new Date(`${dateStr}T${classData.start_time}`);

                if (!isNaN(classDateTime.getTime())) {
                  const now = new Date();
                  isPastClass = classDateTime < now;

                  const today = new Date();
                  today.setHours(23, 59, 59, 999);
                  canCompleteClass = classDateTime <= today;
                }
              } catch (error) {
                canCompleteClass = false;
                isPastClass = false;
              }

              const currentParticipants = classData.current_participants || 0;
              const occupancyPercentage =
                (currentParticipants / classData.max_participants) * 100;
              const isClassFull =
                currentParticipants >= classData.max_participants;
              const isEmpty = currentParticipants <= 0;
              const pricePerSession = Number(classData.price_per_session) || 0;

              return (
                <motion.div
                  key={classData.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-slate-800 rounded-xl p-4 border border-slate-700 ${
                    isPastClass ? "opacity-75" : ""
                  }`}
                >
                  {/* Class Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center flex-wrap gap-2 mb-1">
                        <h3 className="text-white font-medium text-lg">
                          {classData.title}
                        </h3>
                        {classData.is_recurring && (
                          <span className="px-2 py-1 text-xs bg-purple-500 text-white rounded-full">
                            Recurring
                          </span>
                        )}
                        {isPastClass && (
                          <span className="px-2 py-1 text-xs bg-slate-500 text-white rounded-full">
                            Past
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-slate-400">
                        {classData.class_type}
                      </div>
                      {classData.instructor && (
                        <div className="text-xs text-slate-500 mt-1">
                          Instructor: {classData.instructor}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-white font-medium">
                        ${pricePerSession.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Date, Time, Location */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    <div className="flex items-center text-sm text-white">
                      <span className="text-slate-400 mr-2">📅</span>
                      {new Date(classData.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                    <div className="flex items-center text-sm text-slate-400">
                      <span className="mr-2">🕐</span>
                      {classData.start_time} - {classData.end_time}
                    </div>
                    <div className="flex items-center text-sm text-white sm:col-span-2">
                      <span className="text-slate-400 mr-2">📍</span>
                      <span className="truncate">{classData.location}</span>
                    </div>
                  </div>

                  {/* Participants */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <span className="text-slate-400 mr-2">👥</span>
                        <span className="font-medium text-white">
                          {currentParticipants}/{classData.max_participants}
                        </span>
                        <span className="text-xs text-slate-400 ml-2">
                          ({occupancyPercentage.toFixed(0)}%)
                        </span>
                      </div>
                      {!isPastClass && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => onAddParticipant(classData.id!)}
                            disabled={isClassFull}
                            className="p-1 text-green-400 hover:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed rounded transition-colors touch-manipulation"
                            title="Add participant"
                          >
                            <span className="text-sm">👤+</span>
                          </button>
                          <button
                            onClick={() => onRemoveParticipant(classData.id!)}
                            disabled={isEmpty}
                            className="p-1 text-red-400 hover:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed rounded transition-colors touch-manipulation"
                            title="Remove participant"
                          >
                            <span className="text-sm">👤-</span>
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          occupancyPercentage >= 90
                            ? "bg-red-500"
                            : occupancyPercentage >= 70
                            ? "bg-yellow-500"
                            : "bg-green-500"
                        }`}
                        style={{
                          width: `${Math.min(occupancyPercentage, 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-700">
                    <button
                      onClick={() => handleViewDetails(classData)}
                      className="flex-1 sm:flex-none px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center text-sm touch-manipulation"
                      title="View Details"
                    >
                      <span className="mr-2">👁️</span>
                      View Details
                    </button>

                    {canCompleteClass && onCompleteClass && (
                      <button
                        onClick={() => onCompleteClass(classData.id!)}
                        className="flex-1 sm:flex-none px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors flex items-center justify-center text-sm touch-manipulation"
                        title="Complete Class"
                      >
                        <span className="mr-2">✅</span>
                        Complete
                      </button>
                    )}

                    {!isPastClass && (
                      <button
                        onClick={() => onDeleteClass(classData.id!)}
                        className="flex-1 sm:flex-none px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center justify-center text-sm touch-manipulation"
                        title="Cancel Class"
                      >
                        <span className="mr-2">🗑️</span>
                        Cancel
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })
        )}
      </div>

      {/* Class Details Modal */}
      <UpgradedClassDetailsModal
        classData={selectedClass}
        isOpen={showDetailsModal}
        onClose={handleCloseDetails}
        onAddParticipant={onAddParticipant}
        onRemoveParticipant={onRemoveParticipant}
        onEditClass={onEditClass}
        isAdmin={true}
      />
    </>
  );
}
