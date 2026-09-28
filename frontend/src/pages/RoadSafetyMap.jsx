import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import { Map as MapIcon, Filter, Layers, ExternalLink, RefreshCw } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { PriorityBadge, StatusBadge, SeverityBadge } from '../components/Badges';

export function RoadSafetyMap() {
  const { t } = useLanguage();
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersGroupRef = useRef(null);

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeOnly, setActiveOnly] = useState(false);

  // Fetch complaints
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.getComplaints();
      if (res && res.data) {
        setComplaints(res.data);
      }
    } catch (err) {
      console.warn('Failed to load map data:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [12.9716, 77.5946], // Bangalore center default
        zoom: 12
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
      markersGroupRef.current = markersGroup;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers when complaints or filters change
  useEffect(() => {
    if (!mapInstanceRef.current || !markersGroupRef.current) return;

    const group = markersGroupRef.current;
    group.clearLayers();

    let filtered = [...complaints];

    if (severityFilter !== 'all') {
      filtered = filtered.filter(c => c.severity.toLowerCase() === severityFilter.toLowerCase());
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.status.toLowerCase() === statusFilter.toLowerCase());
    }
    if (activeOnly) {
      filtered = filtered.filter(c => c.status !== 'Resolved' && c.status !== 'Rejected');
    }

    const bounds = [];

    filtered.forEach((c) => {
      if (!c.latitude || !c.longitude) return;

      // Color code by severity & resolved status
      let pinColor = '#ea580c';
      if (c.status === 'Resolved') {
        pinColor = '#10b981';
      } else if (c.severity === 'Critical' || c.risk_score >= 81) {
        pinColor = '#dc2626';
      } else if (c.severity === 'High' || c.risk_score >= 61) {
        pinColor = '#ea580c';
      } else if (c.severity === 'Medium') {
        pinColor = '#f59e0b';
      } else {
        pinColor = '#16a34a';
      }

      const customIcon = L.divIcon({
        className: 'custom-hazard-pin',
        html: `<div style="
          background-color: ${pinColor};
          width: 30px;
          height: 30px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 2px solid #ffffff;
          box-shadow: 0 4px 6px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        ">
          <div style="
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background-color: #ffffff;
          "></div>
        </div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -30]
      });

      const popupHtml = `
        <div style="font-family: var(--font-main); min-width: 220px; padding: 4px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <strong style="font-family: var(--font-mono); font-size: 1.05rem; color: #0284c7;">${c.complaint_id}</strong>
            <span style="font-size: 0.75rem; padding: 2px 6px; border-radius: 4px; background: #f1f5f9; font-weight: 700;">${c.status}</span>
          </div>
          <div style="font-weight: 700; font-size: 0.9rem; margin-bottom: 4px;">${c.road_name}</div>
          <div style="font-size: 0.8rem; color: #475569; margin-bottom: 8px;">${c.description?.substring(0, 80)}...</div>
          <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 8px; border-top: 1px solid #e2e8f0; padding-top: 6px;">
            <span>Risk Score: <strong style="color: ${pinColor};">${c.risk_score}/100</strong></span>
            <span>Confirmations: <strong>${c.confirmation_count}</strong></span>
          </div>
          <a href="/track/${c.complaint_id}" style="display: block; text-align: center; background: #0284c7; color: #fff; padding: 6px 12px; border-radius: 6px; font-size: 0.82rem; font-weight: 600; text-decoration: none;">
            Track Details & Proof →
          </a>
        </div>
      `;

      const marker = L.marker([c.latitude, c.longitude], { icon: customIcon });
      marker.bindPopup(popupHtml);
      group.addLayer(marker);
      bounds.push([c.latitude, c.longitude]);
    });

    if (bounds.length > 0 && mapInstanceRef.current) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [complaints, severityFilter, statusFilter, activeOnly]);

  return (
    <div className="page-container" style={{ paddingBottom: '20px' }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '18px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <div style={{ padding: '6px', backgroundColor: 'var(--color-primary-light)', borderRadius: 'var(--radius-md)', color: 'var(--color-primary)' }}>
                <MapIcon size={20} />
              </div>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>
                {t('map.title')}
              </h1>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {t('map.subtitle')}
            </p>
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={loadData}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            <span>Refresh Map</span>
          </button>
        </div>

        {/* Filters & Legend Bar */}
        <div className="card" style={{ padding: '14px 20px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
            {/* Filter controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                <Filter size={14} style={{ display: 'inline', marginRight: '4px' }} />
                Filters:
              </span>

              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                style={{ fontSize: '0.85rem', padding: '6px 12px' }}
              >
                <option value="all">Severity: All</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ fontSize: '0.85rem', padding: '6px 12px' }}
              >
                <option value="all">Status: All</option>
                <option value="Reported">Reported</option>
                <option value="Verified">Verified</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Reopened">Reopened</option>
              </select>

              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={activeOnly}
                  onChange={(e) => setActiveOnly(e.target.checked)}
                />
                <span>Active Hazards Only</span>
              </label>
            </div>

            {/* Map Legend */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.8rem', fontWeight: 600, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#dc2626' }} />
                <span>Critical</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ea580c' }} />
                <span>High</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
                <span>Medium</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                <span>Resolved</span>
              </div>
            </div>
          </div>
        </div>

        {/* Full-width Map Container */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', height: '620px', position: 'relative' }}>
          <div ref={mapContainerRef} style={{ width: '100%', height: '100%', minHeight: '620px' }} />
        </div>
      </div>
    </div>
  );
}
