-- Create walk_dogs junction table for many-to-many relationship between walks and dogs
CREATE TABLE IF NOT EXISTS walk_dogs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  walk_id uuid NOT NULL REFERENCES walks(id) ON DELETE CASCADE,
  dog_id uuid NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(walk_id, dog_id)
);

-- Enable RLS
ALTER TABLE walk_dogs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their walk dogs"
  ON walk_dogs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM walks
      WHERE walks.id = walk_dogs.walk_id
      AND walks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their walk dogs"
  ON walk_dogs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM walks
      WHERE walks.id = walk_dogs.walk_id
      AND walks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their walk dogs"
  ON walk_dogs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM walks
      WHERE walks.id = walk_dogs.walk_id
      AND walks.user_id = auth.uid()
    )
  );

-- Add index for performance
CREATE INDEX idx_walk_dogs_walk_id ON walk_dogs(walk_id);
CREATE INDEX idx_walk_dogs_dog_id ON walk_dogs(dog_id);

-- Comment explaining the table
COMMENT ON TABLE walk_dogs IS 'Junction table to support multiple dogs per walk';
