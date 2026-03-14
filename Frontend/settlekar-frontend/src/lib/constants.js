export const GROUP_TYPES = {
  TRAVEL: 'Trip / Travel',
  HOSTEL: 'College / University / Hostel',
  EVENT: 'Event',
  FAMILY: 'Friends / Family',
};

export const GROUP_STATUSES = {
  ACTIVE: 'Active',
  LOCKED: 'Locked',
  SETTLED: 'Settled',
};

export const GROUP_ROLES = {
  ADMIN: 'Admin',
  MEMBER: 'Member',
};

export const EXPENSE_CATEGORIES = {
  FOOD: { label: 'Food', icon: 'Utensils' },
  TRANSPORT: { label: 'Transport', icon: 'Car' },
  ACCOMMODATION: { label: 'Accommodation', icon: 'Hotel' },
  ENTERTAINMENT: { label: 'Entertainment', icon: 'Gamepad2' },
  UTILITIES: { label: 'Utilities', icon: 'Zap' },
  SHOPPING: { label: 'Shopping', icon: 'ShoppingBag' },
  HEALTH: { label: 'Health', icon: 'Heart' },
  EDUCATION: { label: 'Education', icon: 'GraduationCap' },
  OTHER: { label: 'Other', icon: 'MoreHorizontal' },
};

export const SPLIT_METHODS = {
  EQUAL: 'Equally',
  PERCENTAGE: 'Percentage',
  CUSTOM: 'Custom',
};

export const SETTLEMENT_STATUSES = {
  PENDING: 'Pending',
  COMPLETED: 'Completed',
  FAILED: 'Failed',
};

export const SETTLEMENT_METHODS = {
  MANUAL: 'Manual',
  RAZORPAY: 'Razorpay',
};

export const PAYMENT_STATUSES = {
  CREATED: 'Created',
  CAPTURED: 'Captured',
  FAILED: 'Failed',
};

export const GENDERS = {
  MALE: 'Male',
  FEMALE: 'Female',
  OTHER: 'Other',
  PREFER_NOT_TO_SAY: 'Prefer not to say',
};

export const LEDGER_ENTRY_TYPES = {
  GROUP_CREATED: 'Group Created',
  MEMBER_JOINED: 'Member Joined',
  MEMBER_LEFT: 'Member Left',
  EXPENSE_ADDED: 'Expense Added',
  EXPENSE_UPDATED: 'Expense Updated',
  EXPENSE_DELETED: 'Expense Deleted',
  SETTLEMENT_CREATED: 'Settlement Created',
  SETTLEMENT_COMPLETED: 'Settlement Completed',
  SETTLEMENT_FAILED: 'Settlement Failed',
  GROUP_LOCKED: 'Group Locked',
  GROUP_SETTLED: 'Group Settled',
  RECURRING_EXPENSE_GENERATED: 'Recurring Expense Generated',
  REMINDER_SENT: 'Reminder Sent',
};

export const ROUTES = {
  LOGIN: '/login',
  SIGNUP: '/signup',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',
  OAUTH_REDIRECT: '/oauth2/redirect',
  DASHBOARD: '/dashboard',
  GROUPS: '/groups',
  GROUP_DETAIL: '/groups/:groupId',
  EXPENSES: '/expenses',
  BALANCES: '/balances',
  SETTLEMENTS: '/settlements',
  ANALYTICS: '/analytics',
  ACTIVITY: '/activity',
  PROFILE: '/profile',
};

export const GROUP_TYPE_ICONS = {
  TRAVEL: 'Plane',
  HOSTEL: 'Building2',
  EVENT: 'PartyPopper',
  FAMILY: 'Home',
};
