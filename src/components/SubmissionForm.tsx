import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { THERAPEUTIC_AREAS } from '../constants/therapeuticAreas';

// Version 3.0 - Simplified form with only 3 mandatory fields + email
// Last updated: 2025-07-25

interface SubmissionFormProps {
  onSuccess?: () => void;
  onClose?: () => void;
}

interface FormData {
  // Essential Fields (3 + email)
  product_name: string;
  indication: string;
  therapeutic_area: string;
  submitter_email: string;
  
  // All other fields are optional
  submitter_name: string;
  stage: string;
  client_name: string;
  client_reviewer_name: string;
  client_reviewer_email: string;
  mlr_reviewer_name: string;
  mlr_reviewer_email: string;
  product_code: string;
  target_audience: string[];
  geography: string[];
  key_advantages: string;
  competitor_names: string;
  competitor_urls: string;
  problem_solved: string;
  treatment_settings: string[];
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
    // Essential fields
    product_name: '',
    indication: '',
    therapeutic_area: '',
    submitter_email: '',
    
    // Optional fields
    submitter_name: '',
    stage: '',
    client_name: '',
    client_reviewer_name: '',
    client_reviewer_email: '',
    mlr_reviewer_name: '',
    mlr_reviewer_email: '',
    product_code: '',
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
  const [showOptionalFields, setShowOptionalFields] = useState(false);

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

    try {
      const submissionData = {
        // Essential fields
        product_name: formData.product_name,
        indication: formData.indication,
        therapeutic_area: formData.therapeutic_area,
        submitter_email: formData.submitter_email,
        
        // Optional fields - only include if filled
        submitter_name: formData.submitter_name || null,
        stage: formData.stage || null,
        mechanism_of_action: formData.mechanism_of_action || null,
        key_differentiators: formData.key_advantages || null,
        
        // Array fields - send empty arrays if not filled
        target_audience: formData.target_audience.length > 0 ? formData.target_audience : [],
        geography: formData.geography.length > 0 ? formData.geography : [],
        treatment_setting: formData.treatment_settings.length > 0 ? formData.treatment_settings : [],
        
        // Store additional data in appropriate fields
        client_name: formData.client_name || null,
        client_reviewer_name: formData.client_reviewer_name || null,
        client_reviewer_email: formData.client_reviewer_email || null,
        mlr_reviewer_name: formData.mlr_reviewer_name || null,
        mlr_reviewer_email: formData.mlr_reviewer_email || null,
        
        // Store competitor info
        competitor_products: formData.competitor_names ? formData.competitor_names.split(',').map(s => s.trim()) : [],
        competitive_positioning: formData.problem_solved || null,
        
        // Store clinical data
        clinical_trial_details: formData.clinical_trials || null,
        primary_endpoints: formData.key_results || null,
        safety_profile: formData.safety_info || null,
        dosing_information: formData.dosing_info || null,
        patient_population: formData.patient_population || null,
        regulatory_status: formData.regulatory_status ? [formData.regulatory_status] : [],
        market_size: formData.patient_numbers || null,
        
        // Store additional keywords and info
        additional_keywords: formData.industry_keywords || null,
        content_restrictions: formData.avoid_keywords ? formData.avoid_keywords.split(',').map(s => s.trim()) : [],
        existing_digital_assets: formData.website_url || null,
        unmet_medical_need: formData.unique_value_prop || null,
        conference_presence: formData.conference_data ? [formData.conference_data] : [],
        key_opinion_leaders: formData.kol_names ? formData.kol_names.split(',').map(s => s.trim()) : [],
        special_considerations: formData.special_considerations || null,
        
        // Store all form data as JSON for reference
        raw_input_content: JSON.stringify(formData),
        
        // Default values for new submissions
        priority_level: 'medium',
        ai_processing_status: 'pending',
        workflow_stage: 'draft',
        compliance_id: `COMP-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_updated: new Date().toISOString()
      };

      console.log('Submitting to submissions table:', submissionData);

      const { data, error: supabaseError } = await supabase
        .from('submissions')
        .insert([submissionData])
        .select();

      if (supabaseError) {
        console.error('Supabase error:', supabaseError);
        throw supabaseError;
      }

      console.log('Submission successful:', data);

      // Reset form
      setFormData({
        product_name: '',
        indication: '',
        therapeutic_area: '',
        submitter_email: '',
        submitter_name: '',
        stage: '',
        client_name: '',
        client_reviewer_name: '',
        client_reviewer_email: '',
        mlr_reviewer_name: '',
        mlr_reviewer_email: '',
        product_code: '',
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
      
      // Show success message
      alert('SEO Content Request submitted successfully!');
      
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err: any) {
      console.error('Error submitting form:', err);
      
      let errorMessage = 'Failed to submit form. ';
      
      if (err?.message) {
        errorMessage += err.message;
      } else if (err?.details) {
        errorMessage += err.details;
      } else if (err?.hint) {
        errorMessage += err.hint;
      } else {
        errorMessage += 'Please check the console for details.';
      }
      
      setError(errorMessage);
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

      {/* Quick Submit Notice */}
      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
        <h3 className="text-lg font-semibold text-green-900 mb-2">✨ Quick Submit - Only 4 Required Fields!</h3>
        <p className="text-sm text-green-700">
          Submit your SEO request in 30 seconds. Our AI will automatically pull clinical trial data, 
          FDA approvals, and published research from medical databases.
        </p>
      </div>

      {/* Essential Fields Section */}
      <div className="bg-white p-6 rounded-lg border-2 border-blue-500 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-2 text-sm">1</span>
          Essential Information (Required)
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="product_name" className="block text-sm font-medium text-gray-700 mb-1">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="product_name"
              name="product_name"
              value={formData.product_name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Keytruda, Carvykti, Opdivo"
            />
            <p className="text-xs text-gray-500 mt-1">The actual drug name (NOT the development stage)</p>
          </div>

          <div>
            <label htmlFor="submitter_email" className="block text-sm font-medium text-gray-700 mb-1">
              Your Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="submitter_email"
              name="submitter_email"
              value={formData.submitter_email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="your.email@company.com"
            />
            <p className="text-xs text-gray-500 mt-1">For delivery notifications</p>
          </div>

          <div>
            <label htmlFor="indication" className="block text-sm font-medium text-gray-700 mb-1">
              Medical Indication <span className="text-red-500">*</span>
            </label>
            <textarea
              id="indication"
              name="indication"
              value={formData.indication}
              onChange={handleChange}
              required
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Non-small cell lung cancer, Multiple myeloma, Rheumatoid arthritis"
            />
            <p className="text-xs text-gray-500 mt-1">What condition does this treat?</p>
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
            <p className="text-xs text-gray-500 mt-1">Medical specialty category</p>
          </div>
        </div>
      </div>

      {/* Optional Fields Toggle */}
      <div className="text-center">
        <button
          type="button"
          onClick={() => setShowOptionalFields(!showOptionalFields)}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
        >
          {showOptionalFields ? (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
              Hide Optional Fields
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              Add More Details (Optional - Enhances SEO Quality)
            </>
          )}
        </button>
      </div>

      {/* Optional Fields */}
      {showOptionalFields && (
        <>
          {/* Recommended Fields */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="bg-gray-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-2 text-sm">2</span>
              Recommended Fields (Improves SEO Quality)
            </h3>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="stage" className="block text-sm font-medium text-gray-700 mb-1">
                  Development Stage
                </label>
                <select
                  id="stage"
                  name="stage"
                  value={formData.stage}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Stage</option>
                  <option value="Phase III">Phase III</option>
                  <option value="Market Shaping">Market Shaping</option>
                  <option value="Market Launch">Market Launch</option>
                </select>
              </div>

              <div>
                <label htmlFor="key_advantages" className="block text-sm font-medium text-gray-700 mb-1">
                  Key Product Advantages
                </label>
                <textarea
                  id="key_advantages"
                  name="key_advantages"
                  value={formData.key_advantages}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="• Once daily dosing (vs. multiple daily doses)
• Better safety profile (fewer side effects)
• Oral medication (vs. injections)"
                />
                <p className="text-xs text-gray-500 mt-1">What makes your product better?</p>
              </div>

              <div>
                <label htmlFor="competitor_names" className="block text-sm font-medium text-gray-700 mb-1">
                  Competitor Products
                </label>
                <textarea
                  id="competitor_names"
                  name="competitor_names"
                  value={formData.competitor_names}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Humira, Enbrel, Remicade"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Markets (Select up to 3)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {[
                    { id: 'geo_usa', value: 'United States', label: 'United States' },
                    { id: 'geo_eu', value: 'European Union', label: 'European Union' },
                    { id: 'geo_uk', value: 'United Kingdom', label: 'United Kingdom' },
                    { id: 'geo_canada', value: 'Canada', label: 'Canada' },
                    { id: 'geo_japan', value: 'Japan', label: 'Japan' },
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
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Audience
                </label>
                <div className="space-y-2">
                  {[
                    { id: 'ta_specialists', value: 'Specialist Physicians', label: 'Specialist Physicians' },
                    { id: 'ta_pcp', value: 'Primary Care Physicians', label: 'Primary Care Physicians' },
                    { id: 'ta_patients', value: 'Patients', label: 'Patients' },
                    { id: 'ta_caregivers', value: 'Caregivers', label: 'Caregivers' }
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
              </div>
            </div>
          </div>

          {/* Additional Optional Fields */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="bg-gray-400 text-white rounded-full w-8 h-8 flex items-center justify-center mr-2 text-sm">3</span>
              Additional Details (Further Enhances SEO)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="submitter_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  id="submitter_name"
                  name="submitter_name"
                  value={formData.submitter_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Full name"
                />
              </div>

              <div>
                <label htmlFor="client_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Client/Company Name
                </label>
                <input
                  type="text"
                  id="client_name"
                  name="client_name"
                  value={formData.client_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Company name"
                />
              </div>

              <div>
                <label htmlFor="mechanism_of_action" className="block text-sm font-medium text-gray-700 mb-1">
                  How It Works (Mechanism)
                </label>
                <textarea
                  id="mechanism_of_action"
                  name="mechanism_of_action"
                  value={formData.mechanism_of_action}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., PD-1 inhibitor, JAK inhibitor, CAR-T therapy"
                />
              </div>

              <div>
                <label htmlFor="clinical_trials" className="block text-sm font-medium text-gray-700 mb-1">
                  Clinical Trial Names
                </label>
                <textarea
                  id="clinical_trials"
                  name="clinical_trials"
                  value={formData.clinical_trials}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., KEYNOTE-189, CheckMate-227"
                />
              </div>

              <div>
                <label htmlFor="special_considerations" className="block text-sm font-medium text-gray-700 mb-1">
                  Special Notes
                </label>
                <textarea
                  id="special_considerations"
                  name="special_considerations"
                  value={formData.special_considerations}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Any other important information..."
                />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Processing Time Notice */}
      <div className="bg-blue-50 p-4 rounded-md">
        <p className="text-sm text-blue-800">
          <strong>Processing Time:</strong> Within 60 minutes. We'll automatically pull clinical data from FDA, ClinicalTrials.gov, and PubMed.
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
          {isSubmitting ? 'Submitting...' : 'Submit SEO Request'}
        </button>
      </div>
    </form>
  );
};