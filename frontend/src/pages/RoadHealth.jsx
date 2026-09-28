import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Activity, ShieldAlert, ArrowRight, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';

export function RoadHealth() {
  const { t } = useLanguage();
  const [roads, setRoads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadRoads = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getRoads();
      if (res && res.data) {
        setRoads(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch road health summary.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoads();
  }, []);

  const getHealthBadge = (score) => {
    if (score >= 80) return { label: 'Good Health', color: 'var(--color-low)', bg: 'var(--color-low-bg)' };
    if (score >= 60) return { label: 'Moderate Risk', color: 'var(--color-medium)', bg: 'var(--color-medium-bg)' };
    if (score >= 40) return { label: 'High Risk', color: 'var(--color-high)', bg: 'var(--color-high-bg)' };
    return { label: 'Critical Risk', color: 'var(--color-critical)', bg: 'var(--color-critical-bg)' };
  };

  return (
    <div className="page-container">
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '28px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <div style={{ padding: '6px', backgroundColor: 'var(--color-primary-light)', borderRadius: 'var(--radius-md)', color: 'var(--color-primary)' }}>
                <Activity size={22} />
              </div>
              <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>
                {t('roads.title')}
              </h1>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
              {t('roads.subtitle')}
            </p>
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={loadRoads}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            <span>Refresh Index</span>
          </button>
        </div>

        {/* Loading / Error states */}
        {loading && (
          <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <RefreshCw size={28} className="spin" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 10px' }} />
            <p>{t('common.loading')}</p>
          </div>
        )}

        {error && !loading && (
          <div style={{ padding: '16px 20px', backgroundColor: 'var(--color-critical-bg)', color: 'var(--color-critical)', borderRadius: 'var(--radius-md)', marginBottom: '20px' }}>
            {error}
          </div>
        )}

        {/* Roads Grid (Rule 29) */}
        {!loading && roads.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {roads.map((road, idx) => {
              const badge = getHealthBadge(road.health_score);

              return (
                <div key={idx} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    {/* Top Row: Road Name & Health Badge */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '14px' }}>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                        {road.road_name}
                      </h3>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        backgroundColor: badge.bg,
                        color: badge.color
                      }}>
                        {badge.label}
                      </span>
                    </div>

                    {/* Health Score Gauge */}
                    <div style={{
                      backgroundColor: 'var(--bg-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '14px 16px',
                      marginBottom: '18px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                          {t('roads.healthIndex')}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                          <span style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: badge.color, lineHeight: 1 }}>
                            {road.health_score}
                          </span>
                          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>/ 100</span>
                        </div>
                      </div>

                      <div style={{
                        height: '8px',
                        backgroundColor: 'var(--border-subtle)',
                        borderRadius: 'var(--radius-full)',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          height: '100%',
                          width: `${road.health_score}%`,
                          backgroundColor: badge.color,
                          borderRadius: 'var(--radius-full)'
                        }} />
                      </div>
                    </div>

                    {/* Metric Breakdown (Rule 29) */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: '12px',
                      fontSize: '0.85rem',
                      marginBottom: '16px'
                    }}>
                      <div style={{ padding: '8px 12px', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{t('roads.hazardsCount')}</div>
                        <div style={{ fontSize: '1.15rem', fontWeight: 800 }}>{road.total_hazards}</div>
                      </div>

                      <div style={{ padding: '8px 12px', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>High-Risk Hazards</div>
                        <div style={{ fontSize: '1.15rem', fontWeight: 800, color: road.high_risk_count > 0 ? 'var(--color-critical)' : 'inherit' }}>
                          {road.high_risk_count}
                        </div>
                      </div>

                      <div style={{ padding: '8px 12px', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{t('roads.unresolvedCount')}</div>
                        <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-high)' }}>{road.unresolved_count}</div>
                      </div>

                      <div style={{ padding: '8px 12px', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{t('roads.reopenedCount')}</div>
                        <div style={{ fontSize: '1.15rem', fontWeight: 800, color: road.reopened_count > 0 ? '#dc2626' : 'inherit' }}>
                          {road.reopened_count}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {road.near_miss_count} near misses recorded
                    </span>
                    <Link
                      to={`/map`}
                      className="btn btn-secondary btn-sm"
                    >
                      <span>{t('roads.viewHazards')}</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
