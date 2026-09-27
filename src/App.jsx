import React, { useState } from 'react';
import Header from './components/Header.jsx';
import Showcase from './components/Showcase.jsx';
import WebGISMap from './components/WebGISMap.jsx';
import VN2000Engine from './components/VN2000Engine.jsx';
import TerrainViewer3D from './components/TerrainViewer3D.jsx';
import Footer from './components/Footer.jsx';

export default function App() {
  const [activeTab, setActiveTab] = useState('showcase');
  const [mapTargetCoord, setMapTargetCoord] = useState(null);

  // When locating from VN-2000 Engine
  const handleLocateOnMap = (coord) => {
    setMapTargetCoord(coord);
    setActiveTab('webgis');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#060b18] text-[#e8edf5]">
      {/* Navigation Header */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'showcase' && (
          <Showcase onNavigate={(tab) => setActiveTab(tab)} />
        )}

        {activeTab === 'webgis' && (
          <WebGISMap selectedCoordinate={mapTargetCoord} />
        )}

        {activeTab === 'vn2000' && (
          <VN2000Engine onLocateOnMap={handleLocateOnMap} />
        )}

        {activeTab === 'terrain3d' && (
          <TerrainViewer3D />
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={(tab) => setActiveTab(tab)} />
    </div>
  );
}
