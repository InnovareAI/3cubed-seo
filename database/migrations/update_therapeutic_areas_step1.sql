-- Step 1: Update existing values to match our new standard list
UPDATE submissions 
SET therapeutic_area = CASE 
    WHEN LOWER(therapeutic_area) LIKE '%cardio%' THEN 'Cardiology'
    WHEN LOWER(therapeutic_area) LIKE '%onco%' OR LOWER(therapeutic_area) LIKE '%cancer%' THEN 'Oncology'
    WHEN LOWER(therapeutic_area) LIKE '%neur%' THEN 'Neurology'
    WHEN LOWER(therapeutic_area) LIKE '%psych%' OR LOWER(therapeutic_area) LIKE '%mental%' THEN 'Psychiatry'
    WHEN LOWER(therapeutic_area) LIKE '%endo%' OR LOWER(therapeutic_area) LIKE '%diabet%' THEN 'Endocrinology'
    WHEN LOWER(therapeutic_area) LIKE '%rheum%' OR LOWER(therapeutic_area) LIKE '%arthr%' THEN 'Rheumatology'
    WHEN LOWER(therapeutic_area) LIKE '%derm%' OR LOWER(therapeutic_area) LIKE '%skin%' THEN 'Dermatology'
    WHEN LOWER(therapeutic_area) LIKE '%pulm%' OR LOWER(therapeutic_area) LIKE '%resp%' OR LOWER(therapeutic_area) LIKE '%lung%' THEN 'Pulmonology'
    WHEN LOWER(therapeutic_area) LIKE '%gastro%' OR LOWER(therapeutic_area) LIKE '%gi%' OR LOWER(therapeutic_area) LIKE '%digest%' THEN 'Gastroenterology'
    WHEN LOWER(therapeutic_area) LIKE '%infect%' OR LOWER(therapeutic_area) LIKE '%anti%' THEN 'Infectious Diseases'
    WHEN LOWER(therapeutic_area) LIKE '%immun%' THEN 'Immunology'
    WHEN LOWER(therapeutic_area) LIKE '%ophthalm%' OR LOWER(therapeutic_area) LIKE '%eye%' OR LOWER(therapeutic_area) LIKE '%vision%' THEN 'Ophthalmology'
    WHEN LOWER(therapeutic_area) LIKE '%nephro%' OR LOWER(therapeutic_area) LIKE '%kidney%' OR LOWER(therapeutic_area) LIKE '%renal%' THEN 'Nephrology'
    WHEN LOWER(therapeutic_area) LIKE '%hemato%' OR LOWER(therapeutic_area) LIKE '%blood%' THEN 'Hematology'
    WHEN LOWER(therapeutic_area) LIKE '%gynec%' OR LOWER(therapeutic_area) LIKE '%women%' OR LOWER(therapeutic_area) LIKE '%obstetr%' THEN 'Gynecology'
    WHEN LOWER(therapeutic_area) LIKE '%rare%' THEN 'Others'
    ELSE 'Others'
END
WHERE therapeutic_area IS NOT NULL;