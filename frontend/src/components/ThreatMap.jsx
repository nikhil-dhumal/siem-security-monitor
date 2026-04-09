import { useMemo } from 'react';
import { CircleMarker, MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useSelector } from 'react-redux';

const ThreatMap = () => {
  const logs = useSelector((state) => state.logs.list || []);

  const markers = useMemo(() => {
    const grouping = {};

    logs.forEach((log) => {
      if (!log.latitude || !log.longitude) return;
      const lat = Number(log.latitude);
      const lng = Number(log.longitude);
      if (Number.isNaN(lat) || Number.isNaN(lng)) return;

      const key = `${lat.toFixed(4)},${lng.toFixed(4)}`;
      grouping[key] = grouping[key] || { lat, lng, count: 0, label: log.event_type || 'event' };
      grouping[key].count += 1;
    });

    return Object.values(grouping).sort((a, b) => b.count - a.count).slice(0, 50);
  }, [logs]);

  const bounds = useMemo(() => {
    if (markers.length === 0) return null;
    const latitudes = markers.map((marker) => marker.lat);
    const longitudes = markers.map((marker) => marker.lng);
    const southWest = [Math.min(...latitudes), Math.min(...longitudes)];
    const northEast = [Math.max(...latitudes), Math.max(...longitudes)];
    return [southWest, northEast];
  }, [markers]);

  return (
    <div className="w-full rounded-lg overflow-hidden" style={{ height: '100%' }}>
      <MapContainer
        center={[19.13591013625143, 72.90819435923413]}
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <CircleMarker
          center={[19.13591013625143, 72.90819435923413]}
          radius={8}
          pathOptions={{ color: '#10b981', fillColor: '#34d399', fillOpacity: 0.7 }}
        />
        {markers.map((item, index) => (
          <CircleMarker
            key={index}
            center={[item.lat, item.lng]}
            radius={Math.min(5 + item.count, 10)}
            pathOptions={{ color: '#3b82f6', fillColor: '#93c5fd', fillOpacity: 0.7 }}
          />
        ))}
      </MapContainer>
    </div>
  );
};

export default ThreatMap;
