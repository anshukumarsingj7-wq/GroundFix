import React from 'react';

export function RiskGauge({ score = 0, explanation = '', tier = '' }) {
  const numScore = Math.min(100, Math.max(0, parseInt(score, 10) || 0));

  let color = 'var(--color-low)';
  let computedTier = 'Low';

  if (numScore >= 81) {
    color = 'var(--color-critical)';
    computedTier = 'Critical';
  } else if (numScore >= 61) {
    color = 'var(--color-high)';
    computedTier = 'High';
  } else if (numScore >= 31) {
    color = 'var(--color-medium)';
    computedTier = 'Medium';
  }

  const finalTier = tier || computedTier;

  return (
    <div style={{
      background: 'var(--bg-subtle)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      padding: '20px',
      position: 'relative'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div>
          <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 700 }}>
            Risk Score
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '2px' }}>
            <span style={{ fontSize: '2.4rem', fontWeight: 800, color, fontFamily: 'var(--font-mono)', lineHeight: 1 }}>
              {numScore}
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: 600 }}>/ 100</span>
            <span style={{
              marginLeft: '8px',
              padding: '3px 10px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.85rem',
              fontWeight: 700,
              backgroundColor: color,
              color: '#ffffff'
            }}>
              {finalTier}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar Gauge */}
      <div style={{
        height: '10px',
        backgroundColor: 'var(--border-subtle)',
        borderRadius: 'var(--radius-full)',
        overflow: 'hidden',
        position: 'relative',
        marginBottom: '14px'
      }}>
        <div
          style={{
            height: '100%',
            width: `${numScore}%`,
            backgroundColor: color,
            borderRadius: 'var(--radius-full)',
            transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        />
      </div>

      {/* Score thresholds labels */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '0.72rem',
        color: 'var(--text-muted)',
        fontWeight: 600,
        marginBottom: '10px'
      }}>
        <span>0 (Low)</span>
        <span>31 (Med)</span>
        <span>61 (High)</span>
        <span>81–100 (Critical)</span>
      </div>

      {/* Human Explanation per Rule 19 */}
      {explanation && (
        <div style={{
          fontSize: '0.85rem',
          color: 'var(--text-secondary)',
          background: 'var(--bg-surface)',
          padding: '10px 14px',
          borderRadius: 'var(--radius-md)',
          borderLeft: `3px solid ${color}`,
          marginTop: '8px',
          lineHeight: 1.45
        }}>
          <strong>Assessment: </strong> {explanation}
        </div>
      )}
    </div>
  );
}
