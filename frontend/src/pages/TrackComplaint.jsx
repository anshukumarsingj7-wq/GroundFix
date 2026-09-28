import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Search,
  CheckCircle2,
  Clock,
  ThumbsUp,
  AlertTriangle,
  History,
  ShieldCheck,
  ChevronRight,
  RefreshCw,
  Image as ImageIcon,
  UserCheck,
  RotateCcw,
  Check,
  X
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { PriorityBadge, StatusBadge, SeverityBadge } from '../components/Badges';
import { RiskGauge } from '../components/RiskGauge';
import { getClientIdentifier, hasConfirmedLocally, markConfirmedLocally } from '../utils/clientIdentifier';

export function TrackComplaint() {
  const { complaintId: routeId } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [searchInput, setSearchInput] = useState(routeId || '');
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Confirmation state
  const [confirming, setConfirming] = useState(false);
  const [confirmMsg, setConfirmMsg] = useState(null);

  // Near miss modal state
  const [showNearMissModal, setShowNearMissModal] = useState(false);
  const [nmType, setNmType] = useState('Almost crashed');
  const [nmDetails, setNmDetails] = useState('');
  const [submittingNm, setSubmittingNm] = useState(false);

  // Reverification state (Rule 24)
  const [reverifying, setReverifying] = useState(false);
  const [reverifyMsg, setReverifyMsg] = useState(null);

  const fetchComplaintData = async (id) => {
    if (!id) return;
    setLoading(true);
    setError(null);
    setConfirmMsg(null);
    setReverifyMsg(null);

    try {
      const res = await api.getComplaint(id.trim());
      if (res && res.data) {
        setComplaint(res.data);
      } else {
        setError(`Complaint '${id}' not found.`);
        setComplaint(null);
      }
    } catch (err) {
      setError(err.message || `Complaint '${id}' not found.`);
      setComplaint(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (routeId) {
      setSearchInput(routeId);
      fetchComplaintData(routeId);
    }
  }, [routeId]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/track/${searchInput.trim().toUpperCase()}`);
    }
  };

  // Community Confirmation ("👥 I also see this problem", Rule 16)
  const handleConfirm = async () => {
    if (!complaint) return;
    const clientId = getClientIdentifier();

    if (hasConfirmedLocally(complaint.complaint_id)) {
      setConfirmMsg(t('track.alreadyConfirmed'));
      return;
    }

    setConfirming(true);
    try {
      const res = await api.confirmComplaint(complaint.complaint_id, clientId);
      if (res && res.data) {
        setComplaint(res.data);
        markConfirmedLocally(complaint.complaint_id);
        setConfirmMsg(res.already_confirmed ? t('track.alreadyConfirmed') : t('track.confirmedSuccess'));
      }
    } catch (err) {
      setConfirmMsg(err.message || 'Unable to record confirmation.');
    } finally {
      setConfirming(false);
    }
  };

  // Add Near Miss (Rule 18)
  const handleAddNearMiss = async (e) => {
    e.preventDefault();
    if (!complaint) return;
    setSubmittingNm(true);

    try {
      const res = await api.addNearMiss(complaint.complaint_id, {
        near_miss_type: nmType,
        details: nmDetails
      });
      if (res && res.data) {
        setComplaint(res.data);
        setShowNearMissModal(false);
        setNmDetails('');
      }
    } catch (err) {
      alert(`Error logging near miss: ${err.message}`);
    } finally {
      setSubmittingNm(false);
    }
  };

  // Citizen Re-verification (Rule 24)
  const handleReverify = async (isFixed) => {
    if (!complaint) return;
    setReverifying(true);
    try {
      const res = await api.reverifyComplaint(complaint.complaint_id, isFixed);
      if (res && res.data) {
        setComplaint(res.data);
        setReverifyMsg(isFixed ? t('track.verifiedSuccess') : t('track.reopenedSuccess'));
      }
    } catch (err) {
      setReverifyMsg(err.message || 'Failed to update re-verification.');
    } finally {
      setReverifying(false);
    }
  };

  const demoPills = ['POT-1001', 'POT-1002', 'POT-1003', 'POT-1006', 'POT-1007'];

  return (
    <div className="page-container">
      <div className="container" style={{ maxWidth: '900px' }}>
        {/* Header & Search */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '6px' }}>
            {t('track.title')}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '20px' }}>
            {t('track.subtitle')}
          </p>

          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', maxWidth: '540px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={t('track.searchPlaceholder')}
                style={{ width: '100%', paddingLeft: '38px', textTransform: 'uppercase' }}
              />
              <Search
                size={18}
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading || !searchInput.trim()}>
              <span>{t('track.searchBtn')}</span>
            </button>
          </form>

          {/* Demo Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('track.quickSearchTitle')}</span>
            {demoPills.map((pill) => (
              <button
                key={pill}
                type="button"
                onClick={() => navigate(`/track/${pill}`)}
                style={{
                  padding: '3px 9px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--bg-subtle)',
                  border: '1px solid var(--border-medium)',
                  fontSize: '0.78rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--color-primary)',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {pill}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
            <RefreshCw size={28} className="spin" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px', color: 'var(--color-primary)' }} />
            <p style={{ color: 'var(--text-muted)' }}>{t('common.loading')}</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div style={{
            padding: '20px',
            backgroundColor: 'var(--color-critical-bg)',
            color: 'var(--color-critical)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-critical-border)',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <AlertTriangle size={24} />
            <div>
              <strong>Complaint Not Found</strong>
              <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>{error}</p>
            </div>
          </div>
        )}

        {/* Complaint Details View */}
        {complaint && !loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Top Overview Card */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginBottom: '18px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                      {complaint.complaint_id}
                    </span>
                    <StatusBadge status={complaint.status} />
                    <SeverityBadge severity={complaint.severity} />
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    {complaint.road_name}
                  </h3>
                </div>

                {/* Priority Queue Tag */}
                <PriorityBadge score={complaint.risk_score} />
              </div>

              {/* Description */}
              <p style={{ fontSize: '0.95rem', lineHeight: 1.55, color: 'var(--text-primary)', marginBottom: '20px' }}>
                {complaint.description}
              </p>

              {/* Photo & Risk Score Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '20px',
                marginBottom: '20px'
              }}>
                {/* Photo Preview with Authenticity Badge */}
                {complaint.image_url ? (
                  <div style={{
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: '#000',
                    position: 'relative'
                  }}>
                    <img
                      src={complaint.image_url}
                      alt="Hazard report evidence"
                      style={{ width: '100%', height: '220px', objectFit: 'cover', display: 'block' }}
                    />
                    <div style={{
                      position: 'absolute',
                      bottom: '8px',
                      left: '8px',
                      backgroundColor: 'rgba(15, 23, 42, 0.85)',
                      color: '#ffffff',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      backdropFilter: 'blur(4px)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}>
                      <ShieldCheck size={14} color="#38bdf8" />
                      <span>{complaint.image_auth_status} ({complaint.image_auth_score}%)</span>
                    </div>
                  </div>
                ) : (
                  <div style={{
                    height: '220px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px dashed var(--border-medium)',
                    backgroundColor: 'var(--bg-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-muted)'
                  }}>
                    <ImageIcon size={32} style={{ marginBottom: '8px' }} />
                    <span style={{ fontSize: '0.85rem' }}>No photo attached</span>
                  </div>
                )}

                {/* Risk Gauge */}
                <RiskGauge
                  score={complaint.risk_score}
                  explanation={`${complaint.severity} hazard on ${complaint.road_name} with ${complaint.confirmation_count} confirmations and ${complaint.near_miss_count || 0} reported near-miss incidents.`}
                />
              </div>

              {/* Action Buttons: Confirm & Near Miss */}
              <div style={{
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap',
                paddingTop: '16px',
                borderTop: '1px solid var(--border-subtle)'
              }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleConfirm}
                  disabled={confirming}
                  style={{
                    backgroundColor: hasConfirmedLocally(complaint.complaint_id) ? 'var(--color-low-bg)' : 'var(--bg-subtle)',
                    borderColor: hasConfirmedLocally(complaint.complaint_id) ? 'var(--color-low-border)' : 'var(--border-medium)',
                    color: hasConfirmedLocally(complaint.complaint_id) ? 'var(--color-low)' : 'var(--text-primary)'
                  }}
                >
                  <ThumbsUp size={16} />
                  <span>{t('track.confirmButton')} ({complaint.confirmation_count})</span>
                </button>

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowNearMissModal(true)}
                >
                  <AlertTriangle size={16} color="var(--color-high)" />
                  <span>{t('track.addNearMissBtn')} ({complaint.near_miss_count || 0})</span>
                </button>
              </div>

              {confirmMsg && (
                <div style={{
                  marginTop: '12px',
                  padding: '8px 14px',
                  backgroundColor: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.82rem',
                  color: 'var(--text-secondary)'
                }}>
                  {confirmMsg}
                </div>
              )}
            </div>

            {/* Citizen Re-verification Banner (Rule 24) */}
            {complaint.status === 'Resolved' && (
              <div style={{
                padding: '24px',
                backgroundColor: 'var(--bg-card)',
                borderRadius: 'var(--radius-lg)',
                border: '2px solid var(--color-resolved)',
                boxShadow: 'var(--shadow-md)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', color: 'var(--color-resolved)' }}>
                  <UserCheck size={24} />
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                    {t('track.reverificationTitle')}
                  </h3>
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                  {t('track.reverificationDesc')}
                </p>

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={() => handleReverify(true)}
                    disabled={reverifying}
                  >
                    <Check size={18} />
                    <span>{t('track.yesFixed')}</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => handleReverify(false)}
                    disabled={reverifying}
                  >
                    <RotateCcw size={18} />
                    <span>{t('track.noStillExists')}</span>
                  </button>
                </div>

                {reverifyMsg && (
                  <div style={{ marginTop: '12px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-primary)' }}>
                    {reverifyMsg}
                  </div>
                )}
              </div>
            )}

            {/* Before / After Proof Comparison (Rule 23) */}
            {(complaint.before_image_url || complaint.after_image_url) && (
              <div className="card">
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={20} color="var(--color-primary)" />
                  <span>{t('track.beforeAfterTitle')}</span>
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
                  {/* Before */}
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-critical)', marginBottom: '8px', textTransform: 'uppercase' }}>
                      {t('track.beforeLabel')}
                    </div>
                    {complaint.before_image_url ? (
                      <img
                        src={complaint.before_image_url}
                        alt="Before repair proof"
                        style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: 'var(--radius-md)' }}
                      />
                    ) : (
                      <div style={{ height: '200px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        No initial photo
                      </div>
                    )}
                  </div>

                  {/* After */}
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-low)', marginBottom: '8px', textTransform: 'uppercase' }}>
                      {t('track.afterLabel')}
                    </div>
                    {complaint.after_image_url ? (
                      <img
                        src={complaint.after_image_url}
                        alt="After repair proof"
                        style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: 'var(--radius-md)' }}
                      />
                    ) : (
                      <div style={{ height: '200px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '16px' }}>
                        {t('track.noProofYet')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Status History Timeline (Rule 15, Rule 22) */}
            <div className="card">
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <History size={20} color="var(--color-primary)" />
                <span>{t('track.historyTitle')}</span>
              </h4>

              <div style={{ position: 'relative', paddingLeft: '24px' }}>
                {/* Timeline vertical bar */}
                <div style={{
                  position: 'absolute',
                  left: '7px',
                  top: '8px',
                  bottom: '8px',
                  width: '2px',
                  backgroundColor: 'var(--border-medium)'
                }} />

                {complaint.status_history?.map((step, idx) => (
                  <div key={idx} style={{ position: 'relative', marginBottom: '20px' }}>
                    {/* Circle marker */}
                    <div style={{
                      position: 'absolute',
                      left: '-24px',
                      top: '4px',
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--bg-surface)',
                      border: '3px solid var(--color-primary)'
                    }} />

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{step.status}</span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {new Date(step.created_at).toLocaleDateString()} at {new Date(step.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {step.note && (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                        {step.note}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Near Miss Reports List */}
            {complaint.near_miss_reports?.length > 0 && (
              <div className="card">
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px' }}>
                  {t('track.nearMissLabel')} ({complaint.near_miss_reports.length})
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {complaint.near_miss_reports.map((nm, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '12px 16px',
                        backgroundColor: 'var(--bg-subtle)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.88rem'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <strong style={{ color: 'var(--color-high)' }}>{nm.near_miss_type}</strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {new Date(nm.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {nm.details && (
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                          {nm.details}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal: Add Near Miss Report */}
        {showNearMissModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}>
            <div className="card" style={{ maxWidth: '500px', width: '100%', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                  {t('track.addNearMissModalTitle')}
                </h3>
                <button onClick={() => setShowNearMissModal(false)}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddNearMiss}>
                <div className="form-group">
                  <label className="form-label">Incident Type</label>
                  <select
                    style={{ width: '100%' }}
                    value={nmType}
                    onChange={(e) => setNmType(e.target.value)}
                  >
                    <option value="Almost crashed">Almost crashed</option>
                    <option value="Almost fell">Almost fell</option>
                    <option value="Vehicle damaged">Vehicle damaged</option>
                    <option value="Difficult for pedestrians">Difficult for pedestrians</option>
                    <option value="Accessibility issue">Accessibility issue</option>
                    <option value="Traffic obstruction">Traffic obstruction</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Incident Details (optional)</label>
                  <textarea
                    rows={3}
                    style={{ width: '100%' }}
                    value={nmDetails}
                    onChange={(e) => setNmDetails(e.target.value)}
                    placeholder="Describe what occurred or vehicle damage..."
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowNearMissModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={submittingNm}>
                    <span>{submittingNm ? 'Saving...' : 'Submit Incident'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
