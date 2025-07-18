import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

interface SubmissionFormProps {
  onSuccess?: () => void;
  onClose?: () => void;
}

interface FormData {
  // Reviewer Information
  reviewer_name: string;
  reviewer_email: string;
  
  // Basic Information
  product_name: string;
  therapeutic_area: string;
  stage: string;
  indication: string;
  mechanism_of_action: string;
  competitive_landscape: string;
  key_differentiators: string;
  
  // Target Demographics
  target_audience: string;
  target_markets: string;
}

export const SubmissionForm: React.FC<SubmissionFormProps> = ({ onSuccess, onClose }) => {
  const [formData, setFormData] = useState<FormData>({
    reviewer_name: '',
    reviewer_email: '',
    product_name: '',
    therapeutic_area: '',
    stage: '',
    indication: '',
    mechanism_of_action: '',
    competitive_landscape: '',
    key_differentiators: '',
    target_audience: '',
    target_markets: ''
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
        submitter_name: formData.reviewer_name,
        submitter_email: formData.reviewer_email,
        product_name: formData.product_name,
        therapeutic_area: formData.therapeutic_area,
        stage: formData.stage,
        indication: formData.indication,
        mechanism_of_action: formData.mechanism_of_action,
        competitive_landscape: formData.competitive_landscape,
        key_differentiators: formData.key_differentiators,
        target_audience: formData.target_audience,
        target_markets: formData.target_markets,
        // Raw input content for processing
        raw_input_content: JSON.stringify(formData),
        // Default values for new submissions
        priority_level: 'Medium',
        langchain_status: 'needs_processing',
        workflow_stage: 'initial_processing',
        langchain_retry_count: 0,
        compliance_id: `COMP-${Date.now()}` // Generate a unique compliance ID
      };

      const { error: supabaseError } = await supabase
        .from('submissions')
        .insert([submissionData]);

      if (supabaseError) throw supabaseError;

      // Reset form
      setFormData({
        reviewer_name: '',
        reviewer_email: '',
        product_name: '',
        therapeutic_area: '',
        stage: '',
        indication: '',
        mechanism_of_action: '',
        competitive_landscape: '',
        key_differentiators: '',
        target_audience: '',
        target_markets: ''
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
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
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
            <label htmlFor="reviewer_name" className="block text-sm font-medium text-gray-700 mb-1">
              Your Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="reviewer_name"
              name="reviewer_name"
              value={formData.reviewer_name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label htmlFor="reviewer_email" className="block text-sm font-medium text-gray-700 mb-1">
              Your Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="reviewer_email"
              name="reviewer_email"
              value={formData.reviewer_email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="john.doe@example.com"
            />
          </div>
        </div>
      </div>

      {/* Basic Information Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
        
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
      </div>

      {/* Target Demographics Section */}
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