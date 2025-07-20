-- Update therapeutic areas to top 15 common disease areas plus Others

-- First, update existing values to match our new standard list
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
    WHEN LOWER(therapeutic_area) LIKE '%rare%' THEN 'Others' -- Move Rare Disease to Others
    ELSE 'Others'
END
WHERE therapeutic_area IS NOT NULL;

-- Create a type for therapeutic areas
DO $$ 
BEGIN
    -- Drop the type if it exists
    DROP TYPE IF EXISTS therapeutic_area_type CASCADE;
    
    -- Create the new type
    CREATE TYPE therapeutic_area_type AS ENUM (
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
    );
END $$;

-- Now alter the column to use the enum type
ALTER TABLE submissions 
ALTER COLUMN therapeutic_area TYPE therapeutic_area_type 
USING therapeutic_area::therapeutic_area_type;

-- Update projects table if it has therapeutic_area
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'projects' 
        AND column_name = 'therapeutic_area'
    ) THEN
        -- Update values first
        UPDATE projects 
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
            WHEN LOWER(therapeutic_area) LIKE '%rare%' THEN 'Others' -- Move Rare Disease to Others
            ELSE 'Others'
        END
        WHERE therapeutic_area IS NOT NULL;
        
        -- Then alter the column type
        ALTER TABLE projects 
        ALTER COLUMN therapeutic_area TYPE therapeutic_area_type 
        USING therapeutic_area::therapeutic_area_type;
    END IF;
END $$;

-- Verify the changes
SELECT DISTINCT therapeutic_area, COUNT(*) as count 
FROM submissions 
GROUP BY therapeutic_area 
ORDER BY count DESC;