/**
 * GroundFix Complaints Controller
 */

const dbService = require('../services/dbService');
const { isNearbyDuplicate, calculateDistanceMeters } = require('../utils/geoUtils');
const { verifyImage } = require('../services/imageVerificationService');
const { uploadImage } = require('../services/storageService');

/**
 * GET /api/complaints
 * Filter by status, severity, riskTier, road, search
 */
async function getComplaints(req, res, next) {
  try {
    const { status, severity, riskTier, road, search } = req.query;
    const complaints = await dbService.getComplaints({
      status,
      severity,
      riskTier,
      road,
      search
    });

    res.json({
      success: true,
      count: complaints.length,
      data: complaints
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/complaints/:complaintId
 */
async function getComplaintById(req, res, next) {
  try {
    const { complaintId } = req.params;
    const complaint = await dbService.getComplaintById(complaintId);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        error: `Complaint '${complaintId}' was not found.`
      });
    }

    res.json({
      success: true,
      data: complaint
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/complaints
 * Handles submission with duplicate detection (Rule 17) and image verification (Rule 11)
 */
async function createComplaint(req, res, next) {
  try {
    const body = req.body;
    let file = req.file;

    const latitude = parseFloat(body.latitude);
    const longitude = parseFloat(body.longitude);

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({
        success: false,
        error: 'Valid latitude and longitude coordinates are required.'
      });
    }

    // Check for nearby duplicate reports within 100 meters (Rule 17)
    // unless force_create === 'true' or force_create === true
    const forceCreate = body.force_create === true || body.force_create === 'true';

    if (!forceCreate) {
      const allActive = (await dbService.getComplaints()).filter(c => c.status !== 'Resolved' && c.status !== 'Rejected');
      let nearestDuplicate = null;
      let minDistance = Infinity;

      for (const item of allActive) {
        const dist = calculateDistanceMeters(latitude, longitude, item.latitude, item.longitude);
        if (dist <= 100 && dist < minDistance) {
          minDistance = dist;
          nearestDuplicate = item;
        }
      }

      if (nearestDuplicate) {
        return res.status(409).json({
          success: false,
          is_duplicate: true,
          message: 'A similar road hazard has already been reported nearby.',
          distance_meters: minDistance,
          existing_complaint: {
            complaint_id: nearestDuplicate.complaint_id,
            hazard_type: nearestDuplicate.hazard_type,
            road_name: nearestDuplicate.road_name,
            severity: nearestDuplicate.severity,
            risk_score: nearestDuplicate.risk_score,
            status: nearestDuplicate.status,
            confirmation_count: nearestDuplicate.confirmation_count,
            image_url: nearestDuplicate.image_url
          }
        });
      }
    }

    let imageUrl = body.image_url || null;
    let authStatus = body.image_auth_status || 'Manual Review';
    let authScore = parseInt(body.image_auth_score, 10) || 65;
    let authReason = body.image_auth_reason || 'File integrity verified. Queued for field officer review.';

    // If a physical file was uploaded with the request
    if (file) {
      const verification = await verifyImage(file);
      authStatus = verification.status;
      authScore = verification.confidence;
      authReason = verification.reason;

      // Reject if image failed fundamental integrity
      if (verification.status === 'Rejected') {
        return res.status(400).json({
          success: false,
          error: `Image verification failed: ${verification.reason}`
        });
      }

      // Upload to storage
      imageUrl = await uploadImage(file, 'reports');
    }

    const created = await dbService.createComplaint({
      hazard_type: body.hazard_type || 'pothole',
      description: body.description || '',
      latitude,
      longitude,
      road_name: body.road_name || 'Unspecified Road',
      severity: body.severity || 'Medium',
      image_url: imageUrl,
      image_auth_status: authStatus,
      image_auth_score: authScore,
      image_auth_reason: authReason,
      before_image_url: imageUrl,
      near_miss_type: body.near_miss_type || 'None',
      near_miss_details: body.near_miss_details || '',
      initial_note: body.initial_note || 'Report submitted by citizen via GroundFix'
    });

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully.',
      complaint_id: created.complaint_id,
      data: created
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/complaints/:complaintId/status
 * Updates status, note, and optional before/after proof images
 */
async function updateStatus(req, res, next) {
  try {
    const { complaintId } = req.params;
    const { status, note, before_image_url, after_image_url } = req.body;

    const allowedStatuses = [
      'Reported', 'Verified', 'Assigned', 'In Progress', 'Resolved', 'Reopened', 'Rejected'
    ];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}`
      });
    }

    const updated = await dbService.updateComplaintStatus(
      complaintId,
      status,
      note,
      before_image_url,
      after_image_url
    );

    res.json({
      success: true,
      message: `Status updated to ${status}.`,
      data: updated
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/complaints/:complaintId/confirm
 * Community confirmation ("👥 I also see this problem", Rule 16)
 */
async function confirmComplaint(req, res, next) {
  try {
    const { complaintId } = req.params;
    const clientIdentifier = req.body.client_identifier || req.ip || 'anon_client';

    const result = await dbService.addConfirmation(complaintId, clientIdentifier);

    res.json({
      success: true,
      already_confirmed: result.alreadyConfirmed,
      message: result.message,
      data: result.complaint
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/complaints/:complaintId/near-miss
 * Log additional near-miss incidents to existing complaint (Rule 18)
 */
async function addNearMiss(req, res, next) {
  try {
    const { complaintId } = req.params;
    const { near_miss_type, details } = req.body;

    if (!near_miss_type || near_miss_type === 'None') {
      return res.status(400).json({
        success: false,
        error: 'Valid near_miss_type is required.'
      });
    }

    const updated = await dbService.addNearMiss(complaintId, near_miss_type, details);

    res.json({
      success: true,
      message: 'Near-miss incident recorded successfully.',
      data: updated
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/complaints/:complaintId/reverify
 * Citizen re-verification (Rule 24)
 * Has this issue actually been fixed? -> Yes (Fixed) / No (Reopened)
 */
async function reverifyComplaint(req, res, next) {
  try {
    const { complaintId } = req.params;
    const isFixed = req.body.is_fixed === true || req.body.is_fixed === 'true' || req.body.decision === 'fixed';

    const updated = await dbService.reverifyComplaint(complaintId, isFixed);

    res.json({
      success: true,
      status: updated.status,
      message: isFixed
        ? 'Thank you for verifying! Complaint marked verified as resolved.'
        : 'Complaint marked as Reopened. Priorities updated for municipal officers.',
      data: updated
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/complaints/:complaintId/assign
 * Assigns municipal department (Rule 22)
 */
async function assignDepartment(req, res, next) {
  try {
    const { complaintId } = req.params;
    const { department_id } = req.body;

    if (!department_id) {
      return res.status(400).json({
        success: false,
        error: 'department_id is required.'
      });
    }

    const updated = await dbService.assignDepartment(complaintId, department_id);

    res.json({
      success: true,
      message: 'Department assigned successfully.',
      data: updated
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getComplaints,
  getComplaintById,
  createComplaint,
  updateStatus,
  confirmComplaint,
  addNearMiss,
  reverifyComplaint,
  assignDepartment
};
