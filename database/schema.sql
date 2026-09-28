-- GroundFix PostgreSQL / Supabase Schema
-- Tagline: Report. Fix. Safer Roads.

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- 1. DEPARTMENTS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 2. COMPLAINTS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id VARCHAR(20) UNIQUE NOT NULL,
    hazard_type VARCHAR(50) NOT NULL, -- pothole, damaged_road, open_manhole, road_obstruction, broken_infrastructure, other
    description TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    road_name VARCHAR(255),
    severity VARCHAR(20) NOT NULL, -- Low, Medium, High, Critical
    risk_score INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'Reported', -- Reported, Verified, Assigned, In Progress, Resolved, Reopened, Rejected
    image_url TEXT,
    image_auth_status VARCHAR(50) DEFAULT 'Likely Authentic', -- Likely Authentic, Suspicious, Potentially AI Generated, Manual Review, Rejected
    image_auth_score INTEGER DEFAULT 85,
    image_auth_reason TEXT,
    before_image_url TEXT,
    after_image_url TEXT,
    confirmation_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 3. STATUS HISTORY TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id VARCHAR(20) NOT NULL REFERENCES complaints(complaint_id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 4. CONFIRMATIONS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS confirmations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id VARCHAR(20) NOT NULL REFERENCES complaints(complaint_id) ON DELETE CASCADE,
    client_identifier VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_complaint_client UNIQUE (complaint_id, client_identifier)
);

-- ==========================================
-- 5. NEAR MISS REPORTS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS near_miss_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id VARCHAR(20) NOT NULL REFERENCES complaints(complaint_id) ON DELETE CASCADE,
    near_miss_type VARCHAR(100) NOT NULL, -- Almost crashed, Almost fell, Vehicle damaged, Difficult for pedestrians, Accessibility issue, Traffic obstruction
    details TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 6. ASSIGNMENTS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id VARCHAR(20) NOT NULL REFERENCES complaints(complaint_id) ON DELETE CASCADE,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    assigned_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- INDEXES FOR PERFORMANCE & SEARCH
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_complaints_complaint_id ON complaints(complaint_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_severity ON complaints(severity);
CREATE INDEX IF NOT EXISTS idx_complaints_risk_score ON complaints(risk_score);
CREATE INDEX IF NOT EXISTS idx_complaints_road_name ON complaints(road_name);
CREATE INDEX IF NOT EXISTS idx_complaints_lat_long ON complaints(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_status_history_complaint_id ON status_history(complaint_id);
CREATE INDEX IF NOT EXISTS idx_confirmations_complaint_id ON confirmations(complaint_id);
CREATE INDEX IF NOT EXISTS idx_near_miss_complaint_id ON near_miss_reports(complaint_id);

-- ==========================================
-- STORAGE BUCKET CREATION (Supabase)
-- ==========================================
-- In Supabase SQL Editor:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('groundfix-images', 'groundfix-images', true) ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- SAMPLE DEMO DATA (Realistic Urban Roads)
-- ==========================================
INSERT INTO departments (id, name, description) VALUES
('d1111111-1111-1111-1111-111111111111', 'Road Infrastructure & Paving', 'Handles asphalt repair, pothole filling, and road resurfacing'),
('d2222222-2222-2222-2222-222222222222', 'Drainage & Stormwater Works', 'Manages manhole covers, storm drains, and flood mitigation'),
('d3333333-3333-3333-3333-333333333333', 'Traffic & Pedestrian Safety', 'Maintains guard rails, speed breakers, dividers, and signs'),
('d4444444-4444-4444-4444-444444444444', 'Emergency Hazard Response', 'Rapid intervention for high-risk and road-blocking hazards')
ON CONFLICT (name) DO NOTHING;

-- Insert sample complaints
INSERT INTO complaints (
    complaint_id, hazard_type, description, latitude, longitude, road_name,
    severity, risk_score, status, image_url, image_auth_status, image_auth_score,
    image_auth_reason, before_image_url, after_image_url, confirmation_count, created_at, updated_at
) VALUES
(
    'POT-1001',
    'pothole',
    'Deep crater pothole in the middle lane right after the intersection. Waterlogged during rains.',
    12.9716, 77.5946, 'MG Road (near Trinity Junction)',
    'Critical', 94, 'In Progress',
    'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
    'Likely Authentic', 92, 'Valid camera EXIF sensor profile and natural depth variance verified',
    'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
    NULL,
    14,
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '4 hours'
),
(
    'POT-1002',
    'open_manhole',
    'Uncovered storm drain manhole on the pedestrian walkway and bike lane edge. Very dangerous at night.',
    12.9352, 77.6245, 'Koramangala 80 Feet Road',
    'Critical', 91, 'Assigned',
    'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?w=800&auto=format&fit=crop&q=80',
    'Likely Authentic', 89, 'Texture gradient consistent with authentic street photography',
    'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?w=800&auto=format&fit=crop&q=80',
    NULL,
    9,
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '1 day'
),
(
    'POT-1003',
    'damaged_road',
    'Severe road depression and cracked asphalt spanning two lanes causing sudden braking.',
    12.9784, 77.6408, 'Indiranagar 100 Feet Road',
    'High', 78, 'Verified',
    'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=800&auto=format&fit=crop&q=80',
    'Likely Authentic', 87, 'Original image dimensions and compression matches device camera',
    NULL, NULL,
    6,
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '12 hours'
),
(
    'POT-1004',
    'road_obstruction',
    'Fallen concrete barrier and construction debris partially blocking left lane.',
    12.9912, 77.6874, 'Whitefield Main Road',
    'High', 72, 'Reported',
    'https://images.unsplash.com/photo-1584463699042-4e963c683794?w=800&auto=format&fit=crop&q=80',
    'Likely Authentic', 85, 'Authentic citizen mobile submission',
    NULL, NULL,
    3,
    NOW() - INTERVAL '6 hours',
    NOW() - INTERVAL '6 hours'
),
(
    'POT-1005',
    'broken_infrastructure',
    'Damaged storm grate with sharp bent metal edges sticking out.',
    12.9279, 77.6271, 'Outer Ring Road (near Bellandur flyover)',
    'Medium', 52, 'Reported',
    'https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?w=800&auto=format&fit=crop&q=80',
    'Manual Review', 68, 'Sub-optimal lighting, queued for manual officer review',
    NULL, NULL,
    2,
    NOW() - INTERVAL '10 hours',
    NOW() - INTERVAL '10 hours'
),
(
    'POT-1006',
    'pothole',
    'Large pothole filled and hot-rolled with new asphalt overlay. Verified smooth surface.',
    12.9698, 77.7499, 'ITPL Main Road',
    'High', 30, 'Resolved',
    'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
    'Likely Authentic', 95, 'High confidence verification passed',
    'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800&auto=format&fit=crop&q=80',
    8,
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '1 day'
),
(
    'POT-1007',
    'pothole',
    'Temporary gravel wash washed out by rain. Citizens reported road deteriorated again.',
    12.9165, 77.6101, 'Bannerghatta Road',
    'High', 84, 'Reopened',
    'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=800&auto=format&fit=crop&q=80',
    'Likely Authentic', 90, 'Citizen re-verification confirmed patch failed',
    'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=800&auto=format&fit=crop&q=80',
    NULL,
    11,
    NOW() - INTERVAL '6 days',
    NOW() - INTERVAL '3 hours'
)
ON CONFLICT (complaint_id) DO NOTHING;

-- Status history records
INSERT INTO status_history (complaint_id, status, note, created_at) VALUES
('POT-1001', 'Reported', 'Report filed by citizen with geo-tagged photo', NOW() - INTERVAL '3 days'),
('POT-1001', 'Verified', 'Field officer verified crater depth (>15cm) on major transit artery', NOW() - INTERVAL '2 days'),
('POT-1001', 'Assigned', 'Assigned to Road Infrastructure & Paving rapid team', NOW() - INTERVAL '1 day'),
('POT-1001', 'In Progress', 'Cold-mix asphalt patch team dispatched; cordoned off', NOW() - INTERVAL '4 hours'),

('POT-1002', 'Reported', 'Open storm manhole reported near evening peak hours', NOW() - INTERVAL '2 days'),
('POT-1002', 'Verified', 'Critical risk confirmed by area inspector; barricades placed', NOW() - INTERVAL '36 hours'),
('POT-1002', 'Assigned', 'Assigned to Drainage & Stormwater Works for replacement cast-iron cover', NOW() - INTERVAL '1 day'),

('POT-1003', 'Reported', 'Asphalt subsidence reported on 100ft road', NOW() - INTERVAL '1 day'),
('POT-1003', 'Verified', 'Road safety inspector confirmed high vibration and lane swerving risk', NOW() - INTERVAL '12 hours'),

('POT-1004', 'Reported', 'Citizen report logged with mobile photo', NOW() - INTERVAL '6 hours'),
('POT-1005', 'Reported', 'Citizen report logged with mobile photo', NOW() - INTERVAL '10 hours'),

('POT-1006', 'Reported', 'Reported by local commuter', NOW() - INTERVAL '5 days'),
('POT-1006', 'Verified', 'Pothole marked on municipal repair roster', NOW() - INTERVAL '4 days'),
('POT-1006', 'Assigned', 'Assigned to Paving contractor', NOW() - INTERVAL '3 days'),
('POT-1006', 'In Progress', 'Milling and resurfacing ongoing', NOW() - INTERVAL '2 days'),
('POT-1006', 'Resolved', 'Pothole patched with asphalt and rolled flat. After-repair proof verified by municipal engineer.', NOW() - INTERVAL '1 day'),

('POT-1007', 'Reported', 'Initial report submitted', NOW() - INTERVAL '6 days'),
('POT-1007', 'Resolved', 'Initial temporary gravel fill applied', NOW() - INTERVAL '2 days'),
('POT-1007', 'Reopened', 'Citizen re-verification reported patch washed away after rainstorm. Hazard still exists.', NOW() - INTERVAL '3 hours')
ON CONFLICT DO NOTHING;

-- Near miss records
INSERT INTO near_miss_reports (complaint_id, near_miss_type, details, created_at) VALUES
('POT-1001', 'Almost crashed', 'Two-wheeler swerved violently into oncoming bus lane to avoid deep hole.', NOW() - INTERVAL '2 days'),
('POT-1001', 'Vehicle damaged', 'Car rim bent and tire burst when hitting crater in rain.', NOW() - INTERVAL '30 hours'),
('POT-1001', 'Almost fell', 'Scooter rider lost balance in the wet trench.', NOW() - INTERVAL '12 hours'),
('POT-1002', 'Almost fell', 'Pedestrian walking in dark almost stepped into open manhole.', NOW() - INTERVAL '36 hours'),
('POT-1002', 'Vehicle damaged', 'Auto-rickshaw wheel caught inside edge.', NOW() - INTERVAL '24 hours'),
('POT-1003', 'Traffic obstruction', 'Cars braking suddenly from 50km/h creating tailback.', NOW() - INTERVAL '10 hours'),
('POT-1007', 'Vehicle damaged', 'Suspension hit hard bottom on failed patch.', NOW() - INTERVAL '2 hours')
ON CONFLICT DO NOTHING;

-- Confirmations
INSERT INTO confirmations (complaint_id, client_identifier, created_at) VALUES
('POT-1001', 'demo_client_alpha_1', NOW() - INTERVAL '2 days'),
('POT-1001', 'demo_client_alpha_2', NOW() - INTERVAL '1 day'),
('POT-1002', 'demo_client_beta_1', NOW() - INTERVAL '30 hours'),
('POT-1003', 'demo_client_gamma_1', NOW() - INTERVAL '8 hours'),
('POT-1007', 'demo_client_delta_1', NOW() - INTERVAL '4 hours')
ON CONFLICT DO NOTHING;
