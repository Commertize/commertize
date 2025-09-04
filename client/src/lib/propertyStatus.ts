// Standardized property status options across the application
export const PROPERTY_STATUS = {
  'Construction': 'Construction',
  'Completed': 'Completed',
  'Fund Raising': 'Fund Raising',
  'Rented': 'Rented',
  'Coming Soon': 'Coming Soon',
  'Express Interest': 'Express Interest',
  'Closing': 'Closing',
  'Live sale': 'Live sale',
  'Closed': 'Closed'
} as const;

export type PropertyStatus = keyof typeof PROPERTY_STATUS;

// Get all status options as an array
export const getPropertyStatusOptions = (): PropertyStatus[] => {
  return Object.keys(PROPERTY_STATUS) as PropertyStatus[];
};

// Convert display format to storage format (if needed)
export const formatPropertyStatusForStorage = (status: PropertyStatus): string => {
  return status;
};

// Convert storage format to display format (if needed)
export const formatPropertyStatusForDisplay = (status: string): string => {
  return status as PropertyStatus || 'Coming Soon';
};