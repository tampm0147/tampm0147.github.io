import React from 'react';
import { Compass, GitBranch, Heart, Mail } from 'lucide-react';

export default function Footer({ onNavigate }) {
  return (
    <footer className="mt-20 border-t border-[#1e3a5f]/60 bg-[#060b18] text-[#94a3b8] font-mono text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1 */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded bg-[#00d4aa] flex items-center justify-center text-[#060b18]">
                <Compass className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm text-white">
                GEOSURVEY<span className="text-[#00d4aa]">.STUDIO</span>
              </span>
            </div>
            <p className="text-xs text-[#94a3b8] leading-relaxed max-w-sm">
              Không gian số chuyên ngành Kỹ thuật Trắc địa Bản đồ, Viễn thám & WebGIS. Xây dựng bởi <strong>Trần Thanh Tâm</strong> — Sinh viên Khoa Trắc địa Bản đồ & Quản lý đất đai (Trường ĐH Tài nguyên và Môi trường TP.HCM - HCMUNRE).
            </p>
          </div>

          {/* Col 2 */}
          <div className="space-y-2">
            <div className="font-bold text-white text-xs uppercase tracking-wider mb-2">
              CÔNG CỤ TRẮC ĐỊA
            </div>
            <ul className="space-y-1.5">
              <li>
                <button
                  onClick={() => onNavigate('showcase')}
                  className="hover:text-[#00d4aa] transition-colors"
                >
                  Showcase & Case Studies
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('webgis')}
                  className="hover:text-[#00d4aa] transition-colors"
                >
                  Bản đồ Đo đạc WebGIS
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('vn2000')}
                  className="hover:text-[#00d4aa] transition-colors"
                >
                  Bộ chuyển đổi VN-2000
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('terrain3d')}
                  className="hover:text-[#00d4aa] transition-colors"
                >
                  Mô phỏng 3D & Point Cloud
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-2">
            <div className="font-bold text-white text-xs uppercase tracking-wider mb-2">
              LIÊN HỆ & MÃ NGUỒN
            </div>
            <ul className="space-y-1.5">
              <li>
                <a
                  href="https://github.com/tampm0147"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 hover:text-[#00d4aa] transition-colors"
                >
                  <GitBranch className="w-3.5 h-3.5" />
                  <span>github.com/tampm0147</span>
                </a>
              </li>
              <li>
                <a
                  href="https://tampm.is-a.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#00d4aa] transition-colors"
                >
                  tampm.is-a.dev
                </a>
              </li>
              <li className="text-[11px] text-[#64748b]">
                Hệ quy chiếu: VN-2000 (Bộ TN&MT)
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-[#1e3a5f]/40 flex flex-col sm:flex-row items-center justify-between text-[11px] gap-2">
          <span>© 2026 Trần Thanh Tâm (tampm0147). All rights reserved.</span>
          <span>Thiết kế chuẩn kỹ thuật Trắc địa số • Đồ án & Khởi nghiệp địa không gian</span>
        </div>
      </div>
    </footer>
  );
}
