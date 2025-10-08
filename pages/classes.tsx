import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import Layout from "../components/Layout";
import SEO from "../components/shared/SEO";
import ClassCalendar from "../components/classes/ClassCalendar";
import ClassModal from "../components/classes/ClassModal";
import ClassCard from "../components/classes/ClassCard";
import LocationsLegend from "../components/classes/LocationsLegend";
import UpcomingClassesSection from "../components/classes/UpcomingClassesSection";
import ClassStats from "../components/classes/ClassStats";
import CancelBookingModal from "../components/classes/CancelBookingModal";
import MyUpcomingClassesGrid from "../components/classes/MyUpcomingClassesGrid";
import StripeCheckoutButton, {
  PACKAGE_CONFIGS,
} from "../components/shared/StripeCheckoutButton";
import { useWeightliftingPackage } from "../hooks/usePackages";
import {
  FaCalendarAlt,
  FaUsers,
  FaDumbbell,
  FaFacebook,
  FaGoogle,
  FaStar,
} from "react-icons/fa";
import AddToHomeScreenButton from "../components/AddToHomeScreenButton";

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
  const { data: session, status } = useSession();
  const { package: weightliftingPackage, loading: packageLoading } =
    useWeightliftingPackage();
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [weightliftingClassesRemaining, setWeightliftingClassesRemaining] =
    useState<number | null>(null);
  const [weightliftingClassesBooked, setWeightliftingClassesBooked] = useState<
    number | null
  >(null);
  const [isUserAdmin, setIsUserAdmin] = useState<boolean>(false);
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const [cancellingBooking, setCancellingBooking] = useState<string | null>(
    null
  );
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<any>(null);
  const [modalSource, setModalSource] = useState<"calendar" | "upcoming">(
    "calendar"
  );
  const [userData, setUserData] = useState<any>(null);

  // Fetch classes on component mount
  useEffect(() => {
    fetchClasses();
  }, []);

  // Check user data when user is authenticated
  useEffect(() => {
    if (session?.user?.email) {
      fetchUserData();
      fetchMyBookings();
    }
  }, [session]);

  // Add a refresh function to manually update bookings
  const refreshBookings = async () => {
    if (session?.user?.email) {
      await fetchMyBookings();
      await fetchUserData();
    }
  };

  const fetchUserData = async () => {
    try {
      const response = await fetch("/api/onboarding/status");
      const data = await response.json();

      if (data.success) {
        setUserData(data.user); // Store user data for name display
        // Note: Removed sessions_remaining as we no longer use legacy sessions
        setWeightliftingClassesRemaining(
          data.user.weightlifting_classes_remaining || 0
        );
        setWeightliftingClassesBooked(
          data.user.weightlifting_classes_booked || 0
        );
        setIsUserAdmin(data.user.is_admin || false);

        // If user needs onboarding, redirect to onboarding page
        if (data.user.needsOnboarding || data.user.needsWaiver) {
          window.location.href = "/onboarding";
          return;
        }
      }
    } catch (error) {
      console.error("❌ Error fetching user data:", error);
    }
  };

  const fetchMyBookings = async () => {
    if (!session?.user?.email) return;

    try {
      const response = await fetch(
        `/api/bookings?user_id=${session.user.email}`
      );
      const data = await response.json();

      if (data.success) {
        console.log("All bookings fetched:", data.data);

        // Filter for upcoming classes - check both date AND time
        const now = new Date();

        const upcoming = data.data
          .filter((booking: any) => {
            // Skip cancelled bookings
            if (booking.status === "cancelled") {
              return false;
            }

            // Create full datetime for the class - timezone safe parsing
            const dateStr = booking.date.split("T")[0]; // Get "2025-10-09" from "2025-10-09T04:00:00.000Z"
            const [year, month, day] = dateStr.split("-").map(Number);
            const timeComponents = booking.start_time.split(":");
            // Create date in local timezone (month is 0-based)
            const classDateTime = new Date(
              year,
              month - 1,
              day,
              parseInt(timeComponents[0]),
              parseInt(timeComponents[1]),
              0,
              0
            );

            // Only include classes that haven't started yet
            const isUpcoming = classDateTime > now;

            console.log(`Booking: ${booking.class_title}`);
            console.log(`- Date: ${booking.date}`);
            console.log(`- Start Time: ${booking.start_time}`);
            console.log(`- Status: ${booking.status || "active"}`);
            console.log(`- Class DateTime: ${classDateTime.toLocaleString()}`);
            console.log(`- Now: ${now.toLocaleString()}`);
            console.log(`- Is Upcoming: ${isUpcoming}`);
            console.log("---");

            return isUpcoming;
          })
          .sort((a: any, b: any) => {
            // Parse dates more reliably
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);

            // Get today for comparison
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Check if classes are today
            const isAToday = dateA.toDateString() === today.toDateString();
            const isBToday = dateB.toDateString() === today.toDateString();

            // Prioritize today's classes first
            if (isAToday && !isBToday) return -1; // A (today) comes before B (future)
            if (!isAToday && isBToday) return 1; // B (today) comes before A (future)

            // If both are today or both are future, sort by datetime
            const timeA = a.start_time.split(":");
            const timeB = b.start_time.split(":");

            const fullDateTimeA = new Date(dateA);
            fullDateTimeA.setHours(
              parseInt(timeA[0]),
              parseInt(timeA[1]),
              0,
              0
            );

            const fullDateTimeB = new Date(dateB);
            fullDateTimeB.setHours(
              parseInt(timeB[0]),
              parseInt(timeB[1]),
              0,
              0
            );

            console.log(
              `Sorting: ${
                a.class_title
              } (${fullDateTimeA.toLocaleString()}) vs ${
                b.class_title
              } (${fullDateTimeB.toLocaleString()})`
            );

            return fullDateTimeA.getTime() - fullDateTimeB.getTime();
          });

        console.log("Final upcoming bookings:", upcoming);
        setMyBookings(upcoming);
      } else {
        console.error("Failed to fetch bookings:", data.error);
      }
    } catch (error) {
      console.error("Error fetching my bookings:", error);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await fetch("/api/classes");
      const data = await response.json();

      if (data.success) {
        setClasses(data.data);

        // Update selectedClass if it exists to reflect new participant counts
        if (selectedClass) {
          const updatedSelectedClass = data.data.find(
            (c: ClassData) => c.id === selectedClass.id
          );
          if (updatedSelectedClass) {
            setSelectedClass(updatedSelectedClass);
          }
        }
      } else {
        console.error("Failed to fetch classes:", data.error);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClassSelect = (
    classData: ClassData,
    sourceElement?: HTMLElement
  ) => {
    setSelectedClass(classData);
    setModalSource("calendar");
    setIsModalOpen(true);
  };

  const handleUpcomingClassSelect = (
    classData: ClassData,
    sourceElement?: HTMLElement
  ) => {
    setSelectedClass(classData);
    setModalSource("upcoming");
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
    const targetClass = selectedClass || classes.find((c) => c.id === classId);
    if (!targetClass || !session?.user?.email) return;

    // Check if user has any sessions remaining
    const totalSessions = weightliftingClassesRemaining || 0;

    if (totalSessions === 0) {
      // User has no sessions left - this will be handled by the modal UI
      return;
    }

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
        // Show multiple booking warning if applicable
        if (data.isMultipleBooking) {
          alert(
            `✅ ${data.message}\n\nYou now have ${data.totalBookingsForClass} booking(s) for this class.`
          );
        }

        // Booking successful - let the UI state changes provide feedback
        // Refresh user data and bookings
        await fetchUserData();
        await fetchMyBookings();
        await fetchClasses(); // Refresh class data to update participant counts

        // Don't close the modal immediately - let user see the updated state
      } else {
        console.error(`Failed to book class: ${data.error}`);
        alert(`❌ Booking failed: ${data.error}`);
      }
    } catch (error) {
      console.error("Error booking class:", error);
    } finally {
      setIsBooking(false);
    }
  };

  const handleCancelBooking = async (
    booking: any,
    buttonElement?: HTMLElement
  ) => {
    setBookingToCancel(booking);
    setShowCancelModal(true);
  };

  const confirmCancelBooking = async () => {
    if (!bookingToCancel) return;

    setCancellingBooking(bookingToCancel.id);
    try {
      const response = await fetch("/api/cancel-booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          booking_id: bookingToCancel.id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Close modal and reset state
        setShowCancelModal(false);
        setBookingToCancel(null);

        // Refresh user data and bookings
        await fetchUserData();
        await fetchMyBookings();
        await fetchClasses(); // Refresh class data to update participant counts
      } else {
        console.error(`Failed to cancel booking: ${data.error}`);
      }
    } catch (error) {
      console.error("Error cancelling booking:", error);
    } finally {
      setCancellingBooking(null);
    }
  };

  const handleCloseCancelModal = () => {
    setShowCancelModal(false);
    setBookingToCancel(null);
  };

  // Helper function to calculate if cancellation is more than 24 hours before class (EST)
  const isMoreThan24HoursBeforeClass = (booking: any): boolean => {
    if (!booking || !booking.date || !booking.start_time) {
      console.log("Missing booking data:", booking);
      return false;
    }

    try {
      console.log("Raw booking data:", {
        date: booking.date,
        start_time: booking.start_time,
        class_title: booking.class_title,
      });

      // Parse date in YYYY-MM-DD format
      const dateParts = booking.date.split("-");
      const timeParts = booking.start_time.split(":");

      // Create date object explicitly in local timezone (EST)
      const classDateTime = new Date(
        parseInt(dateParts[0]), // year
        parseInt(dateParts[1]) - 1, // month (0-indexed)
        parseInt(dateParts[2]), // day
        parseInt(timeParts[0]), // hour
        parseInt(timeParts[1]), // minute
        parseInt(timeParts[2] || "0") // second (optional)
      );

      // Get current time
      const now = new Date();

      // Calculate hours difference
      const hoursUntilClass =
        (classDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

      // Debug logging for cancellation timing
      console.log("Cancellation timing check:", {
        classDate: booking.date,
        classTime: booking.start_time,
        hoursUntilClass: hoursUntilClass.toFixed(2),
        shouldGetRefund: hoursUntilClass > 24 ? "YES" : "NO",
      });

      return hoursUntilClass > 24;
    } catch (error) {
      console.error("Error calculating cancellation timing:", error, booking);
      return false;
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  return (
    <Layout>
      <SEO
        title="Fitness Classes | FL Best Trainer - Group Training in Sarasota"
        description="Join our dynamic fitness classes in Sarasota. Small group training, specialized workouts, and expert instruction for all fitness levels."
        keywords="fitness classes Sarasota, group training, small group fitness, personal training classes, strength training classes"
      />

      <div className="min-h-screen bg-gradient-to-br from-royal-dark via-royal-navy to-black">
        {/* Hero Section */}
        <section
          className="relative"
          style={{ paddingTop: "20vh", paddingBottom: "1rem" }}
        >
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <div className="flex flex-col sm:flex-row items-center justify-center mb-4 sm:mb-6">
                <FaUsers className="text-3xl sm:text-4xl text-royal-light mb-2 sm:mb-0 sm:mr-4" />
                <h1 className="text-2xl sm:text-4xl md:text-6xl font-bold text-white">
                  Group Fitness Classes
                </h1>
              </div>

              {/* Sign In Button - Only show if user is not signed in */}
              {status !== "loading" && !session && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8"
                >
                  <p className="text-white/80 text-lg mb-4 sm:mb-0 sm:mr-6">
                    Sign in with Google to book classes and track your progress
                  </p>
                  <button
                    onClick={() => (window.location.href = "/auth/signin")}
                    className="px-8 py-3 bg-royal-light text-royal-dark font-semibold rounded-lg hover:bg-white hover:text-royal-dark transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    Sign In with Google
                  </button>
                </motion.div>
              )}

              {/* PWA Container - Top Position */}
              {session && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.15 }}
                  className="mb-4"
                >
                  <AddToHomeScreenButton showAsContainer={true} />
                </motion.div>
              )}

              {/* Dashboard Welcome Section */}
              {session && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="mt-8"
                >
                  {/* Dashboard Header */}
                  <div className="bg-gradient-to-r from-royal-dark/60 to-blue-900/60 backdrop-blur-lg rounded-2xl p-4 sm:p-6 border border-white/10 shadow-xl">
                    <div className="flex flex-col sm:flex-row items-center sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                      <div className="text-center sm:text-left">
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1 sm:mb-2">
                          Welcome back,{" "}
                          <span className="text-royal-light">
                            {userData?.first_name ||
                              userData?.name?.split(" ")[0] ||
                              session.user?.name?.split(" ")[0] ||
                              "User"}
                          </span>
                          !
                        </h2>
                        <p className="text-white/70 text-base sm:text-lg">
                          Your fitness dashboard • Ready to train?
                        </p>
                      </div>
                      {isUserAdmin && (
                        <div className="flex items-center space-x-2">
                          <span className="px-3 py-1.5 bg-gradient-to-r from-yellow-500 to-amber-500 text-white text-sm font-bold rounded-lg shadow-lg">
                            ⚡ ADMIN
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Review Section - Integrated */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="mt-3"
                  >
                    <div className="flex items-center justify-center gap-4 text-xs">
                      <div className="flex items-center gap-1 text-white/60">
                        <FaStar className="text-yellow-400 text-xs" />
                        <span>Happy with your results?</span>
                      </div>
                      <div className="flex gap-2">
                        <a
                          href="https://www.facebook.com/FLBestTrainer/reviews"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 bg-white/10 hover:bg-white/20 text-white px-2 py-1 rounded-lg text-xs font-medium transition-colors duration-200 border border-white/20"
                        >
                          <FaFacebook className="text-xs" />
                          <span className="hidden sm:inline">Facebook</span>
                        </a>
                        <a
                          href="https://g.page/r/CaACepEsFdx0EBM/review"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 bg-white/10 hover:bg-white/20 text-white px-2 py-1 rounded-lg text-xs font-medium transition-colors duration-200 border border-white/20"
                        >
                          <FaGoogle className="text-xs" />
                          <span className="hidden sm:inline">Google</span>
                        </a>
                      </div>
                    </div>
                  </motion.div>
                  {/* Dashboard Stats & Actions */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="mt-4 sm:mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 max-w-6xl mx-auto"
                  >
                    {/* Purchase Package Card - LEFT */}
                    <div className="bg-gradient-to-br from-royal-light/20 to-blue-500/20 backdrop-blur-lg rounded-2xl p-4 sm:p-6 border border-royal-light/30 shadow-lg hover:shadow-xl transition-all duration-300">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between h-full">
                        <div className="flex-1">
                          <div className="flex items-start space-x-3 mb-4">
                            <div className="bg-royal-light/30 p-2 rounded-lg">
                              <FaDumbbell className="text-royal-light text-lg sm:text-xl" />
                            </div>
                            <div>
                              <h3 className="text-white font-bold text-base sm:text-lg mb-1">
                                Weightlifting Package
                              </h3>
                              <p className="text-white/70 text-sm leading-relaxed">
                                10 Sessions • Small Group Training
                                <br />
                                <span className="text-royal-light font-medium">
                                  4-Person Max • $
                                  {weightliftingPackage?.price ||
                                    PACKAGE_CONFIGS.find(
                                      (pkg) =>
                                        pkg.id === "weightlifting-10-class"
                                    )?.price ||
                                    400}
                                </span>
                              </p>
                            </div>
                          </div>

                          {/* Payment Fee Warning */}
                          <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3 mb-4">
                            <p className="text-yellow-300 text-xs font-medium mb-1">
                              💳 Payment Processing Notice
                            </p>
                            <p className="text-yellow-100 text-xs mb-2">
                              <strong>
                                Online payments include a $30 processing fee.
                              </strong>
                            </p>
                            <p className="text-white/80 text-xs">
                              To avoid fees, pay with cash, check, or Zelle.
                              Contact us to arrange.
                            </p>
                          </div>

                          {session ? (
                            <StripeCheckoutButton
                              package={
                                weightliftingPackage ||
                                PACKAGE_CONFIGS.find(
                                  (pkg) => pkg.id === "weightlifting-10-class"
                                )!
                              }
                              className="w-full from-royal-light to-blue-500 hover:from-blue-500 hover:to-royal-light font-bold py-3 px-6 rounded-xl transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                              onSuccess={() => {
                                setTimeout(
                                  () => window.location.reload(),
                                  2000
                                );
                              }}
                              onError={(error) => {
                                console.error("Payment error:", error);
                              }}
                            >
                              Buy Package - $
                              {weightliftingPackage?.price ||
                                PACKAGE_CONFIGS.find(
                                  (pkg) => pkg.id === "weightlifting-10-class"
                                )?.price ||
                                400}
                            </StripeCheckoutButton>
                          ) : (
                            <button
                              className="w-full bg-gradient-to-r from-royal-light to-blue-500 hover:from-blue-500 hover:to-royal-light text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                              onClick={() => {
                                window.location.href = "/auth/signin";
                              }}
                            >
                              Sign In to Purchase
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Classes Counter Card - RIGHT */}
                    <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-2xl p-4 sm:p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
                      <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <div className="flex items-center space-x-3 sm:space-x-4">
                          <div className="bg-royal-light/20 p-2 sm:p-3 rounded-xl">
                            <FaDumbbell className="text-royal-light text-lg sm:text-2xl" />
                          </div>
                          <div>
                            <h3 className="text-white font-bold text-base sm:text-lg">
                              Session Status
                            </h3>
                            <p className="text-white/60 text-xs sm:text-sm">
                              Weightlifting classes
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Session Counters */}
                      <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        {/* Available Sessions */}
                        <div className="text-center">
                          <div className="text-xl sm:text-2xl font-bold text-royal-light">
                            {weightliftingClassesRemaining || 0}
                          </div>
                          <div className="text-white/70 text-xs sm:text-sm">
                            Available
                          </div>
                        </div>

                        {/* Booked Sessions */}
                        <div className="text-center">
                          <div className="text-xl sm:text-2xl font-bold text-amber-400">
                            {weightliftingClassesBooked || 0}
                          </div>
                          <div className="text-white/70 text-xs sm:text-sm">
                            Booked
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-3 sm:mt-4">
                        <div className="bg-white/10 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-royal-light to-blue-400 h-2 rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min(
                                (weightliftingClassesRemaining || 0) * 10,
                                100
                              )}%`,
                            }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-white/50 mt-1.5 sm:mt-2">
                          <span>
                            Available: {weightliftingClassesRemaining || 0}
                          </span>
                          <span>Booked: {weightliftingClassesBooked || 0}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                  {/* Status Messages */}
                  {weightliftingClassesRemaining === 0 && (
                    <p className="text-yellow-300 text-lg mt-4">
                      No sessions remaining - Contact trainer to purchase
                      packages
                    </p>
                  )}
                  {/* My Upcoming Classes Dashboard */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="mt-8 max-w-6xl mx-auto"
                  >
                    <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-xl p-3 sm:p-4 md:p-6 border border-white/20 shadow-lg">
                      {/* Header Section - Improved Mobile Layout */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                        <div className="flex items-center justify-between sm:justify-start">
                          <div className="flex items-center">
                            <div className="bg-royal-light/20 p-2 sm:p-2.5 rounded-lg mr-2 sm:mr-3">
                              <FaCalendarAlt className="text-royal-light text-base sm:text-lg md:text-xl" />
                            </div>
                            <div>
                              <h3 className="text-white font-bold text-base sm:text-lg md:text-xl">
                                My Upcoming Classes
                              </h3>
                              <p className="text-white/60 text-xs sm:text-sm mt-0.5">
                                {myBookings.length}{" "}
                                {myBookings.length === 1 ? "class" : "classes"}{" "}
                                scheduled
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={refreshBookings}
                            className="ml-2 sm:ml-4 p-2 sm:p-2.5 bg-royal-light/20 hover:bg-royal-light/30 rounded-lg transition-colors touch-manipulation flex-shrink-0"
                            title="Refresh bookings"
                          >
                            <svg
                              className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-royal-light"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                              />
                            </svg>
                          </button>
                        </div>

                        {/* Cancellation Policy - Better Mobile Positioning */}
                        <div className="w-full sm:w-auto">
                          <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-400/40 rounded-lg px-2.5 sm:px-3 py-1.5 sm:py-2 backdrop-blur-sm">
                            <p className="text-amber-200 text-xs font-semibold leading-tight">
                              Cancellation Policy
                            </p>
                            <p className="text-amber-100 text-xs leading-tight">
                              24+ hrs: Full refund • &lt;24 hrs: No refund
                            </p>
                          </div>
                        </div>
                      </div>

                      <MyUpcomingClassesGrid
                        bookings={myBookings}
                        classes={classes}
                        onClassSelect={handleUpcomingClassSelect}
                        onCancelBooking={handleCancelBooking}
                        cancellingBooking={cancellingBooking}
                      />
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-2 sm:py-4 md:py-8">
          <div className="container mx-auto px-4">
            {/* Upcoming Classes Section */}
            <div data-component="upcoming">
              <UpcomingClassesSection
                classes={classes}
                onClassSelect={handleUpcomingClassSelect}
              />
            </div>

            {/* Calendar Section */}
            <div className="mt-8 sm:mt-12 md:mt-16" data-component="calendar">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="bg-black/40 backdrop-blur-lg rounded-2xl p-4 sm:p-6 md:p-8 border border-white/10"
              >
                <div className="flex flex-col sm:flex-row sm:items-center mb-4 sm:mb-6">
                  <FaCalendarAlt className="text-xl sm:text-2xl text-royal-light mb-2 sm:mb-0 sm:mr-3" />
                  <h2 className="text-xl sm:text-2xl font-bold text-white">
                    Class Calendar
                  </h2>
                </div>
                <ClassCalendar
                  classes={classes}
                  onDateSelect={handleDateSelect}
                  onClassSelect={handleClassSelect}
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Class Modal */}
        <ClassModal
          classData={selectedClass}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onBook={handleBookClass}
          onCancelBooking={handleCancelBooking}
          isBooking={isBooking}
          sessionsRemaining={0}
          weightliftingClassesRemaining={weightliftingClassesRemaining || 0}
          isAuthenticated={!!session}
          source={modalSource}
          currentlyBooked={myBookings.length}
          weightliftingPackage={weightliftingPackage}
          isAlreadyBooked={
            selectedClass
              ? myBookings.some(
                  (booking) => booking.class_id === selectedClass.id
                )
              : false
          }
          currentBookings={
            selectedClass
              ? myBookings.filter(
                  (booking) => booking.class_id === selectedClass.id
                )
              : []
          }
        />

        {/* Cancel Booking Modal */}
        <CancelBookingModal
          isOpen={showCancelModal}
          onClose={handleCloseCancelModal}
          onConfirm={confirmCancelBooking}
          booking={bookingToCancel}
          isMoreThan24Hours={isMoreThan24HoursBeforeClass(bookingToCancel)}
          isLoading={cancellingBooking === bookingToCancel?.id}
        />
      </div>
    </Layout>
  );
}
