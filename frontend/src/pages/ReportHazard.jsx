import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  AlertTriangle,
  MapPin,
  Mic,
  MicOff,
  Navigation,
  CheckCircle2,
  Copy,
  ExternalLink,
  ShieldAlert,
  AlertCircle
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { ImageUploadWithVerification } from '../components/ImageUploadWithVerification';
import { LocationPickerModal } from '../components/LocationPickerModal';
import { api } from '../services/api';

export function ReportHazard() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  // Form State
  const [photoData, setPhotoData] = useState(null);
  const [latitude, setLatitude] = useState(12.9716); // default Bangalore
  const [longitude, setLongitude] = useState(77.5946);
  const [roadName, setRoadName] = useState('');
  const [hazardType, setHazardType] = useState('pothole');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('Medium');
  const [nearMissType, setNearMissType] = useState('None');
  const [nearMissDetails, setNearMissDetails] = useState('');

  // UI state
  const [locating, setLocating] = useState(false);
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Duplicate detection modal state (Rule 17)
  const [duplicateWarning, setDuplicateWarning] = useState(null);

  // Success state (Rule 13)
  const [submittedData, setSubmittedData] = useState(null);
  const [copied, setCopied] = useState(false);

  // Use My Location (GPS)
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setErrorMessage('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    setErrorMessage(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLatitude(lat);
        setLongitude(lng);

        // Try reverse geocoding road name
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
            headers: { 'User-Agent': 'GroundFix-RoadSafetyPlatform' }
          });
          if (res.ok) {
            const data = await res.json();
            const road = data.address?.road || data.address?.suburb || data.address?.neighbourhood || data.display_name?.split(',')[0];
            if (road) setRoadName(road);
          }
        } catch (e) {
          // Ignore reverse geocode failures
        }
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        setErrorMessage('Unable to retrieve your location. Please check location permissions or select on map.');
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  };

  // Voice Reporting via Web Speech API (Rule 10)
  const handleToggleVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechError(t('report.voiceUnsupported'));
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      // Set language based on current selection
      if (language === 'hi') {
        recognition.lang = 'hi-IN';
      } else if (language === 'kn') {
        recognition.lang = 'kn-IN';
      } else {
        recognition.lang = 'en-IN';
      }

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setDescription((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        setSpeechError(`Voice error: ${event.error}. Please type description.`);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      setSpeechError(t('report.voiceUnsupported'));
      setIsListening(false);
    }
  };

  // Form Submission
  const handleSubmit = async (e, forceCreate = false) => {
    if (e && e.preventDefault) e.preventDefault();
    setErrorMessage(null);
    setSubmitting(true);

    try {
      const formData = new FormData();
      if (photoData?.file) {
        formData.append('image', photoData.file);
      }
      formData.append('latitude', latitude);
      formData.append('longitude', longitude);
      formData.append('road_name', roadName || 'Unspecified Road');
      formData.append('hazard_type', hazardType);
      formData.append('description', description);
      formData.append('severity', severity);
      formData.append('near_miss_type', nearMissType);
      formData.append('near_miss_details', nearMissDetails);
      if (forceCreate) {
        formData.append('force_create', 'true');
      }

      if (photoData) {
        formData.append('image_auth_status', photoData.authStatus || 'Manual Review');
        formData.append('image_auth_score', photoData.authScore || 65);
        formData.append('image_auth_reason', photoData.authReason || 'Basic file integrity checked');
      }

      const res = await api.createComplaint(formData);

      if (res && res.complaint_id) {
        setSubmittedData(res.data);
        setDuplicateWarning(null);
      }
    } catch (err) {
      // Check for duplicate response (Rule 17)
      if (err.status === 409 && err.data?.is_duplicate) {
        setDuplicateWarning(err.data);
      } else {
        setErrorMessage(err.message || 'Failed to submit report. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const copyComplaintId = () => {
    if (submittedData?.complaint_id) {
      navigator.clipboard.writeText(submittedData.complaint_id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // SUCCESS SCREEN (Rule 13)
  if (submittedData) {
    return (
      <div className="page-container">
        <div className="container" style={{ maxWidth: '640px' }}>
          <div className="card" style={{ textAlign: 'center', padding: '40px 24px' }}>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-low-bg)',
              color: 'var(--color-low)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px'
            }}>
              <CheckCircle2 size={42} />
            </div>

            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>
              {t('report.successTitle')}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '24px' }}>
              {t('report.successSubtitle')}
            </p>

            {/* Complaint ID Box (Rule 13) */}
            <div style={{
              backgroundColor: 'var(--bg-subtle)',
              border: '2px dashed var(--border-medium)',
              borderRadius: 'var(--radius-lg)',
              padding: '20px',
              marginBottom: '20px'
            }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                {t('report.complaintIdLabel')}
              </div>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: 800,
                fontFamily: 'var(--font-mono)',
                color: 'var(--color-primary)',
                letterSpacing: '0.05em',
                margin: '8px 0'
              }}>
                {submittedData.complaint_id}
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                "{t('report.saveIdAdvice')}"
              </p>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={copyComplaintId}
                style={{ marginTop: '12px' }}
              >
                <Copy size={16} />
                <span>{copied ? t('common.copied') : t('common.copyId')}</span>
              </button>
            </div>

            {/* Details Preview */}
            <div style={{
              textAlign: 'left',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              marginBottom: '28px',
              fontSize: '0.88rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Location:</span>
                <strong>{submittedData.road_name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Initial Risk Score:</span>
                <strong style={{ color: submittedData.risk_score >= 81 ? 'var(--color-critical)' : 'var(--color-high)' }}>
                  {submittedData.risk_score} / 100
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Authenticity Status:</span>
                <strong>{submittedData.image_auth_status}</strong>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to={`/track/${submittedData.complaint_id}`} className="btn btn-primary btn-lg">
                <ExternalLink size={18} />
                <span>{t('report.trackComplaintBtn')}</span>
              </Link>
              <button
                type="button"
                className="btn btn-secondary btn-lg"
                onClick={() => {
                  setSubmittedData(null);
                  setPhotoData(null);
                  setDescription('');
                  setRoadName('');
                }}
              >
                <span>{t('report.reportAnotherBtn')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="container" style={{ maxWidth: '780px' }}>
        {/* Title */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '6px' }}>
            {t('report.title')}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            {t('report.subtitle')}
          </p>
        </div>

        {errorMessage && (
          <div style={{
            padding: '14px 18px',
            backgroundColor: 'var(--color-critical-bg)',
            color: 'var(--color-critical)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-critical-border)',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <AlertCircle size={20} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Duplicate Alert Modal/Banner (Rule 17) */}
        {duplicateWarning && (
          <div style={{
            padding: '20px',
            backgroundColor: 'var(--color-high-bg)',
            border: '2px solid var(--color-high-border)',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '28px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--color-high)', marginBottom: '10px' }}>
              <ShieldAlert size={24} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>
                {t('report.duplicateWarningTitle')}
              </h3>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              A hazard was already reported <strong>{duplicateWarning.distance_meters}m</strong> away on{' '}
              <strong>{duplicateWarning.existing_complaint?.road_name}</strong> (ID:{' '}
              {duplicateWarning.existing_complaint?.complaint_id}). You can confirm the existing report or submit a new one.
            </p>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link
                to={`/track/${duplicateWarning.existing_complaint?.complaint_id}`}
                className="btn btn-primary"
                style={{ backgroundColor: '#ea580c' }}
              >
                <span>{t('report.confirmExistingBtn')} ({duplicateWarning.existing_complaint?.complaint_id})</span>
              </Link>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={(e) => handleSubmit(e, true)}
                disabled={submitting}
              >
                <span>{t('report.submitNewBtn')}</span>
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="card">
          {/* 1. Photo Upload & Authenticity */}
          <div className="form-group">
            <label className="form-label">{t('report.photoUploadTitle')}</label>
            <ImageUploadWithVerification onImageSelected={(data) => setPhotoData(data)} />
          </div>

          {/* 2. Location & Road */}
          <div className="form-group">
            <label className="form-label">{t('report.locationTitle')}</label>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '12px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleUseMyLocation}
                disabled={locating}
              >
                <Navigation size={16} />
                <span>{locating ? t('report.locating') : t('report.useMyLocation')}</span>
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setMapModalOpen(true)}
              >
                <MapPin size={16} />
                <span>{t('report.selectOnMap')}</span>
              </button>
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              fontSize: '0.82rem',
              color: 'var(--text-muted)',
              marginBottom: '12px',
              fontFamily: 'var(--font-mono)'
            }}>
              <span>Lat: {latitude.toFixed(5)}</span>
              <span>Long: {longitude.toFixed(5)}</span>
            </div>

            <input
              type="text"
              className="form-control"
              style={{ width: '100%' }}
              value={roadName}
              onChange={(e) => setRoadName(e.target.value)}
              placeholder={t('report.roadNamePlaceholder')}
              required
            />
          </div>

          {/* 3. Hazard Type */}
          <div className="form-group">
            <label className="form-label">{t('report.hazardTypeTitle')}</label>
            <select
              style={{ width: '100%' }}
              value={hazardType}
              onChange={(e) => setHazardType(e.target.value)}
            >
              <option value="pothole">{t('report.hazardTypes.pothole')}</option>
              <option value="damaged_road">{t('report.hazardTypes.damaged_road')}</option>
              <option value="open_manhole">{t('report.hazardTypes.open_manhole')}</option>
              <option value="road_obstruction">{t('report.hazardTypes.road_obstruction')}</option>
              <option value="broken_infrastructure">{t('report.hazardTypes.broken_infrastructure')}</option>
              <option value="other">{t('report.hazardTypes.other')}</option>
            </select>
          </div>

          {/* 4. Description with Voice Input (Rule 10) */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label className="form-label" style={{ margin: 0 }}>{t('report.descriptionTitle')}</label>
              <button
                type="button"
                onClick={handleToggleVoice}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  backgroundColor: isListening ? '#fee2e2' : 'var(--bg-subtle)',
                  color: isListening ? '#dc2626' : 'var(--text-primary)',
                  border: isListening ? '1px solid #ef4444' : '1px solid var(--border-medium)',
                  animation: isListening ? 'pulse 1.5s infinite' : 'none'
                }}
              >
                {isListening ? <MicOff size={14} /> : <Mic size={14} />}
                <span>{isListening ? t('report.voiceListening') : t('report.voiceButton')}</span>
              </button>
            </div>

            <textarea
              rows={4}
              style={{ width: '100%', resize: 'vertical' }}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('report.descriptionPlaceholder')}
              required
            />
            {speechError && (
              <p style={{ fontSize: '0.8rem', color: 'var(--color-critical)', marginTop: '4px' }}>
                {speechError}
              </p>
            )}
          </div>

          {/* 5. Severity Selection (Rule 9) */}
          <div className="form-group">
            <label className="form-label">{t('report.severityTitle')}</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px' }}>
              {['Low', 'Medium', 'High', 'Critical'].map((sev) => {
                const isSelected = severity === sev;
                let activeBorder = 'var(--border-medium)';
                let activeColor = 'var(--text-primary)';

                if (sev === 'Critical') {
                  activeBorder = 'var(--color-critical)';
                  activeColor = 'var(--color-critical)';
                } else if (sev === 'High') {
                  activeBorder = 'var(--color-high)';
                  activeColor = 'var(--color-high)';
                } else if (sev === 'Medium') {
                  activeBorder = 'var(--color-medium)';
                  activeColor = 'var(--color-medium)';
                } else {
                  activeBorder = 'var(--color-low)';
                  activeColor = 'var(--color-low)';
                }

                return (
                  <button
                    key={sev}
                    type="button"
                    onClick={() => setSeverity(sev)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: isSelected ? `2px solid ${activeBorder}` : '1px solid var(--border-medium)',
                      backgroundColor: isSelected ? 'var(--bg-subtle)' : 'var(--bg-surface)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: isSelected ? activeColor : 'var(--text-primary)', marginBottom: '4px' }}>
                      {sev}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                      {t(`report.severityLevels.${sev}`)}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 6. Near Miss Reporting (Rule 9, Rule 18) */}
          <div className="form-group" style={{
            backgroundColor: 'var(--bg-subtle)',
            padding: '18px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)'
          }}>
            <label className="form-label" style={{ marginBottom: '6px' }}>
              {t('report.nearMissTitle')}
            </label>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              {t('report.nearMissQuestion')}
            </p>

            <select
              style={{ width: '100%', marginBottom: nearMissType !== 'None' ? '12px' : '0' }}
              value={nearMissType}
              onChange={(e) => setNearMissType(e.target.value)}
            >
              <option value="None">{t('report.nearMissOptions.none')}</option>
              <option value="Almost fell">{t('report.nearMissOptions.fell')}</option>
              <option value="Almost crashed">{t('report.nearMissOptions.crashed')}</option>
              <option value="Vehicle damaged">{t('report.nearMissOptions.damaged')}</option>
              <option value="Difficult for pedestrians">{t('report.nearMissOptions.pedestrian')}</option>
              <option value="Accessibility issue">{t('report.nearMissOptions.accessibility')}</option>
              <option value="Traffic obstruction">{t('report.nearMissOptions.traffic')}</option>
            </select>

            {nearMissType !== 'None' && (
              <div>
                <label className="form-label" style={{ fontSize: '0.85rem', marginTop: '10px' }}>
                  {t('report.nearMissDetailsLabel')}
                </label>
                <textarea
                  rows={2}
                  style={{ width: '100%' }}
                  value={nearMissDetails}
                  onChange={(e) => setNearMissDetails(e.target.value)}
                  placeholder={t('report.nearMissDetailsPlaceholder')}
                />
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', backgroundColor: '#ea580c' }}
            disabled={submitting}
          >
            <AlertTriangle size={20} />
            <span>{submitting ? t('common.submitting') : t('report.submitReport')}</span>
          </button>
        </form>

        {/* Location Picker Modal */}
        <LocationPickerModal
          isOpen={mapModalOpen}
          onClose={() => setMapModalOpen(false)}
          initialLocation={{ latitude, longitude, roadName }}
          onLocationSelected={(loc) => {
            setLatitude(loc.latitude);
            setLongitude(loc.longitude);
            if (loc.roadName) setRoadName(loc.roadName);
          }}
        />
      </div>
    </div>
  );
}
