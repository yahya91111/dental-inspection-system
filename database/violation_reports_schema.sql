-- =====================================================
-- Violation Reports Table Schema
-- =====================================================
-- This table stores individual violation reports
-- Multiple reports can exist for a single visit
-- =====================================================

CREATE TABLE IF NOT EXISTS violation_reports (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign Keys
  visit_id UUID NOT NULL,

  -- Report Metadata
  report_number INTEGER NOT NULL,

  -- معلومات أساسية (مشتركة من المحضر الأول)
  inspector1_name TEXT NOT NULL,
  inspector2_name TEXT NOT NULL,
  inspector3_name TEXT,
  inspection_date TEXT NOT NULL,
  inspection_day TEXT,
  inspection_time TEXT,

  -- معلومات الموقع (مشتركة من المحضر الأول)
  facility_name TEXT NOT NULL,
  area TEXT,
  block TEXT,
  street TEXT,
  plot_number TEXT,
  floor TEXT,

  -- المخالفات (مختلفة لكل محضر)
  violations_list JSONB NOT NULL DEFAULT '[]',

  -- معلومات المواجهة (مختلفة لكل محضر)
  confronted_person TEXT,
  person_title TEXT,
  statement TEXT,

  -- توقيع المخالف (مختلف لكل محضر)
  violator_signature TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),

  -- Constraints
  CONSTRAINT unique_visit_report_number UNIQUE(visit_id, report_number)
);

-- =====================================================
-- Indexes for Performance
-- =====================================================

-- Index on visit_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_violation_reports_visit_id
ON violation_reports(visit_id);

-- Index on report_number for sorting
CREATE INDEX IF NOT EXISTS idx_violation_reports_report_number
ON violation_reports(report_number);

-- Index on created_at for time-based queries
CREATE INDEX IF NOT EXISTS idx_violation_reports_created_at
ON violation_reports(created_at DESC);

-- =====================================================
-- Row Level Security (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE violation_reports ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for everyone (you can restrict this later)
CREATE POLICY "Allow all operations on violation reports"
ON violation_reports
USING (true)
WITH CHECK (true);

-- =====================================================
-- Trigger for Updated At
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_violation_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function
DROP TRIGGER IF EXISTS update_violation_reports_updated_at_trigger ON violation_reports;
CREATE TRIGGER update_violation_reports_updated_at_trigger
BEFORE UPDATE ON violation_reports
FOR EACH ROW
EXECUTE FUNCTION update_violation_reports_updated_at();

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON TABLE violation_reports IS 'Stores individual violation reports - multiple reports can exist per visit';
COMMENT ON COLUMN violation_reports.id IS 'Unique identifier for each violation report';
COMMENT ON COLUMN violation_reports.visit_id IS 'Reference to the visit this report belongs to';
COMMENT ON COLUMN violation_reports.report_number IS 'Sequential number of the report (1, 2, 3, etc.)';
COMMENT ON COLUMN violation_reports.violations_list IS 'JSON array of violations with id and text fields';
COMMENT ON COLUMN violation_reports.violator_signature IS 'Base64 encoded PNG image of the violator signature';
