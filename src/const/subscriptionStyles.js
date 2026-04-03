// Centralized Tailwind class maps and helpers for subscription UI

export const subscriptionStyles = {
  pageWrapper: "max-w-2xl mx-auto animate-fadeIn",
  sectionCard: "rounded-2xl shadow-sm border border-gray-100 bg-white mb-6 animate-fadeIn",
  pageHeader: "flex items-center gap-4 mb-6",
  summaryGrid: "flex flex-col md:flex-row md:items-center md:justify-between gap-4",
  badge: {
    ACTIVE: "bg-green-100 text-green-800 border-green-200",
    INACTIVE: "bg-orange-100 text-orange-800 border-orange-200",
    EXPIRED: "bg-red-100 text-red-800 border-red-200",
    PENDING: "bg-blue-100 text-blue-800 border-blue-200",
    default: "bg-gray-100 text-gray-800 border-gray-200",
  },
  actionFooter: "flex justify-end gap-3 mt-8",
  formGrid: "grid grid-cols-1 md:grid-cols-2 gap-4",
  inputGroup: "mb-4",
  destructiveBtn: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:text-red-900",
  primaryBtn: "bg-violet-600 text-white hover:bg-violet-700 border-violet-600",
  disabledBtn: "opacity-60 cursor-not-allowed",
};

export function getBadgeClass(status) {
  return subscriptionStyles.badge[status] || subscriptionStyles.badge.default;
}
