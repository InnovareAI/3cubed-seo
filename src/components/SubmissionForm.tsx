import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

interface SubmissionFormProps {
  onSuccess?: () => void;
  onClose?: () => void;
}

interface FormData {
  // Reviewer Information
  reviewer1_name: string;
  reviewer1_email: string;
  reviewer2_name: string;
  reviewer2_email: string;
  reviewer3_name: string;
  reviewer3_email: string;
  
  // Product Information
  product_name: string;
  therapeutic_area: string;
  stage: string;
  indication: string;
  mechanism_of_action: string;
  patient_population: string;
  competitive_landscape: string;
  key_differentiators: string;
  value_proposition: string;
  
  // Clinical Trial Info
  clinical_trial_status: string;
  trial_endpoints: string;
  expected_approval_date: string;
  
  // Market Analysis
  market_size: string;
  market_share_projection: string;
  pricing_strategy: string;
  
  // Target Demographics
  target_audience: string;
  target_hcp_specialties: string;
  target_patient_demographics: string;
  target_markets: string;
  
  // Content Requirements
  content_type: string;
  key_messages: string;
  tone_style: string;
  content_timeline: string;
  
  // Regulatory
  regulatory_considerations: string;
  mlr_requirements: string;
  
  // Additional Info
  reference_materials: string;
  competitor_examples: string;
  specific_requirements: string;
  success_metrics: string;
}

export const SubmissionForm: React.FC<SubmissionFormProps> = ({ onSuccess, onClose }) => {
  const [formData, setFormData] = useState<FormData>({
    reviewer1_name: '',
    reviewer1_email: '',
    reviewer2_name: '',
    reviewer2_email: '',
    reviewer3_name: '',
    reviewer3_email: '',
    product_name: '',
    therapeutic_area: '',
    stage: '',
    indication: '',
    mechanism_of_action: '',
    patient_population: '',
    competitive_landscape: '',
    key_differentiators: '',
    value_proposition: '',
    clinical_trial_status: '',
    trial_endpoints: '',
    expected_approval_date: '',
    market_size: '',
    market_share_projection: '',
    pricing_strategy: '',
    target_audience: '',
    target_hcp_specialties: '',
    target_patient_demographics: '',
    target_markets: '',
    content_type: '',
    key_messages: '',
    tone_style: '',
    content_timeline: '',
    regulatory_considerations: '',
    mlr_requirements: '',
    reference_materials: '',
    competitor_examples: '',
    specific_requirements: '',
    success_metrics: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const submissionData = {
        submitter_name: formData.reviewer1_name, // Primary reviewer
        submitter_email: formData.reviewer1_email,
        product_name: formData.product_name,
        therapeutic_area: formData.therapeutic_area,
        stage: formData.stage,
        indication: formData.indication,
        mechanism_of_action: formData.mechanism_of_action,
        competitive_landscape: formData.competitive_landscape,
        key_differentiators: formData.key_differentiators,
        target_audience: formData.target_audience,
        target_markets: formData.target_markets,
        // Store all form data in raw_input_content
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
        reviewer1_name: '',
        reviewer1_email: '',
        reviewer2_name: '',
        reviewer2_email: '',
        reviewer3_name: '',
        reviewer3_email: '',
        product_name: '',
        therapeutic_area: '',
        stage: '',
        indication: '',
        mechanism_of_action: '',
        patient_population: '',
        competitive_landscape: '',
        key_differentiators: '',
        value_proposition: '',
        clinical_trial_status: '',
        trial_endpoints: '',
        expected_approval_date: '',
        market_size: '',
        market_share_projection: '',
        pricing_strategy: '',
        target_audience: '',
        target_hcp_specialties: '',
        target_patient_demographics: '',
        target_markets: '',
        content_type: '',
        key_messages: '',
        tone_style: '',
        content_timeline: '',
        regulatory_considerations: '',
        mlr_requirements: '',
        reference_materials: '',
        competitor_examples: '',
        specific_requirements: '',
        success_metrics: ''
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

      {/* Reviewer Information */}
      <div className="border-b pb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Reviewer Information</h3>
        
        {/* Reviewer 1 */}
        <div className="mb-4">
          <h4 className="text-md font-medium text-gray-700 mb-3">Reviewer 1 (Primary)</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="reviewer1_name" className="block text-sm font-medium text-gray-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="reviewer1_name"
                name="reviewer1_name"
                value={formData.reviewer1_name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label htmlFor="reviewer1_email" className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="reviewer1_email"
                name="reviewer1_email"
                value={formData.reviewer1_email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="john.doe@example.com"
              />
            </div>
          </div>
        </div>

        {/* Reviewer 2 */}
        <div className="mb-4">
          <h4 className="text-md font-medium text-gray-700 mb-3">Reviewer 2</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="reviewer2_name" className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                id="reviewer2_name"
                name="reviewer2_name"
                value={formData.reviewer2_name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Jane Smith"
              />
            </div>
            <div>
              <label htmlFor="reviewer2_email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="reviewer2_email"
                name="reviewer2_email"
                value={formData.reviewer2_email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="jane.smith@example.com"
              />
            </div>
          </div>
        </div>

        {/* Reviewer 3 */}
        <div>
          <h4 className="text-md font-medium text-gray-700 mb-3">Reviewer 3</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="reviewer3_name" className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                id="reviewer3_name"
                name="reviewer3_name"
                value={formData.reviewer3_name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Bob Johnson"
              />
            </div>
            <div>
              <label htmlFor="reviewer3_email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="reviewer3_email"
                name="reviewer3_email"
                value={formData.reviewer3_email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="bob.johnson@example.com"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Product Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Product Information</h3>
        
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
              placeholder="e.g., KEYTRUDA®, Humira®"
            />
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
              <option value="">Select therapeutic area</option>
              <option value="Oncology">Oncology</option>
              <option value="Cardiovascular">Cardiovascular</option>
              <option value="Neurology">Neurology</option>
              <option value="Immunology">Immunology</option>
              <option value="Rare Diseases">Rare Diseases</option>
              <option value="Endocrinology">Endocrinology</option>
              <option value="Respiratory">Respiratory</option>
              <option value="Gastroenterology">Gastroenterology</option>
              <option value="Hematology">Hematology</option>
              <option value="Infectious Diseases">Infectious Diseases</option>
              <option value="Ophthalmology">Ophthalmology</option>
              <option value="Dermatology">Dermatology</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="stage" className="block text-sm font-medium text-gray-700 mb-1">
              Development Stage <span className="text-red-500">*</span>
            </label>
            <select
              id="stage"
              name="stage"
              value={formData.stage}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select stage</option>
              <option value="Phase III">Phase III</option>
              <option value="Market Shaping">Market Shaping</option>
              <option value="Market Launch">Market Launch</option>
            </select>
          </div>

          <div>
            <label htmlFor="clinical_trial_status" className="block text-sm font-medium text-gray-700 mb-1">
              Clinical Trial Status
            </label>
            <input
              type="text"
              id="clinical_trial_status"
              name="clinical_trial_status"
              value={formData.clinical_trial_status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Phase III ongoing, enrollment complete"
            />
          </div>
        </div>

        <div>
          <label htmlFor="indication" className="block text-sm font-medium text-gray-700 mb-1">
            Indication <span className="text-red-500">*</span>
          </label>
          <textarea
            id="indication"
            name="indication"
            value={formData.indication}
            onChange={handleChange}
            required
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Metastatic non-small cell lung cancer (NSCLC) with PD-L1 expression ≥50%"
          />
        </div>

        <div>
          <label htmlFor="mechanism_of_action" className="block text-sm font-medium text-gray-700 mb-1">
            Mechanism of Action
          </label>
          <textarea
            id="mechanism_of_action"
            name="mechanism_of_action"
            value={formData.mechanism_of_action}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., PD-1 inhibitor that blocks interaction between PD-1 and PD-L1/PD-L2"
          />
        </div>

        <div>
          <label htmlFor="patient_population" className="block text-sm font-medium text-gray-700 mb-1">
            Patient Population
          </label>
          <textarea
            id="patient_population"
            name="patient_population"
            value={formData.patient_population}
            onChange={handleChange}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Adults 18+ with advanced/metastatic NSCLC, first-line treatment"
          />
        </div>

        <div>
          <label htmlFor="competitive_landscape" className="block text-sm font-medium text-gray-700 mb-1">
            Competitive Landscape
          </label>
          <textarea
            id="competitive_landscape"
            name="competitive_landscape"
            value={formData.competitive_landscape}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Opdivo®, Tecentriq®, other checkpoint inhibitors"
          />
        </div>

        <div>
          <label htmlFor="key_differentiators" className="block text-sm font-medium text-gray-700 mb-1">
            Key Differentiators
          </label>
          <textarea
            id="key_differentiators"
            name="key_differentiators"
            value={formData.key_differentiators}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Superior efficacy in first-line treatment, better safety profile, convenient dosing"
          />
        </div>

        <div>
          <label htmlFor="value_proposition" className="block text-sm font-medium text-gray-700 mb-1">
            Value Proposition
          </label>
          <textarea
            id="value_proposition"
            name="value_proposition"
            value={formData.value_proposition}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="What unique value does your product offer?"
          />
        </div>
      </div>

      {/* Clinical Trial Information */}
      <div className="space-y-4 border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900">Clinical Trial Information</h3>
        
        <div>
          <label htmlFor="trial_endpoints" className="block text-sm font-medium text-gray-700 mb-1">
            Trial Endpoints
          </label>
          <textarea
            id="trial_endpoints"
            name="trial_endpoints"
            value={formData.trial_endpoints}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Primary and secondary endpoints"
          />
        </div>

        <div>
          <label htmlFor="expected_approval_date" className="block text-sm font-medium text-gray-700 mb-1">
            Expected Approval Date
          </label>
          <input
            type="text"
            id="expected_approval_date"
            name="expected_approval_date"
            value={formData.expected_approval_date}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Q4 2024"
          />
        </div>
      </div>

      {/* Market Analysis */}
      <div className="space-y-4 border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900">Market Analysis</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="market_size" className="block text-sm font-medium text-gray-700 mb-1">
              Market Size
            </label>
            <input
              type="text"
              id="market_size"
              name="market_size"
              value={formData.market_size}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., $5.2B globally"
            />
          </div>

          <div>
            <label htmlFor="market_share_projection" className="block text-sm font-medium text-gray-700 mb-1">
              Market Share Projection
            </label>
            <input
              type="text"
              id="market_share_projection"
              name="market_share_projection"
              value={formData.market_share_projection}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 15% by 2026"
            />
          </div>

          <div>
            <label htmlFor="pricing_strategy" className="block text-sm font-medium text-gray-700 mb-1">
              Pricing Strategy
            </label>
            <input
              type="text"
              id="pricing_strategy"
              name="pricing_strategy"
              value={formData.pricing_strategy}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Premium pricing"
            />
          </div>
        </div>
      </div>

      {/* Target Demographics */}
      <div className="space-y-4 border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900">Target Demographics</h3>
        
        <div>
          <label htmlFor="target_audience" className="block text-sm font-medium text-gray-700 mb-1">
            Target Audience <span className="text-red-500">*</span>
          </label>
          <select
            id="target_audience"
            name="target_audience"
            value={formData.target_audience}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select target audience</option>
            <option value="Healthcare Professionals">Healthcare Professionals</option>
            <option value="Patients">Patients</option>
            <option value="Regulatory Bodies">Regulatory Bodies</option>
            <option value="Payers / Insurance">Payers / Insurance</option>
            <option value="Investors">Investors</option>
            <option value="General Public">General Public</option>
          </select>
        </div>

        <div>
          <label htmlFor="target_hcp_specialties" className="block text-sm font-medium text-gray-700 mb-1">
            Target HCP Specialties
          </label>
          <input
            type="text"
            id="target_hcp_specialties"
            name="target_hcp_specialties"
            value={formData.target_hcp_specialties}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Oncologists, Pulmonologists, Pathologists"
          />
        </div>

        <div>
          <label htmlFor="target_patient_demographics" className="block text-sm font-medium text-gray-700 mb-1">
            Target Patient Demographics
          </label>
          <textarea
            id="target_patient_demographics"
            name="target_patient_demographics"
            value={formData.target_patient_demographics}
            onChange={handleChange}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Age range, gender, disease stage, treatment history"
          />
        </div>

        <div>
          <label htmlFor="target_markets" className="block text-sm font-medium text-gray-700 mb-1">
            Target Markets <span className="text-red-500">*</span>
          </label>
          <select
            id="target_markets"
            name="target_markets"
            value={formData.target_markets}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select target market</option>
            <option value="United States">United States</option>
            <option value="Europe (EU)">Europe (EU)</option>
            <option value="United Kingdom">United Kingdom</option>
            <option value="Canada">Canada</option>
            <option value="Japan">Japan</option>
            <option value="China">China</option>
            <option value="Brazil">Brazil</option>
            <option value="Australia">Australia</option>
            <option value="South Korea">South Korea</option>
            <option value="India">India</option>
            <option value="Global">Global</option>
          </select>
        </div>
      </div>

      {/* Content Requirements */}
      <div className="space-y-4 border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900">Content Requirements</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="content_type" className="block text-sm font-medium text-gray-700 mb-1">
              Content Type
            </label>
            <select
              id="content_type"
              name="content_type"
              value={formData.content_type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select content type</option>
              <option value="Website Copy">Website Copy</option>
              <option value="Blog Articles">Blog Articles</option>
              <option value="White Papers">White Papers</option>
              <option value="Case Studies">Case Studies</option>
              <option value="Email Campaigns">Email Campaigns</option>
              <option value="Social Media">Social Media</option>
              <option value="Press Releases">Press Releases</option>
              <option value="Product Brochures">Product Brochures</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="tone_style" className="block text-sm font-medium text-gray-700 mb-1">
              Tone & Style
            </label>
            <select
              id="tone_style"
              name="tone_style"
              value={formData.tone_style}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select tone</option>
              <option value="Professional/Clinical">Professional/Clinical</option>
              <option value="Educational">Educational</option>
              <option value="Conversational">Conversational</option>
              <option value="Empathetic">Empathetic</option>
              <option value="Authoritative">Authoritative</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="key_messages" className="block text-sm font-medium text-gray-700 mb-1">
            Key Messages
          </label>
          <textarea
            id="key_messages"
            name="key_messages"
            value={formData.key_messages}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Main points to communicate"
          />
        </div>

        <div>
          <label htmlFor="content_timeline" className="block text-sm font-medium text-gray-700 mb-1">
            Content Timeline
          </label>
          <input
            type="text"
            id="content_timeline"
            name="content_timeline"
            value={formData.content_timeline}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., 2 weeks, 1 month"
          />
        </div>
      </div>

      {/* Regulatory Considerations */}
      <div className="space-y-4 border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900">Regulatory Considerations</h3>
        
        <div>
          <label htmlFor="regulatory_considerations" className="block text-sm font-medium text-gray-700 mb-1">
            Regulatory Considerations
          </label>
          <textarea
            id="regulatory_considerations"
            name="regulatory_considerations"
            value={formData.regulatory_considerations}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="FDA guidelines, local regulations, compliance requirements"
          />
        </div>

        <div>
          <label htmlFor="mlr_requirements" className="block text-sm font-medium text-gray-700 mb-1">
            MLR Requirements
          </label>
          <textarea
            id="mlr_requirements"
            name="mlr_requirements"
            value={formData.mlr_requirements}
            onChange={handleChange}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Medical Legal Review requirements"
          />
        </div>
      </div>

      {/* Additional Information */}
      <div className="space-y-4 border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900">Additional Information</h3>
        
        <div>
          <label htmlFor="reference_materials" className="block text-sm font-medium text-gray-700 mb-1">
            Reference Materials
          </label>
          <textarea
            id="reference_materials"
            name="reference_materials"
            value={formData.reference_materials}
            onChange={handleChange}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Links to studies, guidelines, existing materials"
          />
        </div>

        <div>
          <label htmlFor="competitor_examples" className="block text-sm font-medium text-gray-700 mb-1">
            Competitor Examples
          </label>
          <textarea
            id="competitor_examples"
            name="competitor_examples"
            value={formData.competitor_examples}
            onChange={handleChange}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="URLs or descriptions of competitor content"
          />
        </div>

        <div>
          <label htmlFor="specific_requirements" className="block text-sm font-medium text-gray-700 mb-1">
            Specific Requirements
          </label>
          <textarea
            id="specific_requirements"
            name="specific_requirements"
            value={formData.specific_requirements}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Any specific requirements or constraints"
          />
        </div>

        <div>
          <label htmlFor="success_metrics" className="block text-sm font-medium text-gray-700 mb-1">
            Success Metrics
          </label>
          <textarea
            id="success_metrics"
            name="success_metrics"
            value={formData.success_metrics}
            onChange={handleChange}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="How will success be measured?"
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end space-x-3 pt-6 border-t">
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
          {isSubmitting ? 'Submitting...' : 'Submit Request'}
        </button>
      </div>
    </form>
  );
};