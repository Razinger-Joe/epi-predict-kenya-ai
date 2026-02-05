-- Migration: Health Operators & Insight Reports
-- Created: 2026-02-05
-- Description: Tables for health operator verification and social media insight reports

-- ═══════════════════════════════════════════════════════════════════════════════
-- Health Operators Table
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS health_operators (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    organization TEXT NOT NULL,
    license_number TEXT NOT NULL,
    county TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'doctor' CHECK (role IN ('doctor', 'nurse', 'pharmacist', 'lab_technician', 'health_officer')),
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by UUID REFERENCES auth.users(id),
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_health_operators_email ON health_operators(email);
CREATE INDEX IF NOT EXISTS idx_health_operators_verified ON health_operators(is_verified);
CREATE INDEX IF NOT EXISTS idx_health_operators_county ON health_operators(county);

-- ═══════════════════════════════════════════════════════════════════════════════
-- Insight Reports Table
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS insight_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    operator_id UUID REFERENCES health_operators(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    file_path TEXT,
    content_summary TEXT,
    source_type TEXT NOT NULL DEFAULT 'social_media' CHECK (source_type IN ('social_media', 'field_observation', 'lab_report', 'pdf_upload')),
    county TEXT NOT NULL,
    disease_indicators JSONB DEFAULT '[]'::jsonb,
    severity_score INTEGER DEFAULT 0 CHECK (severity_score >= 0 AND severity_score <= 100),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'analyzing', 'analyzed', 'verified', 'rejected')),
    verified_by UUID REFERENCES auth.users(id),
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_insight_reports_operator ON insight_reports(operator_id);
CREATE INDEX IF NOT EXISTS idx_insight_reports_county ON insight_reports(county);
CREATE INDEX IF NOT EXISTS idx_insight_reports_status ON insight_reports(status);
CREATE INDEX IF NOT EXISTS idx_insight_reports_severity ON insight_reports(severity_score);

-- ═══════════════════════════════════════════════════════════════════════════════
-- Row Level Security (RLS)
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE health_operators ENABLE ROW LEVEL SECURITY;
ALTER TABLE insight_reports ENABLE ROW LEVEL SECURITY;

-- Health Operators Policies
CREATE POLICY "Operators can view own profile" ON health_operators
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all operators" ON health_operators
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM health_operators 
            WHERE user_id = auth.uid() AND role = 'health_officer' AND is_verified = true
        )
    );

CREATE POLICY "Anyone can register as operator" ON health_operators
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update operators" ON health_operators
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM health_operators 
            WHERE user_id = auth.uid() AND role = 'health_officer' AND is_verified = true
        )
    );

-- Insight Reports Policies
CREATE POLICY "Verified operators can create reports" ON insight_reports
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM health_operators 
            WHERE id = operator_id AND is_verified = true
        )
    );

CREATE POLICY "Anyone can view verified reports" ON insight_reports
    FOR SELECT USING (status = 'verified');

CREATE POLICY "Operators can view own reports" ON insight_reports
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM health_operators 
            WHERE id = operator_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can update reports" ON insight_reports
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM health_operators 
            WHERE user_id = auth.uid() AND role = 'health_officer' AND is_verified = true
        )
    );

-- ═══════════════════════════════════════════════════════════════════════════════
-- Trigger for updated_at
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_health_operators_updated_at
    BEFORE UPDATE ON health_operators
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_insight_reports_updated_at
    BEFORE UPDATE ON insight_reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
