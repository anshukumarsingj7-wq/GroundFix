import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  Upload,
  UserCheck,
  Eye,
  RefreshCw,
  Search,
  ExternalLink,
  X,
  FileCheck
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { PriorityBadge, StatusBadge, SeverityBadge } from '../components/Badges';

export function OfficerDashboard() {
  const { t } = useLanguage();

  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({
    totalReports: 0,
    critical: 0,
    highRisk: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    reopened: 0
  });
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [riskTierFilter, setRiskTierFilter] = useState('all');
  const [roadFilter, setRoadFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Officer Action Modal State (Rule 22, 23)
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [actionStatus, setActionStatus] = useState('');
  const [actionNote, setActionNote] = useState('');
  const [actionDeptId, setActionDeptId] = useState('');
  const [actionBeforeUrl, setActionBeforeUrl] = useState('');
  const [actionAfterUrl, setActionAfterUrl] = useState('');
  const [actionSaving, setActionSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [compRes, statsRes, deptRes] = await Promise.all([
        api.getComplaints({
          status: statusFilter,
          severity: severityFilter,
          riskTier: riskTierFilter,
          road: roadFilter,
          search: searchTerm
        }),
        api.getDashboardStats(),
        api.getDepartments()
      ]);

      if (compRes && compRes.data) setComplaints(compRes.data);
      if (statsRes && statsRes.data) setStats(statsRes.data);
      if (deptRes && deptRes.data) setDepartments(deptRes.data);
    } catch (err) {
      setError(err.message || 'Failed to load officer dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, severityFilter, riskTierFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData();
  };

  const openActionModal = (comp) => {
    setSelectedComplaint(comp);
    setActionStatus(comp.status);
    setActionNote('');
    setActionDeptId(comp.department_id || (departments[0]?.id || ''));
    setActionBeforeUrl(comp.before_image_url || comp.image_url || '');
    setActionAfterUrl(comp.after_image_url || '');
  };

  const handleSaveAction = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    setActionSaving(true);

    try {
      // 1. Assign department if changed
      if (actionDeptId && actionDeptId !== selectedComplaint.department_id) {
        await api.assignDepartment(selectedComplaint.complaint_id, actionDeptId);
      }

      // 2. Update status and notes & proofs
      await api.updateStatus(selectedComplaint.complaint_id, {
        status: actionStatus,
        note: actionNote || `Status updated to ${actionStatus} by officer.`,
        before_image_url: actionBeforeUrl,
        after_image_url: actionAfterUrl
      });

      // Reload
      await loadData();
      setSelectedComplaint(null);
    } catch (err) {
      alert(`Error updating complaint: ${err.message}`);
    } finally {
      setActionSaving(false);
    }
  };

  // Smart Priority Queue Groups (Rule 21)
  const fixFirstList = complaints.filter(c => c.risk_score >= 81 && c.status !== 'Resolved');
  const fixNextList = complaints.filter(c => c.risk_score >= 61 && c.risk_score <= 80 && c.status !== 'Resolved');
  const normalList = complaints.filter(c => c.risk_score <= 60 && c.status !== 'Resolved');

  return (
    <div className="page-container">
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <div style={{ padding: '6px', backgroundColor: 'var(--color-primary-light)', borderRadius: 'var(--radius-md)', color: 'var(--color-primary)' }}>
                <ShieldAlert size={22} />
              </div>
              <h1 style={{ fontSize: '1.9rem', fontWeight: 800 }}>
                {t('officer.title')}
              </h1>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
              {t('officer.subtitle')}
            </p>
          </div>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={loadData}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'spin' : ''} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            <span>Refresh Feed</span>
          </button>
        </div>

        {/* Dashboard Top KPI Cards (Rule 20) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '14px',
          marginBottom: '28px'
        }}>
          <div className="card" style={{ padding: '16px 20px', borderLeft: '4px solid var(--text-primary)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t('officer.stats.total')}</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>{stats.totalReports}</div>
          </div>

          <div className="card" style={{ padding: '16px 20px', borderLeft: '4px solid var(--color-critical)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t('officer.stats.critical')}</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-critical)', fontFamily: 'var(--font-mono)' }}>{stats.critical}</div>
          </div>

          <div className="card" style={{ padding: '16px 20px', borderLeft: '4px solid var(--color-high)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t('officer.stats.high')}</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-high)', fontFamily: 'var(--font-mono)' }}>{stats.highRisk}</div>
          </div>

          <div className="card" style={{ padding: '16px 20px', borderLeft: '4px solid var(--color-medium)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t('officer.stats.pending')}</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-medium)', fontFamily: 'var(--font-mono)' }}>{stats.pending}</div>
          </div>

          <div className="card" style={{ padding: '16px 20px', borderLeft: '4px solid var(--color-primary)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t('officer.stats.inProgress')}</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-primary)', fontFamily: 'var(--font-mono)' }}>{stats.inProgress}</div>
          </div>

          <div className="card" style={{ padding: '16px 20px', borderLeft: '4px solid var(--color-resolved)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t('officer.stats.resolved')}</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-resolved)', fontFamily: 'var(--font-mono)' }}>{stats.resolved}</div>
          </div>

          <div className="card" style={{ padding: '16px 20px', borderLeft: '4px solid #ef4444' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t('officer.stats.reopened')}</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#dc2626', fontFamily: 'var(--font-mono)' }}>{stats.reopened}</div>
          </div>
        </div>

        {/* Smart Priority Queue Dispatch Highlights (Rule 21) */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '16px' }}>
            {t('officer.priorityQueueTitle')}
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '16px' }}>
            {/* 🔴 FIX FIRST */}
            <div className="card" style={{ borderTop: '4px solid var(--color-critical)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span className="badge priority-fix-first">
                  {t('officer.fixFirst')}
                </span>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  {fixFirstList.length} items
                </span>
              </div>

              {fixFirstList.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', padding: '12px 0' }}>No active critical hazards.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {fixFirstList.slice(0, 3).map((item) => (
                    <div
                      key={item.complaint_id}
                      style={{
                        padding: '10px 12px',
                        backgroundColor: 'var(--bg-subtle)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>{item.complaint_id}</strong>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{item.road_name}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--color-critical)', fontFamily: 'var(--font-mono)' }}>
                          Score: {item.risk_score}
                        </div>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => openActionModal(item)}
                          style={{ marginTop: '4px' }}
                        >
                          Manage
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 🟠 FIX NEXT */}
            <div className="card" style={{ borderTop: '4px solid var(--color-high)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span className="badge priority-fix-next">
                  {t('officer.fixNext')}
                </span>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  {fixNextList.length} items
                </span>
              </div>

              {fixNextList.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', padding: '12px 0' }}>No high-risk queue items.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {fixNextList.slice(0, 3).map((item) => (
                    <div
                      key={item.complaint_id}
                      style={{
                        padding: '10px 12px',
                        backgroundColor: 'var(--bg-subtle)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>{item.complaint_id}</strong>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{item.road_name}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--color-high)', fontFamily: 'var(--font-mono)' }}>
                          Score: {item.risk_score}
                        </div>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => openActionModal(item)}
                          style={{ marginTop: '4px' }}
                        >
                          Manage
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 🟡 NORMAL */}
            <div className="card" style={{ borderTop: '4px solid var(--color-medium)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span className="badge priority-normal">
                  {t('officer.normalPriority')}
                </span>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  {normalList.length} items
                </span>
              </div>

              {normalList.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', padding: '12px 0' }}>No normal priority items.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {normalList.slice(0, 3).map((item) => (
                    <div
                      key={item.complaint_id}
                      style={{
                        padding: '10px 12px',
                        backgroundColor: 'var(--bg-subtle)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>{item.complaint_id}</strong>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{item.road_name}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--color-medium)', fontFamily: 'var(--font-mono)' }}>
                          Score: {item.risk_score}
                        </div>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => openActionModal(item)}
                          style={{ marginTop: '4px' }}
                        >
                          Manage
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filters Bar (Rule 20) */}
        <div className="card" style={{ padding: '16px', marginBottom: '20px' }}>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            alignItems: 'center'
          }}>
            {/* Search */}
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '6px', flex: '1 1 200px' }}>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search road, ID, or description..."
                style={{ width: '100%', fontSize: '0.85rem' }}
              />
              <button type="submit" className="btn btn-secondary btn-sm">
                <Search size={14} />
              </button>
            </form>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ fontSize: '0.85rem' }}
            >
              <option value="all">Status: All</option>
              <option value="Reported">Reported</option>
              <option value="Verified">Verified</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Reopened">Reopened</option>
              <option value="Rejected">Rejected</option>
            </select>

            {/* Severity Filter */}
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              style={{ fontSize: '0.85rem' }}
            >
              <option value="all">Severity: All</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            {/* Risk Tier Filter */}
            <select
              value={riskTierFilter}
              onChange={(e) => setRiskTierFilter(e.target.value)}
              style={{ fontSize: '0.85rem' }}
            >
              <option value="all">Risk Tier: All</option>
              <option value="Critical">Critical (81–100)</option>
              <option value="High">High (61–80)</option>
              <option value="Medium">Medium (31–60)</option>
              <option value="Low">Low (0–30)</option>
            </select>
          </div>
        </div>

        {/* Complaints Table (Rule 20) */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{t('officer.tableTitle')}</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Showing {complaints.length} records</span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <th style={{ padding: '12px 16px' }}>{t('officer.tableHeaders.id')}</th>
                  <th style={{ padding: '12px 16px' }}>{t('officer.tableHeaders.location')}</th>
                  <th style={{ padding: '12px 16px' }}>{t('officer.tableHeaders.severity')}</th>
                  <th style={{ padding: '12px 16px' }}>{t('officer.tableHeaders.riskScore')}</th>
                  <th style={{ padding: '12px 16px' }}>{t('officer.tableHeaders.confirmations')}</th>
                  <th style={{ padding: '12px 16px' }}>{t('officer.tableHeaders.nearMisses')}</th>
                  <th style={{ padding: '12px 16px' }}>{t('officer.tableHeaders.status')}</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>{t('officer.tableHeaders.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {complaints.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No complaints match the selected filters.
                    </td>
                  </tr>
                ) : (
                  complaints.map((c) => (
                    <tr
                      key={c.complaint_id}
                      style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background-color var(--transition-fast)' }}
                    >
                      <td style={{ padding: '14px 16px' }}>
                        <Link to={`/track/${c.complaint_id}`} style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-primary)' }}>
                          {c.complaint_id}
                        </Link>
                      </td>
                      <td style={{ padding: '14px 16px', maxWidth: '240px' }}>
                        <div style={{ fontWeight: 600 }}>{c.road_name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          {c.description}
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <SeverityBadge severity={c.severity} size="sm" />
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <PriorityBadge score={c.risk_score} size="sm" />
                      </td>
                      <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)' }}>
                        {c.confirmation_count}
                      </td>
                      <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)' }}>
                        {c.near_miss_count || 0}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <StatusBadge status={c.status} size="sm" />
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => openActionModal(c)}
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Officer Action Modal (Rule 22, 23) */}
        {selectedComplaint && (
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
            padding: '20px',
            backdropFilter: 'blur(3px)'
          }}>
            <div className="card" style={{
              maxWidth: '680px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              position: 'relative'
            }}>
              {/* Modal Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Officer Action</h3>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-primary)' }}>
                      {selectedComplaint.complaint_id}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{selectedComplaint.road_name}</p>
                </div>
                <button onClick={() => setSelectedComplaint(null)}>
                  <X size={22} />
                </button>
              </div>

              <form onSubmit={handleSaveAction}>
                {/* Status selection */}
                <div className="form-group">
                  <label className="form-label">{t('officer.actions.changeStatus')}</label>
                  <select
                    style={{ width: '100%' }}
                    value={actionStatus}
                    onChange={(e) => setActionStatus(e.target.value)}
                  >
                    <option value="Reported">Reported</option>
                    <option value="Verified">Verified</option>
                    <option value="Assigned">Assigned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Reopened">Reopened</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                {/* Department assignment */}
                <div className="form-group">
                  <label className="form-label">{t('officer.actions.assignDept')}</label>
                  <select
                    style={{ width: '100%' }}
                    value={actionDeptId}
                    onChange={(e) => setActionDeptId(e.target.value)}
                  >
                    <option value="">-- Select Municipal Department --</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>

                {/* Officer Notes */}
                <div className="form-group">
                  <label className="form-label">{t('officer.actions.addNotes')}</label>
                  <textarea
                    rows={3}
                    style={{ width: '100%' }}
                    value={actionNote}
                    onChange={(e) => setActionNote(e.target.value)}
                    placeholder={t('officer.actions.notesPlaceholder')}
                  />
                </div>

                {/* Proof Photos (Rule 23) */}
                <div className="form-group" style={{ backgroundColor: 'var(--bg-subtle)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                  <label className="form-label" style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FileCheck size={16} color="var(--color-primary)" />
                    <span>Before & After Repair Proof Evidence (Rule 23)</span>
                  </label>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                        Before Repair Photo URL
                      </label>
                      <input
                        type="url"
                        style={{ width: '100%', fontSize: '0.82rem' }}
                        value={actionBeforeUrl}
                        onChange={(e) => setActionBeforeUrl(e.target.value)}
                        placeholder="https://... or /uploads/..."
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px', color: actionStatus === 'Resolved' ? 'var(--color-low)' : 'inherit' }}>
                        After Repair Photo URL {actionStatus === 'Resolved' ? '(Recommended/Proof)' : ''}
                      </label>
                      <input
                        type="url"
                        style={{ width: '100%', fontSize: '0.82rem' }}
                        value={actionAfterUrl}
                        onChange={(e) => setActionAfterUrl(e.target.value)}
                        placeholder="https://... or /uploads/..."
                      />
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setSelectedComplaint(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={actionSaving}>
                    <span>{actionSaving ? 'Saving Action...' : t('officer.actions.saveChanges')}</span>
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
