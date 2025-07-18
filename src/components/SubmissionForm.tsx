import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

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
  key_differentiators: string;
  competitors: string;
  unmet_need: string;
  treatment_settings: string[];
  
  // SEO Enhancement Fields
  mechanism_of_action: string;
  clinical_trials: string;
  efficacy_data: string;
  safety_profile: string;
  dosing_administration: string;
  patient_populations: string;
  regulatory_status: string;
  market_size: string;
  medical_keywords: string;
  avoid_keywords: string;
  existing_content: string;
  unique_value_prop: string;
  conference_data: string;
  kol_names: string;
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
    key_differentiators: '',
    competitors: '',
    unmet_need: '',
    treatment_settings: [],
    mechanism_of_action: '',
    clinical_trials: '',
    efficacy_data: '',
    safety_profile: '',
    dosing_administration: '',
    patient_populations: '',
    regulatory_status: '',
    market_size: '',
    medical_keywords: '',
    avoid_keywords: '',
    existing_content: '',
    unique_value_prop: '',
    conference_data: '',
    kol_names: ''
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
        therapeutic_area: formData.therapeutic_area,
        stage: formData.stage,
        indication: formData.condition_treated,
        mechanism_of_action: formData.mechanism_of_action,
        competitive_landscape: formData.competitors,
        key_differentiators: formData.key_differentiators,
        target_audience: formData.target_audience.join(', '),
        target_markets: formData.geography.join(', '),
        // Store all form data as JSON in raw_input_content
        raw_input_content: JSON.stringify(formData),
        // Default values for new submissions
        priority_level: 'Medium',
        langchain_status: 'needs_processing',
        workflow_stage: 'initial_processing',
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
        key_differentiators: '',
        competitors: '',
        unmet_need: '',
        treatment_settings: [],
        mechanism_of_action: '',
        clinical_trials: '',
        efficacy_data: '',
        safety_profile: '',
        dosing_administration: '',
        patient_populations: '',
        regulatory_status: '',
        market_size: '',
        medical_keywords: '',
        avoid_keywords: '',
        existing_content: '',
        unique_value_prop: '',
        conference_data: '',
        kol_names: ''
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
              <option value="Oncology">Oncology</option>
              <option value="Rare Disease">Rare Disease</option>
              <option value="Other">Other</option>
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

      {/* Key Information */}
      <div className="space-y-4 border-b pb-6">
        <h3 className="text-lg font-semibold text-gray-900">Key Information</h3>
        
        <div>
          <label htmlFor="key_differentiators" className="block text-sm font-medium text-gray-700 mb-1">
            Key Differentiators <span className="text-red-500">*</span>
          </label>
          <textarea
            id="key_differentiators"
            name="key_differentiators"
            value={formData.key_differentiators}
            onChange={handleChange}
            required
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="What makes this treatment different/better?"
          />
          <p className="text-xs text-gray-500 mt-1">List 3-5 advantages in simple, clear language. Focus on what matters to patients and doctors.</p>
        </div>

        <div>
          <label htmlFor="competitors" className="block text-sm font-medium text-gray-700 mb-1">
            Main Competitors <span className="text-red-500">*</span>
          </label>
          <textarea
            id="competitors"
            name="competitors"
            value={formData.competitors}
            onChange={handleChange}
            required
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="List competing products and companies"
          />
          <p className="text-xs text-gray-500 mt-1">Include brand names and their official websites when available</p>
        </div>

        <div>
          <label htmlFor="unmet_need" className="block text-sm font-medium text-gray-700 mb-1">
            Unmet Need <span className="text-red-500">*</span>
          </label>
          <textarea
            id="unmet_need"
            name="unmet_need"
            value={formData.unmet_need}
            onChange={handleChange}
            required
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="What problem does this solve?"
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
              Mechanism of Action
            </label>
            <textarea
              id="mechanism_of_action"
              name="mechanism_of_action"
              value={formData.mechanism_of_action}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="How does the drug work?"
            />
            <p className="text-xs text-gray-500 mt-1">Technical description helps capture HCP searches for specific mechanisms</p>
          </div>

          <div>
            <label htmlFor="clinical_trials" className="block text-sm font-medium text-gray-700 mb-1">
              Clinical Trial Names/Numbers
            </label>
            <textarea
              id="clinical_trials"
              name="clinical_trials"
              value={formData.clinical_trials}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., KEYNOTE-189, NCT02578680"
            />
            <p className="text-xs text-gray-500 mt-1">Trial names and details that HCPs might search for</p>
          </div>

          <div>
            <label htmlFor="efficacy_data" className="block text-sm font-medium text-gray-700 mb-1">
              Key Efficacy Data
            </label>
            <textarea
              id="efficacy_data"
              name="efficacy_data"
              value={formData.efficacy_data}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Response rates, survival data, etc."
            />
            <p className="text-xs text-gray-500 mt-1">Specific outcomes that differentiate your product</p>
          </div>

          <div>
            <label htmlFor="safety_profile" className="block text-sm font-medium text-gray-700 mb-1">
              Safety Profile Highlights
            </label>
            <textarea
              id="safety_profile"
              name="safety_profile"
              value={formData.safety_profile}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Key safety advantages or considerations"
            />
            <p className="text-xs text-gray-500 mt-1">Key safety data that influences prescribing decisions</p>
          </div>

          <div>
            <label htmlFor="dosing_administration" className="block text-sm font-medium text-gray-700 mb-1">
              Dosing & Administration
            </label>
            <textarea
              id="dosing_administration"
              name="dosing_administration"
              value={formData.dosing_administration}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Frequency, route, duration"
            />
            <p className="text-xs text-gray-500 mt-1">Dosing convenience is a major search factor</p>
          </div>

          <div>
            <label htmlFor="patient_populations" className="block text-sm font-medium text-gray-700 mb-1">
              Specific Patient Populations
            </label>
            <textarea
              id="patient_populations"
              name="patient_populations"
              value={formData.patient_populations}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Age groups, biomarkers, prior treatments"
            />
            <p className="text-xs text-gray-500 mt-1">Specific patient groups who benefit most</p>
          </div>

          <div>
            <label htmlFor="regulatory_status" className="block text-sm font-medium text-gray-700 mb-1">
              Regulatory Status/Designations
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
            <label htmlFor="market_size" className="block text-sm font-medium text-gray-700 mb-1">
              Market Size/Patient Numbers
            </label>
            <input
              type="text"
              id="market_size"
              name="market_size"
              value={formData.market_size}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Estimated patient population"
            />
            <p className="text-xs text-gray-500 mt-1">Helps prioritize SEO investment based on market opportunity</p>
          </div>

          <div>
            <label htmlFor="medical_keywords" className="block text-sm font-medium text-gray-700 mb-1">
              Important Medical Keywords
            </label>
            <textarea
              id="medical_keywords"
              name="medical_keywords"
              value={formData.medical_keywords}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Key terms your audience uses"
            />
            <p className="text-xs text-gray-500 mt-1">Technical terms, acronyms, or specific phrases important to your product</p>
          </div>

          <div>
            <label htmlFor="avoid_keywords" className="block text-sm font-medium text-gray-700 mb-1">
              Keywords to Avoid
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
          <label htmlFor="existing_content" className="block text-sm font-medium text-gray-700 mb-1">
            Existing Website/Content URLs
          </label>
          <textarea
            id="existing_content"
            name="existing_content"
            value={formData.existing_content}
            onChange={handleChange}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Current website or content links"
          />
          <p className="text-xs text-gray-500 mt-1">We'll build on your existing SEO presence</p>
        </div>

        <div>
          <label htmlFor="unique_value_prop" className="block text-sm font-medium text-gray-700 mb-1">
            Unique Value Proposition
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
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="ASCO, ASH, ACC presentations"
          />
          <p className="text-xs text-gray-500 mt-1">Conference presentations create search spikes we can capitalize on</p>
        </div>

        <div>
          <label htmlFor="kol_names" className="block text-sm font-medium text-gray-700 mb-1">
            Key Opinion Leaders
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