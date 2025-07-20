// Top 15 common therapeutic areas in pharmaceutical industry
export const THERAPEUTIC_AREAS = [
  'Oncology',
  'Cardiology',
  'Neurology',
  'Psychiatry',
  'Endocrinology',
  'Rheumatology',
  'Dermatology',
  'Pulmonology',
  'Gastroenterology',
  'Infectious Diseases',
  'Immunology',
  'Ophthalmology',
  'Nephrology',
  'Hematology',
  'Gynecology',
  'Others'
] as const;

export type TherapeuticArea = typeof THERAPEUTIC_AREAS[number];

// Helper function to get therapeutic area label
export const getTherapeuticAreaLabel = (area: string): string => {
  return area;
};

// Color coding for therapeutic areas (optional, for UI enhancement)
export const THERAPEUTIC_AREA_COLORS: Record<TherapeuticArea, string> = {
  'Oncology': 'bg-purple-100 text-purple-800',
  'Cardiology': 'bg-red-100 text-red-800',
  'Neurology': 'bg-blue-100 text-blue-800',
  'Psychiatry': 'bg-indigo-100 text-indigo-800',
  'Endocrinology': 'bg-yellow-100 text-yellow-800',
  'Rheumatology': 'bg-orange-100 text-orange-800',
  'Dermatology': 'bg-pink-100 text-pink-800',
  'Pulmonology': 'bg-cyan-100 text-cyan-800',
  'Gastroenterology': 'bg-amber-100 text-amber-800',
  'Infectious Diseases': 'bg-green-100 text-green-800',
  'Immunology': 'bg-teal-100 text-teal-800',
  'Ophthalmology': 'bg-sky-100 text-sky-800',
  'Nephrology': 'bg-violet-100 text-violet-800',
  'Hematology': 'bg-rose-100 text-rose-800',
  'Gynecology': 'bg-fuchsia-100 text-fuchsia-800',
  'Others': 'bg-gray-100 text-gray-800'
};
