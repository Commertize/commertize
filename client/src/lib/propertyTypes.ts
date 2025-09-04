// Standardized property types across the application
export const PROPERTY_TYPES = {
  'Multi Family': 'Multi Family',
  'Office': 'Office',
  'Datacenters': 'Datacenters',
  'Retail': 'Retail',
  'Industrial': 'Industrial',
  'Mixed Use': 'Mixed Use',
  'Hospitality': 'Hospitality',
  'Other': 'Other'
} as const;

export type PropertyType = keyof typeof PROPERTY_TYPES;

// Convert display format to storage format (if needed)
export const formatPropertyTypeForStorage = (type: PropertyType): string => {
  return type;
};

// Convert storage format to display format (if needed)
export const formatPropertyTypeForDisplay = (type: string): string => {
  return type as PropertyType || 'Not specified';
};
