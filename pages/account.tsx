import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSession, getSession } from "next-auth/react";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next";
import Layout from "../components/Layout";
import SEO from "../components/shared/SEO";
import StripeCheckoutButton, {
  PACKAGE_CONFIGS,
} from "../components/shared/StripeCheckoutButton";
import StripeSuccess from "../components/shared/StripeSuccess";
import { useWeightliftingPackage } from "../hooks/usePackages";
import {
  FaUser,
  FaDumbbell,
  FaCalendarAlt,
  FaShoppingCart,
  FaHistory,
  FaEnvelope,
  FaTrophy,
  FaStar,
  FaFacebook,
  FaGoogle,
} from "react-icons/fa";
import AddToHomeScreenButton from "../components/AddToHomeScreenButton";

interface UserData {
  id: string;
  name: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  weightlifting_classes_remaining: number;
  weightlifting_classes_booked: number;
  private_sessions_remaining?: number;
  classes_attended?: number;
  member_since?: string;
  is_admin: boolean;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  fitness_goals?: string;
  medical_conditions?: string;
  address?: string;
}

interface Purchase {
  id: string;
  package_type: string;
  sessions_included: number;
  purchase_date: string;
  amount_paid: number;
  status: string;
}

export default function Account() {
  const { data: session, status } = useSession();
  const { package: weightliftingPackage, loading: packageLoading } =
    useWeightliftingPackage();
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [pastClasses, setPastClasses] = useState([]);
  const [upcomingPrivate, setUpcomingPrivate] = useState([]);
  const [showStripeSuccess, setShowStripeSuccess] = useState(false);
  const [successPackageName, setSuccessPackageName] = useState("");
  const [showMorePackages, setShowMorePackages] = useState(false);
  const [pastPrivate, setPastPrivate] = useState([]);
  const [activeClassTab, setActiveClassTab] = useState<
    "upcoming" | "completed"
  >("upcoming");
  const [activePrivateTab, setActivePrivateTab] = useState<
    "upcoming" | "completed"
  >("upcoming");
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    fitnessGoals: "",
    medicalConditions: "",
  });

  const processStripeSuccess = async (sessionId: string) => {
    try {
      const response = await fetch("/api/stripe/process-success", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sessionId }),
      });

      const result = await response.json();

      if (result.success) {
        setShowStripeSuccess(true);
        // Refresh all data to show updated sessions and purchase history
        fetchUserData();
        fetchPurchaseHistory();
        // Clean up URL
        router.replace("/account", undefined, { shallow: true });
      } else {
        console.error("Error processing payment:", result.error);
      }
    } catch (error) {
      console.error("Error processing payment:", error);
    }
  };

  useEffect(() => {
    if (session?.user?.email) {
      fetchUserData();
      fetchPurchaseHistory();
      fetchUpcomingClasses();
    }

    // Check for Stripe success/cancellation and process payment
    if (router.query.success === "true" && router.query.session_id) {
      processStripeSuccess(router.query.session_id as string);
      setSuccessPackageName(
        decodeURIComponent((router.query.package as string) || "")
      );
    }
  }, [session, router]);

  const fetchUserData = async () => {
    try {
      const response = await fetch("/api/onboarding/status");
      const data = await response.json();

      if (data.success) {
        setUserData(data.user);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const fetchPurchaseHistory = async () => {
    try {
      const response = await fetch(
        `/api/purchases?user_id=${session?.user?.email}`
      );
      const data = await response.json();

      if (data.success) {
        // Transform the API data to match our Purchase interface
        const transformedPurchases: Purchase[] = data.data.map(
          (purchase: any) => ({
            id: purchase.id,
            package_type: purchase.package_type,
            sessions_included: purchase.sessions_included,
            purchase_date: purchase.purchase_date,
            amount_paid: purchase.amount_paid,
            status: purchase.payment_status,
          })
        );
        setPurchases(transformedPurchases);
      } else {
        console.error("Error fetching purchase history:", data.error);
        // Keep empty array if there's an error
        setPurchases([]);
      }
    } catch (error) {
      console.error("Error fetching purchase history:", error);
      setPurchases([]);
    }
  };

  const fetchUpcomingClasses = async () => {
    try {
      const response = await fetch(
        `/api/bookings?user_id=${session?.user?.email}`
      );
      const data = await response.json();

      if (data.success) {
        const now = new Date();

        // Separate group classes and private sessions
        const groupClasses = data.data.filter(
          (booking: any) =>
            booking.class_type !== "private" &&
            booking.class_type !== "private_session"
        );
        const privateSessions = data.data.filter(
          (booking: any) =>
            booking.class_type === "private" ||
            booking.class_type === "private_session"
        );

        // Filter and sort upcoming group classes
        const upcomingGroup = groupClasses
          .filter((booking: any) => {
            // Create a proper datetime by combining date and end_time - timezone safe
            const dateStr = booking.date.split("T")[0]; // Get "2025-10-09" from "2025-10-09T04:00:00.000Z"
            const [year, month, day] = dateStr.split("-").map(Number);
            const [hours, minutes] = booking.end_time.split(":");
            const classDate = new Date(
              year,
              month - 1,
              day,
              parseInt(hours),
              parseInt(minutes),
              0,
              0
            );

            console.log(
              "Class:",
              booking.class_title,
              "End DateTime:",
              classDate,
              "Current:",
              now,
              "Is Future:",
              classDate > now
            );

            return classDate > now && booking.status !== "cancelled";
          })
          .sort((a: any, b: any) => {
            // Timezone-safe date parsing for sorting
            const dateStrA = a.date.split("T")[0];
            const [yearA, monthA, dayA] = dateStrA.split("-").map(Number);
            const [hoursA, minutesA] = a.start_time.split(":");
            const dateA = new Date(
              yearA,
              monthA - 1,
              dayA,
              parseInt(hoursA),
              parseInt(minutesA),
              0,
              0
            );

            const dateStrB = b.date.split("T")[0];
            const [yearB, monthB, dayB] = dateStrB.split("-").map(Number);
            const [hoursB, minutesB] = b.start_time.split(":");
            const dateB = new Date(
              yearB,
              monthB - 1,
              dayB,
              parseInt(hoursB),
              parseInt(minutesB),
              0,
              0
            );

            return dateA.getTime() - dateB.getTime();
          });
        setUpcomingClasses(upcomingGroup);

        // Filter and sort past group classes
        const pastGroup = groupClasses
          .filter((booking: any) => {
            // Create a proper datetime by combining date and end_time
            const classDate = new Date(booking.date);
            const [hours, minutes] = booking.end_time.split(":");
            classDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

            return classDate <= now && booking.status !== "cancelled";
          })
          .sort((a: any, b: any) => {
            const dateA = new Date(`${a.date} ${a.start_time}`);
            const dateB = new Date(`${b.date} ${b.start_time}`);
            return dateB.getTime() - dateA.getTime(); // Most recent first
          });
        setPastClasses(pastGroup);

        // Filter and sort upcoming private sessions
        const upcomingPrivateSessions = privateSessions
          .filter((booking: any) => {
            // Create a proper datetime by combining date and end_time
            const classDate = new Date(booking.date);
            const [hours, minutes] = booking.end_time.split(":");
            classDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

            return classDate > now && booking.status !== "cancelled";
          })
          .sort((a: any, b: any) => {
            const dateA = new Date(`${a.date} ${a.start_time}`);
            const dateB = new Date(`${b.date} ${b.start_time}`);
            return dateA.getTime() - dateB.getTime();
          });
        setUpcomingPrivate(upcomingPrivateSessions);

        // Filter and sort past private sessions
        const pastPrivateSessions = privateSessions
          .filter((booking: any) => {
            // Create a proper datetime by combining date and end_time
            const classDate = new Date(booking.date);
            const [hours, minutes] = booking.end_time.split(":");
            classDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

            return classDate <= now && booking.status !== "cancelled";
          })
          .sort((a: any, b: any) => {
            const dateA = new Date(`${a.date} ${a.start_time}`);
            const dateB = new Date(`${b.date} ${b.start_time}`);
            return dateB.getTime() - dateA.getTime(); // Most recent first
          });
        setPastPrivate(pastPrivateSessions);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing - reset form data
      setEditFormData({
        firstName: "",
        lastName: "",
        phone: "",
        address: "",
        emergencyContactName: "",
        emergencyContactPhone: "",
        fitnessGoals: "",
        medicalConditions: "",
      });
    } else {
      // Start editing - populate form with current data
      const nameParts = userData?.name?.split(" ") || ["", ""];
      setEditFormData({
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" ") || "",
        phone: userData?.phone || "",
        address: userData?.address || "",
        emergencyContactName: userData?.emergency_contact_name || "",
        emergencyContactPhone: userData?.emergency_contact_phone || "",
        fitnessGoals: userData?.fitness_goals || "",
        medicalConditions: userData?.medical_conditions || "",
      });
    }
    setIsEditing(!isEditing);
  };

  const handleSaveChanges = async () => {
    try {
      const response = await fetch("/api/update-user", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editFormData),
      });

      const result = await response.json();

      if (result.success) {
        // Refresh user data to show updated information
        await fetchUserData();
        setIsEditing(false);

        // Show success message (you can add a toast notification here)
        console.log("User information updated successfully");
      } else {
        console.error("Error updating user information:", result.error);
        alert("Failed to update information. Please try again.");
      }
    } catch (error) {
      console.error("Error updating user information:", error);
      alert("Failed to update information. Please try again.");
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-royal-dark via-slate-900 to-black flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-royal-light"></div>
        </div>
      </Layout>
    );
  }

  if (!session) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-royal-dark via-slate-900 to-black flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-white text-2xl mb-4">
              Please log in to access your account
            </h1>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO
        title="My Account - FL's Best Personal Trainer"
        description="Manage your account, view your packages, and track your fitness journey"
      />

      <div
        className="min-h-screen bg-gradient-to-br from-royal-dark via-slate-900 to-black"
        style={{ paddingTop: "15vh" }}
      >
        <div className="container mx-auto px-3 sm:px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-6 sm:mb-8 md:mb-12"
          >
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-2 sm:mb-4">
              My Account
            </h1>
            <p className="text-white/70 text-base sm:text-xl max-w-2xl mx-auto px-2">
              Manage your fitness journey and track your progress
            </p>
          </motion.div>

          {/* Welcome Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="bg-gradient-to-r from-royal-dark/60 to-blue-900/60 backdrop-blur-lg rounded-2xl p-4 sm:p-6 md:p-8 border border-white/10 shadow-xl mb-4 sm:mb-6 md:mb-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center">
                <div className="bg-royal-light/20 p-3 sm:p-4 rounded-full mr-3 sm:mr-6">
                  <FaUser className="text-royal-light text-lg sm:text-2xl" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1 sm:mb-2">
                    Welcome back,{" "}
                    {userData?.first_name && userData?.last_name
                      ? `${userData.first_name} ${userData.last_name}`
                      : userData?.name?.split(" ")[0] ||
                        session.user?.name?.split(" ")[0] ||
                        "User"}
                    !
                  </h2>
                  <p className="text-white/70 text-sm sm:text-base md:text-lg">
                    Member since{" "}
                    {userData?.member_since
                      ? new Date(userData.member_since).toLocaleDateString(
                          "en-US",
                          { month: "long", year: "numeric" }
                        )
                      : "September 2025"}
                  </p>
                </div>
              </div>
              {userData?.is_admin && (
                <div className="flex items-center space-x-2">
                  <div className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg shadow-lg self-start sm:self-center">
                    <span className="font-bold text-sm sm:text-base">
                      ⚡ ADMIN
                    </span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Review Section - Integrated */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-4"
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

          {/* PWA Container - Top Position */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mb-4"
          >
            <AddToHomeScreenButton showAsContainer={true} position="header" />
          </motion.div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
            {/* Weightlifting Sessions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-xl p-3 sm:p-4 md:p-6 border border-white/20 shadow-lg"
            >
              <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4">
                <FaDumbbell className="text-royal-light text-lg sm:text-xl md:text-2xl" />
                <span className="text-xl sm:text-2xl md:text-3xl font-bold text-royal-light">
                  {userData?.weightlifting_classes_remaining || 0}
                </span>
              </div>
              <h3 className="text-white font-semibold mb-0.5 sm:mb-1 text-sm sm:text-base">
                Weightlifting Sessions
              </h3>
              <p className="text-white/60 text-xs sm:text-sm">Remaining</p>
            </motion.div>

            {/* Private Sessions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-xl p-3 sm:p-4 md:p-6 border border-white/20 shadow-lg"
            >
              <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4">
                <FaUser className="text-green-400 text-lg sm:text-xl md:text-2xl" />
                <span className="text-xl sm:text-2xl md:text-3xl font-bold text-green-400">
                  {userData?.private_sessions_remaining || 0}
                </span>
              </div>
              <h3 className="text-white font-semibold mb-0.5 sm:mb-1 text-sm sm:text-base">
                Private Sessions
              </h3>
              <p className="text-white/60 text-xs sm:text-sm">Remaining</p>
            </motion.div>

            {/* Classes Attended */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-xl p-3 sm:p-4 md:p-6 border border-white/20 shadow-lg"
            >
              <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4">
                <FaTrophy className="text-amber-400 text-lg sm:text-xl md:text-2xl" />
                <span className="text-xl sm:text-2xl md:text-3xl font-bold text-amber-400">
                  {userData?.classes_attended || 0}
                </span>
              </div>
              <h3 className="text-white font-semibold mb-0.5 sm:mb-1 text-sm sm:text-base">
                Classes Attended
              </h3>
              <p className="text-white/60 text-xs sm:text-sm">Total</p>
            </motion.div>

            {/* Booked Sessions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-xl p-3 sm:p-4 md:p-6 border border-white/20 shadow-lg"
            >
              <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4">
                <FaCalendarAlt className="text-blue-400 text-lg sm:text-xl md:text-2xl" />
                <span className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-400">
                  {userData?.weightlifting_classes_booked || 0}
                </span>
              </div>
              <h3 className="text-white font-semibold mb-0.5 sm:mb-1 text-sm sm:text-base">
                Booked Sessions
              </h3>
              <p className="text-white/60 text-xs sm:text-sm">
                Pending classes
              </p>
            </motion.div>
          </div>

          {/* Top Section - Purchase Packages, Contact Info, Purchase History */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6 md:mb-8">
            {/* Purchase Packages */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-xl p-4 sm:p-6 border border-white/20 shadow-lg"
            >
              <div className="flex items-center mb-4 sm:mb-6">
                <FaShoppingCart className="text-royal-light text-lg sm:text-xl mr-2 sm:mr-3" />
                <h3 className="text-white font-bold text-lg sm:text-xl">
                  Purchase Packages
                </h3>
              </div>

              <div className="space-y-3 sm:space-y-4">
                {/* Stripe Success Message */}
                {showStripeSuccess && (
                  <div className="mb-4">
                    <StripeSuccess packageName={successPackageName} />
                  </div>
                )}

                {/* Weightlifting Package */}
                <div className="bg-royal-light/10 rounded-lg p-3 sm:p-4 border border-royal-light/20">
                  <div className="flex items-center mb-2 sm:mb-3">
                    <FaDumbbell className="text-royal-light text-base sm:text-lg mr-2" />
                    <h4 className="text-white font-semibold text-sm sm:text-base">
                      Weightlifting Package - $
                      {weightliftingPackage?.price ||
                        PACKAGE_CONFIGS.find(
                          (pkg) => pkg.id === "weightlifting-10-class"
                        )?.price ||
                        400}
                    </h4>
                  </div>
                  <p className="text-white/70 text-xs sm:text-sm mb-3 sm:mb-4">
                    Small group training • 10 sessions • 4-person max • Expert
                    instruction
                  </p>

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
                      To avoid fees, pay with cash, check, or Zelle. Contact us
                      to arrange.
                    </p>
                  </div>

                  <StripeCheckoutButton
                    package={
                      weightliftingPackage ||
                      PACKAGE_CONFIGS.find(
                        (pkg) => pkg.id === "weightlifting-10-class"
                      )!
                    }
                    className="from-royal-light to-blue-500 hover:from-blue-500 hover:to-royal-light"
                    onSuccess={() => {
                      setTimeout(() => window.location.reload(), 2000);
                    }}
                    onError={(error) => {
                      console.error("Payment error:", error);
                      alert("Payment failed. Please try again.");
                    }}
                  >
                    Buy Weightlifting Package
                  </StripeCheckoutButton>
                </div>

                {/* Private Sessions - Contact Only */}
                <div className="bg-green-500/10 rounded-lg p-3 sm:p-4 border border-green-400/20">
                  <div className="flex items-center mb-2 sm:mb-3">
                    <FaUser className="text-green-400 text-base sm:text-lg mr-2" />
                    <h4 className="text-white font-semibold text-sm sm:text-base">
                      Private Sessions
                    </h4>
                  </div>
                  <p className="text-white/70 text-xs sm:text-sm mb-3 sm:mb-4">
                    1-on-1 training • Personalized program • Flexible scheduling
                  </p>
                  <a
                    href="mailto:flbesttrainer@gmail.com?subject=Private Session Inquiry&body=Hi Gavin, I'm interested in private training sessions. Please contact me to discuss options and pricing."
                    className="w-full inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-emerald-500 hover:to-green-500 text-white font-medium text-sm sm:text-base rounded-lg transition-all duration-300 touch-manipulation"
                  >
                    <FaEnvelope className="mr-1 sm:mr-2 text-xs sm:text-sm" />
                    Contact for Private Sessions
                  </a>
                </div>

                {/* More Packages Button */}
                <div className="pt-4 border-t border-white/10">
                  <button
                    onClick={() => setShowMorePackages(!showMorePackages)}
                    className="w-full text-royal-light hover:text-white transition-colors duration-300 text-sm flex items-center justify-center"
                  >
                    {showMorePackages
                      ? "Show Less"
                      : "View All Training Packages"}
                    <motion.svg
                      className="w-4 h-4 ml-2"
                      animate={{ rotate: showMorePackages ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </motion.svg>
                  </button>
                </div>

                {/* Expanded Package Options */}
                <motion.div
                  initial={false}
                  animate={{
                    height: showMorePackages ? "auto" : 0,
                    opacity: showMorePackages ? 1 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  {showMorePackages && (
                    <div className="grid grid-cols-1 gap-3 pt-4">
                      {PACKAGE_CONFIGS.filter(
                        (pkg) =>
                          pkg.id !== "weightlifting-10-class" &&
                          pkg.type !== "private"
                      ).map((pkg) => (
                        <div
                          key={pkg.id}
                          className="bg-white/5 rounded-lg p-3 border border-white/10"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="text-white font-medium text-sm">
                              {pkg.name}
                            </h5>
                            <span className="text-royal-light font-bold text-sm">
                              ${pkg.price}
                            </span>
                          </div>
                          <p className="text-white/60 text-xs mb-3">
                            {pkg.description}
                          </p>

                          {/* Payment Fee Warning */}
                          <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-2 mb-3">
                            <p className="text-yellow-300 text-xs font-medium mb-1">
                              💳 +$30 processing fee
                            </p>
                            <p className="text-white/80 text-xs">
                              Use cash, check, or Zelle to avoid fees
                            </p>
                          </div>

                          <StripeCheckoutButton
                            package={pkg}
                            className="text-xs py-2"
                            onSuccess={() => {
                              setTimeout(() => window.location.reload(), 2000);
                            }}
                            onError={(error) => {
                              console.error("Payment error:", error);
                              alert("Payment failed. Please try again.");
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </div>
            </motion.div>

            {/* Purchase History */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-xl p-4 sm:p-6 border border-white/20 shadow-lg"
            >
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="flex items-center">
                  <FaHistory className="text-white text-lg sm:text-xl mr-2 sm:mr-3" />
                  <h3 className="text-white font-bold text-lg sm:text-xl">
                    Purchase History
                  </h3>
                </div>
              </div>

              {purchases.length > 0 ? (
                <div className="space-y-2 sm:space-y-3 max-h-60 sm:max-h-80 overflow-y-auto">
                  {purchases.slice(0, 3).map((purchase) => (
                    <div
                      key={purchase.id}
                      className="bg-white/5 rounded-lg p-2.5 sm:p-3 border border-white/10"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-semibold text-xs sm:text-sm truncate">
                            {purchase.package_type}
                          </h4>
                          <p className="text-white/70 text-xs">
                            {purchase.sessions_included} sessions •{" "}
                            {new Date(
                              purchase.purchase_date
                            ).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right ml-2 flex-shrink-0">
                          <div className="text-green-400 font-bold text-xs sm:text-sm">
                            ${purchase.amount_paid}
                          </div>
                          <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium bg-green-100/10 text-green-300">
                            {purchase.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {purchases.length > 3 && (
                    <div className="text-center pt-1 sm:pt-2">
                      <p className="text-white/60 text-xs">
                        +{purchases.length - 3} more purchases
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 sm:py-8">
                  <FaHistory className="text-white/30 text-xl sm:text-2xl mx-auto mb-2 sm:mb-3" />
                  <p className="text-white/70 text-xs sm:text-sm">
                    No purchase history yet
                  </p>
                </div>
              )}
            </motion.div>

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-xl p-4 sm:p-6 border border-white/20 shadow-lg"
            >
              <div className="flex items-center mb-4 sm:mb-6">
                <FaEnvelope className="text-white text-lg sm:text-xl mr-2 sm:mr-3" />
                <h3 className="text-white font-bold text-lg sm:text-xl">
                  Contact Information
                </h3>
              </div>

              {!isEditing ? (
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="text-white/70 text-xs sm:text-sm mb-1 block">
                      Email
                    </label>
                    <div className="text-white font-medium text-xs sm:text-sm break-all">
                      {userData?.email || session.user?.email}
                    </div>
                  </div>
                  <div>
                    <label className="text-white/70 text-xs sm:text-sm mb-1 block">
                      Phone
                    </label>
                    <div className="text-white font-medium text-xs sm:text-sm">
                      {userData?.phone || "Not provided"}
                    </div>
                  </div>
                  <div>
                    <label className="text-white/70 text-xs sm:text-sm mb-1 block">
                      Address
                    </label>
                    <div className="text-white font-medium text-xs sm:text-sm">
                      {userData?.address || "Not provided"}
                    </div>
                  </div>
                  <div>
                    <label className="text-white/70 text-xs sm:text-sm mb-1 block">
                      Emergency Contact
                    </label>
                    <div className="text-white font-medium text-xs sm:text-sm">
                      {userData?.emergency_contact_name || "Not provided"}
                    </div>
                  </div>
                  <div>
                    <label className="text-white/70 text-xs sm:text-sm mb-1 block">
                      Emergency Phone
                    </label>
                    <div className="text-white font-medium text-xs sm:text-sm">
                      {userData?.emergency_contact_phone || "Not provided"}
                    </div>
                  </div>
                  <div>
                    <label className="text-white/70 text-xs sm:text-sm mb-1 block">
                      Fitness Goals
                    </label>
                    <div className="text-white font-medium text-xs sm:text-sm">
                      {userData?.fitness_goals || "Not provided"}
                    </div>
                  </div>
                  <div>
                    <label className="text-white/70 text-xs sm:text-sm mb-1 block">
                      Medical Conditions
                    </label>
                    <div className="text-white font-medium text-xs sm:text-sm">
                      {userData?.medical_conditions || "Not provided"}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <div>
                      <label className="text-white/70 text-xs sm:text-sm mb-1 block">
                        First Name *
                      </label>
                      <input
                        type="text"
                        value={editFormData.firstName}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            firstName: e.target.value,
                          })
                        }
                        className="w-full bg-white/10 text-white text-xs sm:text-sm rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 border border-white/20 focus:border-royal-light focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-white/70 text-xs sm:text-sm mb-1 block">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        value={editFormData.lastName}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            lastName: e.target.value,
                          })
                        }
                        className="w-full bg-white/10 text-white text-xs sm:text-sm rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 border border-white/20 focus:border-royal-light focus:outline-none"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-white/70 text-xs sm:text-sm mb-1 block">
                      Email
                    </label>
                    <div className="text-white/50 font-medium text-xs sm:text-sm break-all bg-white/5 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2">
                      {userData?.email || session.user?.email} (Cannot be
                      changed)
                    </div>
                  </div>
                  <div>
                    <label className="text-white/70 text-xs sm:text-sm mb-1 block">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={editFormData.phone}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          phone: e.target.value,
                        })
                      }
                      className="w-full bg-white/10 text-white text-xs sm:text-sm rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 border border-white/20 focus:border-royal-light focus:outline-none"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div>
                    <label className="text-white/70 text-xs sm:text-sm mb-1 block">
                      Address
                    </label>
                    <input
                      type="text"
                      value={editFormData.address}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          address: e.target.value,
                        })
                      }
                      className="w-full bg-white/10 text-white text-xs sm:text-sm rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 border border-white/20 focus:border-royal-light focus:outline-none"
                      placeholder="Street address, city, state, zip"
                    />
                  </div>
                  <div>
                    <label className="text-white/70 text-xs sm:text-sm mb-1 block">
                      Emergency Contact Name
                    </label>
                    <input
                      type="text"
                      value={editFormData.emergencyContactName}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          emergencyContactName: e.target.value,
                        })
                      }
                      className="w-full bg-white/10 text-white text-xs sm:text-sm rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 border border-white/20 focus:border-royal-light focus:outline-none"
                      placeholder="Full name"
                    />
                  </div>
                  <div>
                    <label className="text-white/70 text-xs sm:text-sm mb-1 block">
                      Emergency Contact Phone
                    </label>
                    <input
                      type="tel"
                      value={editFormData.emergencyContactPhone}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          emergencyContactPhone: e.target.value,
                        })
                      }
                      className="w-full bg-white/10 text-white text-xs sm:text-sm rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 border border-white/20 focus:border-royal-light focus:outline-none"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div>
                    <label className="text-white/70 text-xs sm:text-sm mb-1 block">
                      Fitness Goals
                    </label>
                    <textarea
                      value={editFormData.fitnessGoals}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          fitnessGoals: e.target.value,
                        })
                      }
                      className="w-full bg-white/10 text-white text-xs sm:text-sm rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 border border-white/20 focus:border-royal-light focus:outline-none resize-none"
                      rows={2}
                      placeholder="What are your fitness goals?"
                    />
                  </div>
                  <div>
                    <label className="text-white/70 text-xs sm:text-sm mb-1 block">
                      Medical Conditions
                    </label>
                    <textarea
                      value={editFormData.medicalConditions}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          medicalConditions: e.target.value,
                        })
                      }
                      className="w-full bg-white/10 text-white text-xs sm:text-sm rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 border border-white/20 focus:border-royal-light focus:outline-none resize-none"
                      rows={2}
                      placeholder="Any medical conditions or limitations"
                    />
                  </div>
                </div>
              )}

              <div className="mt-3 sm:mt-4 space-y-2">
                {!isEditing ? (
                  <button
                    onClick={handleEditToggle}
                    className="w-full bg-royal-light/20 hover:bg-royal-light/30 text-royal-light font-medium py-2 px-3 sm:px-4 rounded-lg transition-all duration-200 text-xs sm:text-sm touch-manipulation"
                  >
                    Update Information
                  </button>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handleSaveChanges}
                      className="bg-green-500/20 hover:bg-green-500/30 text-green-400 font-medium py-2 px-3 sm:px-4 rounded-lg transition-all duration-200 text-xs sm:text-sm touch-manipulation"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={handleEditToggle}
                      className="bg-red-500/20 hover:bg-red-500/30 text-red-400 font-medium py-2 px-3 sm:px-4 rounded-lg transition-all duration-200 text-xs sm:text-sm touch-manipulation"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Classes Section - Full Width Side by Side */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
            {/* Classes Section - Side by Side */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
              {/* Group Classes Tabbed Container */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-xl p-4 sm:p-6 border border-white/20 shadow-lg"
              >
                <div className="flex items-center mb-4 sm:mb-6">
                  <FaDumbbell className="text-royal-light text-lg sm:text-xl mr-2 sm:mr-3" />
                  <h3 className="text-white font-bold text-lg sm:text-xl">
                    Group Classes
                  </h3>
                </div>

                {/* Tabs */}
                <div className="flex space-x-1 mb-4 sm:mb-6">
                  <button
                    onClick={() => setActiveClassTab("upcoming")}
                    className={`flex-1 py-1.5 sm:py-2 px-2 sm:px-4 rounded-lg font-medium text-xs sm:text-sm transition-all duration-200 touch-manipulation ${
                      activeClassTab === "upcoming"
                        ? "bg-blue-500/20 text-blue-300 border border-blue-400/30"
                        : "bg-white/5 text-white/70 hover:bg-white/10"
                    }`}
                  >
                    Upcoming ({upcomingClasses.length})
                  </button>
                  <button
                    onClick={() => setActiveClassTab("completed")}
                    className={`flex-1 py-1.5 sm:py-2 px-2 sm:px-4 rounded-lg font-medium text-xs sm:text-sm transition-all duration-200 touch-manipulation ${
                      activeClassTab === "completed"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-400/30"
                        : "bg-white/5 text-white/70 hover:bg-white/10"
                    }`}
                  >
                    Completed ({pastClasses.length})
                  </button>
                </div>

                {/* Tab Content */}
                <div className="min-h-[200px] sm:min-h-[300px]">
                  {activeClassTab === "upcoming" && (
                    <div>
                      {upcomingClasses.length > 0 ? (
                        <div className="space-y-2 sm:space-y-3 max-h-60 sm:max-h-80 overflow-y-auto">
                          {upcomingClasses.map((classItem: any, index) => (
                            <div
                              key={`upcoming-${classItem.id}-${index}`}
                              className="bg-blue-500/10 rounded-lg p-3 sm:p-4 border border-blue-400/20"
                            >
                              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-white font-semibold text-sm sm:text-base md:text-lg">
                                    {classItem.class_title}
                                  </h4>
                                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mt-1 sm:mt-2 text-xs sm:text-sm space-y-1 sm:space-y-0">
                                    <span className="text-blue-400 font-medium">
                                      {new Date(
                                        classItem.date
                                      ).toLocaleDateString("en-US", {
                                        weekday: "long",
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                      })}
                                    </span>
                                    <span className="text-white/80">
                                      {new Date(
                                        `2000-01-01 ${classItem.start_time}`
                                      ).toLocaleTimeString("en-US", {
                                        hour: "numeric",
                                        minute: "2-digit",
                                        hour12: true,
                                      })}{" "}
                                      -{" "}
                                      {new Date(
                                        `2000-01-01 ${classItem.end_time}`
                                      ).toLocaleTimeString("en-US", {
                                        hour: "numeric",
                                        minute: "2-digit",
                                        hour12: true,
                                      })}
                                    </span>
                                    <span className="text-purple-300 truncate">
                                      {classItem.location}
                                    </span>
                                  </div>
                                  <div className="text-white/60 text-xs sm:text-sm mt-1">
                                    Instructor: {classItem.instructor}
                                  </div>
                                </div>
                                <div className="flex-shrink-0 self-start sm:self-center">
                                  <span className="inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-300 border border-green-400/30">
                                    Booked
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 sm:py-12">
                          <FaCalendarAlt className="text-white/30 text-2xl sm:text-3xl mx-auto mb-2 sm:mb-3" />
                          <p className="text-white/70 text-base sm:text-lg">
                            No upcoming group classes
                          </p>
                          <p className="text-white/50 text-xs sm:text-sm mb-3 sm:mb-4">
                            Book some classes to see them here
                          </p>
                          <button
                            onClick={() => router.push("/classes")}
                            className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 font-medium py-1.5 sm:py-2 px-3 sm:px-4 rounded-lg transition-all duration-200 text-sm touch-manipulation"
                          >
                            Browse Classes
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {activeClassTab === "completed" && (
                    <div>
                      {pastClasses.length > 0 ? (
                        <div className="space-y-2 sm:space-y-3 max-h-60 sm:max-h-80 overflow-y-auto">
                          {pastClasses
                            .slice(0, 10)
                            .map((classItem: any, index) => (
                              <div
                                key={`past-${classItem.id}-${index}`}
                                className="bg-amber-500/10 rounded-lg p-3 sm:p-4 border border-amber-400/20"
                              >
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-white font-semibold text-sm sm:text-base">
                                      {classItem.class_title}
                                    </h4>
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mt-1 text-xs sm:text-sm space-y-1 sm:space-y-0">
                                      <span className="text-amber-400 font-medium">
                                        {new Date(
                                          classItem.date
                                        ).toLocaleDateString("en-US", {
                                          weekday: "short",
                                          month: "short",
                                          day: "numeric",
                                          year: "numeric",
                                        })}
                                      </span>
                                      <span className="text-white/70">
                                        {new Date(
                                          `2000-01-01 ${classItem.start_time}`
                                        ).toLocaleTimeString("en-US", {
                                          hour: "numeric",
                                          minute: "2-digit",
                                          hour12: true,
                                        })}
                                      </span>
                                      <span className="text-purple-300 truncate">
                                        {classItem.location}
                                      </span>
                                    </div>
                                    <div className="text-white/60 text-xs sm:text-sm mt-1">
                                      Instructor: {classItem.instructor}
                                    </div>
                                  </div>
                                  <div className="flex-shrink-0 self-start sm:self-center">
                                    <span className="inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-400/30">
                                      ✓ Completed
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          {pastClasses.length > 10 && (
                            <div className="text-center pt-2 sm:pt-4">
                              <p className="text-white/60 text-xs sm:text-sm">
                                Showing 10 of {pastClasses.length} completed
                                classes
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-8 sm:py-12">
                          <FaHistory className="text-white/30 text-2xl sm:text-3xl mx-auto mb-2 sm:mb-3" />
                          <p className="text-white/70 text-sm sm:text-base">
                            No completed group classes yet
                          </p>
                          <p className="text-white/50 text-xs sm:text-sm">
                            Complete some classes to see your history here
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Private Sessions Tabbed Container */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-xl p-4 sm:p-6 border border-white/20 shadow-lg"
              >
                <div className="flex items-center mb-4 sm:mb-6">
                  <FaUser className="text-green-400 text-lg sm:text-xl mr-2 sm:mr-3" />
                  <h3 className="text-white font-bold text-lg sm:text-xl">
                    Private Sessions
                  </h3>
                </div>

                {/* Tabs */}
                <div className="flex space-x-1 mb-4 sm:mb-6">
                  <button
                    onClick={() => setActivePrivateTab("upcoming")}
                    className={`flex-1 py-1.5 sm:py-2 px-2 sm:px-4 rounded-lg font-medium text-xs sm:text-sm transition-all duration-200 touch-manipulation ${
                      activePrivateTab === "upcoming"
                        ? "bg-green-500/20 text-green-300 border border-green-400/30"
                        : "bg-white/5 text-white/70 hover:bg-white/10"
                    }`}
                  >
                    Upcoming ({upcomingPrivate.length})
                  </button>
                  <button
                    onClick={() => setActivePrivateTab("completed")}
                    className={`flex-1 py-1.5 sm:py-2 px-2 sm:px-4 rounded-lg font-medium text-xs sm:text-sm transition-all duration-200 touch-manipulation ${
                      activePrivateTab === "completed"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
                        : "bg-white/5 text-white/70 hover:bg-white/10"
                    }`}
                  >
                    Completed ({pastPrivate.length})
                  </button>
                </div>

                {/* Tab Content */}
                <div className="min-h-[200px] sm:min-h-[300px]">
                  {activePrivateTab === "upcoming" && (
                    <div>
                      {upcomingPrivate.length > 0 ? (
                        <div className="space-y-2 sm:space-y-3 max-h-60 sm:max-h-80 overflow-y-auto">
                          {upcomingPrivate.map((session: any, index) => (
                            <div
                              key={`upcoming-private-${session.id}-${index}`}
                              className="bg-green-500/10 rounded-lg p-3 sm:p-4 border border-green-400/20"
                            >
                              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-white font-semibold text-sm sm:text-base md:text-lg">
                                    {session.class_title ||
                                      "Private Training Session"}
                                  </h4>
                                  <div className="flex items-center space-x-4 mt-2 text-sm">
                                    <span className="text-green-400 font-medium">
                                      {new Date(
                                        session.date
                                      ).toLocaleDateString("en-US", {
                                        weekday: "long",
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                      })}
                                    </span>
                                    <span className="text-white/80">
                                      {new Date(
                                        `2000-01-01 ${session.start_time}`
                                      ).toLocaleTimeString("en-US", {
                                        hour: "numeric",
                                        minute: "2-digit",
                                        hour12: true,
                                      })}{" "}
                                      -{" "}
                                      {new Date(
                                        `2000-01-01 ${session.end_time}`
                                      ).toLocaleTimeString("en-US", {
                                        hour: "numeric",
                                        minute: "2-digit",
                                        hour12: true,
                                      })}
                                    </span>
                                    <span className="text-purple-300">
                                      {session.location}
                                    </span>
                                  </div>
                                  <div className="text-white/60 text-sm mt-1">
                                    Trainer: {session.instructor}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-300 border border-green-400/30">
                                    Scheduled
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <FaUser className="text-white/30 text-3xl mx-auto mb-3" />
                          <p className="text-white/70 text-lg">
                            No upcoming private sessions
                          </p>
                          <p className="text-white/50 text-sm">
                            Contact your trainer to schedule private sessions
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {activePrivateTab === "completed" && (
                    <div>
                      {pastPrivate.length > 0 ? (
                        <div className="space-y-3 max-h-80 overflow-y-auto">
                          {pastPrivate
                            .slice(0, 10)
                            .map((session: any, index) => (
                              <div
                                key={`past-private-${session.id}-${index}`}
                                className="bg-emerald-500/10 rounded-lg p-4 border border-emerald-400/20"
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h4 className="text-white font-semibold">
                                      {session.class_title ||
                                        "Private Training Session"}
                                    </h4>
                                    <div className="flex items-center space-x-4 mt-1 text-sm">
                                      <span className="text-emerald-400 font-medium">
                                        {new Date(
                                          session.date
                                        ).toLocaleDateString("en-US", {
                                          weekday: "short",
                                          month: "short",
                                          day: "numeric",
                                          year: "numeric",
                                        })}
                                      </span>
                                      <span className="text-white/70">
                                        {new Date(
                                          `2000-01-01 ${session.start_time}`
                                        ).toLocaleTimeString("en-US", {
                                          hour: "numeric",
                                          minute: "2-digit",
                                          hour12: true,
                                        })}
                                      </span>
                                      <span className="text-purple-300">
                                        {session.location}
                                      </span>
                                    </div>
                                    <div className="text-white/60 text-sm mt-1">
                                      Trainer: {session.instructor}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                                      ✓ Completed
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          {pastPrivate.length > 10 && (
                            <div className="text-center pt-4">
                              <p className="text-white/60 text-sm">
                                Showing 10 of {pastPrivate.length} completed
                                sessions
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <FaHistory className="text-white/30 text-3xl mx-auto mb-3" />
                          <p className="text-white/70">
                            No completed private sessions yet
                          </p>
                          <p className="text-white/50 text-sm">
                            Complete some sessions to see your history here
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>

          {/* Settings Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="mt-8"
          >
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-xl p-4 sm:p-6 border border-white/20 shadow-lg">
              <div className="flex items-center mb-4 sm:mb-6">
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-white mr-2 sm:mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <h3 className="text-white font-bold text-lg sm:text-xl">
                  Settings
                </h3>
              </div>

              {/* Add to Home Screen Instructions */}
              <div className="mb-6">
                <h4 className="text-white font-semibold text-base sm:text-lg mb-3 flex items-center">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Add FL Best Trainer to Home Screen
                </h4>
                <p className="text-white/70 text-sm mb-4">
                  Get quick access to FL Best Trainer like a native app. Follow
                  these steps based on your device:
                </p>

                {/* Device-specific instructions */}
                <div className="space-y-4">
                  {/* iOS Instructions */}
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex items-center mb-3">
                      <svg
                        className="w-5 h-5 text-white mr-2"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                      </svg>
                      <h5 className="text-white font-medium text-sm">
                        iPhone/iPad (Safari)
                      </h5>
                    </div>
                    <ol className="list-decimal list-inside text-white/70 text-xs space-y-1 ml-7">
                      <li>
                        Tap the Share button (square with arrow pointing up) at
                        the bottom of Safari
                      </li>
                      <li>Scroll down and tap "Add to Home Screen"</li>
                      <li>Tap "Add" in the top-right corner</li>
                    </ol>
                  </div>

                  {/* Android Instructions */}
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex items-center mb-3">
                      <svg
                        className="w-5 h-5 text-white mr-2"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993.0001.5511-.4482.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.503C15.5902 8.2439 13.8533 7.8508 12 7.8508s-3.5902.3931-5.1367 1.0989L4.841 5.4467a.4161.4161 0 00-.5677-.1521.4157.4157 0 00-.1521.5676l1.9973 3.4592C2.6889 11.1867.3432 14.6589 0 18.761h24c-.3435-4.1021-2.6892-7.5743-6.1185-9.4196" />
                      </svg>
                      <h5 className="text-white font-medium text-sm">
                        Android (Chrome)
                      </h5>
                    </div>
                    <ol className="list-decimal list-inside text-white/70 text-xs space-y-1 ml-7">
                      <li>Tap the menu (three dots) in the top-right corner</li>
                      <li>Tap "Add to Home screen" or "Install app"</li>
                      <li>Tap "Add" or "Install" to confirm</li>
                    </ol>
                  </div>

                  {/* Desktop Instructions */}
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex items-center mb-3">
                      <svg
                        className="w-5 h-5 text-white mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      <h5 className="text-white font-medium text-sm">
                        Desktop (Chrome/Edge)
                      </h5>
                    </div>
                    <ol className="list-decimal list-inside text-white/70 text-xs space-y-1 ml-7">
                      <li>
                        Look for the install icon in the address bar (computer
                        with down arrow)
                      </li>
                      <li>Click the icon and select "Install"</li>
                      <li>Or use the menu → "Install FL Best Trainer..."</li>
                    </ol>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-blue-500/10 border border-blue-400/20 rounded-lg">
                  <p className="text-blue-200 text-xs flex items-start">
                    <svg
                      className="w-4 h-4 text-blue-400 mr-2 mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Once installed, you can access FL Best Trainer directly from
                    your home screen or desktop, just like any other app!
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}

// Protect the page - require authentication
export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/auth/signin",
        permanent: false,
      },
    };
  }

  return {
    props: {
      session,
    },
  };
};
