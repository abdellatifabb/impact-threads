-- WARNING: This removes all access control from the database
-- All authenticated users will have full access to all data

-- Drop all RLS policies on all tables
DROP POLICY IF EXISTS "Users view case manager family assignments" ON public.case_manager_family_assignments;
DROP POLICY IF EXISTS "Admins manage case manager family assignments" ON public.case_manager_family_assignments;

DROP POLICY IF EXISTS "Case managers view own profile" ON public.case_manager_profiles;
DROP POLICY IF EXISTS "Case managers update own profile" ON public.case_manager_profiles;
DROP POLICY IF EXISTS "Admins manage case manager profiles" ON public.case_manager_profiles;
DROP POLICY IF EXISTS "Case managers can insert own profile" ON public.case_manager_profiles;

DROP POLICY IF EXISTS "Users view children" ON public.children;
DROP POLICY IF EXISTS "Admins manage children" ON public.children;
DROP POLICY IF EXISTS "Case managers manage children in assigned families" ON public.children;

DROP POLICY IF EXISTS "Users view donor family assignments" ON public.donor_family_assignments;
DROP POLICY IF EXISTS "Admins manage donor family assignments" ON public.donor_family_assignments;

DROP POLICY IF EXISTS "Donors view own profile" ON public.donor_profiles;
DROP POLICY IF EXISTS "Donors update own profile" ON public.donor_profiles;
DROP POLICY IF EXISTS "Admins manage donor profiles" ON public.donor_profiles;
DROP POLICY IF EXISTS "Donors can insert own profile" ON public.donor_profiles;

DROP POLICY IF EXISTS "Users view families" ON public.families;
DROP POLICY IF EXISTS "Admins manage families" ON public.families;
DROP POLICY IF EXISTS "Case managers update assigned families" ON public.families;

DROP POLICY IF EXISTS "Users view message threads" ON public.message_threads;
DROP POLICY IF EXISTS "Admins manage message threads" ON public.message_threads;
DROP POLICY IF EXISTS "Donors create threads for assigned families" ON public.message_threads;

DROP POLICY IF EXISTS "Users view messages" ON public.messages;
DROP POLICY IF EXISTS "Admins manage messages" ON public.messages;
DROP POLICY IF EXISTS "Users send messages in accessible threads" ON public.messages;

DROP POLICY IF EXISTS "Users view post media" ON public.post_media;
DROP POLICY IF EXISTS "Admins manage post media" ON public.post_media;
DROP POLICY IF EXISTS "Case managers add media to posts in assigned families" ON public.post_media;

DROP POLICY IF EXISTS "Users view posts" ON public.posts;
DROP POLICY IF EXISTS "Families create own posts" ON public.posts;
DROP POLICY IF EXISTS "Admins manage posts" ON public.posts;
DROP POLICY IF EXISTS "Case managers create posts for assigned families" ON public.posts;
DROP POLICY IF EXISTS "Case managers update posts for assigned families" ON public.posts;

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins manage profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles in message threads" ON public.profiles;

DROP POLICY IF EXISTS "Users view update requests" ON public.update_requests;
DROP POLICY IF EXISTS "Admins manage update requests" ON public.update_requests;
DROP POLICY IF EXISTS "Donors create update requests for assigned families" ON public.update_requests;
DROP POLICY IF EXISTS "Case managers update requests for assigned families" ON public.update_requests;

DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

-- Disable RLS on all tables
ALTER TABLE public.case_manager_family_assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_manager_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.children DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.donor_family_assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.donor_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.families DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_threads DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_media DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.update_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;