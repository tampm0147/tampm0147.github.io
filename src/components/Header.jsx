import React from 'react';
import { Compass, Map, Satellite, Box, GitBranch, Radio, Layers, Activity } from 'lucide-react';

export default function Header({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'showcase', label: 'Showcase & Nghiên cứu', icon: Compass, badge: 'Portfolio' },
    { id: 'webgis', label: 'Bản đồ Trắc địa WebGIS', icon: Map, badge: 'Tool' },
    { id: 'vn2000', label: 'Chuyển hệ VN-2000', icon: Satellite, badge: 'Engine' },
    { id: 'terrain3d', label: 'Mô hình 3D & Point Cloud', icon: Box, badge: 'WebGL' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#060b18]/90 backdrop-blur-md border-b border-[#1e3a5f]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('showcase')}>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00d4aa] to-[#2347e8] flex items-center justify-center shadow-lg shadow-[#00d4aa]/20 border border-[#00d4aa]/40">
              <Compass className="w-6 h-6 text-[#060b18] animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-white font-mono">
                  GEOSURVEY<span className="text-[#00d4aa]">.STUDIO</span>
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono font-semibold bg-[#111827] text-[#00d4aa] border border-[#00d4aa]/30 rounded">
                  HCMUNRE
                </span>
              </div>
              <p className="text-[11px] text-[#94a3b8] font-mono tracking-wide">
                Trần Thanh Tâm • Geomatics & WebGIS
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-xs font-mono transition-all duration-200 ${
                    isActive
                      ? 'bg-[#00d4aa]/15 text-[#00d4aa] border border-[#00d4aa]/40 shadow-sm shadow-[#00d4aa]/10'
                      : 'text-[#94a3b8] hover:text-white hover:bg-[#111827]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#00d4aa]' : 'text-[#64748b]'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Status & Links */}
          <div className="flex items-center space-x-3">
            {/* Live RTK status simulator */}
            <div className="hidden lg:flex items-center space-x-2 px-2.5 py-1 rounded-full bg-[#111827] border border-[#1e3a5f] text-[11px] font-mono">
              <span className="w-2 h-2 rounded-full bg-[#00d4aa] animate-ping" />
              <span className="text-[#94a3b8]">GNSS:</span>
              <span className="text-[#00d4aa] font-semibold">RTK FIX (±0.008m)</span>
            </div>

            <a
              href="https://github.com/tampm0147"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-[#111827] text-[#94a3b8] hover:text-white hover:border-[#00d4aa]/40 border border-[#1e3a5f] text-xs font-mono transition-colors"
            >
              <GitBranch className="w-4 h-4" />
              <span className="hidden sm:inline">GitHub</span>
            </a>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-[#1e3a5f]/40 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center py-1 px-2 text-[10px] font-mono ${
                  isActive ? 'text-[#00d4aa] font-semibold' : 'text-[#94a3b8]'
                }`}
              >
                <Icon className="w-4 h-4 mb-0.5" />
                <span>{tab.badge}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
