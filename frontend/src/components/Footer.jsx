import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ShieldCheck, Heart } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer style={{
      backgroundColor: 'var(--bg-surface)',
      borderTop: '1px solid var(--border-subtle)',
      padding: '48px 0 24px',
      marginTop: 'auto'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '36px',
          marginBottom: '36px'
        }}>
          {/* Brand info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#ea580c',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff'
              }}>
                <AlertTriangle size={18} strokeWidth={2.5} />
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>GroundFix</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '14px' }}>
              {t('heroDescription')}
            </p>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <strong>Tagline: </strong>Report. Fix. Safer Roads.
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>
              Platform Navigation
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem' }}>
              <li><Link to="/report" style={{ color: 'var(--text-secondary)' }}>{t('nav.report')}</Link></li>
              <li><Link to="/track" style={{ color: 'var(--text-secondary)' }}>{t('nav.track')}</Link></li>
              <li><Link to="/map" style={{ color: 'var(--text-secondary)' }}>{t('nav.map')}</Link></li>
              <li><Link to="/driver" style={{ color: 'var(--text-secondary)' }}>{t('nav.driver')}</Link></li>
              <li><Link to="/roads" style={{ color: 'var(--text-secondary)' }}>{t('nav.roads')}</Link></li>
              <li><Link to="/officer" style={{ color: 'var(--text-secondary)' }}>{t('nav.officer')}</Link></li>
            </ul>
          </div>

          {/* Safety & Hackathon Notice */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>
              Road Safety Standards
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '12px' }}>
              Dynamic 0–100 Risk Score factoring in community confirmations, near-miss accidents, and road transit density.
            </p>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-subtle)',
              fontSize: '0.78rem',
              color: 'var(--text-muted)'
            }}>
              <ShieldCheck size={16} color="var(--color-low)" />
              <span>Civic-Tech Hackathon Architecture</span>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div style={{
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '0.8rem',
          color: 'var(--text-muted)'
        }}>
          <div>
            &copy; {new Date().getFullYear()} GroundFix — Smart Road Safety Platform. All rights reserved.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>Built for safer streets & zero road casualties</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
