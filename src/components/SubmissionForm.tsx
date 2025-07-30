import React, { useState, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { THERAPEUTIC_AREAS } from '../constants/therapeuticAreas';

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
  
  // Section 2: Clinical Context (Optional)
  nct_number: string;
  sponsor: string;
  development_stage: string;
  line_of_therapy: string;
  patient_population: string[];
  
  // Section 3: Advanced Optimization (Optional)
  route_of_administration: string;
  combination_partners: string[];
  primary_endpoints: string[];
  geographic_markets: string[];
  key_biomarkers: string[];
  target_age_groups: string[];
  
  // Section 4: Team & Review Assignment (Required)
  seo_reviewer_name: string;
  seo_reviewer_email: string;
  client_reviewer_name: string;
  client_reviewer_email: string;
  mlr_reviewer_name: string;
  mlr_reviewer_email: string;
}

export const SubmissionForm: React.FC<SubmissionFormProps> = ({ onSuccess, onClose }) => {
  const [formData, setFormData] = useState<FormData>({
    // Section 1
    product_name: '',
    generic_name: '',
    indication: '',
    therapeutic_area: '',
    
    // Section 2
    nct_number: '',
    sponsor: '',
    development_stage: 'Phase III',
    line_of_therapy: '',
    patient_population: [],
    
    // Section 3
    route_of_administration: '',
    combination_partners: [],
    primary_endpoints: [],
    geographic_markets: [],
    key_biomarkers: [],
    target_age_groups: [],
    
    // Section 4
    seo_reviewer_name: '',
    seo_reviewer_email: '',
    client_reviewer_name: '',
    client_reviewer_email: '',
    mlr_reviewer_name: '',
    mlr_reviewer_email: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState({
    section1: true,
    section2: false,
    section3: false,
    section4: true
  });

  // Calculate section completion
  const section1Complete = useMemo(() => {
    const fields = ['product_name', 'generic_name', 'indication', 'therapeutic_area'];
    return fields.every(field => formData[field as keyof FormData]);
  }, [formData]);

  const section4Complete = useMemo(() => {
    const fields = ['seo_reviewer_name', 'seo_reviewer_email'];
    return fields.every(field => formData[field as keyof FormData]);
  }, [formData]);

  // Calculate progress
  const progress = useMemo(() => {
    let score = 0;
    
    // Section 1: Product Information (65%)
    if (section1Complete) score += 65;
    
    // Section 2: Clinical Context (+20%)
    const section2Fields = ['nct_number', 'sponsor', 'development_stage', 'line_of_therapy'];
    const section2Filled = section2Fields.filter(field => formData[field as keyof FormData]).length >= 2;
    const section2ArraysFilled = formData.patient_population.length > 0;
    if (section2Filled || section2ArraysFilled) score += 20;
    
    // Section 3: Advanced Optimization (+10%)
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
  }, [formData, section1Complete]);

  const progressMessage = useMemo(() => {
    if (progress >= 95) return "Maximum optimization - competitive intelligence included";
    if (progress >= 85) return "Comprehensive database coverage achieved";
    if (progress >= 65) return "Ready to generate basic SEO content";
    return "Fill in product information to begin";
  }, [progress]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Validate only the 6 mandatory fields
    const mandatoryFields = {
      'Product Name': formData.product_name,
      'Generic/INN Name': formData.generic_name,
      'Indication': formData.indication,
      'Therapeutic Area': formData.therapeutic_area,
      'Submitter Name': formData.seo_reviewer_name,
      'Submitter Email': formData.seo_reviewer_email
    };

    const missingFields = Object.entries(mandatoryFields)
      .filter(([_, value]) => !value)
      .map(([key, _]) => key);

    if (missingFields.length > 0) {
      setError(`Please complete these required fields: ${missingFields.join(', ')}`);
      setIsSubmitting(false);
      return;
    }

    try {
      // Build submission data - only include fields that have values
      const submissionData: any = {
        // Mandatory fields (always included)
        product_name: formData.product_name,
        generic_name: formData.generic_name,
        indication: formData.indication,
        therapeutic_area: formData.therapeutic_area,
        submitter_name: formData.seo_reviewer_name,
        submitter_email: formData.seo_reviewer_email,
        
        // Required database fields with defaults
        target_audience: ['Healthcare Professionals'],
        stage: formData.development_stage || 'Not Specified',
        priority_level: 'Medium',
        langchain_status: 'needs_processing',
        workflow_stage: 'draft',
        langchain_retry_count: 0,
        compliance_id: `COMP-${Date.now()}`,
        raw_input_content: JSON.stringify(formData)
      };

      // Optional fields - only include if they have values
      const optionalFields = {
        nct_number: formData.nct_number,
        sponsor: formData.sponsor,
        development_stage: formData.development_stage,
        line_of_therapy: formData.line_of_therapy,
        route_of_administration: formData.route_of_administration,
        seo_reviewer_name: formData.seo_reviewer_name,
        seo_reviewer_email: formData.seo_reviewer_email,
        client_reviewer_name: formData.client_reviewer_name,
        client_reviewer_email: formData.client_reviewer_email,
        mlr_reviewer_name: formData.mlr_reviewer_name,
        mlr_reviewer_email: formData.mlr_reviewer_email
      };

      // Optional arrays - only include if they have items
      const optionalArrays = {
        patient_population: formData.patient_population,
        combination_partners: formData.combination_partners,
        primary_endpoints: formData.primary_endpoints,
        geographic_markets: formData.geographic_markets,
        key_biomarkers: formData.key_biomarkers,
        target_age_groups: formData.target_age_groups
      };

      // Add optional fields that have values
      Object.entries(optionalFields).forEach(([key, value]) => {
        if (value && value.trim()) {
          submissionData[key] = value;
        }
      });

      // Add optional arrays that have items
      Object.entries(optionalArrays).forEach(([key, value]) => {
        if (value && value.length > 0) {
          submissionData[key] = value;
        }
      });

      const { error: supabaseError } = await supabase
        .from('submissions')
        .insert([submissionData]);

      if (supabaseError) throw supabaseError;

      // Reset form
      setFormData({
        product_name: '',
        generic_name: '',
        indication: '',
        therapeutic_area: '',
        nct_number: '',
        sponsor: '',
        development_stage: 'Phase III',
        line_of_therapy: '',
        patient_population: [],
        route_of_administration: '',
        combination_partners: [],
        primary_endpoints: [],
        geographic_markets: [],
        key_biomarkers: [],
        target_age_groups: [],
        seo_reviewer_name: '',
        seo_reviewer_email: '',
        client_reviewer_name: '',
        client_reviewer_email: '',
        mlr_reviewer_name: '',
        mlr_reviewer_email: ''
      });
      
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err) {
      console.error('Error submitting form:', err);
      setError(`Failed to submit form: ${err instanceof Error ? err.message : 'Unknown error'}. Please try again.`);
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
            {section1Complete && (
              <span className="ml-3 text-sm font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">65% Accuracy</span>
            )}
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

      {/* Section 2: Clinical Context */}
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
                  <option value="Phase III">Phase III</option>
                  <option value="Market Shaping">Market Shaping</option>
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

            {/* Patient Population Checkboxes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Patient Population (Select all that apply)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {[
                  'Adults (18+)',
                  'Pediatric (0-17)',
                  'Elderly (65+)',
                  'Treatment-naive',
                  'Treatment-experienced',
                  'Relapsed/Refractory'
                ].map(option => (
                  <div key={option} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`patient_pop_${option}`}
                      name="patient_population"
                      value={option}
                      checked={formData.patient_population.includes(option)}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <label htmlFor={`patient_pop_${option}`} className="text-sm">{option}</label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Section 3: Advanced Optimization */}
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
                <option value="Intravenous">Intravenous</option>
                <option value="Subcutaneous">Subcutaneous</option>
                <option value="Intramuscular">Intramuscular</option>
                <option value="Topical">Topical</option>
                <option value="Inhalation">Inhalation</option>
              </select>
            </div>

            {/* Combination Partners */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Combination Partners (Select all that apply)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {[
                  'Chemotherapy',
                  'Radiation',
                  'Immunotherapy',
                  'Targeted therapy',
                  'Hormone therapy',
                  'Monotherapy'
                ].map(option => (
                  <div key={option} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`combo_${option}`}
                      name="combination_partners"
                      value={option}
                      checked={formData.combination_partners.includes(option)}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <label htmlFor={`combo_${option}`} className="text-sm">{option}</label>
                  </div>
                ))}
              </div>
            </div>

            {/* Primary Endpoints */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Endpoints (Select all that apply)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {[
                  'Overall Survival',
                  'Progression-free Survival',
                  'Objective Response Rate',
                  'Complete Response',
                  'Disease-free Survival',
                  'Quality of Life'
                ].map(option => (
                  <div key={option} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`endpoint_${option}`}
                      name="primary_endpoints"
                      value={option}
                      checked={formData.primary_endpoints.includes(option)}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <label htmlFor={`endpoint_${option}`} className="text-sm">{option}</label>
                  </div>
                ))}
              </div>
            </div>

            {/* Geographic Markets */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Geographic Markets (Select all that apply)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {[
                  'United States',
                  'European Union',
                  'Japan',
                  'Canada',
                  'Australia',
                  'Global'
                ].map(option => (
                  <div key={option} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`geo_${option}`}
                      name="geographic_markets"
                      value={option}
                      checked={formData.geographic_markets.includes(option)}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <label htmlFor={`geo_${option}`} className="text-sm">{option}</label>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Biomarkers */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Key Biomarkers (Select all that apply)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {[
                  'PD-L1',
                  'MSI-H',
                  'HER2',
                  'EGFR',
                  'KRAS',
                  'BRAF'
                ].map(option => (
                  <div key={option} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`biomarker_${option}`}
                      name="key_biomarkers"
                      value={option}
                      checked={formData.key_biomarkers.includes(option)}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <label htmlFor={`biomarker_${option}`} className="text-sm">{option}</label>
                  </div>
                ))}
              </div>
            </div>

            {/* Target Age Groups */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Age Groups (Select all that apply)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {[
                  '18-29 years',
                  '30-49 years',
                  '50-64 years',
                  '65-74 years',
                  '75+ years',
                  'All adults'
                ].map(option => (
                  <div key={option} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`age_${option}`}
                      name="target_age_groups"
                      value={option}
                      checked={formData.target_age_groups.includes(option)}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <label htmlFor={`age_${option}`} className="text-sm">{option}</label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Section 4: Team & Review Assignment */}
      <div className="bg-white rounded-lg border-2 border-blue-500 overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('section4')}
          className="w-full px-6 py-4 bg-blue-50 hover:bg-blue-100 transition-colors flex items-center justify-between"
        >
          <div className="flex items-center">
            <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm font-bold">4</span>
            <h3 className="text-lg font-semibold text-gray-900">Team & Review Assignment (Required)</h3>
            {section4Complete && (
              <span className="ml-3 text-sm font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">Required</span>
            )}
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
        )}
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