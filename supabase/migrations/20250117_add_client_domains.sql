-- Add multi-domain support for clients
CREATE TABLE IF NOT EXISTS client_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  domain VARCHAR NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_domain UNIQUE(domain)
);

-- Add index for performance
CREATE INDEX idx_client_domains_client_id ON client_domains(client_id);
CREATE INDEX idx_client_domains_domain ON client_domains(domain);

-- Migrate existing domains from clients table
INSERT INTO client_domains (client_id, domain, is_primary)
SELECT id, company_domain, true
FROM clients
WHERE company_domain IS NOT NULL
ON CONFLICT (domain) DO NOTHING;

-- Create updated_at trigger for client_domains
CREATE TRIGGER update_client_domains_updated_at BEFORE UPDATE ON client_domains
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update the client assignment function to check multiple domains
CREATE OR REPLACE FUNCTION find_client_by_email(email_address TEXT)
RETURNS UUID AS $$
DECLARE
  client_uuid UUID;
  email_domain TEXT;
BEGIN
  -- Extract domain from email
  email_domain := SPLIT_PART(email_address, '@', 2);
  
  -- First check client_domains table
  SELECT client_id INTO client_uuid
  FROM client_domains
  WHERE domain = email_domain
  LIMIT 1;
  
  -- If not found, check clients table (for backwards compatibility)
  IF client_uuid IS NULL THEN
    SELECT id INTO client_uuid
    FROM clients
    WHERE company_domain = email_domain
    LIMIT 1;
  END IF;
  
  RETURN client_uuid;
END;
$$ LANGUAGE plpgsql;

-- Add client portal access fields
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS portal_access_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS portal_password_hash VARCHAR,
ADD COLUMN IF NOT EXISTS portal_last_login TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS portal_access_token VARCHAR;

-- Create client portal sessions table
CREATE TABLE IF NOT EXISTS client_portal_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  token VARCHAR NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_client_portal_sessions_token ON client_portal_sessions(token);
CREATE INDEX idx_client_portal_sessions_client_id ON client_portal_sessions(client_id);
