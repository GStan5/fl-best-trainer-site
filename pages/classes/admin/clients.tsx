import Layout from "@/components/shared/Layout";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  FaUsers,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaCheckCircle,
  FaTimesCircle,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaFileContract,
  FaTimes,
  FaSave,
  FaFileAlt,
  FaEye,
  FaDumbbell,
  FaUserTie,
} from "react-icons/fa";

interface Client {
  id: string;
  name: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  waiver_signed: boolean;
  waiver_signed_date: string;
  waiver_pdf_data?: string; // Base64 encoded PDF data
  waiver_pdf_filename?: string;
  onboarding_completed: boolean;
  created_at: string;
  weightlifting_classes_remaining?: number;
  personal_training_sessions_remaining?: number;
  total_bookings?: number;
  confirmed_bookings?: number;
  cancelled_bookings?: number;
  waitlist_bookings?: number;
}

export default function AdminClientsPage() {
  const { data: session, status } = useSession();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [showWaiverModal, setShowWaiverModal] = useState(false);
  const [viewingWaiverClient, setViewingWaiverClient] = useState<Client | null>(
    null
  );
  const [showSessionEditModal, setShowSessionEditModal] = useState(false);
  const [editingSessionsClient, setEditingSessionsClient] =
    useState<Client | null>(null);
  const [sessionEditData, setSessionEditData] = useState({
    weightlifting_classes_remaining: 0,
    personal_training_sessions_remaining: 0,
  });
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    first_name: "",
    last_name: "",
    phone: "",
    address: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    waiver_signed: false,
    onboarding_completed: false,
  });
  const [saving, setSaving] = useState(false);

  // Manual Purchase Modal State
  const [showManualPurchaseModal, setShowManualPurchaseModal] = useState(false);
  const [selectedClientForPurchase, setSelectedClientForPurchase] =
    useState<Client | null>(null);
  const [manualPurchaseData, setManualPurchaseData] = useState({
    client_email: "",
    package_type: "",
    sessions_included: "",
    amount_paid: "",
    payment_method: "cash",
    notes: "",
  });

  // Purchase History State
  const [activeTab, setActiveTab] = useState<"details" | "purchases">(
    "details"
  );
  const [clientPurchases, setClientPurchases] = useState<any[]>([]);
  const [loadingPurchases, setLoadingPurchases] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<any | null>(null);
  const [purchaseFormData, setPurchaseFormData] = useState({
    package_type: "",
    sessions_included: 0,
    amount_paid: 0,
    payment_method: "",
    payment_status: "",
    notes: "",
  });

  // Check if user is admin using database field
  const isAdmin = session?.user?.isAdmin === true;

  useEffect(() => {
    if (session && isAdmin) {
      fetchClients();
    }
  }, [session, isAdmin]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/clients");
      const data = await response.json();

      if (data.success) {
        setClients(data.clients);
      } else {
        setError(data.error || "Failed to fetch clients");
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
      setError("Error fetching clients");
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter(
    (client) =>
      client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone?.includes(searchTerm)
  );

  const handleDeleteClient = async (clientId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this client? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/clients/${clientId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setClients(clients.filter((client) => client.id !== clientId));
      } else {
        alert("Failed to delete client");
      }
    } catch (error) {
      console.error("Error deleting client:", error);
      alert("Error deleting client");
    }
  };

  const resetForm = () => {
    setFormData({
      email: "",
      first_name: "",
      last_name: "",
      phone: "",
      address: "",
      emergency_contact_name: "",
      emergency_contact_phone: "",
      waiver_signed: false,
      onboarding_completed: false,
    });
  };

  const openAddModal = () => {
    resetForm();
    setEditingClient(null);
    setShowAddModal(true);
  };

  const openEditModal = (client: Client) => {
    setFormData({
      email: client.email || "",
      first_name: client.first_name || "",
      last_name: client.last_name || "",
      phone: client.phone || "",
      address: client.address || "",
      emergency_contact_name: client.emergency_contact_name || "",
      emergency_contact_phone: client.emergency_contact_phone || "",
      waiver_signed: client.waiver_signed || false,
      onboarding_completed: client.onboarding_completed || false,
    });
    setEditingClient(client);
    setActiveTab("details"); // Reset to details tab
    fetchClientPurchases(client.email); // Fetch purchases when opening modal
    setShowAddModal(true);
  };

  const fetchClientPurchases = async (userEmail: string) => {
    setLoadingPurchases(true);
    try {
      const response = await fetch(`/api/purchases?user_id=${userEmail}`);
      const data = await response.json();
      if (data.success) {
        setClientPurchases(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching purchases:", error);
    } finally {
      setLoadingPurchases(false);
    }
  };

  const handleDeletePurchase = async (purchaseId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this purchase? This will remove the sessions from the client's account."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/purchases/${purchaseId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        alert(
          `Purchase deleted successfully. ${data.sessions_removed} sessions removed from account.`
        );
        // Refresh purchases and clients list
        if (editingClient) {
          fetchClientPurchases(editingClient.email);
        }
        fetchClients();
      } else {
        alert(data.error || "Failed to delete purchase");
      }
    } catch (error) {
      console.error("Error deleting purchase:", error);
      alert("Error deleting purchase");
    }
  };

  const handleEditPurchase = (purchase: any) => {
    setEditingPurchase(purchase);
    setPurchaseFormData({
      package_type: purchase.package_type,
      sessions_included: purchase.sessions_included,
      amount_paid: purchase.amount_paid,
      payment_method: purchase.payment_method || "",
      payment_status: purchase.payment_status || "completed",
      notes: purchase.notes || "",
    });
  };

  const handleSavePurchaseEdit = async () => {
    if (!editingPurchase) return;

    const sessionsDifference =
      purchaseFormData.sessions_included - editingPurchase.sessions_included;

    try {
      const response = await fetch(
        `/api/admin/purchases/${editingPurchase.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...purchaseFormData,
            sessions_difference: sessionsDifference,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        alert("Purchase updated successfully");
        setEditingPurchase(null);
        if (editingClient) {
          fetchClientPurchases(editingClient.email);
        }
        fetchClients();
      } else {
        alert(data.error || "Failed to update purchase");
      }
    } catch (error) {
      console.error("Error updating purchase:", error);
      alert("Error updating purchase");
    }
  };

  const handleSaveClient = async () => {
    setSaving(true);
    try {
      const url = editingClient
        ? `/api/admin/clients/${editingClient.id}`
        : "/api/admin/clients";

      const method = editingClient ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        if (editingClient) {
          // Update existing client in list
          setClients(
            clients.map((client) =>
              client.id === editingClient.id
                ? { ...client, ...data.client }
                : client
            )
          );
        } else {
          // Add new client to list
          setClients([data.client, ...clients]);
        }

        setShowAddModal(false);
        resetForm();
        setEditingClient(null);
      } else {
        alert(data.error || "Failed to save client");
      }
    } catch (error) {
      console.error("Error saving client:", error);
      alert("Error saving client");
    } finally {
      setSaving(false);
    }
  };

  const handleViewWaiver = async (client: Client) => {
    if (!client.waiver_signed) {
      alert("This client has not signed a waiver yet.");
      return;
    }

    try {
      const response = await fetch(`/api/admin/clients/${client.id}/waiver`);
      const data = await response.json();

      if (data.success) {
        setViewingWaiverClient({
          ...client,
          waiver_pdf_data: data.waiverData,
          waiver_pdf_filename: data.filename || "waiver.pdf",
        });
        setShowWaiverModal(true);
      } else {
        alert(data.error || "Could not retrieve waiver data for this client.");
      }
    } catch (error) {
      console.error("Error fetching waiver:", error);
      alert("Error fetching waiver data");
    }
  };

  const handleEditSessions = (client: Client) => {
    setEditingSessionsClient(client);
    setSessionEditData({
      weightlifting_classes_remaining:
        client.weightlifting_classes_remaining || 0,
      personal_training_sessions_remaining:
        client.personal_training_sessions_remaining || 0,
    });
    setShowSessionEditModal(true);
  };

  const handleSaveSessions = async () => {
    if (!editingSessionsClient) return;

    setSaving(true);
    console.log("Saving session data:", sessionEditData);
    console.log("Client ID:", editingSessionsClient.id);

    try {
      const response = await fetch(
        `/api/admin/clients/${editingSessionsClient.id}/sessions`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(sessionEditData),
        }
      );

      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response data:", data);

      if (data.success) {
        // Update the client in the local state
        setClients((prev) =>
          prev.map((client) =>
            client.id === editingSessionsClient.id
              ? {
                  ...client,
                  weightlifting_classes_remaining:
                    sessionEditData.weightlifting_classes_remaining,
                  personal_training_sessions_remaining:
                    sessionEditData.personal_training_sessions_remaining,
                }
              : client
          )
        );

        setShowSessionEditModal(false);
        setEditingSessionsClient(null);
        alert("Session counts updated successfully!");
      } else {
        alert(data.error || "Failed to update session counts");
      }
    } catch (error) {
      console.error("Error updating session counts:", error);
      alert("Error updating session counts");
    } finally {
      setSaving(false);
    }
  };

  // Manual Purchase Functions
  const handleManualPurchase = async () => {
    try {
      setSaving(true);

      if (
        !manualPurchaseData.client_email ||
        !manualPurchaseData.package_type ||
        !manualPurchaseData.sessions_included ||
        !manualPurchaseData.amount_paid
      ) {
        alert("Please fill in all required fields");
        return;
      }

      // Create the purchase record
      const response = await fetch("/api/purchases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: manualPurchaseData.client_email,
          package_type: manualPurchaseData.package_type,
          sessions_included: parseInt(manualPurchaseData.sessions_included),
          amount_paid: parseFloat(manualPurchaseData.amount_paid),
          payment_method: manualPurchaseData.payment_method,
          payment_status: "completed",
          notes: manualPurchaseData.notes,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert("Manual purchase recorded successfully!");
        setShowManualPurchaseModal(false);
        resetManualPurchaseForm();
        fetchClients(); // Refresh client data
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Error recording manual purchase:", error);
      alert("Error recording manual purchase");
    } finally {
      setSaving(false);
    }
  };

  const resetManualPurchaseForm = () => {
    setManualPurchaseData({
      client_email: "",
      package_type: "",
      sessions_included: "",
      amount_paid: "",
      payment_method: "cash",
      notes: "",
    });
    setSelectedClientForPurchase(null);
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
      <div className="min-h-screen bg-gradient-to-br from-royal-dark via-royal-dark/90 to-black py-8 pt-[25vh]">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 sm:mb-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center">
                <FaUsers className="text-royal-light text-2xl sm:text-3xl mr-3 sm:mr-4" />
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white">
                    Client Management
                  </h1>
                  <p className="text-white/60 text-sm sm:text-base">
                    Manage your fitness training clients
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  onClick={() => setShowManualPurchaseModal(true)}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-all duration-300 transform hover:scale-105 flex items-center justify-center touch-manipulation text-sm sm:text-base"
                >
                  <FaDumbbell className="mr-2 text-sm sm:text-base" />
                  Manual Purchase
                </button>
                <button
                  onClick={openAddModal}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-royal-light text-royal-dark font-semibold rounded-lg hover:bg-white transition-all duration-300 transform hover:scale-105 flex items-center justify-center touch-manipulation text-sm sm:text-base"
                >
                  <FaPlus className="mr-2 text-sm sm:text-base" />
                  Add Client
                </button>
              </div>
            </div>
          </motion.div>

          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-black/40 backdrop-blur-lg rounded-2xl p-4 sm:p-6 border border-white/10 mb-6 sm:mb-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <div className="relative flex-1">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 text-sm sm:text-base" />
                <input
                  type="text"
                  placeholder="Search clients by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg pl-9 sm:pl-10 pr-4 py-2 sm:py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-royal-light text-sm sm:text-base"
                />
              </div>
              <div className="text-white/60 text-sm sm:text-base text-center sm:text-left">
                {filteredClients.length} of {clients.length} clients
              </div>
            </div>
          </motion.div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-900/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Clients Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-black/40 backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden"
          >
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-royal-light mx-auto mb-4"></div>
                <p className="text-white/60">Loading clients...</p>
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="p-8 text-center">
                <FaUsers className="text-white/20 text-6xl mx-auto mb-4" />
                <p className="text-white/60 text-lg">
                  {searchTerm
                    ? "No clients found matching your search."
                    : "No clients yet."}
                </p>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="px-6 py-4 text-left text-white font-semibold">
                          Client
                        </th>
                        <th className="px-6 py-4 text-left text-white font-semibold">
                          Contact
                        </th>
                        <th className="px-6 py-4 text-left text-white font-semibold">
                          Sessions
                        </th>
                        <th className="px-6 py-4 text-left text-white font-semibold">
                          Bookings
                        </th>
                        <th className="px-6 py-4 text-left text-white font-semibold">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-white font-semibold">
                          Joined
                        </th>
                        <th className="px-6 py-4 text-center text-white font-semibold">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredClients.map((client, index) => (
                        <motion.tr
                          key={client.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="border-t border-white/10 hover:bg-white/5 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-white font-semibold">
                                {client.first_name && client.last_name
                                  ? `${client.first_name} ${client.last_name}`
                                  : client.name || "No Name"}
                              </div>
                              <div className="text-white/60 text-sm flex items-center">
                                <FaEnvelope className="mr-1" />
                                {client.email}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              {client.phone && (
                                <div className="text-white/80 text-sm flex items-center">
                                  <FaPhone className="mr-2 text-white/40" />
                                  {client.phone}
                                </div>
                              )}
                              {client.address && (
                                <div className="text-white/60 text-sm flex items-center">
                                  <FaMapMarkerAlt className="mr-2 text-white/40" />
                                  {client.address}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <div className="text-white/80 text-sm flex items-center">
                                <FaDumbbell className="mr-2 text-blue-400" />
                                <span className="font-medium">
                                  Weightlifting:
                                </span>
                                <span className="ml-2 text-blue-400 font-semibold">
                                  {client.weightlifting_classes_remaining || 0}
                                </span>
                              </div>
                              <div className="text-white/80 text-sm flex items-center">
                                <FaUserTie className="mr-2 text-green-400" />
                                <span className="font-medium">Personal:</span>
                                <span className="ml-2 text-green-400 font-semibold">
                                  {client.personal_training_sessions_remaining ||
                                    0}
                                </span>
                              </div>
                              <button
                                onClick={() => handleEditSessions(client)}
                                className="mt-1 px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded transition-colors flex items-center"
                                title="Edit Session Counts"
                              >
                                <FaEdit className="mr-1" />
                                Edit
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <div className="text-white/80 text-sm flex items-center justify-between">
                                <span className="text-green-400 font-medium">
                                  Confirmed:
                                </span>
                                <span className="text-green-400 font-semibold">
                                  {client.confirmed_bookings || 0}
                                </span>
                              </div>
                              <div className="text-white/80 text-sm flex items-center justify-between">
                                <span className="text-yellow-400 font-medium">
                                  Waitlist:
                                </span>
                                <span className="text-yellow-400 font-semibold">
                                  {client.waitlist_bookings || 0}
                                </span>
                              </div>
                              <div className="text-white/80 text-sm flex items-center justify-between">
                                <span className="text-red-400 font-medium">
                                  Cancelled:
                                </span>
                                <span className="text-red-400 font-semibold">
                                  {client.cancelled_bookings || 0}
                                </span>
                              </div>
                              <div className="text-white/60 text-xs flex items-center justify-between border-t border-white/10 pt-1">
                                <span>Total:</span>
                                <span className="font-semibold">
                                  {client.total_bookings || 0}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-2">
                              <div className="flex items-center">
                                {client.onboarding_completed ? (
                                  <FaCheckCircle className="text-green-400 mr-2" />
                                ) : (
                                  <FaTimesCircle className="text-red-400 mr-2" />
                                )}
                                <span
                                  className={`text-sm ${
                                    client.onboarding_completed
                                      ? "text-green-400"
                                      : "text-red-400"
                                  }`}
                                >
                                  {client.onboarding_completed
                                    ? "Complete"
                                    : "Incomplete"}
                                </span>
                              </div>
                              <div className="flex items-center">
                                {client.waiver_signed ? (
                                  <FaFileContract className="text-green-400 mr-2" />
                                ) : (
                                  <FaFileContract className="text-red-400 mr-2" />
                                )}
                                <span
                                  className={`text-sm ${
                                    client.waiver_signed
                                      ? "text-green-400"
                                      : "text-red-400"
                                  }`}
                                >
                                  {client.waiver_signed
                                    ? "Waiver Signed"
                                    : "No Waiver"}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-white/80 text-sm">
                              {client.created_at
                                ? new Date(
                                    client.created_at
                                  ).toLocaleDateString()
                                : "Unknown"}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center space-x-2">
                              <button
                                onClick={() => openEditModal(client)}
                                className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                title="Edit Client"
                              >
                                <FaEdit />
                              </button>
                              {client.waiver_signed && (
                                <button
                                  onClick={() => handleViewWaiver(client)}
                                  className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                                  title="View Waiver"
                                >
                                  <FaFileAlt />
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteClient(client.id)}
                                className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                                title="Delete Client"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden space-y-4">
                  {filteredClients.map((client, index) => (
                    <motion.div
                      key={client.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white/5 rounded-xl p-4 border border-white/10"
                    >
                      {/* Client Name and Email */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-white font-semibold text-lg">
                            {client.first_name && client.last_name
                              ? `${client.first_name} ${client.last_name}`
                              : client.name || "No Name"}
                          </h3>
                          <div className="text-white/60 text-sm flex items-center mt-1">
                            <FaEnvelope className="mr-2 text-xs" />
                            {client.email}
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => openEditModal(client)}
                            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors touch-manipulation"
                            title="Edit Client"
                          >
                            <FaEdit className="text-sm" />
                          </button>
                          {client.waiver_signed && (
                            <button
                              onClick={() => handleViewWaiver(client)}
                              className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors touch-manipulation"
                              title="View Waiver"
                            >
                              <FaFileAlt className="text-sm" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteClient(client.id)}
                            className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors touch-manipulation"
                            title="Delete Client"
                          >
                            <FaTrash className="text-sm" />
                          </button>
                        </div>
                      </div>

                      {/* Contact Info */}
                      {(client.phone || client.address) && (
                        <div className="mb-3 space-y-1">
                          {client.phone && (
                            <div className="text-white/80 text-sm flex items-center">
                              <FaPhone className="mr-2 text-white/40 text-xs" />
                              {client.phone}
                            </div>
                          )}
                          {client.address && (
                            <div className="text-white/60 text-sm flex items-center">
                              <FaMapMarkerAlt className="mr-2 text-white/40 text-xs" />
                              {client.address}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Sessions */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white/80 text-sm font-medium">
                            Sessions Remaining
                          </span>
                          <button
                            onClick={() => handleEditSessions(client)}
                            className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded transition-colors flex items-center touch-manipulation"
                            title="Edit Session Counts"
                          >
                            <FaEdit className="mr-1 text-xs" />
                            Edit
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-blue-600/20 rounded-lg p-2">
                            <div className="flex items-center">
                              <FaDumbbell className="text-blue-400 text-sm mr-2" />
                              <div>
                                <div className="text-white/60 text-xs">
                                  Weightlifting
                                </div>
                                <div className="text-blue-400 font-semibold text-lg">
                                  {client.weightlifting_classes_remaining || 0}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="bg-green-600/20 rounded-lg p-2">
                            <div className="flex items-center">
                              <FaUserTie className="text-green-400 text-sm mr-2" />
                              <div>
                                <div className="text-white/60 text-xs">
                                  Personal
                                </div>
                                <div className="text-green-400 font-semibold text-lg">
                                  {client.personal_training_sessions_remaining ||
                                    0}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Class Bookings */}
                      <div className="mb-3">
                        <div className="text-white/80 text-sm font-medium mb-2">
                          Class Bookings
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-green-600/20 rounded-lg p-2">
                            <div className="text-white/60 text-xs">
                              Confirmed
                            </div>
                            <div className="text-green-400 font-semibold">
                              {client.confirmed_bookings || 0}
                            </div>
                          </div>
                          <div className="bg-yellow-600/20 rounded-lg p-2">
                            <div className="text-white/60 text-xs">
                              Waitlist
                            </div>
                            <div className="text-yellow-400 font-semibold">
                              {client.waitlist_bookings || 0}
                            </div>
                          </div>
                          <div className="bg-red-600/20 rounded-lg p-2">
                            <div className="text-white/60 text-xs">
                              Cancelled
                            </div>
                            <div className="text-red-400 font-semibold">
                              {client.cancelled_bookings || 0}
                            </div>
                          </div>
                          <div className="bg-slate-600/20 rounded-lg p-2">
                            <div className="text-white/60 text-xs">Total</div>
                            <div className="text-slate-400 font-semibold">
                              {client.total_bookings || 0}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Status and Join Date */}
                      <div className="flex items-center justify-between pt-3 border-t border-white/10">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            {client.onboarding_completed ? (
                              <FaCheckCircle className="text-green-400 mr-1 text-sm" />
                            ) : (
                              <FaTimesCircle className="text-red-400 mr-1 text-sm" />
                            )}
                            <span
                              className={`text-xs ${
                                client.onboarding_completed
                                  ? "text-green-400"
                                  : "text-red-400"
                              }`}
                            >
                              {client.onboarding_completed
                                ? "Complete"
                                : "Incomplete"}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <FaFileContract
                              className={`mr-1 text-sm ${
                                client.waiver_signed
                                  ? "text-green-400"
                                  : "text-red-400"
                              }`}
                            />
                            <span
                              className={`text-xs ${
                                client.waiver_signed
                                  ? "text-green-400"
                                  : "text-red-400"
                              }`}
                            >
                              {client.waiver_signed ? "Waiver" : "No Waiver"}
                            </span>
                          </div>
                        </div>
                        <div className="text-white/60 text-xs">
                          Joined{" "}
                          {client.created_at
                            ? new Date(client.created_at).toLocaleDateString()
                            : "Unknown"}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        </div>
      </div>

      {/* Add/Edit Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-royal-dark border border-white/10 rounded-2xl p-4 sm:p-8 max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                {editingClient ? "Edit Client" : "Add New Client"}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingClient(null);
                  setActiveTab("details");
                  resetForm();
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors touch-manipulation"
              >
                <FaTimes className="text-white/60" />
              </button>
            </div>

            {/* Tabs - only show when editing */}
            {editingClient && (
              <div className="flex border-b border-white/10 mb-6">
                <button
                  onClick={() => setActiveTab("details")}
                  className={`px-4 py-2 font-medium transition-colors ${
                    activeTab === "details"
                      ? "text-royal-light border-b-2 border-royal-light"
                      : "text-white/60 hover:text-white/80"
                  }`}
                >
                  Client Details
                </button>
                <button
                  onClick={() => setActiveTab("purchases")}
                  className={`px-4 py-2 font-medium transition-colors ${
                    activeTab === "purchases"
                      ? "text-royal-light border-b-2 border-royal-light"
                      : "text-white/60 hover:text-white/80"
                  }`}
                >
                  Purchase History
                </button>
              </div>
            )}

            {/* Details Tab Content */}
            {activeTab === "details" && (
              <div className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        value={formData.first_name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            first_name: e.target.value,
                          })
                        }
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-royal-light"
                        placeholder="Enter first name"
                      />
                    </div>
                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        value={formData.last_name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            last_name: e.target.value,
                          })
                        }
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-royal-light"
                        placeholder="Enter last name"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-white/80 text-sm font-medium mb-2">
                        Email Address * {editingClient && "(Cannot be changed)"}
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        disabled={!!editingClient}
                        className={`w-full border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-royal-light ${
                          editingClient
                            ? "bg-white/5 cursor-not-allowed"
                            : "bg-white/10"
                        }`}
                        placeholder="Enter email address"
                      />
                    </div>
                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-royal-light"
                        placeholder="Enter phone number"
                      />
                    </div>
                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">
                        Address
                      </label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) =>
                          setFormData({ ...formData, address: e.target.value })
                        }
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-royal-light"
                        placeholder="Enter address"
                      />
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Emergency Contact
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">
                        Emergency Contact Name
                      </label>
                      <input
                        type="text"
                        value={formData.emergency_contact_name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            emergency_contact_name: e.target.value,
                          })
                        }
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-royal-light"
                        placeholder="Enter emergency contact name"
                      />
                    </div>
                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">
                        Emergency Contact Phone
                      </label>
                      <input
                        type="tel"
                        value={formData.emergency_contact_phone}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            emergency_contact_phone: e.target.value,
                          })
                        }
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-royal-light"
                        placeholder="Enter emergency contact phone"
                      />
                    </div>
                  </div>
                </div>

                {/* Status */}
                {editingClient && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Status
                    </h3>
                    <div className="space-y-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.waiver_signed}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              waiver_signed: e.target.checked,
                            })
                          }
                          className="mr-3 h-4 w-4 text-royal-light focus:ring-royal-light border-white/20 rounded"
                        />
                        <span className="text-white/80">Waiver Signed</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.onboarding_completed}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              onboarding_completed: e.target.checked,
                            })
                          }
                          className="mr-3 h-4 w-4 text-royal-light focus:ring-royal-light border-white/20 rounded"
                        />
                        <span className="text-white/80">
                          Onboarding Completed
                        </span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-6">
                  <button
                    onClick={handleSaveClient}
                    disabled={
                      saving ||
                      !formData.first_name ||
                      !formData.last_name ||
                      (!editingClient && !formData.email)
                    }
                    className={`flex-1 px-4 sm:px-6 py-3 font-semibold rounded-lg transition-all duration-300 flex items-center justify-center touch-manipulation ${
                      saving ||
                      !formData.first_name ||
                      !formData.last_name ||
                      (!editingClient && !formData.email)
                        ? "bg-white/10 text-white/50 cursor-not-allowed"
                        : "bg-royal-light text-royal-dark hover:bg-white"
                    }`}
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-royal-dark mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <FaSave className="mr-2" />
                        {editingClient ? "Update Client" : "Add Client"}
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingClient(null);
                      resetForm();
                    }}
                    className="px-4 sm:px-6 py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-all duration-300 touch-manipulation"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Purchase History Tab Content */}
            {activeTab === "purchases" && editingClient && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">
                    Purchase History
                  </h3>
                  <span className="text-white/60 text-sm">
                    {clientPurchases.length} purchase(s)
                  </span>
                </div>

                {loadingPurchases ? (
                  <div className="text-center py-8 text-white/60">
                    Loading purchases...
                  </div>
                ) : clientPurchases.length === 0 ? (
                  <div className="text-center py-8 text-white/60">
                    No purchases found
                  </div>
                ) : (
                  <div className="space-y-3">
                    {clientPurchases.map((purchase) => (
                      <div
                        key={purchase.id}
                        className="bg-white/5 border border-white/10 rounded-lg p-4"
                      >
                        {editingPurchase?.id === purchase.id ? (
                          // Edit Mode
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-white/60 text-xs mb-1">
                                  Package Type
                                </label>
                                <input
                                  type="text"
                                  value={purchaseFormData.package_type}
                                  onChange={(e) =>
                                    setPurchaseFormData({
                                      ...purchaseFormData,
                                      package_type: e.target.value,
                                    })
                                  }
                                  className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-white/60 text-xs mb-1">
                                  Sessions
                                </label>
                                <input
                                  type="number"
                                  value={purchaseFormData.sessions_included}
                                  onChange={(e) =>
                                    setPurchaseFormData({
                                      ...purchaseFormData,
                                      sessions_included: parseInt(
                                        e.target.value
                                      ),
                                    })
                                  }
                                  className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-white/60 text-xs mb-1">
                                  Amount Paid ($)
                                </label>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={purchaseFormData.amount_paid}
                                  onChange={(e) =>
                                    setPurchaseFormData({
                                      ...purchaseFormData,
                                      amount_paid: parseFloat(e.target.value),
                                    })
                                  }
                                  className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-white/60 text-xs mb-1">
                                  Payment Method
                                </label>
                                <select
                                  value={purchaseFormData.payment_method}
                                  onChange={(e) =>
                                    setPurchaseFormData({
                                      ...purchaseFormData,
                                      payment_method: e.target.value,
                                    })
                                  }
                                  className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm"
                                >
                                  <option value="stripe">Stripe</option>
                                  <option value="cash">Cash</option>
                                  <option value="bank_transfer">
                                    Bank Transfer
                                  </option>
                                  <option value="other">Other</option>
                                </select>
                              </div>
                            </div>
                            <div>
                              <label className="block text-white/60 text-xs mb-1">
                                Notes
                              </label>
                              <textarea
                                value={purchaseFormData.notes}
                                onChange={(e) =>
                                  setPurchaseFormData({
                                    ...purchaseFormData,
                                    notes: e.target.value,
                                  })
                                }
                                className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm"
                                rows={2}
                              />
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={handleSavePurchaseEdit}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingPurchase(null)}
                                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded text-sm"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          // View Mode
                          <div>
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <div className="font-medium text-white">
                                  {purchase.package_type}
                                </div>
                                <div className="text-white/60 text-sm">
                                  {new Date(
                                    purchase.purchase_date
                                  ).toLocaleDateString()}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEditPurchase(purchase)}
                                  className="p-2 text-blue-400 hover:bg-white/10 rounded"
                                  title="Edit Purchase"
                                >
                                  <FaEdit />
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeletePurchase(purchase.id)
                                  }
                                  className="p-2 text-red-400 hover:bg-white/10 rounded"
                                  title="Delete Purchase"
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                              <div>
                                <div className="text-white/60 text-xs">
                                  Sessions
                                </div>
                                <div className="text-white">
                                  {purchase.sessions_included}
                                </div>
                              </div>
                              <div>
                                <div className="text-white/60 text-xs">
                                  Amount
                                </div>
                                <div className="text-white">
                                  ${purchase.amount_paid}
                                </div>
                              </div>
                              <div>
                                <div className="text-white/60 text-xs">
                                  Method
                                </div>
                                <div className="text-white capitalize">
                                  {purchase.payment_method || "N/A"}
                                </div>
                              </div>
                              <div>
                                <div className="text-white/60 text-xs">
                                  Status
                                </div>
                                <div className="text-green-400 capitalize">
                                  {purchase.payment_status}
                                </div>
                              </div>
                            </div>
                            {purchase.notes && (
                              <div className="mt-2 text-white/60 text-xs">
                                Note: {purchase.notes}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* Waiver Viewing Modal */}
      {showWaiverModal && viewingWaiverClient && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-royal-dark border border-white/10 rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                Waiver for {viewingWaiverClient.first_name}{" "}
                {viewingWaiverClient.last_name}
              </h2>
              <button
                onClick={() => {
                  setShowWaiverModal(false);
                  setViewingWaiverClient(null);
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <FaTimes className="text-white/60" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Waiver Info */}
              <div className="bg-white/10 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white">
                  <div>
                    <strong>Client:</strong> {viewingWaiverClient.first_name}{" "}
                    {viewingWaiverClient.last_name}
                  </div>
                  <div>
                    <strong>Email:</strong> {viewingWaiverClient.email}
                  </div>
                  <div>
                    <strong>Signed Date:</strong>{" "}
                    {viewingWaiverClient.waiver_signed_date
                      ? new Date(
                          viewingWaiverClient.waiver_signed_date
                        ).toLocaleDateString()
                      : "Unknown"}
                  </div>
                  <div>
                    <strong>Status:</strong>{" "}
                    <span className="text-green-400">Signed</span>
                  </div>
                </div>
              </div>

              {/* PDF Viewer or Message */}
              <div className="bg-white/5 rounded-lg p-6 min-h-[400px]">
                {viewingWaiverClient.waiver_pdf_data ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-white">
                        Waiver Document
                      </h3>
                      <div className="flex space-x-2">
                        <a
                          href={`data:application/pdf;base64,${viewingWaiverClient.waiver_pdf_data}`}
                          download={
                            viewingWaiverClient.waiver_pdf_filename ||
                            "waiver.pdf"
                          }
                          className="px-4 py-2 bg-royal-light text-royal-dark font-medium rounded-lg hover:bg-white transition-colors"
                        >
                          Download PDF
                        </a>
                        <a
                          href={`data:application/pdf;base64,${viewingWaiverClient.waiver_pdf_data}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Open in New Tab
                        </a>
                      </div>
                    </div>
                    <div className="border border-white/20 rounded-lg overflow-hidden">
                      <iframe
                        src={`data:application/pdf;base64,${viewingWaiverClient.waiver_pdf_data}`}
                        className="w-full h-96"
                        title="Waiver PDF"
                        onError={() => {
                          console.error("PDF iframe failed to load");
                        }}
                      />
                    </div>
                    <div className="text-white/60 text-sm">
                      If the PDF doesn't display above, try using the "Open in
                      New Tab" or "Download PDF" buttons.
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FaFileContract className="text-white/20 text-6xl mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Waiver Signed
                    </h3>
                    <p className="text-white/60">
                      This client has signed the waiver, but the PDF document is
                      not available for viewing. The waiver was signed on{" "}
                      {viewingWaiverClient.waiver_signed_date
                        ? new Date(
                            viewingWaiverClient.waiver_signed_date
                          ).toLocaleDateString()
                        : "an unknown date"}
                      .
                    </p>
                  </div>
                )}
              </div>

              {/* Close Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setShowWaiverModal(false);
                    setViewingWaiverClient(null);
                  }}
                  className="px-6 py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-all duration-300"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Session Edit Modal */}
      {showSessionEditModal && editingSessionsClient && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-royal-dark border border-white/10 rounded-2xl p-8 max-w-lg w-full"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                Edit Session Counts
              </h2>
              <button
                onClick={() => {
                  setShowSessionEditModal(false);
                  setEditingSessionsClient(null);
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <FaTimes className="text-white/60" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="text-center mb-4">
                <h3 className="text-lg text-white font-semibold">
                  {editingSessionsClient.first_name}{" "}
                  {editingSessionsClient.last_name}
                </h3>
                <p className="text-white/60">{editingSessionsClient.email}</p>
              </div>

              {/* Weightlifting Classes */}
              <div>
                <label className="block text-white font-medium mb-2">
                  Weightlifting Classes Remaining
                </label>
                <input
                  type="number"
                  min="0"
                  value={sessionEditData.weightlifting_classes_remaining}
                  onChange={(e) =>
                    setSessionEditData((prev) => ({
                      ...prev,
                      weightlifting_classes_remaining:
                        parseInt(e.target.value) || 0,
                    }))
                  }
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-royal-light"
                />
              </div>

              {/* Personal Training Sessions */}
              <div>
                <label className="block text-white font-medium mb-2">
                  Personal Training Sessions Remaining
                </label>
                <input
                  type="number"
                  min="0"
                  value={sessionEditData.personal_training_sessions_remaining}
                  onChange={(e) =>
                    setSessionEditData((prev) => ({
                      ...prev,
                      personal_training_sessions_remaining:
                        parseInt(e.target.value) || 0,
                    }))
                  }
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-royal-light"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4 pt-4">
                <button
                  onClick={() => {
                    setShowSessionEditModal(false);
                    setEditingSessionsClient(null);
                  }}
                  className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSessions}
                  disabled={saving}
                  className="flex-1 px-6 py-3 bg-royal hover:bg-royal-light text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <FaSave className="mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Manual Purchase Modal */}
      {showManualPurchaseModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-royal-dark border border-white/10 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                Manual Purchase Entry
              </h2>
              <button
                onClick={() => {
                  setShowManualPurchaseModal(false);
                  resetManualPurchaseForm();
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <FaTimes className="text-white/60" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Client Selection */}
              <div>
                <label className="block text-white/80 font-medium mb-2">
                  Client Email *
                </label>
                <select
                  value={manualPurchaseData.client_email}
                  onChange={(e) =>
                    setManualPurchaseData({
                      ...manualPurchaseData,
                      client_email: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:border-royal-light focus:outline-none"
                >
                  <option value="">Select a client...</option>
                  {clients.map((client) => (
                    <option
                      key={client.id}
                      value={client.email}
                      className="bg-royal-dark"
                    >
                      {client.first_name} {client.last_name} ({client.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Package Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/80 font-medium mb-2">
                    Package Type *
                  </label>
                  <input
                    type="text"
                    value={manualPurchaseData.package_type}
                    onChange={(e) =>
                      setManualPurchaseData({
                        ...manualPurchaseData,
                        package_type: e.target.value,
                      })
                    }
                    placeholder="e.g., 8-Class Package"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:border-royal-light focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-white/80 font-medium mb-2">
                    Sessions Included *
                  </label>
                  <input
                    type="number"
                    value={manualPurchaseData.sessions_included}
                    onChange={(e) =>
                      setManualPurchaseData({
                        ...manualPurchaseData,
                        sessions_included: e.target.value,
                      })
                    }
                    placeholder="8"
                    min="1"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:border-royal-light focus:outline-none"
                  />
                </div>
              </div>

              {/* Payment Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/80 font-medium mb-2">
                    Amount Paid *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={manualPurchaseData.amount_paid}
                    onChange={(e) =>
                      setManualPurchaseData({
                        ...manualPurchaseData,
                        amount_paid: e.target.value,
                      })
                    }
                    placeholder="160.00"
                    min="0"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:border-royal-light focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-white/80 font-medium mb-2">
                    Payment Method *
                  </label>
                  <select
                    value={manualPurchaseData.payment_method}
                    onChange={(e) =>
                      setManualPurchaseData({
                        ...manualPurchaseData,
                        payment_method: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-royal-light focus:outline-none"
                  >
                    <option value="cash" className="bg-royal-dark">
                      Cash
                    </option>
                    <option value="check" className="bg-royal-dark">
                      Check
                    </option>
                    <option value="venmo" className="bg-royal-dark">
                      Venmo
                    </option>
                    <option value="zelle" className="bg-royal-dark">
                      Zelle
                    </option>
                    <option value="bank_transfer" className="bg-royal-dark">
                      Bank Transfer
                    </option>
                    <option value="other" className="bg-royal-dark">
                      Other
                    </option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-white/80 font-medium mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={manualPurchaseData.notes}
                  onChange={(e) =>
                    setManualPurchaseData({
                      ...manualPurchaseData,
                      notes: e.target.value,
                    })
                  }
                  placeholder="Additional notes about the purchase..."
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:border-royal-light focus:outline-none resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowManualPurchaseModal(false);
                    resetManualPurchaseForm();
                  }}
                  className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleManualPurchase}
                  disabled={saving}
                  className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Recording...
                    </>
                  ) : (
                    <>
                      <FaSave className="mr-2" />
                      Record Purchase
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </Layout>
  );
}
