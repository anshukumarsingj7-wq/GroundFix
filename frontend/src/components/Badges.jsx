import React from 'react';

export function PriorityBadge({ score, queue, size = 'md' }) {
  let label = 'NORMAL';
  let badgeClass = 'priority-normal';
  let emoji = '🟡';

  const numericScore = typeof score === 'number' ? score : parseInt(score, 10) || 0;

  if (numericScore >= 81 || queue === 'FIX FIRST') {
    label = 'FIX FIRST';
    badgeClass = 'priority-fix-first';
    emoji = '🔴';
  } else if (numericScore >= 61 || queue === 'FIX NEXT') {
    label = 'FIX NEXT';
    badgeClass = 'priority-fix-next';
    emoji = '🟠';
  } else {
    label = 'NORMAL';
    badgeClass = 'priority-normal';
    emoji = '🟡';
  }

  const padding = size === 'sm' ? '3px 8px' : '5px 12px';
  const fontSize = size === 'sm' ? '0.75rem' : '0.82rem';

  return (
    <span
      className={`badge ${badgeClass}`}
      style={{ padding, fontSize, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
      title={`Risk Score: ${numericScore}/100`}
    >
      <span>{emoji}</span>
      <span>{label}</span>
      {score !== undefined && <span style={{ opacity: 0.8, fontSize: '0.85em' }}>({numericScore})</span>}
    </span>
  );
}

export function StatusBadge({ status, size = 'md' }) {
  let badgeClass = 'badge-medium';
  const s = status || 'Reported';

  switch (s.toLowerCase()) {
    case 'reported':
      badgeClass = 'badge-high';
      break;
    case 'verified':
      badgeClass = 'badge-medium';
      break;
    case 'assigned':
      badgeClass = 'badge-medium';
      break;
    case 'in progress':
    case 'inprogress':
      badgeClass = 'badge-high';
      break;
    case 'resolved':
      badgeClass = 'badge-resolved';
      break;
    case 'reopened':
      badgeClass = 'badge-critical';
      break;
    case 'rejected':
      badgeClass = 'badge-critical';
      break;
    default:
      badgeClass = 'badge-medium';
  }

  const padding = size === 'sm' ? '2px 8px' : '4px 10px';
  const fontSize = size === 'sm' ? '0.72rem' : '0.8rem';

  return (
    <span className={`badge ${badgeClass}`} style={{ padding, fontSize }}>
      {s}
    </span>
  );
}

export function SeverityBadge({ severity, size = 'md' }) {
  const sev = (severity || 'Medium').toLowerCase();
  let badgeClass = 'badge-medium';

  if (sev === 'critical') badgeClass = 'badge-critical';
  else if (sev === 'high') badgeClass = 'badge-high';
  else if (sev === 'medium') badgeClass = 'badge-medium';
  else if (sev === 'low') badgeClass = 'badge-low';

  const padding = size === 'sm' ? '2px 8px' : '4px 10px';
  const fontSize = size === 'sm' ? '0.72rem' : '0.8rem';

  return (
    <span className={`badge ${badgeClass}`} style={{ padding, fontSize }}>
      {severity || 'Medium'}
    </span>
  );
}
