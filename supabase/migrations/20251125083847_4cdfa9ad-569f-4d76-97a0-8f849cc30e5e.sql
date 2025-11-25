-- Create storage bucket for family post media
INSERT INTO storage.buckets (id, name, public)
VALUES ('family-posts', 'family-posts', true);

-- RLS policies for family-posts bucket
CREATE POLICY "Families can upload media to own posts"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'family-posts' 
  AND auth.uid() IN (
    SELECT family_user_id 
    FROM families 
    WHERE family_user_id = auth.uid()
  )
);

CREATE POLICY "Users can view family post media"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'family-posts');

CREATE POLICY "Families can delete own post media"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'family-posts'
  AND auth.uid() IN (
    SELECT family_user_id 
    FROM families 
    WHERE family_user_id = auth.uid()
  )
);