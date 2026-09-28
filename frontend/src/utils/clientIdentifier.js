/**
 * GroundFix Client Identifier
 * Simple local browser session identifier for duplicate confirmation prevention
 * No accounts, no cookies, no tracking - strictly prevents double-clicks from the same device
 */

export function getClientIdentifier() {
  let clientId = localStorage.getItem('groundfix_client_id');
  if (!clientId) {
    clientId = 'gf_client_' + Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
    localStorage.setItem('groundfix_client_id', clientId);
  }
  return clientId;
}

export function hasConfirmedLocally(complaintId) {
  try {
    const list = JSON.parse(localStorage.getItem('groundfix_confirmed_complaints') || '[]');
    return list.includes(complaintId);
  } catch (e) {
    return false;
  }
}

export function markConfirmedLocally(complaintId) {
  try {
    const list = JSON.parse(localStorage.getItem('groundfix_confirmed_complaints') || '[]');
    if (!list.includes(complaintId)) {
      list.push(complaintId);
      localStorage.setItem('groundfix_confirmed_complaints', JSON.stringify(list));
    }
  } catch (e) {
    // ignore
  }
}
