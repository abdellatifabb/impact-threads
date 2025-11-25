-- Create storage policies for family video uploads
-- Families can upload videos to their own folder in the family-posts bucket
CREATE POLICY "Families can upload videos to own folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'family-posts' 
  AND (storage.foldername(name))[1] = (
    SELECT id::text FROM families WHERE family_user_id = auth.uid()
  )
);

-- Families can update their own videos
CREATE POLICY "Families can update own videos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'family-posts'
  AND (storage.foldername(name))[1] = (
    SELECT id::text FROM families WHERE family_user_id = auth.uid()
  )
);

-- Families can delete their own videos
CREATE POLICY "Families can delete own videos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'family-posts'
  AND (storage.foldername(name))[1] = (
    SELECT id::text FROM families WHERE family_user_id = auth.uid()
  )
);

-- Donors can view videos from their assigned families
CREATE POLICY "Donors can view assigned family videos"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'family-posts'
  AND (
    -- Check if user is a donor assigned to this family
    EXISTS (
      SELECT 1 FROM donor_profiles dp
      JOIN donor_family_assignments dfa ON dp.id = dfa.donor_id
      WHERE dp.user_id = auth.uid()
      AND dfa.family_id::text = (storage.foldername(name))[1]
      AND dfa.status = 'active'
    )
    -- Or if user is the family themselves
    OR EXISTS (
      SELECT 1 FROM families
      WHERE id::text = (storage.foldername(name))[1]
      AND family_user_id = auth.uid()
    )
    -- Or if user is a case manager assigned to this family
    OR EXISTS (
      SELECT 1 FROM case_manager_profiles cmp
      JOIN case_manager_family_assignments cmfa ON cmp.id = cmfa.case_manager_id
      WHERE cmp.user_id = auth.uid()
      AND cmfa.family_id::text = (storage.foldername(name))[1]
    )
    -- Or if user is admin
    OR EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  )
);