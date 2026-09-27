import React from 'react';
import { Compass, Satellite, Map, Box, CheckCircle2, ArrowRight, Shield, Award, Cpu, Database, Eye } from 'lucide-react';

export default function Showcase({ onNavigate }) {
  const kpis = [
    { value: '±0.005m', label: 'Độ chính xác Lưới', desc: 'Sai số bình sai GNSS hạng III/IV' },
    { value: '< 2.0 cm/px', label: 'Độ phân giải GSD', desc: 'Bay chụp Drone UAV địa hình' },
    { value: '63 Tỉnh/Thành', label: 'Hệ tọa độ VN-2000', desc: 'Cơ sở dữ liệu KTT chuẩn Bộ TN&MT' },
    { value: '100% WebGL', label: 'Xử lý Không gian', desc: 'Mô phỏng 3D địa hình trực tiếp' },
  ];

  const projects = [
    {
      title: 'Khảo sát UAV Địa hình & Mô hình số độ cao (DSM/DEM)',
      category: 'Drone Photogrammetry',
      badge: 'Thực chiến UAV',
      desc: 'Quy trình bay chụp trắc địa ảnh UAV sử dụng định vị PPK/RTK, bố trí mạng lưới mốc kiểm tra GCP độ chính xác cao. Xây dựng bản đồ trực ảnh Orthomosaic độ phân giải siêu nét (GSD < 2cm) và tính toán khối lượng san lấp đào đắp tự động.',
      tags: ['UAV RTK', 'Orthomosaic', 'DEM/DSM', 'Point Cloud', 'Pix4D/Agisoft'],
      metric: 'GSD 1.8cm • Sai số GCP < 2.5cm',
    },
    {
      title: 'Thiết kế & Bình sai Lưới Khống chế Trắc địa 2D/3D',
      category: 'Geodetic Surveying',
      badge: 'HCMUNRE Campus',
      desc: 'Thành lập đồ hình lưới khống chế mặt bằng và độ cao kết hợp máy toàn đạc điện tử và máy thu GNSS 2 tần số. Thực hiện bình sai gián tiếp có điều kiện, kiểm định sai số khép góc, khép cạnh và vẽ elip sai số theo quy chuẩn TCVN 9401:2012.',
      tags: ['GNSS Static', 'Total Station', 'Bình sai Lưới', 'TCVN 9401', 'Elip Sai số'],
      metric: 'Sai số khép góc f_beta < 10"',
    },
    {
      title: 'Hệ thống WebGIS Quản lý Biến động Không gian & Địa chính',
      category: 'WebGIS & Spatial Database',
      badge: 'Fullstack Platform',
      desc: 'Nền tảng số hóa quản lý ranh thửa đất, hỗ trợ tra cứu thông tin quy hoạch xây dựng và kiểm tra ranh giới thửa đất thực tế. Tích hợp công cụ đo đạc diện tích/chu vi và chuyển đổi tọa độ VN-2000 trực tuyến.',
      tags: ['PostGIS', 'Leaflet', 'GeoJSON', 'VN-2000', 'Cloudflare Workers'],
      metric: 'Truy vấn không gian < 50ms',
    },
    {
      title: 'Viễn thám Đa phổ Giám sát Thảm phủ & Biến động Môi trường',
      category: 'Remote Sensing',
      badge: 'Research Project',
      desc: 'Xử lý chuỗi ảnh vệ tinh Sentinel-2 và Landsat-8/9 để trích xuất chỉ số thực vật NDVI, mặt nước NDWI. Nghiên cứu phương pháp giao thoa Radar viễn thám (D-InSAR) theo dõi sụt lún nền địa chất đô thị ven sông TP.HCM.',
      tags: ['Sentinel-2', 'Radar SAR', 'NDVI / NDWI', 'InSAR', 'Google Earth Engine'],
      metric: 'Phạm vi quét 250+ km²',
    },
  ];

  const standards = [
    { title: 'Quy chuẩn Kỹ thuật Quốc gia', detail: 'TCVN 9401:2012 về đo đạc lưới trắc địa mặt bằng bằng công nghệ GNSS.' },
    { title: 'Hệ Quy chiếu VN-2000', detail: 'Quyết định 05/2007/QĐ-BTNMT về việc sử dụng hệ quy chiếu và hệ tọa độ quốc gia.' },
    { title: 'Quy phạm Bay chụp UAV', detail: 'Thông tư Bộ TN&MT về tiêu chuẩn kỹ thuật bay chụp ảnh hàng không bằng máy bay không người lái.' },
  ];

  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#0a0f1a] to-[#060b18] border border-[#1e3a5f]/80 p-8 sm:p-12 shadow-2xl">
        {/* Background cartographic elements */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#00d4aa_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#00d4aa]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#00d4aa]/10 border border-[#00d4aa]/30 text-[#00d4aa] text-xs font-mono mb-6">
            <span className="w-2 h-2 rounded-full bg-[#00d4aa] animate-ping" />
            <span>HCMUNRE • KỸ THUẬT TRẮC ĐỊA BẢN ĐỒ & GIS</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight font-sans">
            Kỹ thuật Trắc địa Số & <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00d4aa] via-[#38bdf8] to-[#2347e8]">
              Không gian Địa lý Thực chiến
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-[#94a3b8] leading-relaxed max-w-3xl">
            Em là <strong>Trần Thanh Tâm</strong> (sinh viên ngành Trắc địa Bản đồ - Trường ĐH Tài nguyên và Môi trường TP.HCM).
            Đây là không gian số tích hợp nghiên cứu trắc địa, công cụ bản đồ số WebGIS, thuật toán chuyển đổi hệ tọa độ VN-2000 chuẩn xác và mô phỏng 3D địa hình trực quan.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <button
              onClick={() => onNavigate('webgis')}
              className="inline-flex items-center space-x-2 px-5 py-3 rounded-lg bg-[#00d4aa] text-[#060b18] font-bold text-sm hover:bg-[#00d4aa]/90 transition-all shadow-lg shadow-[#00d4aa]/20"
            >
              <Map className="w-4 h-4" />
              <span>Mở Bản đồ WebGIS</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('vn2000')}
              className="inline-flex items-center space-x-2 px-5 py-3 rounded-lg bg-[#111827] text-white border border-[#1e3a5f] hover:border-[#00d4aa]/50 font-mono text-sm transition-all"
            >
              <Satellite className="w-4 h-4 text-[#00d4aa]" />
              <span>Chuyển đổi VN-2000</span>
            </button>

            <button
              onClick={() => onNavigate('terrain3d')}
              className="inline-flex items-center space-x-2 px-5 py-3 rounded-lg bg-[#111827] text-white border border-[#1e3a5f] hover:border-[#00d4aa]/50 font-mono text-sm transition-all"
            >
              <Box className="w-4 h-4 text-[#38bdf8]" />
              <span>Xem Mô hình 3D</span>
            </button>
          </div>
        </div>
      </section>

      {/* KPI Cards */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => (
          <div
            key={index}
            className="p-5 rounded-xl bg-[#0a0f1a] border border-[#1e3a5f]/60 hover:border-[#00d4aa]/40 transition-colors"
          >
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-[#00d4aa] mb-1">
              {kpi.value}
            </div>
            <div className="text-sm font-semibold text-white mb-1">{kpi.label}</div>
            <div className="text-xs text-[#94a3b8]">{kpi.desc}</div>
          </div>
        ))}
      </section>

      {/* Projects Showcase */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-[#1e3a5f]/60 pb-4">
          <div>
            <div className="text-xs font-mono text-[#00d4aa] tracking-widest uppercase mb-1">
              PROJECTS & CASE STUDIES
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white font-sans">
              Dự án Khảo sát & Ứng dụng Địa không gian
            </h2>
          </div>
          <span className="text-xs font-mono text-[#94a3b8] mt-2 sm:mt-0">
            Nghiên cứu & Thực nghiệm thực tế
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((proj, idx) => (
            <div
              key={idx}
              className="group p-6 rounded-xl bg-[#0a0f1a] border border-[#1e3a5f]/70 hover:border-[#00d4aa]/50 transition-all flex flex-col justify-between hover:shadow-xl hover:shadow-[#00d4aa]/5"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-[#111827] text-[#00d4aa] border border-[#00d4aa]/30">
                    {proj.category}
                  </span>
                  <span className="text-[11px] font-mono text-[#f5a623]">{proj.badge}</span>
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-[#00d4aa] transition-colors mb-2">
                  {proj.title}
                </h3>
                <p className="text-sm text-[#94a3b8] leading-relaxed mb-4">
                  {proj.desc}
                </p>
              </div>

              <div>
                <div className="text-xs font-mono text-[#38bdf8] mb-3 font-semibold">
                  ⚡ {proj.metric}
                </div>
                <div className="flex flex-wrap gap-1.5 pt-3 border-t border-[#1e3a5f]/40">
                  {proj.tags.map((t, i) => (
                    <span
                      key={i}
                      className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#111827] text-[#94a3b8]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Standards & Philosophy */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8 rounded-xl bg-[#0a0f1a] border border-[#1e3a5f]/60">
        {standards.map((std, i) => (
          <div key={i} className="space-y-2">
            <div className="flex items-center space-x-2 text-[#00d4aa]">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <h4 className="font-bold text-sm text-white">{std.title}</h4>
            </div>
            <p className="text-xs text-[#94a3b8] leading-relaxed pl-7">{std.detail}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
