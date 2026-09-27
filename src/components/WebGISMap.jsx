import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Ruler, Square, Trash2, Download, Upload, MapPin, Eye, Layers, Crosshair, AlertTriangle } from 'lucide-react';
import { VN2000_PROVINCES, wgs84ToVn2000 } from '../data/vn2000.js';
import { loadGoogleMapsAPI } from '../utils/googleMapsLoader.js';
import GoogleMutant from 'leaflet.gridlayer.googlemutant/src/Leaflet.GoogleMutant.mjs';

// Pre-configured HCMUNRE & Geodetic points
const INITIAL_POINTS = [
  { id: 'MOC_HCMUNRE_01', name: 'Mốc khống chế CS HCMUNRE', lat: 10.801542, lon: 106.657821, h: 4.25, type: 'GCP' },
  { id: 'CORS_HCM_01', name: 'Trạm định vị vệ tinh CORS HCM01', lat: 10.776889, lon: 106.700806, h: 12.80, type: 'CORS' },
  { id: 'DC_Q1_104', name: 'Mốc địa chính Q.1 #104', lat: 10.782500, lon: 106.698000, h: 5.10, type: 'Cadastral' },
];

const GOOGLE_BASEMAPS = {
  'google-roadmap': { label: 'Google Đường phố', type: 'roadmap' },
  'google-satellite': { label: 'Google Vệ tinh', type: 'satellite' },
  'google-hybrid': { label: 'Google Hybrid', type: 'hybrid' },
  'google-terrain': { label: 'Google Địa hình', type: 'terrain' },
};

const isGoogleBasemap = (name) => Boolean(GOOGLE_BASEMAPS[name]);
const googleMapsConfigured = Boolean(import.meta.env.VITE_GOOGLE_MAPS_API_KEY);

export default function WebGISMap({ selectedCoordinate }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layersRef = useRef({
    tileLayer: null,
    markersGroup: null,
    measurementGroup: null,
  });

  const [basemap, setBasemap] = useState('dark');
  const [selectedProvince, setSelectedProvince] = useState(VN2000_PROVINCES[0]); // HCM
  const [points, setPoints] = useState(INITIAL_POINTS);
  const [measureMode, setMeasureMode] = useState(null); // 'distance' | 'area' | null
  const [measurePoints, setMeasurePoints] = useState([]);
  const [measurementResult, setMeasurementResult] = useState(null);
  const [clickedCoord, setClickedCoord] = useState(null);
  const [googleStatus, setGoogleStatus] = useState(googleMapsConfigured ? 'idle' : 'missing_key'); // 'idle' | 'loading' | 'ready' | 'error' | 'missing_key'
  const [googleError, setGoogleError] = useState(null);

  // Basemaps dictionary
  const basemapTiles = {
    dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    osm: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const initialLat = selectedCoordinate?.lat || 10.785;
    const initialLon = selectedCoordinate?.lon || 106.680;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLon],
      zoom: 13,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const tile = L.tileLayer(basemapTiles[basemap], {
      attribution: '&copy; CartoDB, Esri, OSM, tampm0147',
      maxZoom: 19,
    }).addTo(map);

    const markersGroup = L.layerGroup().addTo(map);
    const measurementGroup = L.layerGroup().addTo(map);

    layersRef.current = {
      tileLayer: tile,
      markersGroup,
      measurementGroup,
    };

    mapInstanceRef.current = map;

    // Click handler on map
    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      const vn2000 = wgs84ToVn2000(lat, lng, selectedProvince.ktt, 3);
      setClickedCoord({
        lat: Number(lat.toFixed(6)),
        lon: Number(lng.toFixed(6)),
        vnX: vn2000.x,
        vnY: vn2000.y,
      });

      // Handle measurements
      if (measureModeRef.current) {
        handleMeasureClick([lat, lng]);
      }
    });

    return () => {
      map.remove();
    };
  }, []);

  // Update Tile Layer when basemap changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Remove existing tile layer
    if (layersRef.current.tileLayer) {
      mapInstanceRef.current.removeLayer(layersRef.current.tileLayer);
      layersRef.current.tileLayer = null;
    }

    if (isGoogleBasemap(basemap)) {
      // Google Maps basemap via GoogleMutant
      if (googleStatus === 'ready') {
        const googleConfig = GOOGLE_BASEMAPS[basemap];
        const googleLayer = new GoogleMutant({
          type: googleConfig.type,
          maxZoom: 21,
        });
        googleLayer.addTo(mapInstanceRef.current);
        layersRef.current.tileLayer = googleLayer;
      } else if (googleStatus === 'idle') {
        // Start loading Google Maps API
        setGoogleStatus('loading');
        loadGoogleMapsAPI()
          .then((result) => {
            if (result) {
              setGoogleStatus('ready');
            } else {
              setGoogleStatus('error');
              setGoogleError('Google Maps API không tải được (thiếu API key?)');
              setBasemap('dark'); // fallback
            }
          })
          .catch((err) => {
            setGoogleStatus('error');
            setGoogleError(err.message);
            setBasemap('dark'); // fallback
          });
      }
    } else {
      // Standard tile basemap
      const newTile = L.tileLayer(basemapTiles[basemap], {
        attribution: '&copy; CartoDB, Esri, OSM, tampm0147',
        maxZoom: 19,
      }).addTo(mapInstanceRef.current);
      layersRef.current.tileLayer = newTile;
    }
  }, [basemap, googleStatus]);

  // Keep measureMode accessible inside map click listener
  const measureModeRef = useRef(measureMode);
  useEffect(() => {
    measureModeRef.current = measureMode;
  }, [measureMode]);

  // Render Survey Markers
  useEffect(() => {
    if (!layersRef.current.markersGroup) return;
    layersRef.current.markersGroup.clearLayers();

    points.forEach((pt) => {
      const customIcon = L.divIcon({
        className: 'custom-survey-marker',
        html: `
          <div style="
            background: #00d4aa;
            color: #060b18;
            font-size: 10px;
            font-weight: 700;
            padding: 2px 6px;
            border-radius: 4px;
            border: 1px solid #ffffff;
            box-shadow: 0 0 10px rgba(0,212,170,0.5);
            white-space: nowrap;
            display: inline-flex;
            align-items: center;
            gap: 4px;
          ">
            <span>▲ ${pt.id}</span>
          </div>
        `,
        iconSize: [80, 24],
        iconAnchor: [40, 24],
      });

      const marker = L.marker([pt.lat, pt.lon], { icon: customIcon });
      const vn = wgs84ToVn2000(pt.lat, pt.lon, selectedProvince.ktt, 3);
      marker.bindPopup(`
        <div style="font-family: monospace; font-size: 12px; color: #111;">
          <h4 style="font-weight: bold; margin-bottom: 4px; color: #0f172a;">${pt.name}</h4>
          <p><strong>Mã mốc:</strong> ${pt.id}</p>
          <p><strong>WGS-84:</strong> ${pt.lat.toFixed(6)}, ${pt.lon.toFixed(6)}</p>
          <p><strong>VN-2000 X:</strong> ${vn.x.toLocaleString()} m</p>
          <p><strong>VN-2000 Y:</strong> ${vn.y.toLocaleString()} m</p>
          <p><strong>Cao độ H:</strong> ${pt.h} m</p>
          <p><strong>Loại mốc:</strong> ${pt.type}</p>
        </div>
      `);
      layersRef.current.markersGroup.addLayer(marker);
    });
  }, [points, selectedProvince]);

  // Calculate Distance & Area
  const handleMeasureClick = (latlng) => {
    setMeasurePoints((prev) => {
      const updated = [...prev, latlng];
      drawMeasurement(updated, measureModeRef.current);
      return updated;
    });
  };

  const drawMeasurement = (coords, mode) => {
    const group = layersRef.current.measurementGroup;
    if (!group) return;
    group.clearLayers();

    if (coords.length < 2) return;

    if (mode === 'distance') {
      const polyline = L.polyline(coords, { color: '#f5a623', weight: 3, dashArray: '5, 5' }).addTo(group);
      let totalDist = 0;
      for (let i = 0; i < coords.length - 1; i++) {
        totalDist += L.latLng(coords[i]).distanceTo(L.latLng(coords[i + 1]));
      }
      setMeasurementResult({
        type: 'distance',
        value: totalDist < 1000 ? `${totalDist.toFixed(1)} m` : `${(totalDist / 1000).toFixed(3)} km`,
      });
    } else if (mode === 'area' && coords.length >= 3) {
      const polygon = L.polygon(coords, { color: '#00d4aa', fillColor: '#00d4aa', fillOpacity: 0.25, weight: 2 }).addTo(group);
      
      // Geodesic area calculation (Spherical polygon area approximation)
      const areaM2 = calculateGeodesicArea(coords);
      setMeasurementResult({
        type: 'area',
        m2: `${areaM2.toFixed(1)} m²`,
        ha: `${(areaM2 / 10000).toFixed(4)} ha`,
      });
    }
  };

  const calculateGeodesicArea = (coords) => {
    const R = 6378137; // WGS84 radius
    if (coords.length < 3) return 0;
    let total = 0;
    for (let i = 0; i < coords.length; i++) {
      const j = (i + 1) % coords.length;
      const [lat1, lon1] = coords[i];
      const [lat2, lon2] = coords[j];
      const p1 = (lat1 * Math.PI) / 180;
      const p2 = (lat2 * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      total += dLon * (2 + Math.sin(p1) + Math.sin(p2));
    }
    return Math.abs((total * R * R) / 2) / 2;
  };

  const resetMeasurement = () => {
    setMeasurePoints([]);
    setMeasurementResult(null);
    if (layersRef.current.measurementGroup) {
      layersRef.current.measurementGroup.clearLayers();
    }
  };

  // Export Points to CSV
  const handleExportCSV = () => {
    let csv = 'Mã mốc,Tên mốc,Vĩ độ (WGS84 Lat),Kinh độ (WGS84 Lon),VN2000 X (Bắc),VN2000 Y (Đông),Cao độ H (m),Loại mốc\n';
    points.forEach((p) => {
      const vn = wgs84ToVn2000(p.lat, p.lon, selectedProvince.ktt, 3);
      csv += `${p.id},"${p.name}",${p.lat},${p.lon},${vn.x},${vn.y},${p.h},${p.type}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Danh_Sach_Moc_Trac_Dia_${selectedProvince.id}.csv`;
    link.click();
  };

  // Handle Drag & Drop GeoJSON
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        if (mapInstanceRef.current) {
          const geoJsonLayer = L.geoJSON(json, {
            style: { color: '#00d4aa', weight: 2, fillOpacity: 0.2 },
          }).addTo(mapInstanceRef.current);
          mapInstanceRef.current.fitBounds(geoJsonLayer.getBounds());
        }
      } catch (err) {
        alert('File không hợp lệ hoặc không phải GeoJSON định dạng chuẩn.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 py-6">
      {/* Control bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-[#0a0f1a] border border-[#1e3a5f]/60 font-mono text-xs">
        {/* Basemap Switcher */}
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-[#00d4aa]" />
          <span className="text-[#94a3b8]">Lớp nền:</span>
          <div className="inline-flex rounded-lg bg-[#111827] p-1 border border-[#1e3a5f] max-w-full overflow-x-auto">
            {/* Standard Basemaps */}
            {[
              { id: 'dark', label: 'Bản đồ Tối' },
              { id: 'satellite', label: 'Vệ tinh Esri' },
              { id: 'osm', label: 'OSM' },
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setBasemap(id)}
                className={`px-2.5 py-1 rounded whitespace-nowrap transition-all ${
                  basemap === id ? 'bg-[#00d4aa] text-[#060b18] font-bold' : 'text-[#94a3b8] hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}

            {/* Separator */}
            <div className="w-px bg-[#1e3a5f] mx-1 my-0.5" />

            {/* Google Basemaps */}
            {Object.entries(GOOGLE_BASEMAPS).map(([id, { label }]) => {
              const isDisabled = googleStatus === 'missing_key';
              return (
                <button
                  key={id}
                  onClick={() => {
                    if (isDisabled) return;
                    setBasemap(id);
                  }}
                  disabled={isDisabled}
                  title={
                    isDisabled
                      ? 'Cần biến môi trường VITE_GOOGLE_MAPS_API_KEY để kích hoạt Google Maps'
                      : label
                  }
                  className={`px-2.5 py-1 rounded whitespace-nowrap transition-all flex items-center space-x-1 ${
                    isDisabled
                      ? 'text-[#475569] cursor-not-allowed opacity-60'
                      : basemap === id
                      ? 'bg-[#00d4aa] text-[#060b18] font-bold'
                      : 'text-[#94a3b8] hover:text-white'
                  }`}
                >
                  <span>{label}</span>
                  {isDisabled && <span className="text-[9px] text-[#f5a623] ml-0.5">(Cần Key)</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Measurement Tools */}
        <div className="flex items-center space-x-2">
          <span className="text-[#94a3b8]">Đo đạc:</span>
          <button
            onClick={() => {
              resetMeasurement();
              setMeasureMode(measureMode === 'distance' ? null : 'distance');
            }}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded border transition-all ${
              measureMode === 'distance'
                ? 'bg-[#f5a623] text-[#060b18] font-bold border-[#f5a623]'
                : 'bg-[#111827] text-white border-[#1e3a5f] hover:border-[#f5a623]'
            }`}
          >
            <Ruler className="w-3.5 h-3.5" />
            <span>Khoảng cách</span>
          </button>

          <button
            onClick={() => {
              resetMeasurement();
              setMeasureMode(measureMode === 'area' ? null : 'area');
            }}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded border transition-all ${
              measureMode === 'area'
                ? 'bg-[#00d4aa] text-[#060b18] font-bold border-[#00d4aa]'
                : 'bg-[#111827] text-white border-[#1e3a5f] hover:border-[#00d4aa]'
            }`}
          >
            <Square className="w-3.5 h-3.5" />
            <span>Diện tích thửa</span>
          </button>

          {measureMode && (
            <button
              onClick={resetMeasurement}
              className="px-2 py-1.5 rounded bg-[#111827] text-[#ef4444] border border-[#ef4444]/40 hover:bg-[#ef4444]/10"
              title="Xóa đo đạc"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Province selector */}
        <div className="flex items-center space-x-2">
          <span className="text-[#94a3b8]">Tỉnh thành (KTT):</span>
          <select
            value={selectedProvince.id}
            onChange={(e) => {
              const p = VN2000_PROVINCES.find((x) => x.id === e.target.value);
              if (p) setSelectedProvince(p);
            }}
            className="bg-[#111827] text-white border border-[#1e3a5f] rounded px-2.5 py-1 focus:border-[#00d4aa] outline-none"
          >
            {VN2000_PROVINCES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.kttStr})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Google Maps Status Banner */}
      {googleStatus === 'loading' && (
        <div className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-[#1e3a5f]/30 border border-[#1e3a5f] text-xs font-mono text-[#94a3b8]">
          <div className="animate-spin w-3.5 h-3.5 border-2 border-[#00d4aa] border-t-transparent rounded-full" />
          <span>Đang tải Google Maps API...</span>
        </div>
      )}
      {googleStatus === 'error' && googleError && (
        <div className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-[#ef4444]/10 border border-[#ef4444]/40 text-xs font-mono text-[#ef4444]">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Google Maps: {googleError}</span>
        </div>
      )}

      {/* Main Map Box */}
      <div className="relative rounded-2xl overflow-hidden border border-[#1e3a5f]/80 shadow-2xl bg-[#0a0f1a]">
        <div ref={mapContainerRef} className="w-full h-[580px] z-10" />

        {/* Live Coordinate readout HUD overlay */}
        <div className="absolute top-4 left-4 z-20 p-3 rounded-lg bg-[#060b18]/90 border border-[#00d4aa]/40 backdrop-blur-md font-mono text-xs max-w-sm shadow-xl">
          <div className="flex items-center space-x-1.5 text-[#00d4aa] mb-2 font-bold">
            <Crosshair className="w-3.5 h-3.5 animate-spin" />
            <span>ĐẦU ĐỌC TỌA ĐỘ TRỰC TIẾP</span>
          </div>
          {clickedCoord ? (
            <div className="space-y-1 text-[#e8edf5]">
              <div>WGS-84: <span className="text-[#38bdf8]">{clickedCoord.lat}, {clickedCoord.lon}</span></div>
              <div>VN-2000 X: <span className="text-[#00d4aa]">{clickedCoord.vnX.toLocaleString()} m</span> (Bắc)</div>
              <div>VN-2000 Y: <span className="text-[#00d4aa]">{clickedCoord.vnY.toLocaleString()} m</span> (Đông)</div>
              <div className="text-[10px] text-[#94a3b8] pt-1">KTT {selectedProvince.name}: {selectedProvince.kttStr} (Múi 3°)</div>
            </div>
          ) : (
            <p className="text-[11px] text-[#94a3b8]">Click bất kỳ trên bản đồ để lấy tọa độ WGS-84 và chuyển sang VN-2000.</p>
          )}

          {/* Measurement results */}
          {measurementResult && (
            <div className="mt-3 pt-2 border-t border-[#1e3a5f] text-xs">
              <span className="text-[#f5a623] font-bold">KẾT QUẢ ĐO ĐẠC:</span>
              {measurementResult.type === 'distance' && (
                <div className="text-white font-bold text-sm mt-0.5">{measurementResult.value}</div>
              )}
              {measurementResult.type === 'area' && (
                <div className="text-white font-bold text-sm mt-0.5">
                  {measurementResult.m2} <span className="text-[#94a3b8] text-xs">({measurementResult.ha})</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Import GeoJSON HUD overlay */}
        <div className="absolute top-4 right-4 z-20">
          <label className="cursor-pointer flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-[#060b18]/90 border border-[#1e3a5f] hover:border-[#00d4aa] text-white font-mono text-xs backdrop-blur-md shadow-lg transition-colors">
            <Upload className="w-3.5 h-3.5 text-[#00d4aa]" />
            <span>Nhập GeoJSON</span>
            <input type="file" accept=".geojson,.json" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      </div>

      {/* Survey Points Table */}
      <div className="p-6 rounded-xl bg-[#0a0f1a] border border-[#1e3a5f]/60 font-mono space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-[#00d4aa]" />
            <h3 className="font-bold text-sm text-white">DANH MỤC MỐC TRẮC ĐỊA & ĐỊA CHÍNH ({points.length} MỐC)</h3>
          </div>
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#111827] text-[#00d4aa] border border-[#00d4aa]/40 hover:bg-[#00d4aa]/10 text-xs font-semibold"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất CSV (Tọa độ VN-2000)</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1e3a5f] text-[#94a3b8]">
                <th className="py-2 px-3">MÃ MỐC</th>
                <th className="py-2 px-3">TÊN ĐIỂM ĐO</th>
                <th className="py-2 px-3">WGS-84 (LAT, LON)</th>
                <th className="py-2 px-3">VN-2000 X (BẮC)</th>
                <th className="py-2 px-3">VN-2000 Y (ĐÔNG)</th>
                <th className="py-2 px-3">ĐỘ CAO H</th>
                <th className="py-2 px-3">PHÂN LOẠI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e3a5f]/40 text-[#e8edf5]">
              {points.map((pt) => {
                const vn = wgs84ToVn2000(pt.lat, pt.lon, selectedProvince.ktt, 3);
                return (
                  <tr key={pt.id} className="hover:bg-[#111827]/60 transition-colors">
                    <td className="py-2.5 px-3 text-[#00d4aa] font-bold">{pt.id}</td>
                    <td className="py-2.5 px-3">{pt.name}</td>
                    <td className="py-2.5 px-3 text-[#38bdf8]">
                      {pt.lat.toFixed(6)}, {pt.lon.toFixed(6)}
                    </td>
                    <td className="py-2.5 px-3">{vn.x.toLocaleString()} m</td>
                    <td className="py-2.5 px-3">{vn.y.toLocaleString()} m</td>
                    <td className="py-2.5 px-3">{pt.h.toFixed(2)} m</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded bg-[#111827] border border-[#1e3a5f] text-[10px]">
                        {pt.type}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
