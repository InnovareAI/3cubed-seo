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

// Helper function to validate therapeutic area
export const isValidTherapeuticArea = (area: string): area is TherapeuticArea => {
  return THERAPEUTIC_AREAS.includes(area as TherapeuticArea);
};

// Mapping for common variations to standard therapeutic areas
export const THERAPEUTIC_AREA_MAPPING: Record<string, TherapeuticArea> = {
  // Oncology variations
  'cancer': 'Oncology',
  'tumor': 'Oncology',
  'malignancy': 'Oncology',
  
  // Cardiology variations
  'cardiovascular': 'Cardiology',
  'cardiac': 'Cardiology',
  'heart': 'Cardiology',
  
  // Neurology variations
  'neurological': 'Neurology',
  'brain': 'Neurology',
  'nervous system': 'Neurology',
  
  // Psychiatry variations
  'mental health': 'Psychiatry',
  'psychiatric': 'Psychiatry',
  'behavioral health': 'Psychiatry',
  
  // Endocrinology variations
  'diabetes': 'Endocrinology',
  'diabetic': 'Endocrinology',
  'metabolic': 'Endocrinology',
  'hormonal': 'Endocrinology',
  
  // Rheumatology variations
  'rheumatic': 'Rheumatology',
  'arthritis': 'Rheumatology',
  'joint': 'Rheumatology',
  
  // Dermatology variations
  'skin': 'Dermatology',
  'dermatological': 'Dermatology',
  
  // Pulmonology variations
  'respiratory': 'Pulmonology',
  'lung': 'Pulmonology',
  'pulmonary': 'Pulmonology',
  'breathing': 'Pulmonology',
  
  // Gastroenterology variations
  'gi': 'Gastroenterology',
  'gastrointestinal': 'Gastroenterology',
  'digestive': 'Gastroenterology',
  'gut': 'Gastroenterology',
  
  // Infectious Diseases variations
  'infection': 'Infectious Diseases',
  'antimicrobial': 'Infectious Diseases',
  'antibiotic': 'Infectious Diseases',
  'antiviral': 'Infectious Diseases',
  
  // Immunology variations
  'immune': 'Immunology',
  'autoimmune': 'Immunology',
  'immunological': 'Immunology',
  
  // Ophthalmology variations
  'eye': 'Ophthalmology',
  'ocular': 'Ophthalmology',
  'vision': 'Ophthalmology',
  'ophthalmic': 'Ophthalmology',
  
  // Nephrology variations
  'kidney': 'Nephrology',
  'renal': 'Nephrology',
  
  // Hematology variations
  'blood': 'Hematology',
  'hematological': 'Hematology',
  
  // Gynecology variations
  'womens health': 'Gynecology',
  'obstetrics': 'Gynecology',
  'reproductive': 'Gynecology',
  'gynecological': 'Gynecology'
};