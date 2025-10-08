import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Layout from "../../components/Layout";
import SEO from "../../components/shared/SEO";
import UpgradedCalendar from "../../components/classes/UpgradedCalendar";
import GoogleCalendarModal from "../../components/classes/GoogleCalendarModal";
import { motion } from "framer-motion";
import { FaCalendarAlt, FaFlask, FaGoogle } from "react-icons/fa";

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

export default function AdminTestPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is admin
  const isAdmin = session?.user?.isAdmin === true;

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/api/auth/signin");
      return;
    }

    if (!isAdmin) {
      router.push("/classes");
      return;
    }

    // If admin, load classes
    fetchClasses();
  }, [session, status, isAdmin, router]);

  const fetchClasses = async () => {
    try {
      const response = await fetch("/api/classes");
      const data = await response.json();

      if (data.success) {
        setClasses(data.data);
      } else {
        console.error("Failed to fetch classes:", data.error);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClassSelect = (classData: ClassData) => {
    setSelectedClass(classData);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedClass(null);
  };

  const handleBookClass = async (
    classId?: string,
    joinWaitlist: boolean = false
  ) => {
    console.log("Test booking with Google Calendar integration:", {
      classId,
      joinWaitlist,
    });
    // TODO: Add Google Calendar integration here
  };

  const handleCancelBooking = async (booking: any) => {
    console.log("Test cancellation with Google Calendar integration:", booking);
    // TODO: Add Google Calendar removal here
  };

  if (status === "loading") {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-royal-dark via-royal-dark/90 to-black flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-royal-light"></div>
        </div>
      </Layout>
    );
  }

  if (!session || !isAdmin) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-royal-dark via-royal-dark/90 to-black flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">
              Access Denied
            </h1>
            <p className="text-white/60">
              You don't have permission to access this page.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO
        title="Admin Test - Google Calendar Integration"
        description="Testing Google Calendar integration for class bookings"
      />

      <div className="min-h-screen bg-gradient-to-br from-royal-dark via-royal-dark/90 to-black">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-3 mb-4"
            >
              <FaFlask className="text-3xl text-yellow-400" />
              <h1 className="text-4xl font-bold text-white">Admin Test Lab</h1>
              <FaGoogle className="text-3xl text-blue-400" />
            </motion.div>
            <p className="text-white/70 text-lg">
              Testing Manual Google Calendar Integration - Safe Environment
            </p>
            <div className="mt-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg inline-block">
              <p className="text-green-300 text-sm">
                ✅ Manual "Add to Calendar" links - No OAuth required!
              </p>
            </div>
          </div>

          {/* Authentication Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 flex justify-center"
          >
            <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4 max-w-md">
              <div className="flex items-center gap-2 mb-3">
                <FaGoogle className="text-blue-400" />
                <span className="text-white font-medium">
                  Calendar Integration Status
                </span>
              </div>
              <p className="text-white/80 text-sm mb-3">
                If you see authentication errors, click below to refresh your
                Google permissions:
              </p>
              <button
                onClick={async () => {
                  try {
                    const response = await fetch("/api/auth/refresh-session", {
                      method: "POST",
                    });
                    if (response.ok) {
                      alert("Session cleared! Please sign in again.");
                      window.location.href = "/api/auth/signin";
                    }
                  } catch (error) {
                    console.error("Error refreshing session:", error);
                  }
                }}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
              >
                🔄 Refresh Google Calendar Permissions
              </button>
            </div>
          </motion.div>

          {/* Calendar Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <FaCalendarAlt className="text-2xl text-royal-light" />
              <h2 className="text-2xl font-bold text-white">
                Upgraded Calendar
              </h2>
              <span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-full border border-green-500/30">
                Manual Google Calendar
              </span>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-royal-light"></div>
              </div>
            ) : (
              <UpgradedCalendar
                classes={classes}
                onClassSelect={handleClassSelect}
                selectedClass={selectedClass}
              />
            )}
          </motion.div>

          {/* Features List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
          >
            <h3 className="text-xl font-bold text-white mb-4">
              Features Being Tested:
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <h4 className="font-semibold text-green-300 mb-2">
                  📅 Manual Calendar Links
                </h4>
                <p className="text-white/70 text-sm">
                  Generate Google Calendar "Add Event" links that users can
                  click after booking
                </p>
              </div>
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <h4 className="font-semibold text-blue-300 mb-2">
                  � No Authentication Required
                </h4>
                <p className="text-white/70 text-sm">
                  Works without OAuth - users just click a link to add events to
                  their calendar
                </p>
              </div>
              <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                <h4 className="font-semibold text-purple-300 mb-2">
                  ⏰ Timezone Safe
                </h4>
                <p className="text-white/70 text-sm">
                  Proper date/time formatting for Google Calendar event creation
                </p>
              </div>
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <h4 className="font-semibold text-amber-300 mb-2">
                  🚀 Ready for Production
                </h4>
                <p className="text-white/70 text-sm">
                  No verification needed - can be deployed immediately
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Google Calendar Modal */}
      {selectedClass && (
        <GoogleCalendarModal
          classData={selectedClass}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onBook={handleBookClass}
          onCancelBooking={handleCancelBooking}
          isBooking={false}
          sessionsRemaining={0}
          weightliftingClassesRemaining={10}
          isAuthenticated={!!session}
          source="calendar"
          currentlyBooked={0}
          weightliftingPackage={null}
          isAlreadyBooked={false}
          currentBookings={[]}
          myBookings={[]}
        />
      )}
    </Layout>
  );
}
