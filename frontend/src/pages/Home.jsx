import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  Search,
  Map,
  Compass,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Activity,
  Car,
  FileCheck
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';

export function Home() {
  const { t } = useLanguage();
  const [stats, setStats] = useState({
    totalReports: 7,
    critical: 2,
    highRisk: 3,
    resolved: 1,
    inProgress: 3
  });

  useEffect(() => {
    api.getDashboardStats()
      .then(res => {
        if (res && res.data) {
          setStats(res.data);
        }
      })
      .catch(err => console.warn('Could not fetch home stats:', err.message));
  }, []);

  const processSteps = [
    { title: t('process.step1Title'), desc: t('process.step1Desc'), icon: <AlertTriangle size={24} color="#ea580c" /> },
    { title: t('process.step2Title'), desc: t('process.step2Desc'), icon: <FileCheck size={24} color="#0284c7" /> },
    { title: t('process.step3Title'), desc: t('process.step3Desc'), icon: <TrendingUp size={24} color="#f59e0b" /> },
    { title: t('process.step4Title'), desc: t('process.step4Desc'), icon: <ShieldAlert size={24} color="#dc2626" /> },
    { title: t('process.step5Title'), desc: t('process.step5Desc'), icon: <CheckCircle2 size={24} color="#16a34a" /> },
    { title: t('process.step6Title'), desc: t('process.step6Desc'), icon: <Car size={24} color="#059669" /> }
  ];

  return (
    <div className="page-container">
      {/* Hero Section */}
      <section style={{
        padding: '50px 0 60px',
        textAlign: 'center',
        position: 'relative'
      }}>
        <div className="container" style={{ maxWidth: '880px' }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--color-primary-light)',
            color: 'var(--color-primary)',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: '20px'
          }}>
            <Activity size={16} />
            <span>Citizen-Powered Road Safety Intelligence</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            color: 'var(--text-primary)',
            marginBottom: '12px'
          }}>
            GroundFix
          </h1>

          <h2 style={{
            fontSize: 'clamp(1.25rem, 2.8vw, 1.85rem)',
            fontWeight: 700,
            color: '#ea580c',
            letterSpacing: '-0.01em',
            marginBottom: '18px'
          }}>
            Report. Fix. Safer Roads.
          </h2>

          <p style={{
            fontSize: 'clamp(1rem, 1.8vw, 1.2rem)',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            maxWidth: '680px',
            margin: '0 auto 36px'
          }}>
            {t('heroDescription')}
          </p>

          {/* Primary Action Buttons (Rule 6) */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '14px',
            justifyContent: 'center',
            marginBottom: '48px'
          }}>
            <Link to="/report" className="btn btn-primary btn-lg" style={{ backgroundColor: '#ea580c' }}>
              <AlertTriangle size={20} />
              <span>{t('common.reportHazard')}</span>
            </Link>
            <Link to="/track" className="btn btn-secondary btn-lg">
              <Search size={20} />
              <span>{t('common.trackComplaint')}</span>
            </Link>
            <Link to="/map" className="btn btn-secondary btn-lg">
              <Map size={20} />
              <span>{t('common.safetyMap')}</span>
            </Link>
            <Link to="/driver" className="btn btn-secondary btn-lg">
              <Compass size={20} />
              <span>{t('common.driverMode')}</span>
            </Link>
            <Link to="/officer" className="btn btn-secondary btn-lg">
              <ShieldAlert size={20} />
              <span>{t('common.officerDashboard')}</span>
            </Link>
          </div>

          {/* Live Platform KPI Stats Bar */}
          <div className="card" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '20px',
            padding: '24px',
            textAlign: 'center',
            backgroundColor: 'var(--bg-surface)'
          }}>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                {stats.totalReports}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                {t('officer.stats.total')}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-critical)', fontFamily: 'var(--font-mono)' }}>
                {stats.critical}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                {t('officer.stats.critical')}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-high)', fontFamily: 'var(--font-mono)' }}>
                {stats.highRisk}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                {t('officer.stats.high')}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-low)', fontFamily: 'var(--font-mono)' }}>
                {stats.resolved}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                {t('officer.stats.resolved')}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-primary)', fontFamily: 'var(--font-mono)' }}>
                {stats.inProgress}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                {t('officer.stats.inProgress')}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Flow Section (Rule 6) */}
      <section style={{
        padding: '60px 0',
        backgroundColor: 'var(--bg-subtle)',
        borderTop: '1px solid var(--border-subtle)',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>
              {t('process.title')}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              {t('process.subtitle')}
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px',
            position: 'relative'
          }}>
            {processSteps.map((step, idx) => (
              <div
                key={idx}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  padding: '24px 16px',
                  position: 'relative'
                }}
              >
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--bg-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '14px',
                  border: '1px solid var(--border-subtle)'
                }}>
                  {step.icon}
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  marginBottom: '4px'
                }}>
                  Step {idx + 1}
                </div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '8px' }}>
                  {step.title}
                </h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Spotlight Callouts */}
      <section style={{ padding: '60px 0' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px'
          }}>
            {/* Driver Mode Spotlight */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-primary-light)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px'
                }}>
                  <Compass size={24} />
                </div>
                <h4 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '10px' }}>
                  Driver Mode Hazard Co-Pilot
                </h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
                  Drive safely with proactive proximity alerts. Detect potholes and high-risk road defects 350m–1km ahead, with direct deep-links to Google Maps.
                </p>
              </div>
              <Link to="/driver" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
                <span>Launch Driver Mode</span>
                <ArrowRight size={16} />
              </Link>
            </div>

            {/* Smart Priority Queue Spotlight */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#fee2e2',
                  color: '#dc2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px'
                }}>
                  <ShieldAlert size={24} />
                </div>
                <h4 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '10px' }}>
                  Officer Smart Priority Queue
                </h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
                  Municipal teams resolve critical hazards first (Fix First, Fix Next, Normal). Every resolution requires Before & After repair evidence photos verified by citizens.
                </p>
              </div>
              <Link to="/officer" className="btn btn-secondary" style={{ alignSelf: 'flex-start' }}>
                <span>Open Officer Dashboard</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
