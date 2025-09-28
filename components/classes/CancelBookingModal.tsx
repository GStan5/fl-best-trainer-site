import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import {
  FaExclamationTriangle,
  FaTimes,
  FaCalendarAlt,
  FaClock,
} from "react-icons/fa";

interface CancelBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  booking: {
    id: string;
    class_title: string;
    date: string;
    start_time: string;
  } | null;
  isMoreThan24Hours: boolean;
  isLoading: boolean;
}

const CancelBookingModal: React.FC<CancelBookingModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  booking,
  isMoreThan24Hours,
  isLoading,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!booking || !mounted) return null;

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01 ${time}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[99999999]"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 99999999,
          }}
        >
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-gradient-to-br from-slate-900 to-slate-800 border border-white/20 rounded-2xl shadow-2xl w-[calc(100vw-1.5rem)] max-w-md p-4 sm:p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
            >
              <FaTimes size={20} />
            </button>

            {/* Header */}
            <div className="flex items-center mb-6">
              <div
                className={`p-3 rounded-full mr-4 ${
                  isMoreThan24Hours
                    ? "bg-amber-500/20 text-amber-400"
                    : "bg-red-500/20 text-red-400"
                }`}
              >
                <FaExclamationTriangle size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Cancel Booking</h3>
                <p className="text-white/60 text-sm">
                  This action cannot be undone
                </p>
              </div>
            </div>

            {/* Class Details */}
            <div className="bg-white/5 rounded-lg p-4 mb-6 border border-white/10">
              <h4 className="text-white font-semibold text-lg mb-3">
                {booking.class_title}
              </h4>
              <div className="space-y-2">
                <div className="flex items-center text-white/70">
                  <FaCalendarAlt className="mr-3 text-royal-light" />
                  <span>{formatDate(booking.date)}</span>
                </div>
                <div className="flex items-center text-white/70">
                  <FaClock className="mr-3 text-royal-light" />
                  <span>{formatTime(booking.start_time)}</span>
                </div>
              </div>
            </div>

            {/* Refund Policy Notice */}
            <div
              className={`rounded-lg p-4 mb-6 border ${
                isMoreThan24Hours
                  ? "bg-green-500/10 border-green-500/30 text-green-100"
                  : "bg-red-500/10 border-red-500/30 text-red-100"
              }`}
            >
              <div className="flex items-start">
                <div
                  className={`p-1 rounded-full mr-3 mt-0.5 ${
                    isMoreThan24Hours ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {isMoreThan24Hours ? "✅" : "⚠️"}
                </div>
                <div>
                  <p className="font-medium mb-1">
                    {isMoreThan24Hours
                      ? "Full Refund Available"
                      : "No Refund Available"}
                  </p>
                  <p className="text-sm opacity-90">
                    {isMoreThan24Hours
                      ? "Your session will be refunded to your account since you're cancelling more than 24 hours in advance."
                      : "No session will be refunded as you're cancelling less than 24 hours before the class."}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 py-3 px-4 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50"
              >
                Keep Booking
              </button>
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className={`flex-1 py-3 px-4 font-medium rounded-lg transition-all duration-200 disabled:opacity-50 ${
                  isMoreThan24Hours
                    ? "bg-amber-600 hover:bg-amber-700 text-white"
                    : "bg-red-600 hover:bg-red-700 text-white"
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Cancelling...
                  </div>
                ) : (
                  `${
                    isMoreThan24Hours ? "Cancel & Refund" : "Cancel (No Refund)"
                  }`
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};

export default CancelBookingModal;
