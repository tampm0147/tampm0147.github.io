import React, { useState } from 'react';
import { Satellite, ArrowRightLeft, Copy, Check, MapPin, Download, RefreshCw, Layers, Compass, HelpCircle } from 'lucide-react';
import { VN2000_PROVINCES, vn2000ToWgs84, wgs84ToVn2000 } from '../data/vn2000.js';

export default function VN2000Engine({ onLocateOnMap }) {
  const [direction, setDirection] = useState('vn2wgs'); // 'vn2wgs' | 'wgs2vn'
  const [selectedProvince, setSelectedProvince] = useState(VN2000_PROVINCES[0]); // HCM default
  const [zone, setZone] = useState(3); // 3 or 6
  const [searchFilter, setSearchFilter] = useState('');

  // Single Input state
  // Initial example coordinate in TP.HCM (HCMUNRE area approx)
  const [vnX, setVnX] = useState('1195420.500'); // X (Bắc)
  const [vnY, setVnY] = useState('605120.300');  // Y (Đông)
  const [wgsLat, setWgsLat] = useState('10.801542');
  const [wgsLon, setWgsLon] = useState('106.657821');

  // Copied toast state
  const [copied, setCopied] = useState(false);

  // Batch input
  const [batchText, setBatchText] = useState(`Moc01, 1195420.500, 605120.300
Moc02, 1195600.250, 605300.800
Moc03, 1195850.120, 605050.450`);
  const [batchResults, setBatchResults] = useState([]);

  // Calculate single
  const singleResult = (() => {
    if (direction === 'vn2wgs') {
      const res = vn2000ToWgs84(vnX, vnY, selectedProvince.ktt, zone);
      return {
        ...res,
        dmsLat: toDMS(res.lat, 'lat'),
        dmsLon: toDMS(res.lon, 'lon'),
      };
    } else {
      const res = wgs84ToVn2000(wgsLat, wgsLon, selectedProvince.ktt, zone);
      return res;
    }
  })();

  function toDMS(val, type) {
    if (isNaN(val)) return '';
    const abs = Math.abs(val);
    const deg = Math.floor(abs);
    const minFloat = (abs - deg) * 60;
    const min = Math.floor(minFloat);
    const sec = ((minFloat - min) * 60).toFixed(2);
    const dir = type === 'lat' ? (val >= 0 ? 'N' : 'S') : val >= 0 ? 'E' : 'W';
    return `${deg}°${min}'${sec}" ${dir}`;
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Run Batch Conversion
  const handleRunBatch = () => {
    const lines = batchText.trim().split('\n');
    const results = [];

    lines.forEach((line, idx) => {
      const parts = line.split(/[,;\t]+/).map((s) => s.trim());
      if (parts.length >= 3) {
        const id = parts[0];
        const val1 = parseFloat(parts[1]);
        const val2 = parseFloat(parts[2]);

        if (direction === 'vn2wgs') {
          const res = vn2000ToWgs84(val1, val2, selectedProvince.ktt, zone);
          results.push({ id, inX: val1, inY: val2, outLat: res.lat, outLon: res.lon, valid: res.isValid });
        } else {
          const res = wgs84ToVn2000(val1, val2, selectedProvince.ktt, zone);
          results.push({ id, inLat: val1, inLon: val2, outX: res.x, outY: res.y, valid: res.isValid });
        }
      }
    });
    setBatchResults(results);
  };

  // Export batch to CSV
  const exportBatchCSV = () => {
    if (!batchResults.length) return;
    let csv = '';
    if (direction === 'vn2wgs') {
      csv = 'Mã mốc,VN2000 X (Bắc),VN2000 Y (Đông),WGS84 Vĩ độ (Lat),WGS84 Kinh độ (Lon)\n';
      batchResults.forEach((r) => {
        csv += `${r.id},${r.inX},${r.inY},${r.outLat},${r.outLon}\n`;
      });
    } else {
      csv = 'Mã mốc,WGS84 Vĩ độ (Lat),WGS84 Kinh độ (Lon),VN2000 X (Bắc),VN2000 Y (Đông)\n';
      batchResults.forEach((r) => {
        csv += `${r.id},${r.inLat},${r.inLon},${r.outX},${r.outY}\n`;
      });
    }
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Chuyen_He_Toa_Do_${selectedProvince.id}.csv`;
    a.click();
  };

  const filteredProvinces = VN2000_PROVINCES.filter((p) =>
    p.name.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="space-y-12 py-6 max-w-6xl mx-auto font-sans">
      {/* Title */}
      <div className="border-b border-[#1e3a5f]/60 pb-6">
        <div className="inline-flex items-center space-x-2 text-xs font-mono text-[#00d4aa] mb-2 uppercase tracking-wider">
          <Satellite className="w-4 h-4" />
          <span>GEODETIC PROJECTION ENGINE • QĐ 05/2007/QĐ-BTNMT</span>
        </div>
        <h2 className="text-3xl font-extrabold text-white">
          Chuyển đổi Hệ Tọa độ VN-2000 ↔ WGS-84
        </h2>
        <p className="text-sm text-[#94a3b8] mt-2 max-w-3xl">
          Công cụ tính toán chuyển đổi chính xác tọa độ trắc địa Việt Nam (VN-2000) và hệ tọa độ quốc tế (WGS-84).
          Tích hợp sẵn kinh tuyến trục (KTT) 63 tỉnh thành phố với 7 tham số dịch chuyển chuẩn xác của Cục Đo đạc, Bản đồ và Thông tin địa lý Việt Nam.
        </p>
      </div>

      {/* Main Control Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Settings: Province & Zone */}
        <div className="p-6 rounded-2xl bg-[#0a0f1a] border border-[#1e3a5f]/70 space-y-6">
          <h3 className="font-bold text-sm text-white font-mono flex items-center space-x-2 text-[#00d4aa]">
            <Layers className="w-4 h-4" />
            <span>THAM SỐ HỆ QUY CHIẾU</span>
          </h3>

          {/* Direction toggle */}
          <div className="space-y-2">
            <label className="text-xs font-mono text-[#94a3b8]">Chiều chuyển đổi:</label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-[#111827] rounded-xl border border-[#1e3a5f]">
              <button
                onClick={() => setDirection('vn2wgs')}
                className={`py-2 px-3 rounded-lg text-xs font-mono font-bold transition-all ${
                  direction === 'vn2wgs'
                    ? 'bg-[#00d4aa] text-[#060b18] shadow'
                    : 'text-[#94a3b8] hover:text-white'
                }`}
              >
                VN-2000 ➔ WGS-84
              </button>
              <button
                onClick={() => setDirection('wgs2vn')}
                className={`py-2 px-3 rounded-lg text-xs font-mono font-bold transition-all ${
                  direction === 'wgs2vn'
                    ? 'bg-[#00d4aa] text-[#060b18] shadow'
                    : 'text-[#94a3b8] hover:text-white'
                }`}
              >
                WGS-84 ➔ VN-2000
              </button>
            </div>
          </div>

          {/* Zone selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono text-[#94a3b8]">Múi chiếu (Zone):</label>
              <span className="text-[11px] font-mono text-[#f5a623]">
                {zone === 3 ? 'k=0.9999 (Địa chính)' : 'k=0.9996 (Địa hình)'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setZone(3)}
                className={`py-2 px-3 rounded-lg text-xs font-mono border transition-all ${
                  zone === 3
                    ? 'bg-[#111827] border-[#00d4aa] text-[#00d4aa] font-bold'
                    : 'bg-[#111827]/40 border-[#1e3a5f] text-[#94a3b8] hover:text-white'
                }`}
              >
                Múi 3° (Thực địa/Địa chính)
              </button>
              <button
                onClick={() => setZone(6)}
                className={`py-2 px-3 rounded-lg text-xs font-mono border transition-all ${
                  zone === 6
                    ? 'bg-[#111827] border-[#00d4aa] text-[#00d4aa] font-bold'
                    : 'bg-[#111827]/40 border-[#1e3a5f] text-[#94a3b8] hover:text-white'
                }`}
              >
                Múi 6° (Quốc gia 1:50k)
              </button>
            </div>
          </div>

          {/* Province Central Meridian */}
          <div className="space-y-2">
            <label className="text-xs font-mono text-[#94a3b8]">Kinh tuyến trục tỉnh thành:</label>
            <input
              type="text"
              placeholder="Tìm kiếm tỉnh thành..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full bg-[#111827] text-white border border-[#1e3a5f] rounded-lg px-3 py-1.5 text-xs font-mono focus:border-[#00d4aa] outline-none"
            />
            <div className="max-h-48 overflow-y-auto space-y-1 pr-1 border border-[#1e3a5f]/40 rounded-lg p-1 bg-[#111827]/40">
              {filteredProvinces.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedProvince(p)}
                  className={`w-full text-left px-2.5 py-1.5 rounded text-xs font-mono flex items-center justify-between transition-colors ${
                    selectedProvince.id === p.id
                      ? 'bg-[#00d4aa]/20 text-[#00d4aa] font-bold'
                      : 'text-[#94a3b8] hover:bg-[#111827] hover:text-white'
                  }`}
                >
                  <span>{p.name}</span>
                  <span className="text-[11px] opacity-70">{p.kttStr}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#111827] border border-[#1e3a5f]/60 text-[11px] text-[#94a3b8] font-mono leading-relaxed">
            <div className="text-white font-bold mb-1">KTT Hiện tại: {selectedProvince.name}</div>
            <div>• Kinh độ gốc L0: {selectedProvince.ktt}° ({selectedProvince.kttStr})</div>
            <div>• Độ lệch trục X0: 500,000 m</div>
            <div>• Elip quy chiếu: WGS-84 / VN-2000</div>
          </div>
        </div>

        {/* Right Computation Box: Input & Output */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#0a0f1a] border border-[#1e3a5f]/70 space-y-6">
          <div className="flex items-center justify-between border-b border-[#1e3a5f]/60 pb-3">
            <h3 className="font-bold text-sm text-white font-mono flex items-center space-x-2 text-[#00d4aa]">
              <Compass className="w-4 h-4" />
              <span>TÍNH TOÁN ĐIỂM ĐƠN LẺ</span>
            </h3>
            <span className="text-xs font-mono text-[#38bdf8]">
              {direction === 'vn2wgs' ? 'Nhập X, Y ➔ Nhận Lat, Lon' : 'Nhập Lat, Lon ➔ Nhận X, Y'}
            </span>
          </div>

          {/* Form input */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {direction === 'vn2wgs' ? (
              <>
                <div className="space-y-1.5 font-mono">
                  <label className="text-xs text-[#94a3b8]">Tọa độ X (Northing - Bắc) [m]:</label>
                  <input
                    type="number"
                    value={vnX}
                    onChange={(e) => setVnX(e.target.value)}
                    className="w-full bg-[#111827] text-white border border-[#1e3a5f] rounded-lg px-3.5 py-2 text-sm focus:border-[#00d4aa] outline-none"
                    placeholder="Ví dụ: 1195420.500"
                  />
                </div>
                <div className="space-y-1.5 font-mono">
                  <label className="text-xs text-[#94a3b8]">Tọa độ Y (Easting - Đông) [m]:</label>
                  <input
                    type="number"
                    value={vnY}
                    onChange={(e) => setVnY(e.target.value)}
                    className="w-full bg-[#111827] text-white border border-[#1e3a5f] rounded-lg px-3.5 py-2 text-sm focus:border-[#00d4aa] outline-none"
                    placeholder="Ví dụ: 605120.300"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-1.5 font-mono">
                  <label className="text-xs text-[#94a3b8]">Vĩ độ (WGS-84 Latitude) [độ]:</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={wgsLat}
                    onChange={(e) => setWgsLat(e.target.value)}
                    className="w-full bg-[#111827] text-white border border-[#1e3a5f] rounded-lg px-3.5 py-2 text-sm focus:border-[#00d4aa] outline-none"
                    placeholder="Ví dụ: 10.801542"
                  />
                </div>
                <div className="space-y-1.5 font-mono">
                  <label className="text-xs text-[#94a3b8]">Kinh độ (WGS-84 Longitude) [độ]:</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={wgsLon}
                    onChange={(e) => setWgsLon(e.target.value)}
                    className="w-full bg-[#111827] text-white border border-[#1e3a5f] rounded-lg px-3.5 py-2 text-sm focus:border-[#00d4aa] outline-none"
                    placeholder="Ví dụ: 106.657821"
                  />
                </div>
              </>
            )}
          </div>

          {/* Results Display Card */}
          <div className="p-6 rounded-xl bg-gradient-to-br from-[#111827] to-[#0a0f1a] border border-[#00d4aa]/40 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#00d4aa] flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-[#00d4aa] animate-ping" />
                <span>KẾT QUẢ CHUYỂN ĐỔI CHUẨN XÁC</span>
              </span>
              {copied && <span className="text-xs font-mono text-[#00d4aa]">Đã sao chép!</span>}
            </div>

            {direction === 'vn2wgs' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono">
                <div className="p-3 rounded-lg bg-[#060b18] border border-[#1e3a5f]">
                  <div className="text-[11px] text-[#94a3b8]">WGS-84 VĨ ĐỘ (LAT):</div>
                  <div className="text-lg font-bold text-white mt-1">{singleResult.lat}°</div>
                  <div className="text-xs text-[#38bdf8] mt-0.5">{singleResult.dmsLat}</div>
                </div>
                <div className="p-3 rounded-lg bg-[#060b18] border border-[#1e3a5f]">
                  <div className="text-[11px] text-[#94a3b8]">WGS-84 KINH ĐỘ (LON):</div>
                  <div className="text-lg font-bold text-white mt-1">{singleResult.lon}°</div>
                  <div className="text-xs text-[#38bdf8] mt-0.5">{singleResult.dmsLon}</div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono">
                <div className="p-3 rounded-lg bg-[#060b18] border border-[#1e3a5f]">
                  <div className="text-[11px] text-[#94a3b8]">VN-2000 X (BẮC / NORTHING):</div>
                  <div className="text-lg font-bold text-white mt-1">{singleResult.x?.toLocaleString()} m</div>
                </div>
                <div className="p-3 rounded-lg bg-[#060b18] border border-[#1e3a5f]">
                  <div className="text-[11px] text-[#94a3b8]">VN-2000 Y (ĐÔNG / EASTING):</div>
                  <div className="text-lg font-bold text-white mt-1">{singleResult.y?.toLocaleString()} m</div>
                </div>
              </div>
            )}

            {/* Actions for result */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => {
                  const text =
                    direction === 'vn2wgs'
                      ? `${singleResult.lat}, ${singleResult.lon}`
                      : `${singleResult.x}, ${singleResult.y}`;
                  copyToClipboard(text);
                }}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#060b18] border border-[#1e3a5f] hover:border-[#00d4aa] text-white text-xs font-mono transition-colors"
              >
                <Copy className="w-3.5 h-3.5 text-[#00d4aa]" />
                <span>Sao chép kết quả</span>
              </button>

              <button
                onClick={() => {
                  const lat = direction === 'vn2wgs' ? singleResult.lat : parseFloat(wgsLat);
                  const lon = direction === 'vn2wgs' ? singleResult.lon : parseFloat(wgsLon);
                  if (onLocateOnMap) onLocateOnMap({ lat, lon });
                }}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#00d4aa] text-[#060b18] font-bold text-xs font-mono hover:bg-[#00d4aa]/90 transition-all shadow-md shadow-[#00d4aa]/20"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Xem vị trí trên Bản đồ WebGIS</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Batch Conversion Section */}
      <div className="p-6 rounded-2xl bg-[#0a0f1a] border border-[#1e3a5f]/70 space-y-4 font-mono">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1e3a5f]/60 pb-3">
          <div>
            <h3 className="font-bold text-sm text-white flex items-center space-x-2 text-[#00d4aa]">
              <RefreshCw className="w-4 h-4" />
              <span>CHUYỂN ĐỔI HÀNG LOẠT (BATCH PROCESSING)</span>
            </h3>
            <p className="text-xs text-[#94a3b8] mt-1">
              Dán danh sách tọa độ (Định dạng: Mã điểm, Tọa độ 1, Tọa độ 2 cách nhau bằng dấu phẩy)
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleRunBatch}
              className="px-4 py-2 rounded-lg bg-[#00d4aa] text-[#060b18] font-bold text-xs hover:bg-[#00d4aa]/90 transition-all"
            >
              Chuyển đổi ngay ({batchText.trim().split('\n').length} điểm)
            </button>
            {batchResults.length > 0 && (
              <button
                onClick={exportBatchCSV}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-[#111827] text-white border border-[#1e3a5f] hover:border-[#00d4aa] text-xs transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-[#00d4aa]" />
                <span>Xuất file CSV</span>
              </button>
            )}
          </div>
        </div>

        <textarea
          rows={4}
          value={batchText}
          onChange={(e) => setBatchText(e.target.value)}
          className="w-full bg-[#111827] text-white border border-[#1e3a5f] rounded-lg p-3 text-xs leading-relaxed focus:border-[#00d4aa] outline-none"
          placeholder="Moc01, 1195420.500, 605120.300&#10;Moc02, 1195600.250, 605300.800"
        />

        {/* Batch results table */}
        {batchResults.length > 0 && (
          <div className="overflow-x-auto pt-2">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#1e3a5f] text-[#94a3b8]">
                  <th className="py-2 px-3">MÃ ĐIỂM</th>
                  <th className="py-2 px-3">INPUT 1</th>
                  <th className="py-2 px-3">INPUT 2</th>
                  <th className="py-2 px-3">OUTPUT 1</th>
                  <th className="py-2 px-3">OUTPUT 2</th>
                  <th className="py-2 px-3">TRẠNG THÁI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e3a5f]/40 text-[#e8edf5]">
                {batchResults.map((r, i) => (
                  <tr key={i} className="hover:bg-[#111827]/60">
                    <td className="py-2 px-3 font-bold text-[#00d4aa]">{r.id}</td>
                    <td className="py-2 px-3">{direction === 'vn2wgs' ? r.inX : r.inLat}</td>
                    <td className="py-2 px-3">{direction === 'vn2wgs' ? r.inY : r.inLon}</td>
                    <td className="py-2 px-3 text-[#38bdf8] font-bold">
                      {direction === 'vn2wgs' ? r.outLat : r.outX?.toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-[#38bdf8] font-bold">
                      {direction === 'vn2wgs' ? r.outLon : r.outY?.toLocaleString()}
                    </td>
                    <td className="py-2 px-3">
                      <span className="px-2 py-0.5 rounded bg-[#00d4aa]/15 text-[#00d4aa] text-[10px] font-bold">
                        HỢP LỆ
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
