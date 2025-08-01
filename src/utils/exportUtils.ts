import { parse } from 'papaparse';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ExportData {
  submission: any;
  approvals?: any;
  timestamp: string;
}

// CSV Export Function
export const exportToCSV = (data: ExportData) => {
  const { submission, approvals, timestamp } = data;
  
  // Flatten the data structure for CSV
  const csvData = {
    // Basic Information
    'Export Date': new Date(timestamp).toLocaleDateString(),
    'Export Time': new Date(timestamp).toLocaleTimeString(),
    'Product Name': submission.product_name || '',
    'Generic Name': submission.generic_name || '',
    'Development Stage': submission.development_stage || '',
    'Therapeutic Area': submission.therapeutic_area || '',
    'Medical Indication': submission.medical_indication || '',
    
    // SEO Strategy
    'SEO Strategy': submission.seo_strategy_outline || '',
    
    // Keywords
    'SEO Keywords': submission.seo_keywords?.join('; ') || '',
    'Long-tail Keywords': submission.long_tail_keywords?.join('; ') || '',
    
    // Content Elements
    'H1 Tag': submission.h1_tag || '',
    'H2 Tags': submission.h2_tags?.join('; ') || '',
    'Meta Title': submission.meta_title || '',
    'Meta Description': submission.meta_description || '',
    'SEO Title': submission.seo_title || '',
    
    // GEO Elements
    'GEO Event Tags': submission.geo_event_tags?.join('; ') || '',
    'GEO Optimization Score': submission.geo_optimization_score || '',
    'AI Summary': submission.geo_optimization?.ai_summary || '',
    
    // Consumer Questions
    'Consumer Questions': submission.consumer_questions?.join('; ') || '',
    
    // Submission Details
    'Submitter Name': submission.submitter_name || '',
    'Submitter Email': submission.submitter_email || '',
    'Submission Date': new Date(submission.created_at).toLocaleDateString(),
    'Priority Level': submission.priority_level || '',
    
    // Approval Status (if available)
    'SEO Title Approved': approvals?.seoTitle ? 'Yes' : 'No',
    'Meta Description Approved': approvals?.metaDescription ? 'Yes' : 'No',
    'Keywords Approved': approvals?.keywords ? 'Yes' : 'No',
    'H1 Tag Approved': approvals?.h1Tag ? 'Yes' : 'No',
    'H2 Tags Approved': approvals?.h2Tags ? 'Yes' : 'No',
    'GEO Tags Approved': approvals?.geoTags ? 'Yes' : 'No',
  };
  
  // Convert to CSV format
  const csv = parse.unparse([csvData], {
    header: true,
  });
  
  // Download the CSV
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `SEO_Review_${submission.product_name}_${timestamp}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// PDF Export Function
export const exportToPDF = async (data: ExportData, elementId: string) => {
  const { submission, timestamp } = data;
  
  // Create new PDF document
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  let yPosition = margin;
  
  // Add header
  pdf.setFontSize(20);
  pdf.setTextColor(0, 0, 0);
  pdf.text('SEO/GEO Strategy Review', margin, yPosition);
  yPosition += 10;
  
  // Add product info
  pdf.setFontSize(16);
  pdf.setTextColor(50, 50, 50);
  pdf.text(submission.product_name || 'Product Name', margin, yPosition);
  yPosition += 8;
  
  pdf.setFontSize(10);
  pdf.setTextColor(100, 100, 100);
  pdf.text(`Generated: ${new Date(timestamp).toLocaleString()}`, margin, yPosition);
  yPosition += 10;
  
  // Add horizontal line
  pdf.setDrawColor(200, 200, 200);
  pdf.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;
  
  // Section: Product Information
  pdf.setFontSize(14);
  pdf.setTextColor(0, 0, 0);
  pdf.text('Product Information', margin, yPosition);
  yPosition += 8;
  
  pdf.setFontSize(10);
  pdf.setTextColor(50, 50, 50);
  const productInfo = [
    `Development Stage: ${submission.development_stage || 'N/A'}`,
    `Generic Name: ${submission.generic_name || 'N/A'}`,
    `Therapeutic Area: ${submission.therapeutic_area || 'N/A'}`,
    `Medical Indication: ${submission.medical_indication || 'N/A'}`,
    `Priority Level: ${submission.priority_level || 'N/A'}`
  ];
  
  productInfo.forEach(info => {
    pdf.text(info, margin + 5, yPosition);
    yPosition += 6;
  });
  
  yPosition += 5;
  
  // Section: SEO Elements
  pdf.setFontSize(14);
  pdf.setTextColor(0, 0, 0);
  pdf.text('SEO Elements', margin, yPosition);
  yPosition += 8;
  
  // SEO Title
  pdf.setFontSize(11);
  pdf.setTextColor(30, 30, 30);
  pdf.text('SEO Title:', margin + 5, yPosition);
  yPosition += 6;
  pdf.setFontSize(10);
  pdf.setTextColor(50, 50, 50);
  const seoTitleLines = pdf.splitTextToSize(submission.seo_title || 'Not provided', pageWidth - (margin * 2) - 10);
  seoTitleLines.forEach(line => {
    pdf.text(line, margin + 10, yPosition);
    yPosition += 5;
  });
  yPosition += 3;
  
  // Meta Description
  pdf.setFontSize(11);
  pdf.setTextColor(30, 30, 30);
  pdf.text('Meta Description:', margin + 5, yPosition);
  yPosition += 6;
  pdf.setFontSize(10);
  pdf.setTextColor(50, 50, 50);
  const metaLines = pdf.splitTextToSize(submission.meta_description || 'Not provided', pageWidth - (margin * 2) - 10);
  metaLines.forEach(line => {
    pdf.text(line, margin + 10, yPosition);
    yPosition += 5;
  });
  yPosition += 3;
  
  // Keywords
  pdf.setFontSize(11);
  pdf.setTextColor(30, 30, 30);
  pdf.text('SEO Keywords:', margin + 5, yPosition);
  yPosition += 6;
  pdf.setFontSize(10);
  pdf.setTextColor(50, 50, 50);
  const keywords = submission.seo_keywords?.join(', ') || 'Not provided';
  const keywordLines = pdf.splitTextToSize(keywords, pageWidth - (margin * 2) - 10);
  keywordLines.forEach(line => {
    pdf.text(line, margin + 10, yPosition);
    yPosition += 5;
  });
  
  // Check if we need a new page
  if (yPosition > pageHeight - 40) {
    pdf.addPage();
    yPosition = margin;
  }
  
  yPosition += 5;
  
  // Section: GEO Optimization
  pdf.setFontSize(14);
  pdf.setTextColor(0, 0, 0);
  pdf.text('GEO Optimization', margin, yPosition);
  yPosition += 8;
  
  if (submission.geo_optimization) {
    pdf.setFontSize(10);
    pdf.setTextColor(50, 50, 50);
    pdf.text(`GEO Score: ${submission.geo_optimization_score || 'N/A'}%`, margin + 5, yPosition);
    yPosition += 6;
    
    if (submission.geo_event_tags?.length > 0) {
      pdf.text(`Event Tags: ${submission.geo_event_tags.join(', ')}`, margin + 5, yPosition);
      yPosition += 6;
    }
  }
  
  // Add footer
  const totalPages = pdf.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    pdf.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 20, pageHeight - 10);
    pdf.text('3Cubed SEO Platform', margin, pageHeight - 10);
  }
  
  // Save the PDF
  pdf.save(`SEO_Review_${submission.product_name}_${timestamp}.pdf`);
};

// Enhanced PDF with visual elements (alternative method using html2canvas)
export const exportToPDFVisual = async (elementId: string, filename: string) => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Element not found for PDF export');
    return;
  }
  
  // Store original styles
  const originalHeight = element.style.height;
  const originalOverflow = element.style.overflow;
  const originalMaxHeight = element.style.maxHeight;
  
  try {
    // Temporarily expand the element to capture all content
    element.style.height = 'auto';
    element.style.overflow = 'visible';
    element.style.maxHeight = 'none';
    
    // Wait for any layout changes
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const canvas = await html2canvas(element, {
      scale: 2,
      logging: false,
      useCORS: true,
      backgroundColor: '#ffffff',
      windowHeight: element.scrollHeight,
      height: element.scrollHeight,
      y: 0
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const pageWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const margin = 10; // 10mm margins
    const contentWidth = pageWidth - (2 * margin);
    const contentHeight = pageHeight - (2 * margin);
    
    // Calculate image dimensions to fit page width
    const imgWidth = contentWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Calculate how many pages we need
    const totalPages = Math.ceil(imgHeight / contentHeight);
    
    // Add content to PDF, splitting across pages
    for (let page = 0; page < totalPages; page++) {
      if (page > 0) {
        pdf.addPage();
      }
      
      const yOffset = -(page * contentHeight);
      pdf.addImage(
        imgData, 
        'PNG', 
        margin, 
        margin + yOffset, 
        imgWidth, 
        imgHeight
      );
      
      // Add page number
      pdf.setFontSize(10);
      pdf.setTextColor(128, 128, 128);
      pdf.text(
        `Page ${page + 1} of ${totalPages}`, 
        pageWidth / 2, 
        pageHeight - 5, 
        { align: 'center' }
      );
    }
    
    pdf.save(filename);
  } finally {
    // Restore original styles
    element.style.height = originalHeight;
    element.style.overflow = originalOverflow;
    element.style.maxHeight = originalMaxHeight;
  }
};