import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapPin, X, Check, Navigation, AlertCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export function LocationPickerModal({ isOpen, onClose, initialLocation, onLocationSelected }) {
  const { t } = useLanguage();
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  const defaultCoords = initialLocation?.latitude && initialLocation?.longitude
    ? [initialLocation.latitude, initialLocation.longitude]
    : [12.9716, 77.5946]; // Default Bangalore center

  const [coords, setCoords] = useState({
    latitude: defaultCoords[0],
    longitude: defaultCoords[1]
  });
  const [roadName, setRoadName] = useState(initialLocation?.roadName || '');
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [locating, setLocating] = useState(false);

  // Initialize Leaflet map
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: defaultCoords,
      zoom: 15
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);

    // Custom marker icon
    const customIcon = L.divIcon({
      className: 'custom-leaflet-pin',
      html: `<div style="
        background-color: #dc2626;
        width: 34px;
        height: 34px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid #ffffff;
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background-color: #ffffff;
        "></div>
      </div>`,
      iconSize: [34, 34],
      iconAnchor: [17, 34]
    });

    const marker = L.marker(defaultCoords, {
      draggable: true,
      icon: customIcon
    }).addTo(map);

    marker.on('dragend', (e) => {
      const position = e.target.getLatLng();
      updateLocation(position.lat, position.lng);
    });

    map.on('click', (e) => {
      marker.setLatLng(e.latlng);
      updateLocation(e.latlng.lat, e.latlng.lng);
    });

    mapInstanceRef.current = map;
    markerRef.current = marker;

    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen]);

  const updateLocation = async (lat, lng) => {
    setCoords({ latitude: lat, longitude: lng });
    setLoadingAddress(true);
    try {
      // Reverse geocoding via OpenStreetMap Nominatim
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
        headers: { 'User-Agent': 'GroundFix-RoadSafetyPlatform' }
      });
      if (res.ok) {
        const data = await res.json();
        const road = data.address?.road || data.address?.suburb || data.address?.neighbourhood || data.display_name?.split(',')[0] || '';
        if (road) setRoadName(road);
      }
    } catch (e) {
      // Ignore reverse geocode network issues
    } finally {
      setLoadingAddress(false);
    }
  };

  const useCurrentGPS = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([lat, lng], 16);
          markerRef.current.setLatLng([lat, lng]);
        }
        updateLocation(lat, lng);
        setLocating(false);
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleConfirm = () => {
    if (onLocationSelected) {
      onLocationSelected({
        latitude: coords.latitude,
        longitude: coords.longitude,
        roadName: roadName || 'Selected Road Location'
      });
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      backdropFilter: 'blur(3px)'
    }}>
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
        width: '100%',
        maxWidth: '720px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'var(--shadow-xl)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={20} color="var(--color-primary)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Select Hazard Location on Map</h3>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={22} />
          </button>
        </div>

        {/* Map Container */}
        <div style={{ position: 'relative', flex: 1, minHeight: '380px' }}>
          <div ref={mapContainerRef} style={{ width: '100%', height: '100%', minHeight: '380px' }} />
          <button
            type="button"
            className="btn btn-secondary"
            onClick={useCurrentGPS}
            disabled={locating}
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              zIndex: 1000,
              backgroundColor: 'var(--bg-surface)',
              boxShadow: 'var(--shadow-md)',
              fontSize: '0.85rem'
            }}
          >
            <Navigation size={16} />
            <span>{locating ? 'Locating...' : 'Use My GPS'}</span>
          </button>
        </div>

        {/* Footer with Coordinates & Road */}
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', fontSize: '0.85rem' }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Coordinates: </span>
              <strong style={{ fontFamily: 'var(--font-mono)' }}>
                {coords.latitude.toFixed(5)}, {coords.longitude.toFixed(5)}
              </strong>
            </div>
            {roadName && (
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Detected Area: </span>
                <strong>{roadName}</strong>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary" onClick={handleConfirm}>
              <Check size={18} />
              <span>Confirm Location</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
