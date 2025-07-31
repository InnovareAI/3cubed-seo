# Field Mapping Check - React Form vs n8n Workflow

## ❌ FIELD MISMATCH FOUND!

### React Form sends:
- `indication` (line 15 in SubmissionForm.tsx)
- `generic_name` ✅
- `therapeutic_area` ✅
- `development_stage` ✅
- `product_name` ✅

### n8n Workflow expects:
- `medical_indication` ❌ (NOT `indication`)
- `generic_name` ✅
- `therapeutic_area` ✅
- `development_stage` ✅
- `product_name` ✅

## THE PROBLEM:
- React form sends field as `indication`
- n8n workflow looks for `medical_indication`
- This will cause the workflow to fail!

## QUICK FIX OPTIONS:

### Option 1: Update React Form (Recommended)
Change line 193 in SubmissionForm.tsx from:
```typescript
indication: formData.indication,
```
To:
```typescript
medical_indication: formData.indication,
```

### Option 2: Update n8n Workflow
Change the Build SEO Prompt node to use `indication` instead of `medical_indication`

## Other Fields to Check:
- React sends `nct_number` → n8n expects `nct_id`
- React sends arrays for `patient_population`, `primary_endpoints` etc.
- n8n might expect different formats