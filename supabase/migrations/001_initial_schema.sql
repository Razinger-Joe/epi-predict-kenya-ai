-- ═══════════════════════════════════════════════════════════════════════════════
-- 🎓 LEARNING: Supabase Schema for EpiPredict Kenya AI
-- ═══════════════════════════════════════════════════════════════════════════════
-- This SQL creates all the tables needed for the application.
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor)

-- ═══════════════════════════════════════════════════════════════════════════════
-- 1. ENABLE EXTENSIONS
-- ═══════════════════════════════════════════════════════════════════════════════
-- uuid-ossp: Generates unique IDs
-- postgis: Geographic/spatial data (optional, for mapping)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ═══════════════════════════════════════════════════════════════════════════════
-- 2. CUSTOM TYPES (Enums)
-- ═══════════════════════════════════════════════════════════════════════════════
-- 🎓 LEARNING: Enums ensure data consistency - only valid values can be stored

DO $$ BEGIN
    CREATE TYPE disease_category AS ENUM (
        'respiratory',
        'waterborne', 
        'vector_borne',
        'viral',
        'bacterial',
        'other'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE risk_level AS ENUM ('low', 'medium', 'high');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE alert_severity AS ENUM ('info', 'warning', 'critical');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE prediction_confidence AS ENUM ('low', 'medium', 'high');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 3. DISEASES TABLE
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS diseases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    category disease_category NOT NULL,
    description TEXT,
    symptoms TEXT[] DEFAULT '{}',
    transmission_mode TEXT,
    incubation_days_min INTEGER,
    incubation_days_max INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_diseases_category ON diseases(category);

-- 🎓 LEARNING: Insert initial data for common diseases in Kenya
INSERT INTO diseases (name, category, description, symptoms, transmission_mode) VALUES
    ('Malaria', 'vector_borne', 'Parasitic disease transmitted by Anopheles mosquitoes', 
     ARRAY['fever', 'chills', 'headache', 'muscle pain', 'fatigue'], 'Mosquito bite'),
    ('Cholera', 'waterborne', 'Acute diarrheal infection from contaminated water',
     ARRAY['severe diarrhea', 'dehydration', 'vomiting', 'leg cramps'], 'Contaminated water/food'),
    ('Typhoid', 'bacterial', 'Bacterial infection from Salmonella typhi',
     ARRAY['prolonged fever', 'weakness', 'abdominal pain', 'headache'], 'Contaminated food/water'),
    ('Dengue Fever', 'vector_borne', 'Viral disease transmitted by Aedes mosquitoes',
     ARRAY['high fever', 'severe headache', 'joint pain', 'rash', 'bleeding'], 'Mosquito bite'),
    ('Tuberculosis', 'respiratory', 'Bacterial infection affecting the lungs',
     ARRAY['persistent cough', 'chest pain', 'weight loss', 'night sweats'], 'Airborne droplets'),
    ('COVID-19', 'viral', 'Respiratory illness caused by SARS-CoV-2',
     ARRAY['fever', 'cough', 'fatigue', 'loss of taste/smell', 'difficulty breathing'], 'Airborne/droplets'),
    ('Rift Valley Fever', 'vector_borne', 'Viral disease affecting humans and livestock',
     ARRAY['fever', 'weakness', 'back pain', 'dizziness'], 'Mosquito bite/animal contact'),
    ('Dysentery', 'waterborne', 'Intestinal infection causing severe diarrhea with blood',
     ARRAY['bloody diarrhea', 'fever', 'stomach cramps', 'nausea'], 'Contaminated food/water')
ON CONFLICT (name) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 4. COUNTIES TABLE
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS counties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(3) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL UNIQUE,
    region VARCHAR(50),
    population INTEGER,
    area_km2 DECIMAL(10, 2),
    capital VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert all 47 Kenyan counties
INSERT INTO counties (code, name, region, population) VALUES
    ('001', 'Mombasa', 'Coast', 1208333),
    ('002', 'Kwale', 'Coast', 866820),
    ('003', 'Kilifi', 'Coast', 1453787),
    ('004', 'Tana River', 'Coast', 315943),
    ('005', 'Lamu', 'Coast', 143920),
    ('006', 'Taita-Taveta', 'Coast', 340671),
    ('007', 'Garissa', 'North Eastern', 841353),
    ('008', 'Wajir', 'North Eastern', 781263),
    ('009', 'Mandera', 'North Eastern', 867457),
    ('010', 'Marsabit', 'Eastern', 459785),
    ('011', 'Isiolo', 'Eastern', 268002),
    ('012', 'Meru', 'Eastern', 1545714),
    ('013', 'Tharaka-Nithi', 'Eastern', 393177),
    ('014', 'Embu', 'Eastern', 608599),
    ('015', 'Kitui', 'Eastern', 1136187),
    ('016', 'Machakos', 'Eastern', 1421932),
    ('017', 'Makueni', 'Eastern', 987653),
    ('018', 'Nyandarua', 'Central', 638289),
    ('019', 'Nyeri', 'Central', 759164),
    ('020', 'Kirinyaga', 'Central', 610411),
    ('021', 'Muranga', 'Central', 1056640),
    ('022', 'Kiambu', 'Central', 2417735),
    ('023', 'Turkana', 'Rift Valley', 926976),
    ('024', 'West Pokot', 'Rift Valley', 621241),
    ('025', 'Samburu', 'Rift Valley', 310327),
    ('026', 'Trans-Nzoia', 'Rift Valley', 990341),
    ('027', 'Uasin Gishu', 'Rift Valley', 1163186),
    ('028', 'Elgeyo-Marakwet', 'Rift Valley', 454480),
    ('029', 'Nandi', 'Rift Valley', 885711),
    ('030', 'Baringo', 'Rift Valley', 666763),
    ('031', 'Laikipia', 'Rift Valley', 518560),
    ('032', 'Nakuru', 'Rift Valley', 2162202),
    ('033', 'Narok', 'Rift Valley', 1157873),
    ('034', 'Kajiado', 'Rift Valley', 1117840),
    ('035', 'Kericho', 'Rift Valley', 875689),
    ('036', 'Bomet', 'Rift Valley', 901777),
    ('037', 'Kakamega', 'Western', 1867579),
    ('038', 'Vihiga', 'Western', 590013),
    ('039', 'Bungoma', 'Western', 1670570),
    ('040', 'Busia', 'Western', 893681),
    ('041', 'Siaya', 'Nyanza', 993183),
    ('042', 'Kisumu', 'Nyanza', 1155574),
    ('043', 'Homa Bay', 'Nyanza', 1131950),
    ('044', 'Migori', 'Nyanza', 1116436),
    ('045', 'Kisii', 'Nyanza', 1266860),
    ('046', 'Nyamira', 'Nyanza', 605576),
    ('047', 'Nairobi', 'Nairobi', 4397073)
ON CONFLICT (code) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 5. DISEASE REPORTS TABLE
-- ═══════════════════════════════════════════════════════════════════════════════
-- 🎓 LEARNING: This stores actual disease case reports from health facilities

CREATE TABLE IF NOT EXISTS disease_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    disease_id UUID REFERENCES diseases(id) ON DELETE CASCADE,
    county_id UUID REFERENCES counties(id) ON DELETE CASCADE,
    reported_date DATE NOT NULL,
    confirmed_cases INTEGER NOT NULL DEFAULT 0,
    suspected_cases INTEGER DEFAULT 0,
    deaths INTEGER DEFAULT 0,
    recovered INTEGER DEFAULT 0,
    data_source VARCHAR(100),  -- e.g., 'DHIS2', 'Manual Entry'
    facility_name VARCHAR(200),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_reports_date ON disease_reports(reported_date);
CREATE INDEX IF NOT EXISTS idx_reports_county ON disease_reports(county_id);
CREATE INDEX IF NOT EXISTS idx_reports_disease ON disease_reports(disease_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 6. ALERTS TABLE
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    severity alert_severity NOT NULL DEFAULT 'info',
    disease_id UUID REFERENCES diseases(id),
    county_id UUID REFERENCES counties(id),
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alerts_active ON alerts(is_active) WHERE is_active = true;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 7. PREDICTIONS TABLE
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    disease_id UUID REFERENCES diseases(id),
    county_id UUID REFERENCES counties(id),
    prediction_date DATE NOT NULL,
    forecast_date DATE NOT NULL,
    predicted_cases INTEGER NOT NULL,
    lower_bound INTEGER,
    upper_bound INTEGER,
    risk_score DECIMAL(5, 2),
    confidence prediction_confidence,
    model_version VARCHAR(50),
    contributing_factors TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_predictions_county ON predictions(county_id);
CREATE INDEX IF NOT EXISTS idx_predictions_date ON predictions(prediction_date);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 8. USERS / PROFILES TABLE (extends Supabase Auth)
-- ═══════════════════════════════════════════════════════════════════════════════
-- 🎓 LEARNING: Supabase Auth handles auth.users automatically
-- We create a profiles table for additional user data

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255),
    full_name VARCHAR(200),
    organization_name VARCHAR(200),
    organization_type VARCHAR(100),
    county_id UUID REFERENCES counties(id),
    job_title VARCHAR(100),
    phone VARCHAR(20),
    is_admin BOOLEAN DEFAULT false,
    is_approved BOOLEAN DEFAULT false,  -- Admin must approve new users
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 9. ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════════════════════════════════
-- 🎓 LEARNING: RLS controls who can access what data
-- This is CRITICAL for security in Supabase

-- Enable RLS on all tables
ALTER TABLE diseases ENABLE ROW LEVEL SECURITY;
ALTER TABLE counties ENABLE ROW LEVEL SECURITY;
ALTER TABLE disease_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Public read access for diseases and counties (anyone can view)
CREATE POLICY "Diseases are viewable by everyone" ON diseases
    FOR SELECT USING (true);

CREATE POLICY "Counties are viewable by everyone" ON counties
    FOR SELECT USING (true);

-- Alerts are viewable by everyone
CREATE POLICY "Active alerts are viewable by everyone" ON alerts
    FOR SELECT USING (is_active = true);

-- Predictions are viewable by authenticated users
CREATE POLICY "Predictions viewable by authenticated users" ON predictions
    FOR SELECT USING (auth.role() = 'authenticated');

-- Disease reports: authenticated users can view, admins can edit
CREATE POLICY "Reports viewable by authenticated users" ON disease_reports
    FOR SELECT USING (auth.role() = 'authenticated');

-- Profiles: users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 10. FUNCTIONS & TRIGGERS
-- ═══════════════════════════════════════════════════════════════════════════════

-- Function to auto-update 'updated_at' timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables that have updated_at
CREATE TRIGGER set_updated_at_diseases
    BEFORE UPDATE ON diseases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_reports
    BEFORE UPDATE ON disease_reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_profiles
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to create profile after user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ═══════════════════════════════════════════════════════════════════════════════
-- DONE! Your database is ready.
-- ═══════════════════════════════════════════════════════════════════════════════
