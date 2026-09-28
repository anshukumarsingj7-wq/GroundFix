import React, { useState, useEffect, useRef } from 'react';
import {
  Compass,
  Navigation,
  AlertTriangle,
  Volume2,
  VolumeX,
  Play,
  Pause,
  ExternalLink,
  MapPin,
  ShieldAlert,
  Car,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { PriorityBadge, SeverityBadge } from '../components/Badges';

export function DriverMode() {
  const { t } = useLanguage();

  // Driver Location
  const [coords, setCoords] = useState(null);
  const [speed, setSpeed] = useState(0); // km/h
  const [gpsError, setGpsError] = useState(null);
  const [gpsActive, setGpsActive] = useState(false);

  // Sound alert
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Hazards list
  const [nearbyHazards, setNearbyHazards] = useState([]);
  const [loading, setLoading] = useState(false);

  // Simulation mode (Demo Mode for judges & desktop testing)
  const [isSimulating, setIsSimulating] = useState(false);
  const simIntervalRef = useRef(null);
  const simStepRef = useRef(0);

  // Demo route coordinates along Bangalore transit corridor (MG Road -> Indiranagar -> Whitefield)
  const DEMO_ROUTE = [
    { lat: 12.9760, lng: 77.5910, road: 'MG Road Junction', speed: 42 },
    { lat: 12.9735, lng: 77.5930, road: 'MG Road East', speed: 38 },
    { lat: 12.9718, lng: 77.5948, road: 'Near Trinity Junction (POT-1001 Ahead)', speed: 25 },
    { lat: 12.9750, lng: 77.6200, road: 'Approaching Indiranagar', speed: 45 },
    { lat: 12.9780, lng: 77.6400, road: 'Indiranagar 100ft Road (POT-1003 Ahead)', speed: 30 },
    { lat: 12.9850, lng: 77.6600, road: 'Old Airport Road', speed: 50 },
    { lat: 12.9910, lng: 77.6870, road: 'Whitefield Main Road (POT-1004 Ahead)', speed: 35 }
  ];

  // Geolocation watch
  useEffect(() => {
    let watchId = null;

    if (navigator.geolocation && !isSimulating) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setCoords({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
          });
          setSpeed(pos.coords.speed ? Math.round(pos.coords.speed * 3.6) : 0);
          setGpsActive(true);
          setGpsError(null);
        },
        (err) => {
          setGpsError(err.message || 'Location permission denied.');
          setGpsActive(false);
        },
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
      );
    }

    return () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    };
  }, [isSimulating]);

  // Fetch nearby hazards whenever coordinates update
  useEffect(() => {
    if (!coords) return;

    api.getNearbyHazards(coords.latitude, coords.longitude, 10000)
      .then((res) => {
        if (res && res.data) {
          setNearbyHazards(res.data);

          // Audio Alert Trigger if nearest hazard is critical and within 500m
          const closest = res.data[0];
          if (closest && closest.distance_meters <= 500 && closest.risk_score >= 61 && soundEnabled) {
            triggerAudioAlert(closest);
          }
        }
      })
      .catch((err) => console.warn('Could not fetch driver hazards:', err.message));
  }, [coords]);

  // Audio Speech Alert
  const lastSpokenRef = useRef(null);
  const triggerAudioAlert = (hazard) => {
    if (!window.speechSynthesis) return;

    // Throttle duplicate audio alerts within 20 seconds
    const now = Date.now();
    if (lastSpokenRef.current && (now - lastSpokenRef.current < 20000)) {
      return;
    }
    lastSpokenRef.current = now;

    try {
      const msg = new SpeechSynthesisUtterance(
        `Caution! ${hazard.severity} risk ${hazard.hazard_type.replace('_', ' ')} ahead in ${hazard.distance_meters} meters on ${hazard.road_name}.`
      );
      msg.rate = 1.05;
      window.speechSynthesis.speak(msg);
    } catch (e) {
      // ignore speech synth restrictions
    }
  };

  // Toggle Simulation Route
  const toggleSimulation = () => {
    if (isSimulating) {
      clearInterval(simIntervalRef.current);
      setIsSimulating(false);
    } else {
      setIsSimulating(true);
      setGpsError(null);
      setGpsActive(true);

      // Start demo sequence
      simStepRef.current = 0;
      const initialStep = DEMO_ROUTE[0];
      setCoords({ latitude: initialStep.lat, longitude: initialStep.lng });
      setSpeed(initialStep.speed);

      simIntervalRef.current = setInterval(() => {
        simStepRef.current = (simStepRef.current + 1) % DEMO_ROUTE.length;
        const next = DEMO_ROUTE[simStepRef.current];
        setCoords({ latitude: next.lat, longitude: next.lng });
        setSpeed(next.speed);
      }, 4000); // changes location every 4s
    }
  };

  useEffect(() => {
    return () => {
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    };
  }, []);

  // Format distance
  const formatMeters = (m) => {
    if (m === undefined || m === null) return '';
    if (m < 1000) return `${Math.round(m)} m`;
    return `${(m / 1000).toFixed(1)} km`;
  };

  // Open in Navigation Deep Link (Rule 28)
  const openInGoogleMaps = (hazard) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${hazard.latitude},${hazard.longitude}&travelmode=driving`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="page-container" style={{ paddingBottom: '40px' }}>
      <div className="container" style={{ maxWidth: '860px' }}>
        {/* Title */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '24px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <div style={{ padding: '6px', backgroundColor: '#ea580c', borderRadius: 'var(--radius-md)', color: '#ffffff' }}>
                <Compass size={22} />
              </div>
              <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>
                {t('driver.title')}
              </h1>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
              {t('driver.subtitle')}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {/* Audio Toggle */}
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? t('driver.soundOn') : t('driver.soundOff')}
            >
              {soundEnabled ? <Volume2 size={16} color="var(--color-primary)" /> : <VolumeX size={16} color="var(--text-muted)" />}
              <span>{soundEnabled ? 'Audio ON' : 'Audio OFF'}</span>
            </button>

            {/* Demo Route Simulation Toggle */}
            <button
              type="button"
              className={`btn btn-sm ${isSimulating ? 'btn-danger' : 'btn-primary'}`}
              onClick={toggleSimulation}
            >
              {isSimulating ? <Pause size={16} /> : <Play size={16} />}
              <span>{isSimulating ? t('driver.stopSim') : t('driver.startSim')}</span>
            </button>
          </div>
        </div>

        {/* GPS Permission Warning Fallback (Rule 27) */}
        {!coords && gpsError && !isSimulating && (
          <div className="card" style={{
            padding: '32px 24px',
            textAlign: 'center',
            backgroundColor: 'var(--bg-card)',
            border: '2px dashed var(--border-medium)',
            marginBottom: '24px'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: '#fee2e2',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <Navigation size={28} />
            </div>

            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '8px' }}>
              {t('driver.enableGpsTitle')}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '480px', margin: '0 auto 20px' }}>
              "{t('driver.enableGpsDesc')}"
            </p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setGpsError(null);
                  navigator.geolocation?.getCurrentPosition(() => {}, () => {});
                }}
              >
                <Navigation size={18} />
                <span>{t('driver.enableGpsBtn')}</span>
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={toggleSimulation}
              >
                <Play size={18} />
                <span>Run Demo Route Simulation</span>
              </button>
            </div>
          </div>
        )}

        {/* Live HUD Dashboard Card */}
        {coords && (
          <div className="card" style={{
            backgroundColor: 'var(--bg-card)',
            border: isSimulating ? '2px solid #ea580c' : '1px solid var(--border-subtle)',
            padding: '24px',
            marginBottom: '24px',
            boxShadow: 'var(--shadow-md)'
          }}>
            {isSimulating && (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '3px 10px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: '#ffedd5',
                color: '#9a3412',
                fontSize: '0.75rem',
                fontWeight: 800,
                marginBottom: '16px'
              }}>
                <span>DEMO SIMULATION ACTIVE</span>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '20px', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                  {t('driver.currentLocation')}
                </span>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={16} color="var(--color-primary)" />
                  <span style={{ fontFamily: 'var(--font-mono)' }}>
                    {coords.latitude.toFixed(4)}, {coords.longitude.toFixed(4)}
                  </span>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                  {t('driver.drivingSpeed')}
                </span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-primary)', marginTop: '2px' }}>
                  {speed} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>km/h</span>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Corridor Hazards
                </span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: nearbyHazards.length > 0 ? 'var(--color-high)' : 'var(--color-low)', marginTop: '2px' }}>
                  {nearbyHazards.length} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>detected</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Immediate / Nearest Alert Card (Rule 27) */}
        {nearbyHazards.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            {(() => {
              const topHazard = nearbyHazards[0];
              const isImminent = topHazard.distance_meters <= 600;
              const isHigh = topHazard.risk_score >= 61;

              return (
                <div style={{
                  padding: '24px',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: isHigh ? 'var(--color-critical-bg)' : 'var(--bg-card)',
                  border: isHigh ? '2px solid var(--color-critical)' : '1px solid var(--border-subtle)',
                  boxShadow: 'var(--shadow-lg)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '50%',
                        backgroundColor: isHigh ? 'var(--color-critical)' : '#ea580c',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <AlertTriangle size={24} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 800, color: isHigh ? 'var(--color-critical)' : '#ea580c', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          {isHigh ? t('driver.warningPrefixHighRisk') : t('driver.warningPrefixPothole')}
                        </div>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>
                          {topHazard.road_name}
                        </h2>
                      </div>
                    </div>

                    {/* Distance Badge */}
                    <div style={{
                      backgroundColor: 'var(--bg-surface)',
                      padding: '8px 16px',
                      borderRadius: 'var(--radius-lg)',
                      boxShadow: 'var(--shadow-sm)',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: isImminent ? 'var(--color-critical)' : 'var(--text-primary)', lineHeight: 1 }}>
                        {formatMeters(topHazard.distance_meters)}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                        {t('driver.distanceAhead')}
                      </div>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {topHazard.description}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <PriorityBadge score={topHazard.risk_score} />
                      <SeverityBadge severity={topHazard.severity} />
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        {topHazard.confirmation_count} {t('driver.confirmationsLabel')}, {topHazard.near_miss_count || 0} {t('driver.nearMissesLabel')}
                      </span>
                    </div>

                    {/* Open in Navigation Deep Link (Rule 28) */}
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => openInGoogleMaps(topHazard)}
                      style={{ backgroundColor: '#0284c7' }}
                    >
                      <ExternalLink size={16} />
                      <span>{t('driver.openGoogleMaps')}</span>
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Upcoming Hazards Feed */}
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '14px' }}>
            {t('driver.upcomingHazards')}
          </h3>

          {nearbyHazards.length <= 1 ? (
            <div className="card" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <CheckCircle2 size={32} color="var(--color-low)" style={{ margin: '0 auto 10px' }} />
              <p style={{ fontSize: '0.92rem' }}>
                {t('driver.noNearbyHazards')}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {nearbyHazards.slice(1).map((hazard) => (
                <div
                  key={hazard.complaint_id}
                  className="card"
                  style={{
                    padding: '16px 20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}
                >
                  <div style={{ flex: '1 1 300px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.88rem', color: 'var(--color-primary)' }}>
                        {hazard.complaint_id}
                      </span>
                      <PriorityBadge score={hazard.risk_score} size="sm" />
                    </div>
                    <strong style={{ fontSize: '0.95rem', display: 'block', marginBottom: '2px' }}>
                      {hazard.road_name}
                    </strong>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {hazard.description?.substring(0, 70)}...
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                        {formatMeters(hazard.distance_meters)}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>distance</div>
                    </div>

                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => openInGoogleMaps(hazard)}
                    >
                      <ExternalLink size={14} />
                      <span>Navigate</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
