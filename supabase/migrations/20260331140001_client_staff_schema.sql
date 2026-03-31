-- Update staff role constraint to include new roles
ALTER TABLE staff_profiles DROP CONSTRAINT IF EXISTS staff_profiles_role_check;
ALTER TABLE staff_profiles ADD CONSTRAINT staff_profiles_role_check
  CHECK (role IN ('admin','consultant','viewer','consultation_admin','business_admin','site_admin'));

-- ─────────────────────────────────────────────────────────────────────────────
-- CLIENT PROFILES
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE client_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  inquiry_id uuid REFERENCES inquiries(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  full_name text NOT NULL,
  email text NOT NULL UNIQUE,
  phone text,
  whatsapp text,
  city text,
  country text,
  education_level text,
  field_of_study text,
  gpa_percentage numeric,
  graduation_year integer,
  preferred_countries text[],
  service_type text,
  budget_range text,
  payment_status text DEFAULT 'pending'
    CHECK (payment_status IN ('pending','partial','paid','overdue'))
);

CREATE INDEX client_profiles_email_idx ON client_profiles(email);

ALTER TABLE client_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view own profile"
  ON client_profiles FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Clients can update own profile"
  ON client_profiles FOR UPDATE TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Clients can insert own profile"
  ON client_profiles FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "Staff can view all client profiles"
  ON client_profiles FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM staff_profiles WHERE id = auth.uid()));

CREATE POLICY "Staff can update client profiles"
  ON client_profiles FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM staff_profiles WHERE id = auth.uid()));

-- ─────────────────────────────────────────────────────────────────────────────
-- APPLICATION TRACKING
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE application_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES client_profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('scholarship','visa','admission')),
  title text NOT NULL,
  destination_country text,
  institution text,
  status text DEFAULT 'in_progress'
    CHECK (status IN ('not_started','in_progress','completed','on_hold','rejected')),
  current_stage text,
  stages jsonb DEFAULT '[]',
  assigned_staff_id uuid REFERENCES staff_profiles(id),
  assigned_staff_name text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX application_tracking_client_id_idx ON application_tracking(client_id);

ALTER TABLE application_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view own applications"
  ON application_tracking FOR SELECT TO authenticated
  USING (client_id IN (SELECT id FROM client_profiles WHERE id = auth.uid()));

CREATE POLICY "Staff can manage all applications"
  ON application_tracking FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM staff_profiles WHERE id = auth.uid()));

-- ─────────────────────────────────────────────────────────────────────────────
-- PAYMENTS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES client_profiles(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  currency text DEFAULT 'NGN',
  status text DEFAULT 'pending'
    CHECK (status IN ('pending','paid','failed','refunded')),
  description text NOT NULL,
  payment_reference text,
  payment_method text,
  paid_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX payments_client_id_idx ON payments(client_id);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view own payments"
  ON payments FOR SELECT TO authenticated
  USING (client_id IN (SELECT id FROM client_profiles WHERE id = auth.uid()));

CREATE POLICY "Clients can initiate payments"
  ON payments FOR INSERT TO authenticated
  WITH CHECK (client_id IN (SELECT id FROM client_profiles WHERE id = auth.uid()));

CREATE POLICY "Staff can view all payments"
  ON payments FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM staff_profiles WHERE id = auth.uid()));

CREATE POLICY "Staff can manage all payments"
  ON payments FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM staff_profiles WHERE id = auth.uid()));
