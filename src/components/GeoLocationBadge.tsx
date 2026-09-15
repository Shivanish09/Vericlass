import React, { useEffect, useState } from 'react';
import { MapPin, Navigation, CheckCircle, AlertTriangle, Radio } from 'lucide-react';
import { calculateDistanceMeters, formatDistance } from '../utils/geoUtils';

interface GeoLocationBadgeProps {
  targetLat: number;
  targetLng: number;
  radiusMeters: number;
  classroomName: string;
  onLocationUpdate: (lat: number, lng: number, isInside: boolean, distance: number) => void;
}

export const GeoLocationBadge: React.FC<GeoLocationBadgeProps> = ({
  targetLat,
  targetLng,
  radiusMeters,
  classroomName,
  onLocationUpdate,
}) => {
  // Mode: 'simulated' (inside classroom) or 'real' (browser GPS)
  const [mode, setMode] = useState<'simulated' | 'real'>('simulated');
  const [currentLat, setCurrentLat] = useState<number>(targetLat);
  const [currentLng, setCurrentLng] = useState<number>(targetLng);
  const [isInside, setIsInside] = useState<boolean>(true);
  const [distance, setDistance] = useState<number>(0);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Recompute distance when coordinates change
  useEffect(() => {
    let lat = currentLat;
    let lng = currentLng;

    if (mode === 'simulated') {
      // Simulate sitting inside the classroom (approx 3.5 meters from beacon)
      lat = targetLat + 0.00003;
      lng = targetLng + 0.00002;
    }

    const dist = calculateDistanceMeters(lat, lng, targetLat, targetLng);
    const inside = dist <= radiusMeters;
    setDistance(dist);
    setIsInside(inside);
    setCurrentLat(lat);
    setCurrentLng(lng);
    onLocationUpdate(lat, lng, inside, dist);
  }, [mode, targetLat, targetLng, radiusMeters]);

  const handleFetchRealGps = () => {
    setGpsError(null);
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLat(latitude);
        setCurrentLng(longitude);
        setMode('real');
        const dist = calculateDistanceMeters(latitude, longitude, targetLat, targetLng);
        const inside = dist <= radiusMeters;
        setDistance(dist);
        setIsInside(inside);
        onLocationUpdate(latitude, longitude, inside, dist);
      },
      (err) => {
        console.warn('GPS location error:', err);
        setGpsError('Unable to read device GPS. Using simulated campus coordinates.');
        setMode('simulated');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleSetSimulatedInside = () => {
    setMode('simulated');
    setGpsError(null);
  };

  const handleSimulateOutside = () => {
    // Simulate being far outside campus (e.g., 350m away)
    setMode('real');
    const outsideLat = targetLat + 0.0035;
    const outsideLng = targetLng + 0.0035;
    setCurrentLat(outsideLat);
    setCurrentLng(outsideLng);
    const dist = calculateDistanceMeters(outsideLat, outsideLng, targetLat, targetLng);
    setDistance(dist);
    setIsInside(false);
    onLocationUpdate(outsideLat, outsideLng, false, dist);
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2.5">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-lg ${
              isInside ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
            }`}
          >
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Classroom Geofence
              </span>
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                  isInside ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                }`}
              >
                <Radio className="mr-1 h-3 w-3 animate-pulse" />
                Radius: {radiusMeters}m
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-800">{classroomName}</p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 self-start sm:self-center">
          <button
            type="button"
            onClick={handleSetSimulatedInside}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
              mode === 'simulated' && isInside
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            In-Class (Beacon)
          </button>
          <button
            type="button"
            onClick={handleSimulateOutside}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
              !isInside
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Simulate Outside
          </button>
          <button
            type="button"
            onClick={handleFetchRealGps}
            title="Read Device GPS"
            className="flex items-center space-x-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            <Navigation className="h-3 w-3 text-sky-600" />
            <span>Device GPS</span>
          </button>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {isInside ? (
            <div className="flex items-center space-x-1.5 text-xs font-medium text-emerald-600">
              <CheckCircle className="h-4 w-4 shrink-0" />
              <span>Physically verified inside geofence ({formatDistance(distance)})</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1.5 text-xs font-medium text-amber-600">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>Too far from room: {formatDistance(distance)} (Max allowable {radiusMeters}m)</span>
            </div>
          )}
        </div>

        <div className="text-right font-mono text-[11px] text-slate-400">
          {currentLat.toFixed(5)}, {currentLng.toFixed(5)}
        </div>
      </div>

      {gpsError && (
        <div className="mt-2 text-[11px] text-amber-600 bg-amber-50 rounded-md p-1.5">
          {gpsError}
        </div>
      )}
    </div>
  );
};
