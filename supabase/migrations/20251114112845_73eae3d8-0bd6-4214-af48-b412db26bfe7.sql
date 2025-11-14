-- Add columns to direct_threads for pinning, archiving, and deleting
ALTER TABLE direct_threads
ADD COLUMN IF NOT EXISTS pinned_by text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS archived_by text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS deleted_by text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Create index for better performance on filtering
CREATE INDEX IF NOT EXISTS idx_direct_threads_pinned ON direct_threads USING GIN(pinned_by);
CREATE INDEX IF NOT EXISTS idx_direct_threads_archived ON direct_threads USING GIN(archived_by);
CREATE INDEX IF NOT EXISTS idx_direct_threads_deleted ON direct_threads USING GIN(deleted_by);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_direct_threads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_update_direct_threads_updated_at ON direct_threads;
CREATE TRIGGER trigger_update_direct_threads_updated_at
  BEFORE UPDATE ON direct_threads
  FOR EACH ROW
  EXECUTE FUNCTION update_direct_threads_updated_at();