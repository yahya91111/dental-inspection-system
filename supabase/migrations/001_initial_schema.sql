-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types
CREATE TYPE user_role AS ENUM ('admin', 'inspector');
CREATE TYPE facility_type AS ENUM ('clinic', 'medical_center', 'hospital', 'laboratory');
CREATE TYPE facility_status AS ENUM ('active', 'permanently_closed');
CREATE TYPE task_type AS ENUM ('inspection', 'follow_up', 'initial_review', 'final_review');
CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed', 'needs_revision', 'cancelled');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high');
CREATE TYPE file_type AS ENUM ('image', 'pdf', 'document');
CREATE TYPE audit_action AS ENUM ('create', 'update', 'delete', 'approve', 'reject');

-- =====================================================
-- TABLE 1: users (المستخدمون)
-- =====================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'inspector',
    full_name TEXT NOT NULL,
    phone TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ
);

-- Index for faster email lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- =====================================================
-- TABLE 2: facilities (المنشآت - القوالب)
-- =====================================================
CREATE TABLE facilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type facility_type NOT NULL,
    license_number TEXT UNIQUE,
    address TEXT,
    city TEXT,
    region TEXT,
    manager_name TEXT,
    manager_phone TEXT,
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    status facility_status DEFAULT 'active',
    working_hours JSONB,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_facilities_type ON facilities(type);
CREATE INDEX idx_facilities_status ON facilities(status);
CREATE INDEX idx_facilities_license ON facilities(license_number);

-- =====================================================
-- TABLE 3: tasks (المهام)
-- =====================================================
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    task_type task_type NOT NULL,
    status task_status DEFAULT 'pending',
    priority task_priority DEFAULT 'medium',
    assigned_by UUID NOT NULL REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    due_date DATE,
    completed_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_tasks_facility ON tasks(facility_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_assigned_by ON tasks(assigned_by);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);

-- =====================================================
-- TABLE 4: task_inspectors (علاقة المفتشين بالمهام)
-- =====================================================
CREATE TABLE task_inspectors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    inspector_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    UNIQUE(task_id, inspector_id)
);

-- Indexes
CREATE INDEX idx_task_inspectors_task ON task_inspectors(task_id);
CREATE INDEX idx_task_inspectors_inspector ON task_inspectors(inspector_id);

-- =====================================================
-- TABLE 5: task_responses (إجابات النماذج)
-- =====================================================
CREATE TABLE task_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    inspector_id UUID NOT NULL REFERENCES users(id),
    form_data JSONB,
    signature_data TEXT,
    stamp_image_url TEXT,
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    is_draft BOOLEAN DEFAULT true,
    submitted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_task_responses_task ON task_responses(task_id);
CREATE INDEX idx_task_responses_inspector ON task_responses(inspector_id);
CREATE INDEX idx_task_responses_draft ON task_responses(is_draft);

-- =====================================================
-- TABLE 6: attachments (المرفقات)
-- =====================================================
CREATE TABLE attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_response_id UUID NOT NULL REFERENCES task_responses(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_type file_type NOT NULL,
    file_size INTEGER,
    uploaded_by UUID NOT NULL REFERENCES users(id),
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_attachments_task_response ON attachments(task_response_id);
CREATE INDEX idx_attachments_uploaded_by ON attachments(uploaded_by);

-- =====================================================
-- TABLE 7: audit_log (سجل التعديلات)
-- =====================================================
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action audit_action NOT NULL,
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    changes JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_audit_log_user ON audit_log(user_id);
CREATE INDEX idx_audit_log_table ON audit_log(table_name);
CREATE INDEX idx_audit_log_record ON audit_log(record_id);
CREATE INDEX idx_audit_log_created ON audit_log(created_at);

-- =====================================================
-- TRIGGERS: Update updated_at timestamps
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_facilities_updated_at BEFORE UPDATE ON facilities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_task_responses_updated_at BEFORE UPDATE ON task_responses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_inspectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Users Table Policies
CREATE POLICY "Users can view their own data" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id::text = auth.uid()::text
            AND role = 'admin'
        )
    );

CREATE POLICY "Admins can insert users" ON users
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE id::text = auth.uid()::text
            AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update users" ON users
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id::text = auth.uid()::text
            AND role = 'admin'
        )
    );

-- Facilities Table Policies
CREATE POLICY "Anyone authenticated can view facilities" ON facilities
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can insert facilities" ON facilities
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE id::text = auth.uid()::text
            AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update facilities" ON facilities
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id::text = auth.uid()::text
            AND role = 'admin'
        )
    );

-- Tasks Table Policies
CREATE POLICY "Admins can view all tasks" ON tasks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id::text = auth.uid()::text
            AND role = 'admin'
        )
    );

CREATE POLICY "Inspectors can view their assigned tasks" ON tasks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM task_inspectors
            WHERE task_id = tasks.id
            AND inspector_id::text = auth.uid()::text
        )
    );

CREATE POLICY "Admins can insert tasks" ON tasks
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE id::text = auth.uid()::text
            AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update tasks" ON tasks
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id::text = auth.uid()::text
            AND role = 'admin'
        )
    );

-- Task Inspectors Policies
CREATE POLICY "Anyone can view task inspectors" ON task_inspectors
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage task inspectors" ON task_inspectors
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id::text = auth.uid()::text
            AND role = 'admin'
        )
    );

-- Task Responses Policies
CREATE POLICY "Inspectors can view their own responses" ON task_responses
    FOR SELECT USING (inspector_id::text = auth.uid()::text);

CREATE POLICY "Admins can view all responses" ON task_responses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id::text = auth.uid()::text
            AND role = 'admin'
        )
    );

CREATE POLICY "Inspectors can insert their own responses" ON task_responses
    FOR INSERT WITH CHECK (inspector_id::text = auth.uid()::text);

CREATE POLICY "Inspectors can update their own responses" ON task_responses
    FOR UPDATE USING (inspector_id::text = auth.uid()::text);

-- Attachments Policies
CREATE POLICY "Users can view attachments for their tasks" ON attachments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM task_responses tr
            WHERE tr.id = attachments.task_response_id
            AND (
                tr.inspector_id::text = auth.uid()::text
                OR EXISTS (
                    SELECT 1 FROM users
                    WHERE id::text = auth.uid()::text
                    AND role = 'admin'
                )
            )
        )
    );

CREATE POLICY "Users can insert their own attachments" ON attachments
    FOR INSERT WITH CHECK (uploaded_by::text = auth.uid()::text);

-- Audit Log Policies
CREATE POLICY "Admins can view audit log" ON audit_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id::text = auth.uid()::text
            AND role = 'admin'
        )
    );

CREATE POLICY "System can insert audit log" ON audit_log
    FOR INSERT WITH CHECK (true);
