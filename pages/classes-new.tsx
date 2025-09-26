import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Layout from "../components/Layout";
import SEO from "../components/shared/SEO";
import ClassCalendar from "../components/classes/ClassCalendar";
import ClassModal from "../components/classes/ClassModal";
import ClassesList from "../components/classes/ClassesList";
import LocationsLegend from "../components/classes/LocationsLegend";
import ClassStats from "../components/classes/ClassStats";
import { FaCalendarAlt, FaUsers, FaDumbbell, FaClock } from "react-icons/fa";

interface ClassData {
  id: string;
  title: string;
  description: string;
  instructor: string;
  date: string;
  start_time: string;
  end_time: string;
  max_participants: number;
  current_participants: number;
  location: string;
  class_type: string;
  difficulty_level: string;
  equipment_needed: string;
  is_active: boolean;
}

export default function Classes() {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [stats, setStats] = useState({
    totalClasses: 0,
    availableSpots: 0,
    totalParticipants: 0,
  });

  // Fetch classes on component mount
  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await fetch("/api/classes");
      const data = await response.json();

      if (data.success) {
        setClasses(data.data);
        calculateStats(data.data);
      } else {
        console.error("Failed to fetch classes:", data.error);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (classData: ClassData[]) => {
    const upcomingClasses = classData.filter(
      (c) => new Date(c.date) >= new Date()
    );

    setStats({
      totalClasses: upcomingClasses.length,
      availableSpots: upcomingClasses.reduce(
        (sum, c) => sum + (c.max_participants - c.current_participants),
        0
      ),
      totalParticipants: upcomingClasses.reduce(
        (sum, c) => sum + c.current_participants,
        0
      ),
    });
  };

  const handleClassSelect = (classData: ClassData) => {
    setSelectedClass(classData);
    setIsModalOpen(true);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedClass(null);
  };

  const handleBookClass = async (
    classId?: string,
    joinWaitlist: boolean = false
  ) => {
    const targetClass = selectedClass || classes.find((c) => c.id === classId);
    if (!targetClass) return;

    setIsBooking(true);
    try {
      const response = await fetch("/api/book-class", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          class_id: targetClass.id,
          join_waitlist: joinWaitlist,
        }),
      });

      const data = await response.json();

      if (data.success) {
        handleCloseModal();
        fetchClasses(); // Refresh to update participant count
      } else {
        console.error(`Failed to book class: ${data.error}`);
      }
    } catch (error) {
      console.error("Error booking class:", error);
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <Layout>
      <SEO
        title="Group Fitness Classes | FL Best Trainer"
        description="Join energizing group fitness classes in Sarasota. Small groups, personalized attention, and results-driven workouts for every fitness level."
      />

      <div className="min-h-screen bg-navy">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-br from-royal/20 to-transparent"></div>
        </div>

        {/* Hero Section */}
        <section className="relative py-20">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center justify-center mb-6">
                <FaUsers className="text-4xl text-royal-light mr-4" />
                <h1 className="text-4xl md:text-6xl font-bold text-white">
                  Group Fitness Classes
                </h1>
              </div>

              <p className="text-xl text-white/80 mb-8 leading-relaxed">
                Join our energizing group classes in beautiful Sarasota. Small
                groups, personalized attention, and results-driven workouts for
                every fitness level.
              </p>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                <div className="bg-black/40 backdrop-blur-lg rounded-lg p-4 border border-white/10">
                  <div className="text-2xl font-bold text-royal-light">
                    {stats.totalClasses}
                  </div>
                  <div className="text-sm text-white/70">
                    Classes This Month
                  </div>
                </div>
                <div className="bg-black/40 backdrop-blur-lg rounded-lg p-4 border border-white/10">
                  <div className="text-2xl font-bold text-green-400">
                    {stats.availableSpots}
                  </div>
                  <div className="text-sm text-white/70">Available Spots</div>
                </div>
                <div className="bg-black/40 backdrop-blur-lg rounded-lg p-4 border border-white/10">
                  <div className="text-2xl font-bold text-yellow-400">8</div>
                  <div className="text-sm text-white/70">Max Per Class</div>
                </div>
                <div className="bg-black/40 backdrop-blur-lg rounded-lg p-4 border border-white/10">
                  <div className="text-2xl font-bold text-blue-400">
                    {stats.totalParticipants}
                  </div>
                  <div className="text-sm text-white/70">Active Members</div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {/* Stats Section */}
            <ClassStats classes={classes} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Calendar */}
              <div className="lg:col-span-2">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                    <FaCalendarAlt className="mr-3 text-royal-light" />
                    Class Schedule
                  </h2>

                  {isLoading ? (
                    <div className="bg-black/40 backdrop-blur-lg rounded-xl border border-white/10 p-8 text-center">
                      <div className="animate-spin w-8 h-8 border-2 border-royal-light border-t-transparent rounded-full mx-auto mb-4"></div>
                      <p className="text-white/70">Loading classes...</p>
                    </div>
                  ) : (
                    <ClassCalendar
                      classes={classes}
                      onClassSelect={handleClassSelect}
                      onDateSelect={handleDateSelect}
                    />
                  )}
                </motion.div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <ClassesList
                  classes={classes}
                  selectedDate={selectedDate}
                  onClassSelect={handleClassSelect}
                />

                <LocationsLegend />
              </div>
            </div>
          </div>
        </section>

        {/* Class Modal */}
        <ClassModal
          classData={selectedClass}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onBook={handleBookClass}
          isBooking={isBooking}
        />
      </div>
    </Layout>
  );
}
