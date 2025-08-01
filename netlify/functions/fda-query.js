// Netlify Function for FDA Database Queries
// Uses official FDA public APIs

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { productName, genericName, indication } = JSON.parse(event.body);
    
    const fdaResults = {
      clinicalTrials: [],
      adverseEvents: [],
      drugApprovals: [],
      drugLabels: [],
      recalls: [],
      timestamp: new Date().toISOString()
    };

    // 1. FDA Drug Labels (SPL) - Most comprehensive product info
    try {
      const labelResponse = await fetch(
        `https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${productName}"+OR+openfda.generic_name:"${genericName}"&limit=5`
      );
      if (labelResponse.ok) {
        const labelData = await labelResponse.json();
        fdaResults.drugLabels = labelData.results || [];
      }
    } catch (error) {
      console.error('FDA Label API error:', error);
    }

    // 2. FDA Drug Approvals (Drugs@FDA)
    try {
      const approvalResponse = await fetch(
        `https://api.fda.gov/drug/drugsfda.json?search=openfda.brand_name:"${productName}"+OR+openfda.generic_name:"${genericName}"&limit=5`
      );
      if (approvalResponse.ok) {
        const approvalData = await approvalResponse.json();
        fdaResults.drugApprovals = approvalData.results || [];
      }
    } catch (error) {
      console.error('FDA Approval API error:', error);
    }

    // 3. FDA Adverse Events (FAERS)
    try {
      const adverseResponse = await fetch(
        `https://api.fda.gov/drug/event.json?search=patient.drug.medicinalproduct:"${productName}"+OR+patient.drug.medicinalproduct:"${genericName}"&limit=10`
      );
      if (adverseResponse.ok) {
        const adverseData = await adverseResponse.json();
        fdaResults.adverseEvents = adverseData.results || [];
      }
    } catch (error) {
      console.error('FDA Adverse Events API error:', error);
    }

    // 4. FDA Recalls
    try {
      const recallResponse = await fetch(
        `https://api.fda.gov/drug/enforcement.json?search=product_description:"${productName}"+OR+product_description:"${genericName}"&limit=5`
      );
      if (recallResponse.ok) {
        const recallData = await recallResponse.json();
        fdaResults.recalls = recallData.results || [];
      }
    } catch (error) {
      console.error('FDA Recalls API error:', error);
    }

    // 5. ClinicalTrials.gov (NIH)
    try {
      const ctResponse = await fetch(
        `https://clinicaltrials.gov/api/v2/studies?query.cond=${encodeURIComponent(indication)}&query.intr=${encodeURIComponent(productName)}+OR+${encodeURIComponent(genericName)}&pageSize=10&format=json`
      );
      if (ctResponse.ok) {
        const ctData = await ctResponse.json();
        fdaResults.clinicalTrials = ctData.studies || [];
      }
    } catch (error) {
      console.error('ClinicalTrials.gov API error:', error);
    }

    // Extract key regulatory information
    const summary = {
      hasApprovedNDA: fdaResults.drugApprovals.length > 0,
      approvalDate: fdaResults.drugApprovals[0]?.products?.[0]?.marketing_start_date,
      applicationNumber: fdaResults.drugApprovals[0]?.application_number,
      sponsorName: fdaResults.drugApprovals[0]?.sponsor_name,
      activeTrials: fdaResults.clinicalTrials.filter(t => 
        t.protocolSection?.statusModule?.overallStatus === 'RECRUITING'
      ).length,
      totalTrials: fdaResults.clinicalTrials.length,
      adverseEventCount: fdaResults.adverseEvents.length,
      hasRecalls: fdaResults.recalls.length > 0,
      indications: fdaResults.drugLabels[0]?.indications_and_usage || [],
      warnings: fdaResults.drugLabels[0]?.warnings || []
    };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        product: productName,
        generic: genericName,
        indication: indication,
        summary: summary,
        data: fdaResults
      })
    };
  } catch (error) {
    console.error('FDA query error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'FDA query failed',
        message: error.message
      })
    };
  }
};