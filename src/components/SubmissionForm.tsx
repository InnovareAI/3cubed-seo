import React, { useState, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { THERAPEUTIC_AREAS } from '../constants/therapeuticAreas';

// Version 4.1 - Reordered sections with updated geographic markets
// Last updated: 2025-07-25

interface SubmissionFormProps {
  onSuccess?: () => void;
  onClose?: () => void;
}

interface FormData {
  // Section 1: Product Information (Required)
  product_name: string;
  generic_name: string;
  indication: string;
  therapeutic_area: string;
  
  // Section 2: Clinical Context (Optional) - MOVED FROM SECTION 3
  nct_number: string;
  sponsor: string;
  development_stage: string;
  line_of_therapy: string;
  patient_population: string[];
  
  // Section 3: Advanced Optimization (Optional) - MOVED FROM SECTION 4
  route_of_administration: string;
  combination_partners: string[];
  primary_endpoints: string[];
  geographic_markets: string[];
  key_biomarkers: string[];
  target_age_groups: string[];
  
  // Section 4: Team & Review Assignment (Required) - MOVED FROM SECTION 2
  seo_reviewer_name: string;
  seo_reviewer_email: string;
  client_reviewer_name: string;
  client_reviewer_email: string;
  mlr_reviewer_name: string;
  mlr_reviewer_email: string;
  
  // Legacy fields (hidden but still submitted)
  submitter_email: string;
  submitter_name: string;
}

export const SubmissionForm: React.FC<SubmissionFormProps> = ({ onSuccess, onClose }) => {
  const [formData, setFormData] = useState<FormData>({
    // Section 1
    product_name: '',
    generic_name: '',
    indication: '',
    therapeutic_area: '',
    
    // Section 2 (formerly Section 3)
    nct_number: '',
    sponsor: '',
    development_stage: '',
    line_of_therapy: '',
    patient_population: [],
    
    // Section 3 (formerly Section 4)
    route_of_administration: '',
    combination_partners: [],
    primary_endpoints: [],
    geographic_markets: [],
    key_biomarkers: [],
    target_age_groups: [],
    
    // Section 4 (formerly Section 2)
    seo_reviewer_name: '',
    seo_reviewer_email: '',
    client_reviewer_name: '',
    client_reviewer_email: '',
    mlr_reviewer_name: '',
    mlr_reviewer_email: '',
    
    // Legacy
    submitter_email: '',
    submitter_name: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState({
    section1: true,
    section2: false,
    section3: false,
    section4: true
  });

  // Calculate progress based on filled fields
  const progress = useMemo(() => {
    let score = 0;
    
    // Section 1: Product Information (65%)
    const section1Fields = ['product_name', 'generic_name', 'indication', 'therapeutic_area'];
    const section1Filled = section1Fields.every(field => formData[field as keyof FormData]);
    if (section1Filled) score += 65;
    
    // Section 2: Clinical Context (+20%) - formerly Section 3
    const section2Fields = ['nct_number', 'sponsor', 'development_stage', 'line_of_therapy'];
    const section2Filled = section2Fields.filter(field => formData[field as keyof FormData]).length >= 2;
    const section2ArraysFilled = formData.patient_population.length > 0;
    if (section2Filled || section2ArraysFilled) score += 20;
    
    // Section 3: Advanced Optimization (+10%) - formerly Section 4
    const section3Fields = ['route_of_administration'];
    const section3Filled = section3Fields.some(field => formData[field as keyof FormData]);
    const section3ArraysFilled = [
      formData.combination_partners,
      formData.primary_endpoints,
      formData.geographic_markets,
      formData.key_biomarkers,
      formData.target_age_groups
    ].some(arr => arr.length > 0);
    if (section3Filled || section3ArraysFilled) score += 10;
    
    return Math.min(score, 95);
  }, [formData]);

  const progressMessage = useMemo(() => {
    if (progress >= 95) return "Maximum optimization - competitive intelligence included";
    if (progress >= 85) return "Comprehensive database coverage achieved";
    if (progress >= 65) return "Ready to generate basic SEO content";
    return "Fill in product information to begin";
  }, [progress]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      const fieldName = name as keyof FormData;
      
      if (['patient_population', 'combination_partners', 'primary_endpoints', 'geographic_markets', 'key_biomarkers', 'target_age_groups'].includes(fieldName)) {
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

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Copy reviewer email to submitter_email for backward compatibility
      const submissionData = {
        ...formData,
        submitter_email: formData.seo_reviewer_email,
        submitter_name: formData.seo_reviewer_name,
        
        // Store all form data as JSON for reference
        raw_input_content: JSON.stringify(formData),
        
        // Default values for new submissions
        priority_level: 'medium',
        ai_processing_status: 'pending',
        workflow_stage: 'draft',
        compliance_id: `COMP-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_updated: new Date().toISOString(),
        
        // Map array fields that already exist in DB
        geography: formData.geographic_markets,
        target_audience: ['Specialist Physicians'] // Default for now
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
        generic_name: '',
        indication: '',
        therapeutic_area: '',
        seo_reviewer_name: '',
        seo_reviewer_email: '',
        client_reviewer_name: '',
        client_reviewer_email: '',
        mlr_reviewer_name: '',
        mlr_reviewer_email: '',
        nct_number: '',
        sponsor: '',
        development_stage: '',
        line_of_therapy: '',
        patient_population: [],
        route_of_administration: '',
        combination_partners: [],
        primary_endpoints: [],
        geographic_markets: [],
        key_biomarkers: [],
        target_age_groups: [],
        submitter_email: '',
        submitter_name: ''
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Progress Bar */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-700">Data Accuracy</h3>
          <span className="text-sm font-bold text-blue-600">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-gray-600">{progressMessage}</p>
      </div>

      {/* Section 1: Product Information */}
      <div className="bg-white rounded-lg border-2 border-blue-500 overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('section1')}
          className="w-full px-6 py-4 bg-blue-50 hover:bg-blue-100 transition-colors flex items-center justify-between"
        >
          <div className="flex items-center">
            <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm font-bold">1</span>
            <h3 className="text-lg font-semibold text-gray-900">Product Information (Required)</h3>
          </div>
          <svg className={`w-5 h-5 text-gray-600 transition-transform ${expandedSections.section1 ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {expandedSections.section1 && (
          <div className="p-6 space-y-4">
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
                  placeholder="e.g., Keytruda, Carvykti"
                />
              </div>

              <div>
                <label htmlFor="generic_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Generic/INN Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="generic_name"
                  name="generic_name"
                  value={formData.generic_name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., pembrolizumab"
                />
                <p className="text-xs text-gray-500 mt-1">International nonproprietary name</p>
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
                  placeholder="e.g., Non-small cell lung cancer"
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
                  <option value="">Select Therapeutic Area</option>
                  {THERAPEUTIC_AREAS.map(area => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Section 2: Clinical Context (formerly Section 3) */}
      <div className="bg-white rounded-lg border border-gray-300 overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('section2')}
          className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
        >
          <div className="flex items-center">
            <span className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm font-bold">2</span>
            <h3 className="text-lg font-semibold text-gray-900">Clinical Context (Optional - +20% Accuracy)</h3>
          </div>
          <svg className={`w-5 h-5 text-gray-600 transition-transform ${expandedSections.section2 ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {expandedSections.section2 && (
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="nct_number" className="block text-sm font-medium text-gray-700 mb-1">
                  NCT Number
                </label>
                <input
                  type="text"
                  id="nct_number"
                  name="nct_number"
                  value={formData.nct_number}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., NCT03425643"
                />
              </div>

              <div>
                <label htmlFor="sponsor" className="block text-sm font-medium text-gray-700 mb-1">
                  Sponsor
                </label>
                <input
                  type="text"
                  id="sponsor"
                  name="sponsor"
                  value={formData.sponsor}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Merck, Pfizer"
                />
              </div>

              <div>
                <label htmlFor="development_stage" className="block text-sm font-medium text-gray-700 mb-1">
                  Development Stage
                </label>
                <select
                  id="development_stage"
                  name="development_stage"
                  value={formData.development_stage}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Stage</option>
                  <option value="Phase I">Phase I</option>
                  <option value="Phase II">Phase II</option>
                  <option value="Phase III">Phase III</option>
                  <option value="FDA Approved">FDA Approved</option>
                  <option value="EMA Approved">EMA Approved</option>
                  <option value="Market Launch">Market Launch</option>
                </select>
              </div>

              <div>
                <label htmlFor="line_of_therapy" className="block text-sm font-medium text-gray-700 mb-1">
                  Line of Therapy
                </label>
                <select
                  id="line_of_therapy"
                  name="line_of_therapy"
                  value={formData.line_of_therapy}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Line</option>
                  <option value="First-line">First-line</option>
                  <option value="Second-line">Second-line</option>
                  <option value="Third-line">Third-line</option>
                  <option value="Fourth-line+">Fourth-line+</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Adjuvant">Adjuvant</option>
                  <option value="Neoadjuvant">Neoadjuvant</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Patient Population
              </label>
              <div className="space-y-2">
                {[
                  'Pediatric',
                  'Adult',
                  'Elderly (65+)',
                  'Treatment-naïve',
                  'Previously treated',
                  'Refractory',
                  'High-risk',
                  'Low-risk'
                ].map(pop => (
                  <label key={pop} className="flex items-center">
                    <input
                      type="checkbox"
                      name="patient_population"
                      value={pop}
                      checked={formData.patient_population.includes(pop)}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <span className="text-sm">{pop}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Section 3: Advanced Optimization (formerly Section 4) */}
      <div className="bg-white rounded-lg border border-gray-300 overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('section3')}
          className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
        >
          <div className="flex items-center">
            <span className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm font-bold">3</span>
            <h3 className="text-lg font-semibold text-gray-900">Advanced Optimization (Optional - +10% Accuracy)</h3>
          </div>
          <svg className={`w-5 h-5 text-gray-600 transition-transform ${expandedSections.section3 ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {expandedSections.section3 && (
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="route_of_administration" className="block text-sm font-medium text-gray-700 mb-1">
                Route of Administration
              </label>
              <select
                id="route_of_administration"
                name="route_of_administration"
                value={formData.route_of_administration}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Route</option>
                <option value="Oral">Oral</option>
                <option value="IV Infusion">IV Infusion</option>
                <option value="Subcutaneous">Subcutaneous</option>
                <option value="Intramuscular">Intramuscular</option>
                <option value="Topical">Topical</option>
                <option value="Inhaled">Inhaled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Combination Partners
              </label>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Add combination drug names, separated by commas"
                  onBlur={(e) => {
                    const values = e.target.value.split(',').map(v => v.trim()).filter(v => v);
                    setFormData(prev => ({ ...prev, combination_partners: values }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Endpoints
              </label>
              <textarea
                placeholder="List primary endpoints (one per line)"
                onChange={(e) => {
                  const values = e.target.value.split('\n').map(v => v.trim()).filter(v => v);
                  setFormData(prev => ({ ...prev, primary_endpoints: values }));
                }}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Geographic Markets
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {[
                  'USA',
                  'Canada',
                  'EU',
                  'UK',
                  'Global'
                ].map(market => (
                  <label key={market} className="flex items-center">
                    <input
                      type="checkbox"
                      name="geographic_markets"
                      value={market}
                      checked={formData.geographic_markets.includes(market)}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <span className="text-sm">{market}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Section 4: Team & Review Assignment (formerly Section 2) */}
      <div className="bg-white rounded-lg border-2 border-blue-500 overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('section4')}
          className="w-full px-6 py-4 bg-blue-50 hover:bg-blue-100 transition-colors flex items-center justify-between"
        >
          <div className="flex items-center">
            <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm font-bold">4</span>
            <h3 className="text-lg font-semibold text-gray-900">Team & Review Assignment (Required)</h3>
          </div>
          <svg className={`w-5 h-5 text-gray-600 transition-transform ${expandedSections.section4 ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {expandedSections.section4 && (
          <div className="p-6 space-y-4">
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
                  placeholder="Full name"
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
                  placeholder="email@company.com"
                />
              </div>

              <div>
                <label htmlFor="client_reviewer_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Client Contact Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="client_reviewer_name"
                  name="client_reviewer_name"
                  value={formData.client_reviewer_name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Full name"
                />
              </div>

              <div>
                <label htmlFor="client_reviewer_email" className="block text-sm font-medium text-gray-700 mb-1">
                  Client Contact Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="client_reviewer_email"
                  name="client_reviewer_email"
                  value={formData.client_reviewer_email}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="email@company.com"
                />
              </div>

              <div>
                <label htmlFor="mlr_reviewer_name" className="block text-sm font-medium text-gray-700 mb-1">
                  MLR Reviewer Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="mlr_reviewer_name"
                  name="mlr_reviewer_name"
                  value={formData.mlr_reviewer_name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Full name"
                />
              </div>

              <div>
                <label htmlFor="mlr_reviewer_email" className="block text-sm font-medium text-gray-700 mb-1">
                  MLR Reviewer Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="mlr_reviewer_email"
                  name="mlr_reviewer_email"
                  value={formData.mlr_reviewer_email}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="email@company.com"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end space-x-3 pt-4">
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
          disabled={isSubmitting || progress < 65}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting...' : 'Submit SEO Request'}
        </button>
      </div>
    </form>
  );
};