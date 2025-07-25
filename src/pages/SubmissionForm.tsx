import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { THERAPEUTIC_AREAS } from '../constants/therapeuticAreas';
import { Send, AlertCircle, Info, ChevronDown, ChevronUp, Sparkles, Database, Users } from 'lucide-react';

export default function SubmissionForm() {
  const [formData, setFormData] = useState({
    // Core Clinical Fields (4 Required)
    product_name: '',
    generic_name: '',
    medical_indication: '',
    therapeutic_area: '',
    
    // Submitter Info (Required)
    submitter_email: '',
    submitter_name: '',
    client_name: '',
    
    // Review Assignment (SEO Required, others optional)
    seo_reviewer_name: '',
    seo_reviewer_email: '',
    client_reviewer_name: '',
    client_reviewer_email: '',
    mlr_reviewer_name: '',
    mlr_reviewer_email: '',
    
    // High-Impact Fields (Recommended)
    sponsor_manufacturer: '',
    stage: '',
    nct_number: '',
    route_of_administration: '',
    
    // Advanced Fields (Optional)
    patient_population: '',
    line_of_therapy: '',
    combination_partners: '',
    priority_markets: [],
    primary_endpoints: '',
    mechanism_of_action: '',
    key_differentiators: [] as string[],
    priority_level: 'Medium',
    geography: 'United States'
  });

  const [showRecommended, setShowRecommended] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showReviewers, setShowReviewers] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const developmentStages = [
    'Phase III', 'Market Shaping', 'Market Launch'
  ];

  const routesOfAdmin = [
    'Oral', 'Intravenous (IV)', 'Subcutaneous (SC)', 'Intramuscular (IM)', 
    'Topical', 'Inhalation', 'Transdermal', 'Intrathecal', 'Ophthalmic'
  ];

  const linesOfTherapy = [
    'First-line', 'Second-line', 'Third-line or later', 
    'Maintenance', 'Adjuvant', 'Neoadjuvant', 'Salvage'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      // Prepare submission data with proper array handling
      const submissionData = {
        ...formData,
        workflow_stage: 'form_submitted',
        langchain_status: 'needs_processing',
        ai_processing_status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        // Ensure arrays are properly formatted
        target_audience: ['Healthcare Professionals'],
        key_differentiators: formData.key_differentiators.filter(d => d.trim()),
        priority_markets: formData.priority_markets.length > 0 ? formData.priority_markets : ['United States'],
        // Map SEO reviewer to the expected field
        seo_reviewer: formData.seo_reviewer_name,
        // Set default stage if not selected
        stage: formData.stage || 'Phase III'
      };

      // Create submission in database
      const { data, error } = await supabase
        .from('submissions')
        .insert(submissionData)
        .select()
        .single();

      if (error) throw error;

      // Trigger n8n webhook
      const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL || 'https://innovareai.app.n8n.cloud/webhook/BNKl1IJoWxTCKUak';
      
      try {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            submission_id: data.id
          })
        });

        if (!response.ok) {
          console.error('Webhook failed:', response.statusText);
        }
      } catch (webhookError) {
        console.error('Webhook error:', webhookError);
        // Don't fail the submission if webhook fails
      }

      setMessage({ 
        type: 'success', 
        text: 'Submission created successfully! SEO content generation has started.' 
      });
      
      // Reset form
      setFormData({
        product_name: '',
        generic_name: '',
        medical_indication: '',
        therapeutic_area: '',
        submitter_email: '',
        submitter_name: '',
        client_name: '',
        seo_reviewer_name: '',
        seo_reviewer_email: '',
        client_reviewer_name: '',
        client_reviewer_email: '',
        mlr_reviewer_name: '',
        mlr_reviewer_email: '',
        sponsor_manufacturer: '',
        stage: '',
        nct_number: '',
        route_of_administration: '',
        patient_population: '',
        line_of_therapy: '',
        combination_partners: '',
        priority_markets: [],
        primary_endpoints: '',
        mechanism_of_action: '',
        key_differentiators: [],
        priority_level: 'Medium',
        geography: 'United States'
      });
      setShowRecommended(false);
      setShowAdvanced(false);
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to submit. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate clinical data coverage
  const calculateCoverage = () => {
    let coverage = 30; // Base coverage with 4 required fields
    
    if (formData.generic_name) {
      coverage = 65; // Jump to 65% with generic name
    }
    
    if (showRecommended && formData.sponsor_manufacturer) {
      coverage = 75;
    }
    
    if (showRecommended && formData.stage) {
      coverage = 80;
    }
    
    if (showRecommended && (formData.nct_number || formData.route_of_administration)) {
      coverage = 85;
    }
    
    return coverage;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          3Cubed SEO Content Generation
        </h1>
        <p className="text-lg text-gray-600">
          Powered by FDA, EMA & Clinical Trial Databases
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 text-blue-800">
          <Database className="h-5 w-5" />
          <span className="font-medium">Clinical Data Coverage:</span>
          <span className="ml-auto font-bold text-lg">{calculateCoverage()}%</span>
        </div>
        <div className="mt-2 bg-white rounded-full h-3 overflow-hidden">
          <div 
            className="bg-blue-600 h-full transition-all duration-500 ease-out"
            style={{ width: `${calculateCoverage()}%` }}
          />
        </div>
        <p className="text-xs text-blue-700 mt-2">
          Add more fields to unlock additional clinical trial data
        </p>
      </div>

      {message.text && (
        <div className={`p-4 rounded-lg flex items-start gap-3 ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          <AlertCircle className="h-5 w-5 mt-0.5" />
          <p className="text-sm">{message.text}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* CORE CLINICAL FIELDS - Just 4 Required */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Clinical Information</h2>
              <p className="text-sm text-gray-600 mt-1">Only 4 fields required for 65% data coverage</p>
            </div>
            <span className="text-sm text-red-600">* Required</span>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={formData.product_name}
                onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Keytruda"
              />
            </div>

            {/* Generic Name - CRITICAL FIELD */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Generic/INN Name *
                <span className="ml-1 inline-flex items-center">
                  <div className="group relative">
                    <Info className="h-4 w-4 text-blue-500 cursor-help" />
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block w-64 p-2 bg-gray-900 text-white text-xs rounded-lg z-10">
                      Critical for FDA/EMA database access. Without this, we miss 50% of clinical trials.
                    </div>
                  </div>
                </span>
              </label>
              <input
                type="text"
                required
                value={formData.generic_name}
                onChange={(e) => setFormData({ ...formData, generic_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., pembrolizumab"
              />
            </div>

            {/* Medical Indication */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Medical Indication *
              </label>
              <textarea
                required
                rows={2}
                value={formData.medical_indication}
                onChange={(e) => setFormData({ ...formData, medical_indication: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Non-small cell lung cancer (NSCLC)"
              />
            </div>

            {/* Therapeutic Area */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Therapeutic Area *
              </label>
              <select
                required
                value={formData.therapeutic_area}
                onChange={(e) => setFormData({ ...formData, therapeutic_area: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select area</option>
                {THERAPEUTIC_AREAS.map(area => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* SUBMITTER & CLIENT INFO */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Name *
              </label>
              <input
                type="text"
                required
                value={formData.submitter_name}
                onChange={(e) => setFormData({ ...formData, submitter_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Email *
              </label>
              <input
                type="email"
                required
                value={formData.submitter_email}
                onChange={(e) => setFormData({ ...formData, submitter_email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="your.email@company.com"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client/Company Name *
              </label>
              <input
                type="text"
                required
                value={formData.client_name}
                onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Pfizer, Merck, Johnson & Johnson"
              />
            </div>
          </div>
        </div>

        {/* HIGH-IMPACT FIELDS (Collapsible) */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <button
            type="button"
            onClick={() => setShowRecommended(!showRecommended)}
            className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              <div className="text-left">
                <h3 className="text-lg font-semibold text-gray-900">
                  High-Impact Fields
                </h3>
                <p className="text-sm text-gray-600">
                  Add these for 85% clinical data coverage (+20% boost)
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-green-600">+20% coverage</span>
              {showRecommended ? <ChevronUp /> : <ChevronDown />}
            </div>
          </button>

          {showRecommended && (
            <div className="px-6 pb-6 pt-0 border-t border-gray-100">
              <div className="grid md:grid-cols-2 gap-6 mt-6">
                {/* Sponsor/Manufacturer */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sponsor/Manufacturer
                    <Info className="inline h-3 w-3 ml-1 text-gray-400" />
                  </label>
                  <input
                    type="text"
                    value={formData.sponsor_manufacturer}
                    onChange={(e) => setFormData({ ...formData, sponsor_manufacturer: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Merck, Pfizer"
                  />
                </div>

                {/* Development Stage */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Development Stage
                  </label>
                  <select
                    value={formData.stage}
                    onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select stage</option>
                    {developmentStages.map(stage => (
                      <option key={stage} value={stage}>{stage}</option>
                    ))}
                  </select>
                </div>

                {/* NCT Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    NCT Number (if known)
                  </label>
                  <input
                    type="text"
                    value={formData.nct_number}
                    onChange={(e) => setFormData({ ...formData, nct_number: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., NCT03834506"
                  />
                </div>

                {/* Route of Administration */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Route of Administration
                  </label>
                  <select
                    value={formData.route_of_administration}
                    onChange={(e) => setFormData({ ...formData, route_of_administration: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select route</option>
                    {routesOfAdmin.map(route => (
                      <option key={route} value={route}>{route}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ADVANCED FIELDS (Collapsible) */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="text-left">
                <h3 className="text-lg font-semibold text-gray-900">
                  Advanced Fields
                </h3>
                <p className="text-sm text-gray-600">
                  For comprehensive competitive intelligence
                </p>
              </div>
            </div>
            {showAdvanced ? <ChevronUp /> : <ChevronDown />}
          </button>

          {showAdvanced && (
            <div className="px-6 pb-6 pt-0 border-t border-gray-100">
              <div className="grid md:grid-cols-2 gap-6 mt-6">
                {/* Patient Population */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Patient Population
                  </label>
                  <input
                    type="text"
                    value={formData.patient_population}
                    onChange={(e) => setFormData({ ...formData, patient_population: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., EGFR-positive adults"
                  />
                </div>

                {/* Line of Therapy */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Line of Therapy
                  </label>
                  <select
                    value={formData.line_of_therapy}
                    onChange={(e) => setFormData({ ...formData, line_of_therapy: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select line</option>
                    {linesOfTherapy.map(line => (
                      <option key={line} value={line}>{line}</option>
                    ))}
                  </select>
                </div>

                {/* Mechanism of Action */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mechanism of Action
                  </label>
                  <textarea
                    rows={2}
                    value={formData.mechanism_of_action}
                    onChange={(e) => setFormData({ ...formData, mechanism_of_action: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="How does the drug work?"
                  />
                </div>

                {/* Key Differentiators */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Key Differentiators
                  </label>
                  <textarea
                    rows={2}
                    value={formData.key_differentiators.join('\n')}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      key_differentiators: e.target.value.split('\n').filter(d => d.trim()) 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter key differentiators (one per line)"
                  />
                </div>

                {/* Combination Partners */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Combination Partners
                  </label>
                  <input
                    type="text"
                    value={formData.combination_partners}
                    onChange={(e) => setFormData({ ...formData, combination_partners: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., carboplatin + pemetrexed"
                  />
                </div>

                {/* Primary Endpoints */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Primary Endpoints
                  </label>
                  <input
                    type="text"
                    value={formData.primary_endpoints}
                    onChange={(e) => setFormData({ ...formData, primary_endpoints: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., PFS, OS, ORR"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* REVIEW ASSIGNMENT - Collapsible */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <button
            type="button"
            onClick={() => setShowReviewers(!showReviewers)}
            className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Users className="h-5 w-5 text-gray-700" />
              <div className="text-left">
                <h3 className="text-lg font-semibold text-gray-900">
                  Review Assignment
                </h3>
                <p className="text-sm text-gray-600">
                  SEO reviewer required, others optional
                </p>
              </div>
            </div>
            {showReviewers ? <ChevronUp /> : <ChevronDown />}
          </button>
          
          {showReviewers && (
            <div className="px-6 pb-6 pt-0 border-t border-gray-100 space-y-6">
              {/* SEO Reviewer - REQUIRED */}
              <div className="border-b pb-4 mt-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  SEO Reviewer <span className="text-red-600">* Required</span>
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SEO Reviewer Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.seo_reviewer_name}
                      onChange={(e) => setFormData({ ...formData, seo_reviewer_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="SEO team member name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SEO Reviewer Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.seo_reviewer_email}
                      onChange={(e) => setFormData({ ...formData, seo_reviewer_email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="seo@3cubed.com"
                    />
                  </div>
                </div>
              </div>

              {/* Client Reviewer - OPTIONAL */}
              <div className="border-b pb-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Client Reviewer <span className="text-gray-500">(Optional)</span>
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Client Reviewer Name
                    </label>
                    <input
                      type="text"
                      value={formData.client_reviewer_name}
                      onChange={(e) => setFormData({ ...formData, client_reviewer_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Client team member name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Client Reviewer Email
                    </label>
                    <input
                      type="email"
                      value={formData.client_reviewer_email}
                      onChange={(e) => setFormData({ ...formData, client_reviewer_email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="reviewer@client.com"
                    />
                  </div>
                </div>
              </div>

              {/* MLR Reviewer - OPTIONAL */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  MLR Reviewer <span className="text-gray-500">(Optional)</span>
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      MLR Reviewer Name
                    </label>
                    <input
                      type="text"
                      value={formData.mlr_reviewer_name}
                      onChange={(e) => setFormData({ ...formData, mlr_reviewer_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="MLR team member name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      MLR Reviewer Email
                    </label>
                    <input
                      type="email"
                      value={formData.mlr_reviewer_email}
                      onChange={(e) => setFormData({ ...formData, mlr_reviewer_email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="mlr@company.com"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {!isSubmitting && <Send className="h-5 w-5 mr-2" />}
            {isSubmitting ? 'Generating SEO Content...' : 'Generate SEO Content'}
          </button>
        </div>
      </form>

      {/* Helper Text */}
      <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
        <div className="flex items-start space-x-3">
          <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-gray-700">
            <p className="font-semibold mb-1">Why Generic Name Matters</p>
            <p>
              The Generic/INN Name unlocks access to FDA Orange Book, EMA databases, and FAERS safety data. 
              Without it, we miss 50% of available clinical trials. This single field increases data coverage from 30% to 65%.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}