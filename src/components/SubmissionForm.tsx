import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

interface SubmissionFormProps {
  onSuccess?: () => void;
  onClose?: () => void;
}

interface FormData {
  reviewerName: string;
  reviewerEmail: string;
  productName: string;
  therapeuticArea: string;
  stage: string;
  indication: string;
  mechanismOfAction: string;
  patientPopulation: string;
  competitiveLandscape: string;
  keyDifferentiators: string;
  valueProposition: string;
  clinicalTrialStatus: string;
  trialEndpoints: string;
  expectedApprovalDate: string;
  marketSize: string;
  marketShareProjection: string;
  pricingStrategy: string;
  targetAudience: string;
  targetHCPSpecialties: string;
  targetPatientDemographics: string;
  targetMarkets: string;
  contentType: string;
  keyMessages: string;
  toneStyle: string;
  contentTimeline: string;
  regulatoryConsiderations: string;
  mlrRequirements: string;
  referenceMaterials: string;
  competitorExamples: string;
  specificRequirements: string;
  successMetrics: string;
}

export const SubmissionForm: React.FC<SubmissionFormProps> = ({ onSuccess, onClose }) => {
  const [formData, setFormData] = useState<FormData>({
    reviewerName: '',
    reviewerEmail: '',
    productName: '',
    therapeuticArea: '',
    stage: '',
    indication: '',
    mechanismOfAction: '',
    patientPopulation: '',
    competitiveLandscape: '',
    keyDifferentiators: '',
    valueProposition: '',
    clinicalTrialStatus: '',
    trialEndpoints: '',
    expectedApprovalDate: '',
    marketSize: '',
    marketShareProjection: '',
    pricingStrategy: '',
    targetAudience: '',
    targetHCPSpecialties: '',
    targetPatientDemographics: '',
    targetMarkets: '',
    contentType: '',
    keyMessages: '',
    toneStyle: '',
    contentTimeline: '',
    regulatoryConsiderations: '',
    mlrRequirements: '',
    referenceMaterials: '',
    competitorExamples: '',
    specificRequirements: '',
    successMetrics: ''
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
        submitter_name: formData.reviewerName,
        submitter_email: formData.reviewerEmail,
        product_name: formData.productName,
        therapeutic_area: formData.therapeuticArea,
        stage: formData.stage,
        indication: formData.indication,
        mechanism_of_action: formData.mechanismOfAction,
        competitive_landscape: formData.competitiveLandscape,
        key_differentiators: formData.keyDifferentiators,
        target_audience: formData.targetAudience,
        target_markets: formData.targetMarkets,
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
        reviewerName: '',
        reviewerEmail: '',
        productName: '',
        therapeuticArea: '',
        stage: '',
        indication: '',
        mechanismOfAction: '',
        patientPopulation: '',
        competitiveLandscape: '',
        keyDifferentiators: '',
        valueProposition: '',
        clinicalTrialStatus: '',
        trialEndpoints: '',
        expectedApprovalDate: '',
        marketSize: '',
        marketShareProjection: '',
        pricingStrategy: '',
        targetAudience: '',
        targetHCPSpecialties: '',
        targetPatientDemographics: '',
        targetMarkets: '',
        contentType: '',
        keyMessages: '',
        toneStyle: '',
        contentTimeline: '',
        regulatoryConsiderations: '',
        mlrRequirements: '',
        referenceMaterials: '',
        competitorExamples: '',
        specificRequirements: '',
        successMetrics: ''
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

      <div className="space-y-6">
        {/* Reviewer Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Reviewer Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Your Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="reviewerName"
                value={formData.reviewerName}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Your Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="reviewerEmail"
                value={formData.reviewerEmail}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Product Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Product Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="productName"
                value={formData.productName}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Therapeutic Area <span className="text-red-500">*</span>
              </label>
              <select
                name="therapeuticArea"
                value={formData.therapeuticArea}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
              <label className="block text-sm font-medium text-gray-700">
                Development Stage <span className="text-red-500">*</span>
              </label>
              <select
                name="stage"
                value={formData.stage}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select stage</option>
                <option value="Phase III">Phase III</option>
                <option value="Market Shaping">Market Shaping</option>
                <option value="Market Launch">Market Launch</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Indication <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="indication"
                value={formData.indication}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Mechanism of Action
            </label>
            <textarea
              name="mechanismOfAction"
              value={formData.mechanismOfAction}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Patient Population
            </label>
            <textarea
              name="patientPopulation"
              value={formData.patientPopulation}
              onChange={handleChange}
              rows={2}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Competitive Landscape
            </label>
            <textarea
              name="competitiveLandscape"
              value={formData.competitiveLandscape}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Key Differentiators
            </label>
            <textarea
              name="keyDifferentiators"
              value={formData.keyDifferentiators}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Value Proposition
            </label>
            <textarea
              name="valueProposition"
              value={formData.valueProposition}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Clinical Trial Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Clinical Trial Information</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Clinical Trial Status
            </label>
            <input
              type="text"
              name="clinicalTrialStatus"
              value={formData.clinicalTrialStatus}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Trial Endpoints
            </label>
            <textarea
              name="trialEndpoints"
              value={formData.trialEndpoints}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Expected Approval Date
            </label>
            <input
              type="text"
              name="expectedApprovalDate"
              value={formData.expectedApprovalDate}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Market Analysis */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Market Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Market Size
              </label>
              <input
                type="text"
                name="marketSize"
                value={formData.marketSize}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Market Share Projection
              </label>
              <input
                type="text"
                name="marketShareProjection"
                value={formData.marketShareProjection}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Pricing Strategy
              </label>
              <input
                type="text"
                name="pricingStrategy"
                value={formData.pricingStrategy}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Target Demographics */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Target Demographics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Target Audience <span className="text-red-500">*</span>
              </label>
              <select
                name="targetAudience"
                value={formData.targetAudience}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
              <label className="block text-sm font-medium text-gray-700">
                Target Markets <span className="text-red-500">*</span>
              </label>
              <select
                name="targetMarkets"
                value={formData.targetMarkets}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Target HCP Specialties
            </label>
            <input
              type="text"
              name="targetHCPSpecialties"
              value={formData.targetHCPSpecialties}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Target Patient Demographics
            </label>
            <textarea
              name="targetPatientDemographics"
              value={formData.targetPatientDemographics}
              onChange={handleChange}
              rows={2}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Content Requirements */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Content Requirements</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Content Type
            </label>
            <select
              name="contentType"
              value={formData.contentType}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
            <label className="block text-sm font-medium text-gray-700">
              Key Messages
            </label>
            <textarea
              name="keyMessages"
              value={formData.keyMessages}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tone & Style
            </label>
            <select
              name="toneStyle"
              value={formData.toneStyle}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select tone</option>
              <option value="Professional/Clinical">Professional/Clinical</option>
              <option value="Educational">Educational</option>
              <option value="Conversational">Conversational</option>
              <option value="Empathetic">Empathetic</option>
              <option value="Authoritative">Authoritative</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Content Timeline
            </label>
            <input
              type="text"
              name="contentTimeline"
              value={formData.contentTimeline}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Regulatory Considerations */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Regulatory Considerations</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Regulatory Considerations
            </label>
            <textarea
              name="regulatoryConsiderations"
              value={formData.regulatoryConsiderations}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              MLR Requirements
            </label>
            <textarea
              name="mlrRequirements"
              value={formData.mlrRequirements}
              onChange={handleChange}
              rows={2}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Additional Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Additional Information</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Reference Materials
            </label>
            <textarea
              name="referenceMaterials"
              value={formData.referenceMaterials}
              onChange={handleChange}
              rows={2}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Competitor Examples
            </label>
            <textarea
              name="competitorExamples"
              value={formData.competitorExamples}
              onChange={handleChange}
              rows={2}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Specific Requirements
            </label>
            <textarea
              name="specificRequirements"
              value={formData.specificRequirements}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Success Metrics
            </label>
            <textarea
              name="successMetrics"
              value={formData.successMetrics}
              onChange={handleChange}
              rows={2}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
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
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </div>
    </form>
  );
};