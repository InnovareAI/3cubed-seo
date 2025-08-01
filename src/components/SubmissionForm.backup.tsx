import React, { useState } from 'react';
import { supabase } from '../lib/mockData';
import { THERAPEUTIC_AREAS } from '../constants/therapeuticAreas';

interface SubmissionFormProps {
  onSuccess?: () => void;
  onClose?: () => void;
}

interface FormData {
  // Reviewer Information
  seo_reviewer_name: string;
  seo_reviewer_email: string;
  client_name: string;
  client_reviewer_name: string;
  client_reviewer_email: string;
  mlr_reviewer_name: string;
  mlr_reviewer_email: string;
  
  // Basic Information
  stage: string;
  product_name: string;
  product_code: string;
  condition_treated: string;
  therapeutic_area: string;
  
  // Target Demographics
  target_audience: string[];
  geography: string[];
  
  // Key Information
  key_advantages: string;
  competitor_names: string;
  competitor_urls: string;
  problem_solved: string;
  treatment_settings: string[];
  
  // SEO Enhancement Fields
  mechanism_of_action: string;
  clinical_trials: string;
  key_results: string;
  safety_info: string;
  dosing_info: string;
  patient_population: string;
  regulatory_status: string;
  patient_numbers: string;
  industry_keywords: string;
  avoid_keywords: string;
  website_url: string;
  unique_value_prop: string;
  conference_data: string;
  kol_names: string;
  special_considerations: string;
}

export const SubmissionForm: React.FC<SubmissionFormProps> = ({ onSuccess, onClose }) => {
  const [formData, setFormData] = useState<FormData>({
    seo_reviewer_name: '',
    seo_reviewer_email: '',
    client_name: '',
    client_reviewer_name: '',
    client_reviewer_email: '',
    mlr_reviewer_name: '',
    mlr_reviewer_email: '',
    stage: '',
    product_name: '',
    product_code: '',
    condition_treated: '',
    therapeutic_area: '',
    target_audience: [],
    geography: [],
    key_advantages: '',
    competitor_names: '',
    competitor_urls: '',
    problem_solved: '',
    treatment_settings: [],
    mechanism_of_action: '',
    clinical_trials: '',
    key_results: '',
    safety_info: '',
    dosing_info: '',
    patient_population: '',
    regulatory_status: '',
    patient_numbers: '',
    industry_keywords: '',
    avoid_keywords: '',
    website_url: '',
    unique_value_prop: '',
    conference_data: '',
    kol_names: '',
    special_considerations: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      const fieldName = name as keyof FormData;
      
      if (fieldName === 'target_audience' || fieldName === 'geography' || fieldName === 'treatment_settings') {
        const currentValues = formData[fieldName] as string[];
        if (checkbox.checked) {
          setFormData(prev => ({
            ...prev,
            [fieldName]: [...currentValues, value]
          }));
        } else {
          setFormData(prev => ({
            ...prev,
            [fieldName]: currentValues.filter(v => v !== value)
          }));
        }
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Validate required fields
    if (formData.target_audience.length === 0) {
      setError('Please select at least one target audience');
      setIsSubmitting(false);
      return;
    }

    if (formData.geography.length === 0 || formData.geography.length > 3) {
      setError('Please select 1-3 target markets');
      setIsSubmitting(false);
      return;
    }

    if (formData.treatment_settings.length === 0) {
      setError('Please select at least one treatment setting');
      setIsSubmitting(false);
      return;
    }

    try {
      const submissionData = {
        submitter_name: formData.seo_reviewer_name,
        submitter_email: formData.seo_reviewer_email,
        product_name: formData.product_name,
        generic_name: formData.product_code,  // Required field - maps from product_code
        therapeutic_area: formData.therapeutic_area,
        stage: formData.stage,
        indication: formData.condition_treated,
        seo_reviewer_name: formData.seo_reviewer_name,  // Required field
        seo_reviewer_email: formData.seo_reviewer_email,  // Required field
        mechanism_of_action: formData.mechanism_of_action,
        competitive_landscape: formData.competitor_names,
        key_differentiators: formData.key_advantages,
        target_audience: formData.target_audience.join(', '),
        target_markets: formData.geography.join(', '),
        // Store all form data as JSON in raw_input_content
        raw_input_content: JSON.stringify(formData),
        // Default values for new submissions
        priority_level: 'Medium',
        langchain_status: 'needs_processing',
        workflow_stage: 'Form_Submitted',
        langchain_retry_count: 0,
        compliance_id: `COMP-${Date.now()}`
      };

      const { error: supabaseError } = await supabase
        .from('submissions')
        .insert([submissionData]);

      if (supabaseError) throw supabaseError;

      // Reset form
      setFormData({
        seo_reviewer_name: '',
        seo_reviewer_email: '',
        client_name: '',
        client_reviewer_name: '',
        client_reviewer_email: '',
        mlr_reviewer_name: '',
        mlr_reviewer_email: '',
        stage: '',
        product_name: '',
        product_code: '',
        condition_treated: '',
        therapeutic_area: '',
        target_audience: [],
        geography: [],
        key_advantages: '',
        competitor_names: '',
        competitor_urls: '',
        problem_solved: '',
        treatment_settings: [],
        mechanism_of_action: '',
        clinical_trials: '',
        key_results: '',
        safety_info: '',
        dosing_info: '',
        patient_population: '',
        regulatory_status: '',
        patient_numbers: '',
        industry_keywords: '',
        avoid_keywords: '',
        website_url: '',
        unique_value_prop: '',
        conference_data: '',
        kol_names: '',
        special_considerations: ''
      });
      
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err) {
      console.error('Error submitting form:', err);
      setError('Failed to submit form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Reviewer Information Section */}
      <div className="border-b pb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Reviewer Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="seo_reviewer_name" className="block text-sm font-medium text-gray-700 mb-1">
              SEO Reviewer Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="seo_reviewer_name"
              name="seo_reviewer_name"
              value={formData.seo_reviewer_name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Your full name"
            />
          </div>
          
          <div>
            <label htmlFor="seo_reviewer_email" className="block text-sm font-medium text-gray-700 mb-1">
              SEO Reviewer Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="seo_reviewer_email"
              name="seo_reviewer_email"
              value={formData.seo_reviewer_email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="your.email@company.com"
            />
          </div>


        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="client_reviewer_name" className="block text-sm font-medium text-gray-700 mb-1">
              Client Reviewer Name
            </label>
            <input
              type="text"
              id="client_reviewer_name"
              name="client_reviewer_name"
              value={formData.client_reviewer_name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Client contact name"
            />
          </div>

          <div>
            <label htmlFor="client_reviewer_email" className="block text-sm font-medium text-gray-700 mb-1">
              Client Reviewer Email
            </label>
            <input
              type="email"
              id="client_reviewer_email"
              name="client_reviewer_email"
              value={formData.client_reviewer_email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="client@company.com"
            />
          </div>

          <div>
            <label htmlFor="mlr_reviewer_name" className="block text-sm font-medium text-gray-700 mb-1">
              MLR Reviewer Name
            </label>
            <input
              type="text"
              id="mlr_reviewer_name"
              name="mlr_reviewer_name"
              value={formData.mlr_reviewer_name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Medical/Legal/Regulatory reviewer"
            />
          </div>

          <div>
            <label htmlFor="mlr_reviewer_email" className="block text-sm font-medium text-gray-700 mb-1">
              MLR Reviewer Email
            </label>
            <input
              type="email"
              id="mlr_reviewer_email"
              name="mlr_reviewer_email"
              value={formData.mlr_reviewer_email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="mlr@company.com"
            />
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div className="space-y-4 border-b pb-6">
        <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
        
        <div>
          <label htmlFor="client_name" className="block text-sm font-medium text-gray-700 mb-1">
            Client Name
          </label>
          <input
            type="text"
            id="client_name"
            name="client_name"
            value={formData.client_name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Company or client name"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="stage" className="block text-sm font-medium text-gray-700 mb-1">
              Stage <span className="text-red-500">*</span>
            </label>
            <select
              id="stage"
              name="stage"
              value={formData.stage}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Stage</option>
              <option value="Phase III">Phase III</option>
              <option value="Market Shaping">Market Shaping</option>
              <option value="Market Launch">Market Launch</option>
            </select>
          </div>

          <div>
            <label htmlFor="product_name" className="block text-sm font-medium text-gray-700 mb-1">
              Product/Project Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="product_name"
              name="product_name"
              value={formData.product_name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Enter the disease/condition-based name</p>
          </div>

          <div>
            <label htmlFor="product_code" className="block text-sm font-medium text-gray-700 mb-1">
              Product Code/Generic Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="product_code"
              name="product_code"
              value={formData.product_code}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., pembrolizumab, ABC-123"
            />
            <p className="text-xs text-gray-500 mt-1">Official identifier for regulatory/medical use</p>
          </div>

          <div>
            <label htmlFor="therapeutic_area" className="block text-sm font-medium text-gray-700 mb-1">
              Therapeutic Area <span className="text-red-500">*</span>
            </label>
            <select
              id="therapeutic_area"
              name="therapeutic_area"
              value={formData.therapeutic_area}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Therapeutic Area</option>
              {THERAPEUTIC_AREAS.map(area => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="condition_treated" className="block text-sm font-medium text-gray-700 mb-1">
            What Condition Does This Treat? <span className="text-red-500">*</span>
          </label>
          <textarea
            id="condition_treated"
            name="condition_treated"
            value={formData.condition_treated}
            onChange={handleChange}
            required
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Metastatic non-small cell lung cancer"
          />
          <p className="text-xs text-gray-500 mt-1">Be specific - include disease stage/severity if relevant</p>
        </div>
      </div>

      {/* Target Demographics */}
      <div className="space-y-4 border-b pb-6">
        <h3 className="text-lg font-semibold text-gray-900">Target Demographics</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Target Audience (Select all that apply) <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            {[
              { id: 'ta_pcp', value: 'Primary Care Physicians', label: 'Primary Care Physicians' },
              { id: 'ta_specialists', value: 'Specialist Physicians', label: 'Specialist Physicians' },
              { id: 'ta_other_hcp', value: 'Other Healthcare Professionals', label: 'Other Healthcare Professionals (Nurses, PAs, Pharmacists)' },
              { id: 'ta_new_patients', value: 'Newly Diagnosed Patients', label: 'Newly Diagnosed Patients' },
              { id: 'ta_exp_patients', value: 'Treatment-Experienced Patients', label: 'Treatment-Experienced Patients' },
              { id: 'ta_caregivers', value: 'Caregivers & Family Members', label: 'Caregivers & Family Members' },
              { id: 'ta_mixed_hcp', value: 'Mixed HCP Audiences', label: 'Mixed HCP Audiences' },
              { id: 'ta_mixed_patients', value: 'Mixed Patient Audiences', label: 'Mixed Patient Audiences' }
            ].map(option => (
              <div key={option.id} className="flex items-center">
                <input
                  type="checkbox"
                  id={option.id}
                  name="target_audience"
                  value={option.value}
                  checked={formData.target_audience.includes(option.value)}
                  onChange={handleChange}
                  className="mr-2"
                />
                <label htmlFor={option.id} className="text-sm">{option.label}</label>
              </div>
            ))}
          </div>
          {formData.target_audience.length === 0 && (
            <p className="text-xs text-red-500 mt-1">Please select at least one target audience</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Geography (Select up to 3 target markets) <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {[
              { id: 'geo_aus', value: 'Australia', label: 'Australia' },
              { id: 'geo_brazil', value: 'Brazil', label: 'Brazil' },
              { id: 'geo_canada', value: 'Canada', label: 'Canada' },
              { id: 'geo_china', value: 'China', label: 'China' },
              { id: 'geo_eu', value: 'European Union', label: 'European Union' },
              { id: 'geo_india', value: 'India', label: 'India' },
              { id: 'geo_japan', value: 'Japan', label: 'Japan' },
              { id: 'geo_korea', value: 'South Korea', label: 'South Korea' },
              { id: 'geo_uk', value: 'United Kingdom', label: 'United Kingdom' },
              { id: 'geo_usa', value: 'United States', label: 'United States' },
              { id: 'geo_global', value: 'Global', label: 'Global' }
            ].map(option => (
              <div key={option.id} className="flex items-center">
                <input
                  type="checkbox"
                  id={option.id}
                  name="geography"
                  value={option.value}
                  checked={formData.geography.includes(option.value)}
                  onChange={handleChange}
                  disabled={formData.geography.length >= 3 && !formData.geography.includes(option.value)}
                  className="mr-2"
                />
                <label htmlFor={option.id} className="text-sm">{option.label}</label>
              </div>
            ))}
          </div>
          {(formData.geography.length === 0 || formData.geography.length > 3) && (
            <p className="text-xs text-red-500 mt-1">Please select 1-3 target markets</p>
          )}
        </div>
      </div>

      {/* Competitive Landscape */}
      <div className="space-y-4 border-b pb-6">
        <h3 className="text-lg font-semibold text-gray-900">Competitive Landscape</h3>
        
        <div>
          <label htmlFor="key_advantages" className="block text-sm font-medium text-gray-700 mb-1">
            Key Product Advantages <span className="text-red-500">*</span>
          </label>
          <textarea
            id="key_advantages"
            name="key_advantages"
            value={formData.key_advantages}
            onChange={handleChange}
            required
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Example advantages:
• Once daily dosing (vs. multiple daily doses)
• Faster onset of action (days vs. weeks)
• Better safety profile (fewer side effects)
• Oral medication (vs. injections)
• Lower cost than alternatives"
          />
          <p className="text-xs text-gray-500 mt-1">List 3-5 advantages in simple, clear language. Focus on what matters to patients and doctors.</p>
        </div>

        <div>
          <label htmlFor="competitor_names" className="block text-sm font-medium text-gray-700 mb-1">
            Competitor Products <span className="text-red-500">*</span>
          </label>
          <textarea
            id="competitor_names"
            name="competitor_names"
            value={formData.competitor_names}
            onChange={handleChange}
            required
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="List product names (e.g., Humira, Enbrel, Remicade)"
          />
          <p className="text-xs text-gray-500 mt-1">Include brand names and their official websites when available</p>
        </div>

        <div>
          <label htmlFor="problem_solved" className="block text-sm font-medium text-gray-700 mb-1">
            What Problem Does Your Product Solve? <span className="text-red-500">*</span>
          </label>
          <textarea
            id="problem_solved"
            name="problem_solved"
            value={formData.problem_solved}
            onChange={handleChange}
            required
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Example: Patients with moderate disease have no treatment options between mild therapies and aggressive biologics"
          />
          <p className="text-xs text-gray-500 mt-1">Describe the gap in current treatment that your product fills</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Treatment Settings (Select all that apply) <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            {[
              { id: 'ts_hospital', value: 'Hospital/Inpatient', label: 'Hospital/Inpatient' },
              { id: 'ts_outpatient', value: 'Outpatient Clinic', label: 'Outpatient Clinic' },
              { id: 'ts_infusion', value: 'Infusion Center', label: 'Infusion Center' },
              { id: 'ts_home', value: 'Home Administration', label: 'Home Administration' },
              { id: 'ts_specialty', value: 'Specialty Pharmacy', label: 'Specialty Pharmacy' }
            ].map(option => (
              <div key={option.id} className="flex items-center">
                <input
                  type="checkbox"
                  id={option.id}
                  name="treatment_settings"
                  value={option.value}
                  checked={formData.treatment_settings.includes(option.value)}
                  onChange={handleChange}
                  className="mr-2"
                />
                <label htmlFor={option.id} className="text-sm">{option.label}</label>
              </div>
            ))}
          </div>
          {formData.treatment_settings.length === 0 && (
            <p className="text-xs text-red-500 mt-1">Please select at least one treatment setting</p>
          )}
        </div>
      </div>

      {/* SEO Enhancement Fields (Optional) */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">SEO Enhancement Fields (Optional)</h3>
        <p className="text-sm text-gray-600 mb-4">These fields are optional but help us create more targeted and effective SEO content. Each field captures specific search behaviors from doctors, patients, or payers.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="mechanism_of_action" className="block text-sm font-medium text-gray-700 mb-1">
              How Your Product Works (Optional)
            </label>
            <textarea
              id="mechanism_of_action"
              name="mechanism_of_action"
              value={formData.mechanism_of_action}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Selective JAK1/JAK3 inhibitor that blocks inflammatory pathways by targeting specific kinase enzymes"
            />
            <p className="text-xs text-gray-500 mt-1">Technical description helps capture HCP searches for specific mechanisms</p>
          </div>

          <div>
            <label htmlFor="clinical_trials" className="block text-sm font-medium text-gray-700 mb-1">
              Clinical Trial Information (Optional)
            </label>
            <textarea
              id="clinical_trials"
              name="clinical_trials"
              value={formData.clinical_trials}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Phase 3 STELLAR trial, 1,200 patients, 52 weeks
Phase 2 NOVA study, 450 patients, dose-ranging
Long-term extension study, 800 patients, 2 years"
            />
            <p className="text-xs text-gray-500 mt-1">Trial names and details that HCPs might search for</p>
          </div>

          <div>
            <label htmlFor="key_results" className="block text-sm font-medium text-gray-700 mb-1">
              Key Study Results (Optional)
            </label>
            <textarea
              id="key_results"
              name="key_results"
              value={formData.key_results}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 75% reduction in disease activity score
45% achieved complete remission at Week 16
Significant improvement in quality of life scores"
            />
            <p className="text-xs text-gray-500 mt-1">Specific outcomes that differentiate your product</p>
          </div>

          <div>
            <label htmlFor="safety_info" className="block text-sm font-medium text-gray-700 mb-1">
              Safety Information (Optional)
            </label>
            <textarea
              id="safety_info"
              name="safety_info"
              value={formData.safety_info}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., No black box warnings, well-tolerated
Most common side effects: headache (8%), nausea (5%)
No dose adjustment needed for elderly patients"
            />
            <p className="text-xs text-gray-500 mt-1">Key safety data that influences prescribing decisions</p>
          </div>

          <div>
            <label htmlFor="dosing_info" className="block text-sm font-medium text-gray-700 mb-1">
              How Is It Taken? (Optional)
            </label>
            <textarea
              id="dosing_info"
              name="dosing_info"
              value={formData.dosing_info}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Once daily oral tablet, can be taken with or without food
Starting dose: 5mg daily for 2 weeks, then 10mg daily
No dose adjustment for mild renal impairment"
            />
            <p className="text-xs text-gray-500 mt-1">Dosing convenience is a major search factor</p>
          </div>

          <div>
            <label htmlFor="patient_population" className="block text-sm font-medium text-gray-700 mb-1">
              Who Is This For? (Optional)
            </label>
            <textarea
              id="patient_population"
              name="patient_population"
              value={formData.patient_population}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Adults 18-65 with inadequate response to methotrexate
Moderate to severe disease despite conventional therapy
Biologic-naive patients or those who failed anti-TNF therapy"
            />
            <p className="text-xs text-gray-500 mt-1">Specific patient groups who benefit most</p>
          </div>

          <div>
            <label htmlFor="regulatory_status" className="block text-sm font-medium text-gray-700 mb-1">
              Regulatory Status/Designations (Optional)
            </label>
            <textarea
              id="regulatory_status"
              name="regulatory_status"
              value={formData.regulatory_status}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="FDA approval status, breakthrough therapy, orphan drug"
            />
            <p className="text-xs text-gray-500 mt-1">Regulatory designations increase search interest and credibility</p>
          </div>

          <div>
            <label htmlFor="patient_numbers" className="block text-sm font-medium text-gray-700 mb-1">
              Patient Numbers (Optional)
            </label>
            <input
              type="text"
              id="patient_numbers"
              name="patient_numbers"
              value={formData.patient_numbers}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 2.3 million patients in US, 15 million globally, growing 5% annually"
            />
            <p className="text-xs text-gray-500 mt-1">Helps prioritize SEO investment based on market opportunity</p>
          </div>

          <div>
            <label htmlFor="industry_keywords" className="block text-sm font-medium text-gray-700 mb-1">
              Industry Keywords You Want Included (Optional)
            </label>
            <textarea
              id="industry_keywords"
              name="industry_keywords"
              value={formData.industry_keywords}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., JAKi, tsDMARD, targeted synthetic DMARD, kinase inhibitor, small molecule, oral DMARD, JAK/STAT pathway"
            />
            <p className="text-xs text-gray-500 mt-1">Technical terms, acronyms, or specific phrases important to your product</p>
          </div>

          <div>
            <label htmlFor="avoid_keywords" className="block text-sm font-medium text-gray-700 mb-1">
              Keywords to Avoid (Optional)
            </label>
            <textarea
              id="avoid_keywords"
              name="avoid_keywords"
              value={formData.avoid_keywords}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Terms we should not use"
            />
            <p className="text-xs text-gray-500 mt-1">Helps us avoid keywords you can't use yet</p>
          </div>
        </div>

        <div>
          <label htmlFor="website_url" className="block text-sm font-medium text-gray-700 mb-1">
            Website URL (if applicable)
          </label>
          <input
            type="url"
            id="website_url"
            name="website_url"
            value={formData.website_url}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://www.example.com"
          />
          <p className="text-xs text-gray-500 mt-1">We'll build on your existing SEO presence</p>
        </div>

        <div>
          <label htmlFor="unique_value_prop" className="block text-sm font-medium text-gray-700 mb-1">
            Unique Value Proposition (Optional)
          </label>
          <textarea
            id="unique_value_prop"
            name="unique_value_prop"
            value={formData.unique_value_prop}
            onChange={handleChange}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="One key message to emphasize"
          />
          <p className="text-xs text-gray-500 mt-1">Helps focus SEO on your strongest advantage</p>
        </div>

        <div>
          <label htmlFor="conference_data" className="block text-sm font-medium text-gray-700 mb-1">
            Recent Conference Presentations
          </label>
          <textarea
            id="conference_data"
            name="conference_data"
            value={formData.conference_data}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Conference name, date, and URL (e.g., ASCO 2024, June 2024, https://meetings.asco.org/abstracts)"
          />
          <p className="text-xs text-gray-500 mt-1">Conference presentations create search spikes we can capitalize on</p>
        </div>

        <div>
          <label htmlFor="kol_names" className="block text-sm font-medium text-gray-700 mb-1">
            Key Opinion Leaders (Optional)
          </label>
          <textarea
            id="kol_names"
            name="kol_names"
            value={formData.kol_names}
            onChange={handleChange}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Leading physicians/researchers associated with your product"
          />
          <p className="text-xs text-gray-500 mt-1">KOL names drive HCP searches and add credibility</p>
        </div>

        <div>
          <label htmlFor="special_considerations" className="block text-sm font-medium text-gray-700 mb-1">
            Anything Else We Should Know? (Optional)
          </label>
          <textarea
            id="special_considerations"
            name="special_considerations"
            value={formData.special_considerations}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Competing with biosimilar launching next year
Positioned for community practice vs. academic centers
Key data presentation at ASH conference in December
Partnership with patient advocacy group announced"
          />
        </div>
      </div>

      {/* Processing Time Notice */}
      <div className="bg-blue-50 p-4 rounded-md">
        <p className="text-sm text-blue-800">
          <strong>Processing Time:</strong> Within 60 minutes
        </p>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end space-x-3 pt-6">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting...' : 'Submit SEO Content Request'}
        </button>
      </div>
    </form>
  );
};