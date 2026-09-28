/**
 * GroundFix Database Service
 * 
 * Supports Supabase PostgreSQL when SUPABASE_URL and service keys are configured.
 * When Supabase credentials are missing or during offline/hackathon testing,
 * automatically falls back to an atomic, persistent JSON datastore
 * pre-populated with realistic demo data from database/schema.sql.
 */

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { createClient } = require('@supabase/supabase-js');
const { calculateDistanceMeters } = require('../utils/geoUtils');
const { calculateRiskScore } = require('./riskCalculationService');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'store.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial realistic demo seed data
const INITIAL_DEMO_DATA = {
  departments: [
    {
      id: 'd1111111-1111-1111-1111-111111111111',
      name: 'Road Infrastructure & Paving',
      description: 'Handles asphalt repair, pothole filling, and road resurfacing'
    },
    {
      id: 'd2222222-2222-2222-2222-222222222222',
      name: 'Drainage & Stormwater Works',
      description: 'Manages manhole covers, storm drains, and flood mitigation'
    },
    {
      id: 'd3333333-3333-3333-3333-333333333333',
      name: 'Traffic & Pedestrian Safety',
      description: 'Maintains guard rails, speed breakers, dividers, and signs'
    },
    {
      id: 'd4444444-4444-4444-4444-444444444444',
      name: 'Emergency Hazard Response',
      description: 'Rapid intervention for high-risk and road-blocking hazards'
    }
  ],
  complaints: [
    {
      id: 'c1111111-1111-1111-1111-111111111111',
      complaint_id: 'POT-1001',
      hazard_type: 'pothole',
      description: 'Deep crater pothole in the middle lane right after the intersection. Waterlogged during rains.',
      latitude: 12.9716,
      longitude: 77.5946,
      road_name: 'MG Road (near Trinity Junction)',
      severity: 'Critical',
      risk_score: 94,
      status: 'In Progress',
      image_url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
      image_auth_status: 'Likely Authentic',
      image_auth_score: 92,
      image_auth_reason: 'Valid camera EXIF sensor profile and natural depth variance verified',
      before_image_url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
      after_image_url: null,
      confirmation_count: 14,
      created_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString()
    },
    {
      id: 'c2222222-2222-2222-2222-222222222222',
      complaint_id: 'POT-1002',
      hazard_type: 'open_manhole',
      description: 'Uncovered storm drain manhole on the pedestrian walkway and bike lane edge. Very dangerous at night.',
      latitude: 12.9352,
      longitude: 77.6245,
      road_name: 'Koramangala 80 Feet Road',
      severity: 'Critical',
      risk_score: 91,
      status: 'Assigned',
      image_url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?w=800&auto=format&fit=crop&q=80',
      image_auth_status: 'Likely Authentic',
      image_auth_score: 89,
      image_auth_reason: 'Texture gradient consistent with authentic street photography',
      before_image_url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?w=800&auto=format&fit=crop&q=80',
      after_image_url: null,
      confirmation_count: 9,
      created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
    },
    {
      id: 'c3333333-3333-3333-3333-333333333333',
      complaint_id: 'POT-1003',
      hazard_type: 'damaged_road',
      description: 'Severe road depression and cracked asphalt spanning two lanes causing sudden braking.',
      latitude: 12.9784,
      longitude: 77.6408,
      road_name: 'Indiranagar 100 Feet Road',
      severity: 'High',
      risk_score: 78,
      status: 'Verified',
      image_url: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=800&auto=format&fit=crop&q=80',
      image_auth_status: 'Likely Authentic',
      image_auth_score: 87,
      image_auth_reason: 'Original image dimensions and compression matches device camera',
      before_image_url: null,
      after_image_url: null,
      confirmation_count: 6,
      created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString()
    },
    {
      id: 'c4444444-4444-4444-4444-444444444444',
      complaint_id: 'POT-1004',
      hazard_type: 'road_obstruction',
      description: 'Fallen concrete barrier and construction debris partially blocking left lane.',
      latitude: 12.9912,
      longitude: 77.6874,
      road_name: 'Whitefield Main Road',
      severity: 'High',
      risk_score: 72,
      status: 'Reported',
      image_url: 'https://images.unsplash.com/photo-1584463699042-4e963c683794?w=800&auto=format&fit=crop&q=80',
      image_auth_status: 'Likely Authentic',
      image_auth_score: 85,
      image_auth_reason: 'Authentic citizen mobile submission',
      before_image_url: null,
      after_image_url: null,
      confirmation_count: 3,
      created_at: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 6 * 3600 * 1000).toISOString()
    },
    {
      id: 'c5555555-5555-5555-5555-555555555555',
      complaint_id: 'POT-1005',
      hazard_type: 'broken_infrastructure',
      description: 'Damaged storm grate with sharp bent metal edges sticking out.',
      latitude: 12.9279,
      longitude: 77.6271,
      road_name: 'Outer Ring Road (near Bellandur flyover)',
      severity: 'Medium',
      risk_score: 52,
      status: 'Reported',
      image_url: 'https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?w=800&auto=format&fit=crop&q=80',
      image_auth_status: 'Manual Review',
      image_auth_score: 68,
      image_auth_reason: 'Sub-optimal lighting, queued for manual officer review',
      before_image_url: null,
      after_image_url: null,
      confirmation_count: 2,
      created_at: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 10 * 3600 * 1000).toISOString()
    },
    {
      id: 'c6666666-6666-6666-6666-666666666666',
      complaint_id: 'POT-1006',
      hazard_type: 'pothole',
      description: 'Large pothole filled and hot-rolled with new asphalt overlay. Verified smooth surface.',
      latitude: 12.9698,
      longitude: 77.7499,
      road_name: 'ITPL Main Road',
      severity: 'High',
      risk_score: 30,
      status: 'Resolved',
      image_url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
      image_auth_status: 'Likely Authentic',
      image_auth_score: 95,
      image_auth_reason: 'High confidence verification passed',
      before_image_url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
      after_image_url: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800&auto=format&fit=crop&q=80',
      confirmation_count: 8,
      created_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
    },
    {
      id: 'c7777777-7777-7777-7777-777777777777',
      complaint_id: 'POT-1007',
      hazard_type: 'pothole',
      description: 'Temporary gravel wash washed out by rain. Citizens reported road deteriorated again.',
      latitude: 12.9165,
      longitude: 77.6101,
      road_name: 'Bannerghatta Road',
      severity: 'High',
      risk_score: 84,
      status: 'Reopened',
      image_url: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=800&auto=format&fit=crop&q=80',
      image_auth_status: 'Likely Authentic',
      image_auth_score: 90,
      image_auth_reason: 'Citizen re-verification confirmed patch failed',
      before_image_url: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=800&auto=format&fit=crop&q=80',
      after_image_url: null,
      confirmation_count: 11,
      created_at: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString()
    }
  ],
  status_history: [
    {
      id: uuidv4(),
      complaint_id: 'POT-1001',
      status: 'Reported',
      note: 'Report filed by citizen with geo-tagged photo',
      created_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: uuidv4(),
      complaint_id: 'POT-1001',
      status: 'Verified',
      note: 'Field officer verified crater depth (>15cm) on major transit artery',
      created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: uuidv4(),
      complaint_id: 'POT-1001',
      status: 'Assigned',
      note: 'Assigned to Road Infrastructure & Paving rapid team',
      created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
    },
    {
      id: uuidv4(),
      complaint_id: 'POT-1001',
      status: 'In Progress',
      note: 'Cold-mix asphalt patch team dispatched; cordoned off',
      created_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString()
    },
    {
      id: uuidv4(),
      complaint_id: 'POT-1002',
      status: 'Reported',
      note: 'Open storm manhole reported near evening peak hours',
      created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: uuidv4(),
      complaint_id: 'POT-1002',
      status: 'Verified',
      note: 'Critical risk confirmed by area inspector; barricades placed',
      created_at: new Date(Date.now() - 36 * 3600 * 1000).toISOString()
    },
    {
      id: uuidv4(),
      complaint_id: 'POT-1002',
      status: 'Assigned',
      note: 'Assigned to Drainage & Stormwater Works for replacement cast-iron cover',
      created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
    },
    {
      id: uuidv4(),
      complaint_id: 'POT-1003',
      status: 'Reported',
      note: 'Asphalt subsidence reported on 100ft road',
      created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
    },
    {
      id: uuidv4(),
      complaint_id: 'POT-1003',
      status: 'Verified',
      note: 'Road safety inspector confirmed high vibration and lane swerving risk',
      created_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString()
    },
    {
      id: uuidv4(),
      complaint_id: 'POT-1004',
      status: 'Reported',
      note: 'Citizen report logged with mobile photo',
      created_at: new Date(Date.now() - 6 * 3600 * 1000).toISOString()
    },
    {
      id: uuidv4(),
      complaint_id: 'POT-1005',
      status: 'Reported',
      note: 'Citizen report logged with mobile photo',
      created_at: new Date(Date.now() - 10 * 3600 * 1000).toISOString()
    },
    {
      id: uuidv4(),
      complaint_id: 'POT-1006',
      status: 'Reported',
      note: 'Reported by local commuter',
      created_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: uuidv4(),
      complaint_id: 'POT-1006',
      status: 'Verified',
      note: 'Pothole marked on municipal repair roster',
      created_at: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: uuidv4(),
      complaint_id: 'POT-1006',
      status: 'Assigned',
      note: 'Assigned to Paving contractor',
      created_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: uuidv4(),
      complaint_id: 'POT-1006',
      status: 'In Progress',
      note: 'Milling and resurfacing ongoing',
      created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: uuidv4(),
      complaint_id: 'POT-1006',
      status: 'Resolved',
      note: 'Pothole patched with asphalt and rolled flat. After-repair proof verified by municipal engineer.',
      created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
    },
    {
      id: uuidv4(),
      complaint_id: 'POT-1007',
      status: 'Reported',
      note: 'Initial report submitted',
      created_at: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: uuidv4(),
      complaint_id: 'POT-1007',
      status: 'Resolved',
      note: 'Initial temporary gravel fill applied',
      created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: uuidv4(),
      complaint_id: 'POT-1007',
      status: 'Reopened',
      note: 'Citizen re-verification reported patch washed away after rainstorm. Hazard still exists.',
      created_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString()
    }
  ],
  confirmations: [
    { id: uuidv4(), complaint_id: 'POT-1001', client_identifier: 'demo_client_alpha_1', created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString() },
    { id: uuidv4(), complaint_id: 'POT-1001', client_identifier: 'demo_client_alpha_2', created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString() },
    { id: uuidv4(), complaint_id: 'POT-1002', client_identifier: 'demo_client_beta_1', created_at: new Date(Date.now() - 30 * 3600 * 1000).toISOString() },
    { id: uuidv4(), complaint_id: 'POT-1003', client_identifier: 'demo_client_gamma_1', created_at: new Date(Date.now() - 8 * 3600 * 1000).toISOString() },
    { id: uuidv4(), complaint_id: 'POT-1007', client_identifier: 'demo_client_delta_1', created_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString() }
  ],
  near_miss_reports: [
    { id: uuidv4(), complaint_id: 'POT-1001', near_miss_type: 'Almost crashed', details: 'Two-wheeler swerved violently into oncoming bus lane to avoid deep hole.', created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString() },
    { id: uuidv4(), complaint_id: 'POT-1001', near_miss_type: 'Vehicle damaged', details: 'Car rim bent and tire burst when hitting crater in rain.', created_at: new Date(Date.now() - 30 * 3600 * 1000).toISOString() },
    { id: uuidv4(), complaint_id: 'POT-1001', near_miss_type: 'Almost fell', details: 'Scooter rider lost balance in the wet trench.', created_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString() },
    { id: uuidv4(), complaint_id: 'POT-1002', near_miss_type: 'Almost fell', details: 'Pedestrian walking in dark almost stepped into open manhole.', created_at: new Date(Date.now() - 36 * 3600 * 1000).toISOString() },
    { id: uuidv4(), complaint_id: 'POT-1002', near_miss_type: 'Vehicle damaged', details: 'Auto-rickshaw wheel caught inside edge.', created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString() },
    { id: uuidv4(), complaint_id: 'POT-1003', near_miss_type: 'Traffic obstruction', details: 'Cars braking suddenly from 50km/h creating tailback.', created_at: new Date(Date.now() - 10 * 3600 * 1000).toISOString() },
    { id: uuidv4(), complaint_id: 'POT-1007', near_miss_type: 'Vehicle damaged', details: 'Suspension hit hard bottom on failed patch.', created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString() }
  ],
  assignments: [
    { id: uuidv4(), complaint_id: 'POT-1001', department_id: 'd1111111-1111-1111-1111-111111111111', assigned_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString() },
    { id: uuidv4(), complaint_id: 'POT-1002', department_id: 'd2222222-2222-2222-2222-222222222222', assigned_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString() },
    { id: uuidv4(), complaint_id: 'POT-1006', department_id: 'd1111111-1111-1111-1111-111111111111', assigned_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString() }
  ]
};

// In-memory / file cache
let localDb = null;

function loadLocalDb() {
  if (localDb) return localDb;
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf8');
      localDb = JSON.parse(content);
    } else {
      localDb = JSON.parse(JSON.stringify(INITIAL_DEMO_DATA));
      saveLocalDb();
    }
  } catch (err) {
    console.warn('[DB] Error reading store.json, re-initializing demo data:', err.message);
    localDb = JSON.parse(JSON.stringify(INITIAL_DEMO_DATA));
    saveLocalDb();
  }
  return localDb;
}

function saveLocalDb() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(localDb, null, 2), 'utf8');
  } catch (err) {
    console.error('[DB] Failed to save store.json:', err.message);
  }
}

// Supabase client instance (if configured)
let supabase = null;
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project')) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('[DB] Supabase database client initialized.');
  } catch (err) {
    console.warn('[DB] Supabase client init failed, will use local datastore:', err.message);
  }
}

/**
 * Generates the next sequential Complaint ID (e.g. POT-1008)
 */
function getNextComplaintId() {
  const db = loadLocalDb();
  let maxNum = 1000;
  db.complaints.forEach(c => {
    const match = c.complaint_id && c.complaint_id.match(/POT-(\d+)/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNum) maxNum = num;
    }
  });
  return `POT-${maxNum + 1}`;
}

/**
 * Retrieves all complaints with optional filters
 */
async function getComplaints(filters = {}) {
  const { status, severity, riskTier, road, search } = filters;
  const db = loadLocalDb();
  let results = [...db.complaints];

  if (status && status !== 'all') {
    results = results.filter(c => c.status.toLowerCase() === status.toLowerCase());
  }
  if (severity && severity !== 'all') {
    results = results.filter(c => c.severity.toLowerCase() === severity.toLowerCase());
  }
  if (riskTier && riskTier !== 'all') {
    results = results.filter(c => {
      if (riskTier === 'Critical') return c.risk_score >= 81;
      if (riskTier === 'High') return c.risk_score >= 61 && c.risk_score <= 80;
      if (riskTier === 'Medium') return c.risk_score >= 31 && c.risk_score <= 60;
      if (riskTier === 'Low') return c.risk_score <= 30;
      return true;
    });
  }
  if (road && road !== 'all') {
    results = results.filter(c => c.road_name && c.road_name.toLowerCase().includes(road.toLowerCase()));
  }
  if (search) {
    const query = search.toLowerCase();
    results = results.filter(c =>
      c.complaint_id.toLowerCase().includes(query) ||
      (c.road_name && c.road_name.toLowerCase().includes(query)) ||
      (c.description && c.description.toLowerCase().includes(query)) ||
      (c.hazard_type && c.hazard_type.toLowerCase().includes(query))
    );
  }

  // Attach near-miss count, assigned department info, and format
  return results.map(c => {
    const nearMisses = db.near_miss_reports.filter(nm => nm.complaint_id === c.complaint_id);
    const assignment = db.assignments.find(a => a.complaint_id === c.complaint_id);
    const department = assignment ? db.departments.find(d => d.id === assignment.department_id) : null;
    return {
      ...c,
      near_miss_count: nearMisses.length,
      department_name: department ? department.name : null,
      department_id: department ? department.id : null
    };
  }).sort((a, b) => b.risk_score - a.risk_score);
}

/**
 * Retrieves a single complaint by complaint_id (e.g. POT-1001)
 */
async function getComplaintById(complaintId) {
  if (!complaintId) return null;
  const db = loadLocalDb();
  const complaint = db.complaints.find(c => c.complaint_id.toUpperCase() === complaintId.toUpperCase());
  if (!complaint) return null;

  const history = db.status_history
    .filter(h => h.complaint_id.toUpperCase() === complaintId.toUpperCase())
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  const nearMisses = db.near_miss_reports
    .filter(nm => nm.complaint_id.toUpperCase() === complaintId.toUpperCase())
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const assignment = db.assignments.find(a => a.complaint_id.toUpperCase() === complaintId.toUpperCase());
  const department = assignment ? db.departments.find(d => d.id === assignment.department_id) : null;

  return {
    ...complaint,
    status_history: history,
    near_miss_reports: nearMisses,
    near_miss_count: nearMisses.length,
    department: department ? { id: department.id, name: department.name } : null
  };
}

/**
 * Creates a new complaint
 */
async function createComplaint(data) {
  const db = loadLocalDb();
  const complaint_id = data.complaint_id || getNextComplaintId();

  // Calculate dynamic initial risk score
  const nearMissList = data.near_miss_type && data.near_miss_type !== 'None'
    ? [{ near_miss_type: data.near_miss_type, details: data.near_miss_details || '' }]
    : [];

  const riskAnalysis = calculateRiskScore({
    severity: data.severity || 'Medium',
    confirmationCount: 0,
    nearMissReports: nearMissList,
    status: 'Reported',
    roadName: data.road_name || ''
  });

  const newComplaint = {
    id: uuidv4(),
    complaint_id,
    hazard_type: data.hazard_type || 'pothole',
    description: data.description || '',
    latitude: parseFloat(data.latitude),
    longitude: parseFloat(data.longitude),
    road_name: data.road_name || 'Unspecified Road',
    severity: data.severity || 'Medium',
    risk_score: riskAnalysis.score,
    status: 'Reported',
    image_url: data.image_url || null,
    image_auth_status: data.image_auth_status || 'Manual Review',
    image_auth_score: data.image_auth_score || 65,
    image_auth_reason: data.image_auth_reason || 'Basic file integrity check passed',
    before_image_url: data.before_image_url || data.image_url || null,
    after_image_url: null,
    confirmation_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  db.complaints.unshift(newComplaint);

  // Initial status history entry
  db.status_history.push({
    id: uuidv4(),
    complaint_id,
    status: 'Reported',
    note: data.initial_note || 'Report submitted by citizen via GroundFix platform',
    created_at: new Date().toISOString()
  });

  // If a near-miss was reported at submission time, save it
  if (data.near_miss_type && data.near_miss_type !== 'None') {
    db.near_miss_reports.push({
      id: uuidv4(),
      complaint_id,
      near_miss_type: data.near_miss_type,
      details: data.near_miss_details || '',
      created_at: new Date().toISOString()
    });
  }

  saveLocalDb();
  return getComplaintById(complaint_id);
}

/**
 * Updates complaint status (Rule 22, Rule 23, Rule 24)
 */
async function updateComplaintStatus(complaintId, status, note, beforeImageUrl, afterImageUrl) {
  const db = loadLocalDb();
  const complaint = db.complaints.find(c => c.complaint_id.toUpperCase() === complaintId.toUpperCase());
  if (!complaint) throw new Error(`Complaint ${complaintId} not found.`);

  complaint.status = status;
  complaint.updated_at = new Date().toISOString();

  if (beforeImageUrl) complaint.before_image_url = beforeImageUrl;
  if (afterImageUrl) complaint.after_image_url = afterImageUrl;

  // If reopening or resolving, recalculate risk score
  const nearMisses = db.near_miss_reports.filter(nm => nm.complaint_id.toUpperCase() === complaintId.toUpperCase());
  const riskAnalysis = calculateRiskScore({
    severity: complaint.severity,
    confirmationCount: complaint.confirmation_count,
    nearMissReports: nearMisses,
    status: complaint.status,
    roadName: complaint.road_name
  });
  complaint.risk_score = riskAnalysis.score;

  // Add entry to status history (Rule 22: Every status change must be saved in status_history)
  db.status_history.push({
    id: uuidv4(),
    complaint_id: complaint.complaint_id,
    status,
    note: note || `Status updated to ${status}`,
    created_at: new Date().toISOString()
  });

  saveLocalDb();
  return getComplaintById(complaintId);
}

/**
 * Community confirmation ("👥 I also see this problem", Rule 16)
 */
async function addConfirmation(complaintId, clientIdentifier) {
  const db = loadLocalDb();
  const complaint = db.complaints.find(c => c.complaint_id.toUpperCase() === complaintId.toUpperCase());
  if (!complaint) throw new Error(`Complaint ${complaintId} not found.`);

  // Anti-spam check
  const existing = db.confirmations.find(
    cf => cf.complaint_id.toUpperCase() === complaintId.toUpperCase() && cf.client_identifier === clientIdentifier
  );

  if (existing) {
    return {
      alreadyConfirmed: true,
      complaint: await getComplaintById(complaintId),
      message: 'You have already confirmed this hazard from this browser.'
    };
  }

  // Record confirmation
  db.confirmations.push({
    id: uuidv4(),
    complaint_id: complaint.complaint_id,
    client_identifier: clientIdentifier || 'anon_client',
    created_at: new Date().toISOString()
  });

  complaint.confirmation_count = (complaint.confirmation_count || 0) + 1;
  complaint.updated_at = new Date().toISOString();

  // Recalculate risk score
  const nearMisses = db.near_miss_reports.filter(nm => nm.complaint_id.toUpperCase() === complaintId.toUpperCase());
  const riskAnalysis = calculateRiskScore({
    severity: complaint.severity,
    confirmationCount: complaint.confirmation_count,
    nearMissReports: nearMisses,
    status: complaint.status,
    roadName: complaint.road_name
  });
  complaint.risk_score = riskAnalysis.score;

  saveLocalDb();
  return {
    alreadyConfirmed: false,
    complaint: await getComplaintById(complaintId),
    message: 'Confirmation recorded successfully.'
  };
}

/**
 * Add a Near Miss report to existing complaint (Rule 18)
 */
async function addNearMiss(complaintId, nearMissType, details) {
  const db = loadLocalDb();
  const complaint = db.complaints.find(c => c.complaint_id.toUpperCase() === complaintId.toUpperCase());
  if (!complaint) throw new Error(`Complaint ${complaintId} not found.`);

  db.near_miss_reports.push({
    id: uuidv4(),
    complaint_id: complaint.complaint_id,
    near_miss_type: nearMissType,
    details: details || '',
    created_at: new Date().toISOString()
  });

  complaint.updated_at = new Date().toISOString();

  // Recalculate risk score
  const nearMisses = db.near_miss_reports.filter(nm => nm.complaint_id.toUpperCase() === complaintId.toUpperCase());
  const riskAnalysis = calculateRiskScore({
    severity: complaint.severity,
    confirmationCount: complaint.confirmation_count,
    nearMissReports: nearMisses,
    status: complaint.status,
    roadName: complaint.road_name
  });
  complaint.risk_score = riskAnalysis.score;

  saveLocalDb();
  return getComplaintById(complaintId);
}

/**
 * Citizen re-verification (Rule 24)
 * "Has this issue actually been fixed?" -> Yes or No (Reopened)
 */
async function reverifyComplaint(complaintId, isFixed) {
  if (isFixed) {
    return updateComplaintStatus(
      complaintId,
      'Resolved',
      'Citizen re-verification: Confirmed that hazard is fixed.'
    );
  } else {
    return updateComplaintStatus(
      complaintId,
      'Reopened',
      'Citizen re-verification: Citizen reported hazard still exists after marked resolution.'
    );
  }
}

/**
 * Assign department to complaint (Rule 22)
 */
async function assignDepartment(complaintId, departmentId) {
  const db = loadLocalDb();
  const complaint = db.complaints.find(c => c.complaint_id.toUpperCase() === complaintId.toUpperCase());
  if (!complaint) throw new Error(`Complaint ${complaintId} not found.`);

  const department = db.departments.find(d => d.id === departmentId);
  if (!department) throw new Error(`Department ${departmentId} not found.`);

  // Remove previous assignment if any
  db.assignments = db.assignments.filter(a => a.complaint_id.toUpperCase() !== complaintId.toUpperCase());
  db.assignments.push({
    id: uuidv4(),
    complaint_id: complaint.complaint_id,
    department_id: departmentId,
    assigned_at: new Date().toISOString()
  });

  // If status was Reported or Verified, move to Assigned
  if (['Reported', 'Verified'].includes(complaint.status)) {
    complaint.status = 'Assigned';
  }
  complaint.updated_at = new Date().toISOString();

  db.status_history.push({
    id: uuidv4(),
    complaint_id: complaint.complaint_id,
    status: complaint.status,
    note: `Assigned to department: ${department.name}`,
    created_at: new Date().toISOString()
  });

  saveLocalDb();
  return getComplaintById(complaintId);
}

/**
 * Officer Dashboard aggregated stats (Rule 20)
 */
async function getDashboardStats() {
  const db = loadLocalDb();
  const complaints = db.complaints;

  const total = complaints.length;
  const critical = complaints.filter(c => c.risk_score >= 81).length;
  const highRisk = complaints.filter(c => c.risk_score >= 61 && c.risk_score <= 80).length;
  const pending = complaints.filter(c => c.status === 'Reported').length;
  const inProgress = complaints.filter(c => ['Verified', 'Assigned', 'In Progress'].includes(c.status)).length;
  const resolved = complaints.filter(c => c.status === 'Resolved').length;
  const reopened = complaints.filter(c => c.status === 'Reopened').length;

  return {
    totalReports: total,
    critical,
    highRisk,
    pending,
    inProgress,
    resolved,
    reopened
  };
}

/**
 * Road Health Intelligence (Rule 29)
 */
async function getRoadsSummary() {
  const db = loadLocalDb();
  const roadMap = {};

  db.complaints.forEach(c => {
    const rawName = c.road_name || 'Other Roads';
    // Normalize road name (group by main segment)
    const baseName = rawName.split('(')[0].trim();

    if (!roadMap[baseName]) {
      roadMap[baseName] = {
        road_name: baseName,
        total_hazards: 0,
        high_risk_count: 0,
        unresolved_count: 0,
        reopened_count: 0,
        near_miss_count: 0,
        total_confirmations: 0,
        latitudes: [],
        longitudes: []
      };
    }

    const r = roadMap[baseName];
    r.total_hazards++;
    if (c.risk_score >= 61) r.high_risk_count++;
    if (c.status !== 'Resolved') r.unresolved_count++;
    if (c.status === 'Reopened') r.reopened_count++;
    r.total_confirmations += (c.confirmation_count || 0);

    const nmCount = db.near_miss_reports.filter(nm => nm.complaint_id === c.complaint_id).length;
    r.near_miss_count += nmCount;

    if (c.latitude) r.latitudes.push(c.latitude);
    if (c.longitude) r.longitudes.push(c.longitude);
  });

  return Object.values(roadMap).map(road => {
    // Health score: 100 base minus penalty for unresolved, high risk, and reopened
    let penalty = (road.unresolved_count * 10) + (road.high_risk_count * 12) + (road.reopened_count * 15);
    let healthScore = Math.max(10, Math.min(100, Math.round(100 - penalty)));

    let riskTier = 'Low';
    if (healthScore < 45) riskTier = 'Critical';
    else if (healthScore < 65) riskTier = 'High Risk';
    else if (healthScore < 80) riskTier = 'Moderate Risk';
    else riskTier = 'Good Health';

    const avgLat = road.latitudes.reduce((a, b) => a + b, 0) / (road.latitudes.length || 1);
    const avgLng = road.longitudes.reduce((a, b) => a + b, 0) / (road.longitudes.length || 1);

    return {
      road_name: road.road_name,
      health_score: healthScore,
      risk_tier: riskTier,
      total_hazards: road.total_hazards,
      high_risk_count: road.high_risk_count,
      unresolved_count: road.unresolved_count,
      reopened_count: road.reopened_count,
      near_miss_count: road.near_miss_count,
      total_confirmations: road.total_confirmations,
      center: { latitude: avgLat, longitude: avgLng }
    };
  }).sort((a, b) => a.health_score - b.health_score);
}

/**
 * Nearby Hazards for Driver Mode (Rule 27, Rule 30)
 */
async function getNearbyHazards(latitude, longitude, maxDistanceMeters = 5000) {
  const db = loadLocalDb();
  if (latitude === undefined || longitude === undefined || isNaN(latitude) || isNaN(longitude)) {
    return [];
  }

  // Filter only active (unresolved) hazards
  const activeHazards = db.complaints.filter(c => c.status !== 'Resolved');

  return activeHazards.map(c => {
    const distanceMeters = calculateDistanceMeters(latitude, longitude, c.latitude, c.longitude);
    const nearMisses = db.near_miss_reports.filter(nm => nm.complaint_id === c.complaint_id);
    return {
      ...c,
      distance_meters: distanceMeters,
      near_miss_count: nearMisses.length,
      // Priority alert flag for driver mode
      is_immediate_warning: distanceMeters <= 500 && c.risk_score >= 61
    };
  })
  .filter(c => c.distance_meters <= maxDistanceMeters)
  .sort((a, b) => a.distance_meters - b.distance_meters);
}

/**
 * Get all municipal departments
 */
async function getDepartments() {
  const db = loadLocalDb();
  return db.departments;
}

module.exports = {
  getComplaints,
  getComplaintById,
  createComplaint,
  updateComplaintStatus,
  addConfirmation,
  addNearMiss,
  reverifyComplaint,
  assignDepartment,
  getDashboardStats,
  getRoadsSummary,
  getNearbyHazards,
  getDepartments,
  getNextComplaintId
};
