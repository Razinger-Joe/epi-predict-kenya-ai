-- ML Training Data Table
-- Stores historical observations for training prediction models

CREATE TABLE IF NOT EXISTS training_data (
  id BIGSERIAL PRIMARY KEY,
  county TEXT NOT NULL,
  disease TEXT NOT NULL,
  
  -- Environmental factors
  temperature DECIMAL(5, 2) NOT NULL,
  humidity DECIMAL(5, 2) NOT NULL,
  rainfall DECIMAL(8, 2) NOT NULL,
  
  -- Health factors
  population_density DECIMAL(10, 2) NOT NULL,
  access_to_water DECIMAL(5, 2) DEFAULT 0,
  healthcare_coverage DECIMAL(5, 2) DEFAULT 0,
  
  -- Disease factors
  previous_cases INTEGER DEFAULT 0,
  vaccination_rate DECIMAL(5, 2) DEFAULT 0,
  
  -- Outcome
  outbreak_occurred BOOLEAN NOT NULL,
  cases_reported INTEGER DEFAULT 0,
  
  -- Metadata
  observation_date TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraints
  CHECK (humidity >= 0 AND humidity <= 100),
  CHECK (rainfall >= 0),
  CHECK (population_density >= 0),
  CHECK (access_to_water >= 0 AND access_to_water <= 100),
  CHECK (healthcare_coverage >= 0 AND healthcare_coverage <= 100),
  CHECK (previous_cases >= 0),
  CHECK (vaccination_rate >= 0 AND vaccination_rate <= 100),
  CHECK (cases_reported >= 0)
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_training_data_county ON training_data(county);
CREATE INDEX IF NOT EXISTS idx_training_data_disease ON training_data(disease);
CREATE INDEX IF NOT EXISTS idx_training_data_county_disease ON training_data(county, disease);
CREATE INDEX IF NOT EXISTS idx_training_data_date ON training_data(observation_date);
CREATE INDEX IF NOT EXISTS idx_training_data_outbreak ON training_data(outbreak_occurred);

-- ML Model Metadata Table
-- Stores information about trained models

CREATE TABLE IF NOT EXISTS ml_model_metadata (
  id BIGSERIAL PRIMARY KEY,
  model_name TEXT NOT NULL UNIQUE,
  disease TEXT,
  model_version TEXT NOT NULL,
  
  -- Performance metrics
  accuracy DECIMAL(5, 4),
  precision DECIMAL(5, 4),
  recall DECIMAL(5, 4),
  f1_score DECIMAL(5, 4),
  
  -- Training info
  trained_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  training_samples INTEGER,
  test_samples INTEGER,
  features TEXT[] DEFAULT '{temperature,humidity,rainfall,population_density,access_to_water,healthcare_coverage,previous_cases,vaccination_rate}'::TEXT[],
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for model queries
CREATE INDEX IF NOT EXISTS idx_model_metadata_disease ON ml_model_metadata(disease);
CREATE INDEX IF NOT EXISTS idx_model_metadata_active ON ml_model_metadata(is_active);

-- Prediction History Table
-- Stores all predictions made for auditing and analysis

CREATE TABLE IF NOT EXISTS prediction_history (
  id BIGSERIAL PRIMARY KEY,
  county TEXT NOT NULL,
  disease TEXT NOT NULL,
  
  -- Input features
  temperature DECIMAL(5, 2),
  humidity DECIMAL(5, 2),
  rainfall DECIMAL(8, 2),
  population_density DECIMAL(10, 2),
  access_to_water DECIMAL(5, 2),
  healthcare_coverage DECIMAL(5, 2),
  previous_cases INTEGER,
  vaccination_rate DECIMAL(5, 2),
  
  -- Prediction results
  risk_level TEXT NOT NULL,
  outbreak_probability DECIMAL(5, 4),
  confidence_score DECIMAL(5, 4),
  predicted_cases INTEGER,
  
  -- Model info
  model_version TEXT,
  model_accuracy DECIMAL(5, 4),
  
  -- Actual outcome (for model evaluation)
  actual_outcome_occurred BOOLEAN,
  actual_cases_reported INTEGER,
  prediction_correct BOOLEAN,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for prediction queries
CREATE INDEX IF NOT EXISTS idx_prediction_history_county ON prediction_history(county);
CREATE INDEX IF NOT EXISTS idx_prediction_history_disease ON prediction_history(disease);
CREATE INDEX IF NOT EXISTS idx_prediction_history_risk ON prediction_history(risk_level);
CREATE INDEX IF NOT EXISTS idx_prediction_history_date ON prediction_history(created_at);

-- View: Training Data Summary
-- Quick access to key statistics

CREATE OR REPLACE VIEW training_data_summary AS
SELECT 
  county,
  disease,
  COUNT(*) as total_records,
  SUM(CASE WHEN outbreak_occurred THEN 1 ELSE 0 END) as outbreak_count,
  AVG(temperature) as avg_temperature,
  AVG(humidity) as avg_humidity,
  AVG(rainfall) as avg_rainfall,
  AVG(previous_cases) as avg_previous_cases,
  AVG(vaccination_rate) as avg_vaccination_rate,
  MAX(observation_date) as last_observation
FROM training_data
GROUP BY county, disease;

-- View: Prediction Performance
-- Analyze prediction accuracy over time

CREATE OR REPLACE VIEW prediction_performance AS
SELECT 
  disease,
  model_version,
  risk_level,
  COUNT(*) as prediction_count,
  SUM(CASE WHEN prediction_correct THEN 1 ELSE 0 END) as correct_predictions,
  ROUND(100.0 * SUM(CASE WHEN prediction_correct THEN 1 ELSE 0 END) / COUNT(*), 2) as accuracy_percentage,
  DATE_TRUNC('day', created_at) as prediction_date
FROM prediction_history
WHERE prediction_correct IS NOT NULL
GROUP BY disease, model_version, risk_level, DATE_TRUNC('day', created_at)
ORDER BY prediction_date DESC;

-- Enable Row Level Security (optional but recommended)
-- ALTER TABLE training_data ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE ml_model_metadata ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE prediction_history ENABLE ROW LEVEL SECURITY;

-- Grants (if using authenticated users)
-- GRANT SELECT, INSERT, UPDATE ON training_data TO authenticated;
-- GRANT SELECT, INSERT ON prediction_history TO authenticated;
-- GRANT SELECT ON ml_model_metadata TO authenticated;
