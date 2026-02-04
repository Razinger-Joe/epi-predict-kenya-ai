-- ═══════════════════════════════════════════════════════════════════════════════
-- 11. SECURE RLS FOR ML TABLES
-- ═══════════════════════════════════════════════════════════════════════════════
-- 🎓 LEARNING: Secure the new ML tables created in 002_ml_tables.sql

-- Enable RLS
ALTER TABLE training_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_model_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE prediction_history ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════════════════════
-- POLICIES
-- ═══════════════════════════════════════════════════════════════════════════════

-- 1. Training Data
-- Authenticated users (Health Workers) can view training data
CREATE POLICY "Training data viewable by authenticated users" ON training_data
    FOR SELECT USING (auth.role() = 'authenticated');

-- Authenticated users can contribute new training data points
CREATE POLICY "Authenticated users can insert training data" ON training_data
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 2. ML Model Metadata
-- Everyone (including public) needs to know which model is active to trust predictions
-- But let's restrict to authenticated for safety, or public if used on landing page
CREATE POLICY "Model metadata viewable by everyone" ON ml_model_metadata
    FOR SELECT USING (true);

-- Only admins/service role can update models (implicitly handled if no policy for INSERT/UPDATE)

-- 3. Prediction History
-- Authenticated users can view history
CREATE POLICY "Prediction history viewable by authenticated users" ON prediction_history
    FOR SELECT USING (auth.role() = 'authenticated');

-- Authenticated users (via API) can log predictions
CREATE POLICY "Authenticated users can insert prediction history" ON prediction_history
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');
