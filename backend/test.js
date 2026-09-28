/**
 * GroundFix Backend API Test Suite
 * Validates all endpoints, models, calculations, and business logic
 */

process.env.NODE_ENV = 'test';
const http = require('http');
const app = require('./server');

const TEST_PORT = 5099;
let server;

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const reqHeaders = {
      ...headers
    };
    if (payload) {
      reqHeaders['Content-Type'] = 'application/json';
      reqHeaders['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = http.request(
      {
        hostname: 'localhost',
        port: TEST_PORT,
        path,
        method,
        headers: reqHeaders
      },
      (res) => {
        let data = '';
        res.on('data', chunk => (data += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve({ status: res.statusCode, data: parsed });
          } catch (e) {
            resolve({ status: res.statusCode, data });
          }
        });
      }
    );

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function runTests() {
  console.log('--- Starting GroundFix Backend Test Suite ---');
  server = app.listen(TEST_PORT);
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(` ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(` ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Health check
    const health = await request('GET', '/api/health');
    assert(health.status === 200 && health.data.platform === 'GroundFix', 'GET /api/health returns healthy platform');

    // 2. Complaints list
    const complaintsRes = await request('GET', '/api/complaints');
    assert(complaintsRes.status === 200 && Array.isArray(complaintsRes.data.data), 'GET /api/complaints returns list');
    assert(complaintsRes.data.data.length >= 7, 'Demo data contains at least 7 seeded complaints');

    // 3. Single complaint by ID
    const singleRes = await request('GET', '/api/complaints/POT-1001');
    assert(singleRes.status === 200 && singleRes.data.data.complaint_id === 'POT-1001', 'GET /api/complaints/POT-1001 finds record');
    assert(Array.isArray(singleRes.data.data.status_history), 'Complaint has status_history array');
    assert(singleRes.data.data.status_history.length > 0, 'Status history has entries');

    // 4. Create new complaint
    const newComplaint = {
      hazard_type: 'pothole',
      description: 'Deep road cavity near bus stop',
      latitude: 13.0358,
      longitude: 77.5970,
      road_name: 'Bellary Road Highway',
      severity: 'Critical',
      near_miss_type: 'Almost crashed',
      near_miss_details: 'Biker swerved into median',
      force_create: true
    };
    const createRes = await request('POST', '/api/complaints', newComplaint);
    assert(createRes.status === 201 && createRes.data.complaint_id, `POST /api/complaints created ${createRes.data.complaint_id}`);
    const createdId = createRes.data.complaint_id;

    // 5. Test duplicate detection
    const dupAttempt = {
      hazard_type: 'pothole',
      description: 'Same pothole reported nearby',
      latitude: 13.03581, // ~1 meter away
      longitude: 77.59701,
      road_name: 'Bellary Road',
      severity: 'Critical',
      force_create: false
    };
    const dupRes = await request('POST', '/api/complaints', dupAttempt);
    assert(dupRes.status === 409 && dupRes.data.is_duplicate === true, 'Duplicate report properly flagged (409 Conflict with is_duplicate: true)');

    // 6. Community confirmation
    const confirmRes = await request('POST', `/api/complaints/${createdId}/confirm`, { client_identifier: 'test_client_999' });
    assert(confirmRes.status === 200 && confirmRes.data.data.confirmation_count >= 1, 'POST confirm increments confirmation_count');

    // Anti-spam confirmation duplicate
    const confirmDupRes = await request('POST', `/api/complaints/${createdId}/confirm`, { client_identifier: 'test_client_999' });
    assert(confirmDupRes.data.already_confirmed === true, 'Anti-spam prevents double confirmation from same client');

    // 7. Add Near Miss
    const nmRes = await request('POST', `/api/complaints/${createdId}/near-miss`, {
      near_miss_type: 'Vehicle damaged',
      details: 'Axle hit road edge'
    });
    assert(nmRes.status === 200 && nmRes.data.data.near_miss_count >= 2, 'POST near-miss adds report and updates near_miss_count');

    // 8. Update status
    const statusRes = await request('PATCH', `/api/complaints/${createdId}/status`, {
      status: 'In Progress',
      note: 'Repair crew assigned with asphalt mix'
    });
    assert(statusRes.status === 200 && statusRes.data.data.status === 'In Progress', 'PATCH status changes status to In Progress');

    // 9. Assign department
    const deptsRes = await request('GET', '/api/dashboard/departments');
    assert(deptsRes.status === 200 && deptsRes.data.data.length > 0, 'GET departments returns available municipal teams');
    const firstDeptId = deptsRes.data.data[0].id;

    const assignRes = await request('POST', `/api/complaints/${createdId}/assign`, { department_id: firstDeptId });
    assert(assignRes.status === 200, 'POST assign assigns department');

    // 10. Reverify (Citizen says "No, Still Exists" -> Reopened)
    const reverifyRes = await request('POST', `/api/complaints/${createdId}/reverify`, { is_fixed: false });
    assert(reverifyRes.status === 200 && reverifyRes.data.data.status === 'Reopened', 'POST reverify changes status to Reopened when not fixed');

    // 11. Dashboard stats
    const statsRes = await request('GET', '/api/dashboard/stats');
    assert(statsRes.status === 200 && statsRes.data.data.totalReports >= 8, 'GET /api/dashboard/stats returns aggregate metrics');

    // 12. Roads summary
    const roadsRes = await request('GET', '/api/roads');
    assert(roadsRes.status === 200 && Array.isArray(roadsRes.data.data), 'GET /api/roads returns road health data');

    // 13. Nearby hazards (Driver Mode)
    const nearbyRes = await request('GET', '/api/hazards/nearby?latitude=12.9716&longitude=77.5946&radius=10000');
    assert(nearbyRes.status === 200 && Array.isArray(nearbyRes.data.data), 'GET /api/hazards/nearby returns nearby hazards');
    assert(nearbyRes.data.data[0].distance_meters !== undefined, 'Nearby hazards have calculated distance_meters');

    // 14. AI Assistant
    const aiRes = await request('POST', '/api/ai/assistant', { message: 'How do I report a pothole?', language: 'en' });
    assert(aiRes.status === 200 && aiRes.data.data.answer.includes('Report a Hazard'), 'POST /api/ai/assistant answers citizen queries');

    console.log(`\n==========================================`);
    console.log(` Test Results: ${passed} passed, ${failed} failed`);
    console.log(`==========================================`);
  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  } finally {
    server.close();
    process.exit(failed > 0 ? 1 : 0);
  }
}

runTests();
