/**
 * GroundFix Risk Score Calculation Service
 * 
 * Rules:
 * 0–30 = Low
 * 31–60 = Medium
 * 61–80 = High
 * 81–100 = Critical
 * 
 * Deterministic, rule-based formula based on:
 * - Hazard Severity (Low, Medium, High, Critical)
 * - Community Confirmations Count
 * - Near-Miss Reports & Types (Almost crashed, Almost fell, Vehicle damaged, etc.)
 * - Reopened history penalty
 * - Road transit importance factor
 */

const SEVERITY_BASE = {
  Low: 18,
  Medium: 42,
  High: 68,
  Critical: 84
};

const NEAR_MISS_WEIGHTS = {
  'Almost crashed': 8,
  'Vehicle damaged': 6,
  'Almost fell': 5,
  'Difficult for pedestrians': 4,
  'Accessibility issue': 4,
  'Traffic obstruction': 3,
  'None': 0
};

/**
 * Calculates risk score and returns detailed analysis
 * @param {Object} params
 * @param {string} params.severity - Low, Medium, High, Critical
 * @param {number} params.confirmationCount - Number of community confirmations
 * @param {Array} params.nearMissReports - Array of near miss report objects or types
 * @param {string} [params.status] - Current complaint status (e.g. Reopened)
 * @param {string} [params.roadName] - Name of the road
 * @returns {{ score: number, tier: string, priorityQueue: string, explanation: string }}
 */
function calculateRiskScore({
  severity = 'Medium',
  confirmationCount = 0,
  nearMissReports = [],
  status = 'Reported',
  roadName = ''
}) {
  let score = SEVERITY_BASE[severity] || 40;

  // Confirmations add weight (+3 per confirmation, capped at 18)
  const confirmationBonus = Math.min(confirmationCount * 3, 18);
  score += confirmationBonus;

  // Near misses calculation
  let nearMissBonus = 0;
  const reasons = [];

  if (Array.isArray(nearMissReports) && nearMissReports.length > 0) {
    let severeCount = 0;
    nearMissReports.forEach(nm => {
      const type = typeof nm === 'string' ? nm : (nm.near_miss_type || nm.type);
      const weight = NEAR_MISS_WEIGHTS[type] || 3;
      nearMissBonus += weight;
      if (type === 'Almost crashed' || type === 'Vehicle damaged' || type === 'Almost fell') {
        severeCount++;
      }
    });

    // Cap near miss contribution to 25 points
    nearMissBonus = Math.min(nearMissBonus, 25);
    score += nearMissBonus;

    if (severeCount > 0) {
      reasons.push(`${severeCount} critical near-miss incidents (${nearMissReports.length} total)`);
    } else {
      reasons.push(`${nearMissReports.length} reported near misses`);
    }
  }

  // Penalty if complaint was marked resolved but reopened by citizens
  if (status === 'Reopened') {
    score += 10;
    reasons.push('reopened after incomplete or failed prior repair');
  }

  // Arterial road / junction keyword bonus (+5)
  if (roadName && /(arterial|ring road|highway|junction|main road|flyover|expressway)/i.test(roadName)) {
    score += 5;
    reasons.push('located on a high-density transit corridor');
  }

  // Clamp strictly to 0 - 100
  score = Math.min(100, Math.max(0, Math.round(score)));

  // Risk Tier (Rule 19)
  let tier = 'Low';
  let priorityQueue = 'NORMAL'; // 🟡

  if (score >= 81) {
    tier = 'Critical';
    priorityQueue = 'FIX FIRST'; // 🔴
  } else if (score >= 61) {
    tier = 'High';
    priorityQueue = 'FIX NEXT'; // 🟠
  } else if (score >= 31) {
    tier = 'Medium';
    priorityQueue = 'NORMAL'; // 🟡
  } else {
    tier = 'Low';
    priorityQueue = 'NORMAL'; // 🟡
  }

  // Build transparent human explanation
  let explanation = `${tier} risk (${score}/100) based on ${severity.toLowerCase()} base severity.`;
  if (confirmationCount > 0) {
    reasons.unshift(`${confirmationCount} community confirmation${confirmationCount > 1 ? 's' : ''}`);
  }

  if (reasons.length > 0) {
    explanation = `${tier} risk (${score}/100) because this hazard has ${reasons.join(', ')}.`;
  }

  return {
    score,
    tier,
    priorityQueue,
    explanation
  };
}

module.exports = {
  calculateRiskScore,
  SEVERITY_BASE,
  NEAR_MISS_WEIGHTS
};
