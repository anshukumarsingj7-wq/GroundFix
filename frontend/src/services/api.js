/**
 * GroundFix Frontend API Service
 * Connects to the backend REST API using VITE_API_URL
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

/**
 * Helper to handle fetch responses safely
 */
async function handleResponse(res) {
  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const errorMsg = (typeof data === 'object' && data.error) ? data.error : (data.message || `Request failed with status ${res.status}`);
    const error = new Error(errorMsg);
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data;
}

export const api = {
  /**
   * Health check
   */
  async checkHealth() {
    const res = await fetch(`${API_BASE_URL}/api/health`);
    return handleResponse(res);
  },

  /**
   * Get all complaints with optional filters
   */
  async getComplaints(params = {}) {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'all') query.append('status', params.status);
    if (params.severity && params.severity !== 'all') query.append('severity', params.severity);
    if (params.riskTier && params.riskTier !== 'all') query.append('riskTier', params.riskTier);
    if (params.road && params.road !== 'all') query.append('road', params.road);
    if (params.search) query.append('search', params.search);

    const url = `${API_BASE_URL}/api/complaints${query.toString() ? `?${query.toString()}` : ''}`;
    const res = await fetch(url);
    return handleResponse(res);
  },

  /**
   * Get single complaint by ID (e.g. POT-1001)
   */
  async getComplaint(complaintId) {
    const res = await fetch(`${API_BASE_URL}/api/complaints/${encodeURIComponent(complaintId)}`);
    return handleResponse(res);
  },

  /**
   * Submit new complaint (accepts FormData for photo upload or JSON)
   */
  async createComplaint(payload) {
    const isFormData = payload instanceof FormData;
    const res = await fetch(`${API_BASE_URL}/api/complaints`, {
      method: 'POST',
      headers: isFormData ? {} : { 'Content-Type': 'application/json' },
      body: isFormData ? payload : JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  /**
   * Update complaint status and officer notes
   */
  async updateStatus(complaintId, { status, note, before_image_url, after_image_url }) {
    const res = await fetch(`${API_BASE_URL}/api/complaints/${encodeURIComponent(complaintId)}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, note, before_image_url, after_image_url })
    });
    return handleResponse(res);
  },

  /**
   * Community confirmation ("👥 I also see this problem")
   */
  async confirmComplaint(complaintId, clientIdentifier) {
    const res = await fetch(`${API_BASE_URL}/api/complaints/${encodeURIComponent(complaintId)}/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_identifier: clientIdentifier })
    });
    return handleResponse(res);
  },

  /**
   * Log near miss report on existing complaint
   */
  async addNearMiss(complaintId, { near_miss_type, details }) {
    const res = await fetch(`${API_BASE_URL}/api/complaints/${encodeURIComponent(complaintId)}/near-miss`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ near_miss_type, details })
    });
    return handleResponse(res);
  },

  /**
   * Citizen re-verification ("Has this issue actually been fixed?")
   */
  async reverifyComplaint(complaintId, isFixed) {
    const res = await fetch(`${API_BASE_URL}/api/complaints/${encodeURIComponent(complaintId)}/reverify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_fixed: isFixed })
    });
    return handleResponse(res);
  },

  /**
   * Assign department to complaint
   */
  async assignDepartment(complaintId, departmentId) {
    const res = await fetch(`${API_BASE_URL}/api/complaints/${encodeURIComponent(complaintId)}/assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ department_id: departmentId })
    });
    return handleResponse(res);
  },

  /**
   * Officer Dashboard Statistics
   */
  async getDashboardStats() {
    const res = await fetch(`${API_BASE_URL}/api/dashboard/stats`);
    return handleResponse(res);
  },

  /**
   * Municipal Departments
   */
  async getDepartments() {
    const res = await fetch(`${API_BASE_URL}/api/dashboard/departments`);
    return handleResponse(res);
  },

  /**
   * Road Health Intelligence
   */
  async getRoads() {
    const res = await fetch(`${API_BASE_URL}/api/roads`);
    return handleResponse(res);
  },

  /**
   * Nearby hazards for Driver Mode
   */
  async getNearbyHazards(latitude, longitude, radius = 5000) {
    const res = await fetch(`${API_BASE_URL}/api/hazards/nearby?latitude=${latitude}&longitude=${longitude}&radius=${radius}`);
    return handleResponse(res);
  },

  /**
   * Check image authenticity
   */
  async checkImageAuthenticity(file) {
    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch(`${API_BASE_URL}/api/image-verification/check`, {
      method: 'POST',
      body: formData
    });
    return handleResponse(res);
  },

  /**
   * GroundFix AI Assistant
   */
  async askAssistant(message, language = 'en') {
    const res = await fetch(`${API_BASE_URL}/api/ai/assistant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, language })
    });
    return handleResponse(res);
  }
};

export default api;
