/**
 * Centralized cancellation policy configuration
 *
 * Update CANCELLATION_HOURS to change the policy across the entire application
 */

export const CANCELLATION_POLICY = {
  // Number of hours before class starts when cancellation is allowed with full refund
  HOURS: 12,

  // Helper functions for consistent messaging
  getMessage: () =>
    `${CANCELLATION_POLICY.HOURS}+ hrs: Full refund • <${CANCELLATION_POLICY.HOURS} hrs: No refund`,

  getFullMessage: () =>
    `Your session will be refunded to your account since you're cancelling more than ${CANCELLATION_POLICY.HOURS} hours in advance.`,

  getNoRefundMessage: () =>
    `No session will be refunded as you're cancelling less than ${CANCELLATION_POLICY.HOURS} hours before the class.`,

  getFAQMessage: () =>
    `Yes, sessions can be rescheduled with ${CANCELLATION_POLICY.HOURS}-hour notice without any penalty.`,

  getAPIMessage: () =>
    `Booking cancelled - 1 session deducted for late cancellation (less than ${CANCELLATION_POLICY.HOURS} hours notice)`,

  // Function to check if cancellation allows refund
  isRefundable: (classDateTime: Date): boolean => {
    const now = new Date();
    const hoursUntilClass =
      (classDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursUntilClass > CANCELLATION_POLICY.HOURS;
  },
} as const;

// Export individual values for backwards compatibility
export const CANCELLATION_HOURS = CANCELLATION_POLICY.HOURS;
export const isMoreThanCancellationHours = CANCELLATION_POLICY.isRefundable;
