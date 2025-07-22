# Therapeutic Areas Update

## Summary
Updated the therapeutic area field in the application to use the top 15 common disease areas plus an "Others" option.

## Changes Made

### 1. Frontend Changes
- **Created constants file**: `/src/constants/therapeuticAreas.ts`
  - Defines the new therapeutic areas list
  - Includes a TypeScript type for type safety
  - Provides a mapping for common variations to standard therapeutic areas

- **Updated SubmissionForm component**: `/src/components/SubmissionForm.tsx`
  - Replaced hardcoded options with dynamic list from constants
  - Now displays all 16 therapeutic areas in dropdown

### 2. Database Migration
- **Created migration file**: `/database/migrations/update_therapeutic_areas.sql`
  - Updates existing data to map to new therapeutic areas
  - Creates an enum type for therapeutic areas
  - Handles both `submissions` and `projects` tables if applicable

## New Therapeutic Areas List
1. Oncology
2. Cardiology
3. Neurology
4. Psychiatry
5. Endocrinology
6. Rheumatology
7. Dermatology
8. Pulmonology
9. Gastroenterology
10. Infectious Diseases
11. Immunology
12. Ophthalmology
13. Nephrology
14. Hematology
15. Gynecology
16. Others

## Migration Instructions

### Step 1: Run Database Migration
Execute the SQL migration file in your database:
```bash
psql -U your_username -d your_database -f database/migrations/update_therapeutic_areas.sql
```

Or run it through your database client.

### Step 2: Deploy Frontend Changes
The frontend changes will automatically take effect when you deploy the updated code.

## Data Mapping
The migration script automatically maps existing therapeutic areas to the new categories:
- "Rare Disease" → "Others"
- Any cardiovascular-related terms → "Cardiology"
- Any cancer/oncology-related terms → "Oncology"
- Any unmatched values → "Others"

## Validation
The database now enforces the enum type, ensuring only valid therapeutic areas can be stored.

## Future Considerations
- The mapping dictionary in `therapeuticAreas.ts` can be used to automatically suggest the correct therapeutic area based on user input
- Consider adding a UI for administrators to manage therapeutic area mappings
- Monitor "Others" category usage to identify potential new therapeutic areas to add