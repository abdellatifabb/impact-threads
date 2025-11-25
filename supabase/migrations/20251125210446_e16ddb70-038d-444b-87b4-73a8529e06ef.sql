-- Drop the restrictive policy that only allows viewing own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- Create new policies that allow viewing profiles in appropriate contexts
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can view profiles in message threads"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM message_threads mt
    LEFT JOIN donor_profiles dp ON mt.donor_id = dp.id
    LEFT JOIN families f ON mt.family_id = f.id
    WHERE (
      -- If current user is a donor in the thread, they can see the family profile
      (dp.user_id = auth.uid() AND f.family_user_id = profiles.id)
      OR
      -- If current user is a family in the thread, they can see the donor profile
      (f.family_user_id = auth.uid() AND dp.user_id = profiles.id)
    )
  )
);