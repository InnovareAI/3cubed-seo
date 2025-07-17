import { supabase } from './supabase'

/**
 * Find or create a client based on email domain
 */
export async function findOrCreateClient(email: string) {
  const domain = email.split('@')[1]
  if (!domain) throw new Error('Invalid email address')

  // First, try to find existing client
  const { data: existingClient } = await supabase
    .from('clients')
    .select('*')
    .eq('company_domain', domain)
    .single()

  if (existingClient) {
    return existingClient
  }

  // Create new client if not found
  const clientName = domain === 'pharmaco.com' ? 'PharmaCo' :
                     domain === 'biotech.com' ? 'BioTech Inc' :
                     domain === 'medtech.com' ? 'MedTech Solutions' :
                     domain === 'test.com' ? 'Test Company' :
                     domain === 'example.com' ? 'Example Corp' :
                     // Convert domain to title case company name
                     domain.split('.')[0]
                       .replace(/-/g, ' ')
                       .replace(/\b\w/g, l => l.toUpperCase())

  const { data: newClient, error: createError } = await supabase
    .from('clients')
    .insert({
      name: clientName,
      company_domain: domain,
      contact_email: email,
      status: 'active'
    })
    .select()
    .single()

  if (createError) throw createError
  return newClient
}

/**
 * Find or create a project based on client, product, and therapeutic area
 */
export async function findOrCreateProject(
  clientId: string,
  productName: string,
  therapeuticArea: string
) {
  // First, try to find existing project
  const { data: existingProject } = await supabase
    .from('projects')
    .select('*')
    .eq('client_id', clientId)
    .eq('product_name', productName)
    .eq('therapeutic_area', therapeuticArea)
    .single()

  if (existingProject) {
    return existingProject
  }

  // Create new project if not found
  const { data: newProject, error: createError } = await supabase
    .from('projects')
    .insert({
      client_id: clientId,
      name: `${productName} - ${therapeuticArea}`,
      product_name: productName,
      therapeutic_area: therapeuticArea,
      status: 'active'
    })
    .select()
    .single()

  if (createError) throw createError
  return newProject
}

/**
 * Process a new submission and assign client/project IDs
 */
export async function processSubmissionAssignment(submission: {
  submitter_email: string
  product_name: string
  therapeutic_area: string
}) {
  try {
    // Find or create client
    const client = await findOrCreateClient(submission.submitter_email)
    
    // Find or create project
    const project = await findOrCreateProject(
      client.id,
      submission.product_name,
      submission.therapeutic_area
    )

    return {
      client_id: client.id,
      project_id: project.id,
      client,
      project
    }
  } catch (error) {
    console.error('Error processing submission assignment:', error)
    throw error
  }
}