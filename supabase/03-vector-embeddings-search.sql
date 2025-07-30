-- Enable vector embeddings and full-text search for pharmaceutical data
-- This enables semantic search across all submission content

-- Enable the pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Add vector column for content embeddings
ALTER TABLE submissions 
ADD COLUMN IF NOT EXISTS content_embedding vector(1536);

-- Add full-text search vector column
ALTER TABLE submissions 
ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Create GIN index for full-text search
CREATE INDEX IF NOT EXISTS submissions_search_idx ON submissions USING GIN(search_vector);

-- Create HNSW index for vector similarity search
CREATE INDEX IF NOT EXISTS submissions_embedding_idx ON submissions 
USING hnsw (content_embedding vector_cosine_ops);

-- Function to update search vector automatically
CREATE OR REPLACE FUNCTION update_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english',
    COALESCE(NEW.product_name, '') || ' ' ||
    COALESCE(NEW.indication, '') || ' ' ||
    COALESCE(NEW.therapeutic_area, '') || ' ' ||
    COALESCE(NEW.mechanism_of_action, '') || ' ' ||
    COALESCE(NEW.key_differentiators, '') || ' ' ||
    COALESCE(NEW.target_audience, '') || ' ' ||
    COALESCE(NEW.ai_generated_content::text, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update search vector on insert/update
DROP TRIGGER IF EXISTS update_search_vector_trigger ON submissions;
CREATE TRIGGER update_search_vector_trigger
  BEFORE INSERT OR UPDATE ON submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_search_vector();

-- Function for semantic search using embeddings
CREATE OR REPLACE FUNCTION search_submissions_by_similarity(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.8,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  product_name text,
  indication text,
  therapeutic_area text,
  similarity float
) 
LANGUAGE sql
AS $$
  SELECT
    s.id,
    s.product_name,
    s.indication,
    s.therapeutic_area,
    1 - (s.content_embedding <=> query_embedding) AS similarity
  FROM submissions s
  WHERE s.content_embedding IS NOT NULL
    AND 1 - (s.content_embedding <=> query_embedding) > match_threshold
  ORDER BY s.content_embedding <=> query_embedding
  LIMIT match_count;
$$;

-- Function for full-text search
CREATE OR REPLACE FUNCTION search_submissions_by_text(
  search_query text,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  product_name text,
  indication text,
  therapeutic_area text,
  rank real
)
LANGUAGE sql
AS $$
  SELECT
    s.id,
    s.product_name,
    s.indication,
    s.therapeutic_area,
    ts_rank(s.search_vector, plainto_tsquery('english', search_query)) AS rank
  FROM submissions s
  WHERE s.search_vector @@ plainto_tsquery('english', search_query)
  ORDER BY ts_rank(s.search_vector, plainto_tsquery('english', search_query)) DESC
  LIMIT match_count;
$$;

-- Function for hybrid search (combining text and vector search)
CREATE OR REPLACE FUNCTION search_submissions_hybrid(
  search_query text,
  query_embedding vector(1536) DEFAULT NULL,
  match_count int DEFAULT 10,
  text_weight float DEFAULT 0.5,
  vector_weight float DEFAULT 0.5
)
RETURNS TABLE (
  id uuid,
  product_name text,
  indication text,
  therapeutic_area text,
  combined_score float
)
LANGUAGE sql
AS $$
  WITH text_search AS (
    SELECT
      s.id,
      s.product_name,
      s.indication,
      s.therapeutic_area,
      ts_rank(s.search_vector, plainto_tsquery('english', search_query)) AS text_score
    FROM submissions s
    WHERE s.search_vector @@ plainto_tsquery('english', search_query)
  ),
  vector_search AS (
    SELECT
      s.id,
      s.product_name,
      s.indication,
      s.therapeutic_area,
      1 - (s.content_embedding <=> query_embedding) AS vector_score
    FROM submissions s
    WHERE query_embedding IS NOT NULL
      AND s.content_embedding IS NOT NULL
  )
  SELECT
    COALESCE(t.id, v.id) AS id,
    COALESCE(t.product_name, v.product_name) AS product_name,
    COALESCE(t.indication, v.indication) AS indication,
    COALESCE(t.therapeutic_area, v.therapeutic_area) AS therapeutic_area,
    (COALESCE(t.text_score, 0) * text_weight + COALESCE(v.vector_score, 0) * vector_weight) AS combined_score
  FROM text_search t
  FULL OUTER JOIN vector_search v ON t.id = v.id
  ORDER BY combined_score DESC
  LIMIT match_count;
$$;

-- Update existing records to populate search vectors
UPDATE submissions SET updated_at = NOW() WHERE search_vector IS NULL;