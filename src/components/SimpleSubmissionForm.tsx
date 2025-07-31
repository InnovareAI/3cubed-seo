import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { THERAPEUTIC_AREAS } from '../constants/therapeuticAreas';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface SimpleSubmissionFormProps {
  onSuccess?: () => void;
  onClose?: () => void;
}

export const SimpleSubmissionForm: React.FC<SimpleSubmissionFormProps> = ({ onSuccess, onClose }) => {
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    product_name: '',
    generic_name: '',
    indication: '',
    therapeutic_area: '',
    submitter_name: '',
    submitter_email: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Create submission in Supabase
      const submissionData = {
        ...formData,
        // Add required fields for database
        seo_reviewer_name: formData.submitter_name,
        seo_reviewer_email: formData.submitter_email,
        priority_level: 'medium',
        workflow_stage: 'form_submitted',
        ai_processing_status: 'pending',
        created_at: new Date().toISOString()
      };

      const { data: insertedData, error: supabaseError } = await supabase
        .from('submissions')
        .insert([submissionData])
        .select();

      if (supabaseError) throw supabaseError;
      
      const submissionId = insertedData[0].id;
      console.log('✅ Created submission:', submissionId);

      // Supabase trigger will automatically call N8N workflow
      console.log('✅ Submission saved to Supabase, trigger will handle N8N processing');

      // Show success
      setShowSuccessMessage(true);
      
      // Reset form
      setFormData({
        product_name: '',
        generic_name: '',
        indication: '',
        therapeutic_area: '',
        submitter_name: '',
        submitter_email: ''
      });

      if (onSuccess) onSuccess();
      
    } catch (err) {
      console.error('Submission error:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit form');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccessMessage) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-green-100 rounded-full p-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Success!</h3>
            <p className="text-gray-600 mb-6">
              Your SEO content request has been submitted and is being processed.
            </p>
            <button
              onClick={() => {
                setShowSuccessMessage(false);
                if (onClose) onClose();
              }}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Quick SEO Content Request</h2>
        <p className="text-gray-600 mt-2">Just 6 fields to get started - takes less than a minute!</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md flex items-start gap-3">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Product Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Information</h3>
        
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
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Keytruda"
            />
          </div>

          <div>
            <label htmlFor="generic_name" className="block text-sm font-medium text-gray-700 mb-1">
              Generic Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="generic_name"
              name="generic_name"
              value={formData.generic_name}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., pembrolizumab"
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
            onChange={handleInputChange}
            required
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., First-line treatment of metastatic non-small cell lung cancer"
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
            onChange={handleInputChange}
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

      {/* Contact Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="submitter_name" className="block text-sm font-medium text-gray-700 mb-1">
              Your Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="submitter_name"
              name="submitter_name"
              value={formData.submitter_name}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="John Doe"
            />
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
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="john.doe@pharma.com"
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Processing...
            </>
          ) : (
            'Submit Request'
          )}
        </button>
      </div>

      <p className="text-xs text-gray-500 text-center">
        AI processing typically completes in 30-60 seconds
      </p>
    </form>
  );
};