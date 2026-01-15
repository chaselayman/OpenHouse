-- Add listing_url column to properties table
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS listing_url text;

-- Add comment
COMMENT ON COLUMN public.properties.listing_url IS 'Full URL to the MLS listing page';
