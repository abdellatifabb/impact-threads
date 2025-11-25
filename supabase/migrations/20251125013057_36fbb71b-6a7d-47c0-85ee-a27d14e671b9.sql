-- Create enum for user roles
CREATE TYPE app_role AS ENUM ('admin', 'case_manager', 'donor', 'family');

-- Create enum for family status
CREATE TYPE family_status AS ENUM ('active', 'inactive', 'graduated');

-- Create enum for assignment status
CREATE TYPE assignment_status AS ENUM ('active', 'paused', 'ended');

-- Create enum for update request status
CREATE TYPE update_request_status AS ENUM ('pending', 'in_progress', 'completed');

-- Create profiles table (extends auth.users with role and basic info)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create donor_profiles table
CREATE TABLE donor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  bio TEXT,
  preferred_name TEXT,
  communication_preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create case_manager_profiles table
CREATE TABLE case_manager_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT,
  phone TEXT,
  region TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create families table
CREATE TABLE families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location_country TEXT,
  location_city TEXT,
  story TEXT,
  status family_status NOT NULL DEFAULT 'active',
  family_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  banner_image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create children table
CREATE TABLE children (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age INTEGER,
  gender TEXT,
  school TEXT,
  notes TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create donor_family_assignments table
CREATE TABLE donor_family_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id UUID NOT NULL REFERENCES donor_profiles(id) ON DELETE CASCADE,
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  status assignment_status NOT NULL DEFAULT 'active',
  start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(donor_id, family_id)
);

-- Create case_manager_family_assignments table
CREATE TABLE case_manager_family_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_manager_id UUID NOT NULL REFERENCES case_manager_profiles(id) ON DELETE CASCADE,
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(case_manager_id, family_id)
);

-- Create posts table
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  created_by_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT,
  body TEXT NOT NULL,
  visibility TEXT NOT NULL DEFAULT 'visible',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create post_media table
CREATE TABLE post_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  caption TEXT,
  media_type TEXT NOT NULL DEFAULT 'image',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create message_threads table
CREATE TABLE message_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id UUID NOT NULL REFERENCES donor_profiles(id) ON DELETE CASCADE,
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(donor_id, family_id)
);

-- Create messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES message_threads(id) ON DELETE CASCADE,
  sender_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create update_requests table
CREATE TABLE update_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id UUID NOT NULL REFERENCES donor_profiles(id) ON DELETE CASCADE,
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  status update_request_status NOT NULL DEFAULT 'pending',
  request_text TEXT NOT NULL,
  responded_post_id UUID REFERENCES posts(id) ON DELETE SET NULL,
  handled_by_case_manager_id UUID REFERENCES case_manager_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE donor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_manager_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE donor_family_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_manager_family_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE update_requests ENABLE ROW LEVEL SECURITY;

-- Create trigger function for updating updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_donor_profiles_updated_at BEFORE UPDATE ON donor_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_case_manager_profiles_updated_at BEFORE UPDATE ON case_manager_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_families_updated_at BEFORE UPDATE ON families FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_children_updated_at BEFORE UPDATE ON children FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_donor_family_assignments_updated_at BEFORE UPDATE ON donor_family_assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_case_manager_family_assignments_updated_at BEFORE UPDATE ON case_manager_family_assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_message_threads_updated_at BEFORE UPDATE ON message_threads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_update_requests_updated_at BEFORE UPDATE ON update_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies

-- Profiles: Users can view their own profile, admins can view all
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Donor profiles: Donors can view their own, case managers can view assigned donors, admins view all
CREATE POLICY "Donors view own profile" ON donor_profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.id = donor_profiles.user_id)
);
CREATE POLICY "Donors update own profile" ON donor_profiles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.id = donor_profiles.user_id)
);

-- Case manager profiles: Case managers view own, admins view all
CREATE POLICY "Case managers view own profile" ON case_manager_profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.id = case_manager_profiles.user_id)
);
CREATE POLICY "Case managers update own profile" ON case_manager_profiles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.id = case_manager_profiles.user_id)
);

-- Families: Donors see assigned families, case managers see assigned families, admins see all
CREATE POLICY "Users view families" ON families FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND (
      -- Admins see all
      profiles.role = 'admin' OR
      -- Donors see assigned families
      (profiles.role = 'donor' AND EXISTS (
        SELECT 1 FROM donor_profiles dp
        JOIN donor_family_assignments dfa ON dp.id = dfa.donor_id
        WHERE dp.user_id = auth.uid() AND dfa.family_id = families.id AND dfa.status = 'active'
      )) OR
      -- Case managers see assigned families
      (profiles.role = 'case_manager' AND EXISTS (
        SELECT 1 FROM case_manager_profiles cmp
        JOIN case_manager_family_assignments cmfa ON cmp.id = cmfa.case_manager_id
        WHERE cmp.user_id = auth.uid() AND cmfa.family_id = families.id
      )) OR
      -- Family user sees own family
      (profiles.role = 'family' AND families.family_user_id = auth.uid())
    )
  )
);

-- Children: Same access as families
CREATE POLICY "Users view children" ON children FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM families WHERE families.id = children.family_id AND (
      EXISTS (
        SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND (
          profiles.role = 'admin' OR
          (profiles.role = 'donor' AND EXISTS (
            SELECT 1 FROM donor_profiles dp
            JOIN donor_family_assignments dfa ON dp.id = dfa.donor_id
            WHERE dp.user_id = auth.uid() AND dfa.family_id = families.id AND dfa.status = 'active'
          )) OR
          (profiles.role = 'case_manager' AND EXISTS (
            SELECT 1 FROM case_manager_profiles cmp
            JOIN case_manager_family_assignments cmfa ON cmp.id = cmfa.case_manager_id
            WHERE cmp.user_id = auth.uid() AND cmfa.family_id = families.id
          )) OR
          (profiles.role = 'family' AND families.family_user_id = auth.uid())
        )
      )
    )
  )
);

-- Posts: Donors see posts from assigned families, case managers see posts from assigned families, admins see all
CREATE POLICY "Users view posts" ON posts FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM families WHERE families.id = posts.family_id AND (
      EXISTS (
        SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND (
          profiles.role = 'admin' OR
          (profiles.role = 'donor' AND EXISTS (
            SELECT 1 FROM donor_profiles dp
            JOIN donor_family_assignments dfa ON dp.id = dfa.donor_id
            WHERE dp.user_id = auth.uid() AND dfa.family_id = families.id AND dfa.status = 'active'
          )) OR
          (profiles.role = 'case_manager' AND EXISTS (
            SELECT 1 FROM case_manager_profiles cmp
            JOIN case_manager_family_assignments cmfa ON cmp.id = cmfa.case_manager_id
            WHERE cmp.user_id = auth.uid() AND cmfa.family_id = families.id
          )) OR
          (profiles.role = 'family' AND families.family_user_id = auth.uid())
        )
      )
    )
  )
);

-- Post media: Same access as posts
CREATE POLICY "Users view post media" ON post_media FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM posts WHERE posts.id = post_media.post_id AND (
      EXISTS (
        SELECT 1 FROM families WHERE families.id = posts.family_id AND (
          EXISTS (
            SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND (
              profiles.role = 'admin' OR
              (profiles.role = 'donor' AND EXISTS (
                SELECT 1 FROM donor_profiles dp
                JOIN donor_family_assignments dfa ON dp.id = dfa.donor_id
                WHERE dp.user_id = auth.uid() AND dfa.family_id = families.id AND dfa.status = 'active'
              )) OR
              (profiles.role = 'case_manager' AND EXISTS (
                SELECT 1 FROM case_manager_profiles cmp
                JOIN case_manager_family_assignments cmfa ON cmp.id = cmfa.case_manager_id
                WHERE cmp.user_id = auth.uid() AND cmfa.family_id = families.id
              )) OR
              (profiles.role = 'family' AND families.family_user_id = auth.uid())
            )
          )
        )
      )
    )
  )
);

-- Message threads: Donors see threads for assigned families, case managers see threads for assigned families
CREATE POLICY "Users view message threads" ON message_threads FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND (
      profiles.role = 'admin' OR
      (profiles.role = 'donor' AND EXISTS (
        SELECT 1 FROM donor_profiles dp
        WHERE dp.user_id = auth.uid() AND dp.id = message_threads.donor_id
      )) OR
      (profiles.role = 'case_manager' AND EXISTS (
        SELECT 1 FROM case_manager_profiles cmp
        JOIN case_manager_family_assignments cmfa ON cmp.id = cmfa.case_manager_id
        WHERE cmp.user_id = auth.uid() AND cmfa.family_id = message_threads.family_id
      )) OR
      (profiles.role = 'family' AND EXISTS (
        SELECT 1 FROM families WHERE families.id = message_threads.family_id AND families.family_user_id = auth.uid()
      ))
    )
  )
);

-- Messages: Users can view messages in threads they have access to
CREATE POLICY "Users view messages" ON messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM message_threads WHERE message_threads.id = messages.thread_id AND (
      EXISTS (
        SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND (
          profiles.role = 'admin' OR
          (profiles.role = 'donor' AND EXISTS (
            SELECT 1 FROM donor_profiles dp
            WHERE dp.user_id = auth.uid() AND dp.id = message_threads.donor_id
          )) OR
          (profiles.role = 'case_manager' AND EXISTS (
            SELECT 1 FROM case_manager_profiles cmp
            JOIN case_manager_family_assignments cmfa ON cmp.id = cmfa.case_manager_id
            WHERE cmp.user_id = auth.uid() AND cmfa.family_id = message_threads.family_id
          )) OR
          (profiles.role = 'family' AND EXISTS (
            SELECT 1 FROM families WHERE families.id = message_threads.family_id AND families.family_user_id = auth.uid()
          ))
        )
      )
    )
  )
);

-- Update requests: Donors see their own, case managers see requests for assigned families, admins see all
CREATE POLICY "Users view update requests" ON update_requests FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND (
      profiles.role = 'admin' OR
      (profiles.role = 'donor' AND EXISTS (
        SELECT 1 FROM donor_profiles dp
        WHERE dp.user_id = auth.uid() AND dp.id = update_requests.donor_id
      )) OR
      (profiles.role = 'case_manager' AND EXISTS (
        SELECT 1 FROM case_manager_profiles cmp
        JOIN case_manager_family_assignments cmfa ON cmp.id = cmfa.case_manager_id
        WHERE cmp.user_id = auth.uid() AND cmfa.family_id = update_requests.family_id
      ))
    )
  )
);

-- Assignments: Admins and case managers can view
CREATE POLICY "Users view donor family assignments" ON donor_family_assignments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND (
      profiles.role = 'admin' OR
      (profiles.role = 'case_manager' AND EXISTS (
        SELECT 1 FROM case_manager_profiles cmp
        JOIN case_manager_family_assignments cmfa ON cmp.id = cmfa.case_manager_id
        WHERE cmp.user_id = auth.uid() AND cmfa.family_id = donor_family_assignments.family_id
      )) OR
      (profiles.role = 'donor' AND EXISTS (
        SELECT 1 FROM donor_profiles dp
        WHERE dp.user_id = auth.uid() AND dp.id = donor_family_assignments.donor_id
      ))
    )
  )
);

CREATE POLICY "Users view case manager family assignments" ON case_manager_family_assignments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND (
      profiles.role = 'admin' OR
      (profiles.role = 'case_manager' AND EXISTS (
        SELECT 1 FROM case_manager_profiles cmp
        WHERE cmp.user_id = auth.uid() AND cmp.id = case_manager_family_assignments.case_manager_id
      ))
    )
  )
);

-- Function to check if user has a specific role
CREATE OR REPLACE FUNCTION has_role(user_id UUID, check_role app_role)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles WHERE id = user_id AND role = check_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin policies for INSERT, UPDATE, DELETE on all tables
-- Profiles
CREATE POLICY "Admins manage profiles" ON profiles FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Donor profiles
CREATE POLICY "Admins manage donor profiles" ON donor_profiles FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Case manager profiles
CREATE POLICY "Admins manage case manager profiles" ON case_manager_profiles FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Families
CREATE POLICY "Admins manage families" ON families FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Case managers update assigned families" ON families FOR UPDATE USING (
  has_role(auth.uid(), 'case_manager') AND EXISTS (
    SELECT 1 FROM case_manager_profiles cmp
    JOIN case_manager_family_assignments cmfa ON cmp.id = cmfa.case_manager_id
    WHERE cmp.user_id = auth.uid() AND cmfa.family_id = families.id
  )
);

-- Children
CREATE POLICY "Admins manage children" ON children FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Case managers manage children in assigned families" ON children FOR ALL USING (
  has_role(auth.uid(), 'case_manager') AND EXISTS (
    SELECT 1 FROM case_manager_profiles cmp
    JOIN case_manager_family_assignments cmfa ON cmp.id = cmfa.case_manager_id
    WHERE cmp.user_id = auth.uid() AND cmfa.family_id = children.family_id
  )
);

-- Assignments
CREATE POLICY "Admins manage donor family assignments" ON donor_family_assignments FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage case manager family assignments" ON case_manager_family_assignments FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Posts
CREATE POLICY "Admins manage posts" ON posts FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Case managers create posts for assigned families" ON posts FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'case_manager') AND EXISTS (
    SELECT 1 FROM case_manager_profiles cmp
    JOIN case_manager_family_assignments cmfa ON cmp.id = cmfa.case_manager_id
    WHERE cmp.user_id = auth.uid() AND cmfa.family_id = posts.family_id
  )
);
CREATE POLICY "Case managers update posts for assigned families" ON posts FOR UPDATE USING (
  has_role(auth.uid(), 'case_manager') AND EXISTS (
    SELECT 1 FROM case_manager_profiles cmp
    JOIN case_manager_family_assignments cmfa ON cmp.id = cmfa.case_manager_id
    WHERE cmp.user_id = auth.uid() AND cmfa.family_id = posts.family_id
  )
);
CREATE POLICY "Families create own posts" ON posts FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'family') AND EXISTS (
    SELECT 1 FROM families WHERE families.id = posts.family_id AND families.family_user_id = auth.uid()
  )
);

-- Post media
CREATE POLICY "Admins manage post media" ON post_media FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Case managers add media to posts in assigned families" ON post_media FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'case_manager') AND EXISTS (
    SELECT 1 FROM posts
    JOIN case_manager_profiles cmp ON TRUE
    JOIN case_manager_family_assignments cmfa ON cmp.id = cmfa.case_manager_id
    WHERE posts.id = post_media.post_id AND cmp.user_id = auth.uid() AND cmfa.family_id = posts.family_id
  )
);

-- Message threads
CREATE POLICY "Admins manage message threads" ON message_threads FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Donors create threads for assigned families" ON message_threads FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'donor') AND EXISTS (
    SELECT 1 FROM donor_profiles dp
    WHERE dp.user_id = auth.uid() AND dp.id = message_threads.donor_id
  )
);

-- Messages
CREATE POLICY "Admins manage messages" ON messages FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Users send messages in accessible threads" ON messages FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM message_threads WHERE message_threads.id = messages.thread_id AND (
      EXISTS (
        SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND (
          (profiles.role = 'donor' AND EXISTS (
            SELECT 1 FROM donor_profiles dp
            WHERE dp.user_id = auth.uid() AND dp.id = message_threads.donor_id
          )) OR
          (profiles.role = 'case_manager' AND EXISTS (
            SELECT 1 FROM case_manager_profiles cmp
            JOIN case_manager_family_assignments cmfa ON cmp.id = cmfa.case_manager_id
            WHERE cmp.user_id = auth.uid() AND cmfa.family_id = message_threads.family_id
          )) OR
          (profiles.role = 'family' AND EXISTS (
            SELECT 1 FROM families WHERE families.id = message_threads.family_id AND families.family_user_id = auth.uid()
          ))
        )
      )
    )
  )
);

-- Update requests
CREATE POLICY "Admins manage update requests" ON update_requests FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Donors create update requests for assigned families" ON update_requests FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'donor') AND EXISTS (
    SELECT 1 FROM donor_profiles dp
    JOIN donor_family_assignments dfa ON dp.id = dfa.donor_id
    WHERE dp.user_id = auth.uid() AND dfa.family_id = update_requests.family_id AND dfa.status = 'active'
  )
);
CREATE POLICY "Case managers update requests for assigned families" ON update_requests FOR UPDATE USING (
  has_role(auth.uid(), 'case_manager') AND EXISTS (
    SELECT 1 FROM case_manager_profiles cmp
    JOIN case_manager_family_assignments cmfa ON cmp.id = cmfa.case_manager_id
    WHERE cmp.user_id = auth.uid() AND cmfa.family_id = update_requests.family_id
  )
);

-- Create trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, role, name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'donor')::app_role,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();