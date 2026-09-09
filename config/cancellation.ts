/**
 * Cancellation policies
 *
 * Classes: 12 hours
 * In-home (1:1 and semi-private): 48 hours
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
    `Yes, group classes can be cancelled or rescheduled with ${CANCELLATION_POLICY.HOURS}-hour notice without any penalty.`,

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

export const IN_HOME_CANCELLATION_POLICY = {
  HOURS: 48,

  getFAQMessage: () =>
    `Yes, in-home sessions can be cancelled or rescheduled with ${IN_HOME_CANCELLATION_POLICY.HOURS}-hour notice without any penalty.`,

  getPolicyText: () =>
    `I require ${IN_HOME_CANCELLATION_POLICY.HOURS} hours notice for cancellations to avoid being charged for the session. I understand emergencies happen, so please contact me as soon as possible if you need to reschedule.`,

  getShortFeature: () =>
    `Same ${IN_HOME_CANCELLATION_POLICY.HOURS}-hour cancellation policy`,
} as const;

/** Shared legal language for the signed waiver, PDF copy, and printable form */
export const WAIVER_CANCELLATION_CLAUSE = `For in-home personal training (including semi-private in-home sessions), I agree to provide at least ${IN_HOME_CANCELLATION_POLICY.HOURS} hours' notice to cancel or reschedule. Cancellations made with less than ${IN_HOME_CANCELLATION_POLICY.HOURS} hours' notice, and no-shows, will be charged as a used session. For group classes, I agree to provide at least ${CANCELLATION_POLICY.HOURS} hours' notice to cancel. Cancellations made with less than ${CANCELLATION_POLICY.HOURS} hours' notice, and no-shows, will result in a class session being deducted with no refund.`;

// Export individual values for backwards compatibility
export const CANCELLATION_HOURS = CANCELLATION_POLICY.HOURS;
export const isMoreThanCancellationHours = CANCELLATION_POLICY.isRefundable;
