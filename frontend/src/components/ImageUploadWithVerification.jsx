import React, { useState, useRef } from 'react';
import { Camera, Upload, CheckCircle2, AlertTriangle, AlertCircle, RefreshCw, Eye } from 'lucide-react';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export function ImageUploadWithVerification({ onImageSelected, existingImageUrl = null }) {
  const { t } = useLanguage();
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const [previewUrl, setPreviewUrl] = useState(existingImageUrl);
  const [selectedFile, setSelectedFile] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset previous states
    setError(null);
    setVerificationResult(null);

    // Validate mime type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setError('Invalid file format. Please upload JPEG, PNG, or WebP.');
      return;
    }

    // Validate size (max 15MB)
    if (file.size > 15 * 1024 * 1024) {
      setError('File size exceeds 15MB limit.');
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Trigger authenticity check (Rule 11)
    setVerifying(true);
    try {
      const res = await api.checkImageAuthenticity(file);
      if (res && res.data) {
        setVerificationResult(res.data);
        if (onImageSelected) {
          onImageSelected({
            file,
            previewUrl: objectUrl,
            authStatus: res.data.status,
            authScore: res.data.confidence,
            authReason: res.data.reason
          });
        }
      }
    } catch (err) {
      console.warn('Image verification check failed:', err.message);
      // Fallback per Rule 11
      const fallback = {
        status: 'Manual Review',
        confidence: 60,
        reason: 'Network check bypassed; marked for officer manual review.'
      };
      setVerificationResult(fallback);
      if (onImageSelected) {
        onImageSelected({
          file,
          previewUrl: objectUrl,
          authStatus: fallback.status,
          authScore: fallback.confidence,
          authReason: fallback.reason
        });
      }
    } finally {
      setVerifying(false);
    }
  };

  const clearImage = () => {
    setPreviewUrl(null);
    setSelectedFile(null);
    setVerificationResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    if (onImageSelected) {
      onImageSelected(null);
    }
  };

  // Status badge styling per Rule 11
  const getAuthBadge = (status) => {
    switch (status) {
      case 'Likely Authentic':
        return {
          icon: <CheckCircle2 size={16} color="var(--color-low)" />,
          bg: 'var(--color-low-bg)',
          border: 'var(--color-low-border)',
          text: 'var(--color-low)',
          label: t('report.authLikely')
        };
      case 'Suspicious':
        return {
          icon: <AlertTriangle size={16} color="var(--color-high)" />,
          bg: 'var(--color-high-bg)',
          border: 'var(--color-high-border)',
          text: 'var(--color-high)',
          label: t('report.authSuspicious')
        };
      case 'Potentially AI Generated':
        return {
          icon: <AlertCircle size={16} color="var(--color-critical)" />,
          bg: 'var(--color-critical-bg)',
          border: 'var(--color-critical-border)',
          text: 'var(--color-critical)',
          label: t('report.authAi')
        };
      case 'Rejected':
        return {
          icon: <AlertCircle size={16} color="var(--color-critical)" />,
          bg: 'var(--color-critical-bg)',
          border: 'var(--color-critical-border)',
          text: 'var(--color-critical)',
          label: t('report.authRejected')
        };
      case 'Manual Review':
      default:
        return {
          icon: <Eye size={16} color="var(--color-medium)" />,
          bg: 'var(--color-medium-bg)',
          border: 'var(--color-medium-border)',
          text: 'var(--color-medium)',
          label: t('report.authReview')
        };
    }
  };

  return (
    <div style={{ marginBottom: '24px' }}>
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {!previewUrl ? (
        <div style={{
          border: '2px dashed var(--border-medium)',
          borderRadius: 'var(--radius-lg)',
          padding: '36px 20px',
          textAlign: 'center',
          backgroundColor: 'var(--bg-subtle)',
          transition: 'border-color var(--transition-fast)'
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: 'var(--bg-surface)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: 'var(--shadow-sm)',
            color: 'var(--color-primary)'
          }}>
            <Camera size={28} />
          </div>

          <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px' }}>
            {t('report.uploadButton')}
          </h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 18px' }}>
            {t('report.photoUploadDesc')}
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={18} />
              <span>Choose Photo</span>
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => cameraInputRef.current?.click()}
            >
              <Camera size={18} />
              <span>Use Camera</span>
            </button>
          </div>
        </div>
      ) : (
        <div style={{
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          backgroundColor: 'var(--bg-card)'
        }}>
          <div style={{ position: 'relative', width: '100%', maxHeight: '340px', backgroundColor: '#000', overflow: 'hidden' }}>
            <img
              src={previewUrl}
              alt="Hazard report preview"
              style={{ width: '100%', maxHeight: '340px', objectFit: 'contain', display: 'block', margin: '0 auto' }}
            />
            <button
              type="button"
              onClick={clearImage}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                backgroundColor: 'rgba(15, 23, 42, 0.8)',
                color: '#fff',
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.8rem',
                fontWeight: 600,
                backdropFilter: 'blur(4px)'
              }}
            >
              Change Photo
            </button>
          </div>

          {/* Authenticity Verification Box (Rule 11) */}
          <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-subtle)' }}>
            {verifying ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                <RefreshCw size={18} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
                <span>Running Image Authenticity Verification...</span>
              </div>
            ) : verificationResult ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                      {t('report.photoAuthenticity')}:
                    </span>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '1rem',
                      fontWeight: 800,
                      color: verificationResult.confidence >= 75 ? 'var(--color-low)' : 'var(--color-medium)'
                    }}>
                      {verificationResult.confidence}%
                    </span>
                  </div>

                  {(() => {
                    const badge = getAuthBadge(verificationResult.status);
                    return (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        backgroundColor: badge.bg,
                        color: badge.text,
                        border: `1px solid ${badge.border}`
                      }}>
                        {badge.icon}
                        <span>{badge.label}</span>
                      </span>
                    );
                  })()}
                </div>

                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  {verificationResult.reason}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {error && (
        <div style={{
          marginTop: '10px',
          padding: '10px 14px',
          backgroundColor: 'var(--color-critical-bg)',
          color: 'var(--color-critical)',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
