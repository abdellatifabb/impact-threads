-- Add INSERT policies to allow users to create their own profiles during signup

-- Allow case managers to insert their own profile
CREATE POLICY "Case managers can insert own profile"
ON case_manager_profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow donors to insert their own profile  
CREATE POLICY "Donors can insert own profile"
ON donor_profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);
