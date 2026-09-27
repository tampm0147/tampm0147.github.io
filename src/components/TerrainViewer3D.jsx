import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Box, Layers, Play, Pause, RotateCcw, Activity, Eye, Sliders, Maximize2 } from 'lucide-react';

export default function TerrainViewer3D() {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const terrainMeshRef = useRef(null);
  const pointCloudRef = useRef(null);
  const laserBeamRef = useRef(null);

  // States
  const [viewMode, setViewMode] = useState('elevation'); // 'elevation' | 'wireframe' | 'pointcloud'
  const [exaggeration, setExaggeration] = useState(1.5);
  const [isScanning, setIsScanning] = useState(true);
  const [stats, setStats] = useState({ points: '16,384', minElev: '12m', maxElev: '840m' });

  useEffect(() => {
    if (!mountRef.current) return;

    // Dimensions
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight || 550;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060b18);
    scene.fog = new THREE.FogExp2(0x060b18, 0.015);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
    camera.position.set(0, 45, 65);
    camera.lookAt(0, 0, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x00d4aa, 1.2);
    dirLight.position.set(20, 40, 20);
    scene.add(dirLight);

    const blueLight = new THREE.DirectionalLight(0x2347e8, 0.8);
    blueLight.position.set(-20, 20, -20);
    scene.add(blueLight);

    // Grid helper on base
    const gridHelper = new THREE.GridHelper(80, 20, 0x1e3a5f, 0x0f1f38);
    gridHelper.position.y = -5;
    scene.add(gridHelper);

    // Generate Procedural Topography
    const GRID_SIZE = 128;
    const geometry = new THREE.PlaneGeometry(60, 60, GRID_SIZE - 1, GRID_SIZE - 1);
    geometry.rotateX(-Math.PI / 2);

    const pos = geometry.attributes.position;
    const colors = [];
    const color = new THREE.Color();

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);

      // Realistic topography formula (combination of sines and cosines)
      const h1 = Math.sin(x * 0.12) * Math.cos(z * 0.12) * 5;
      const h2 = Math.sin(x * 0.25 + 1.2) * Math.sin(z * 0.25) * 2.5;
      const h3 = Math.cos(Math.sqrt(x * x + z * z) * 0.15) * 4;
      const elev = (h1 + h2 + h3 + 6) * 0.8;

      pos.setY(i, elev * exaggeration);

      // Color mapping by elevation (Hypsometric Tinting)
      const normY = (elev + 2) / 14;
      if (normY < 0.25) {
        color.setHSL(0.55, 0.8, 0.3); // Deep river/valley blue
      } else if (normY < 0.5) {
        color.setHSL(0.38, 0.7, 0.45); // Lowland green
      } else if (normY < 0.75) {
        color.setHSL(0.12, 0.8, 0.5); // Highlands amber/orange
      } else {
        color.setHSL(0.95, 0.7, 0.6); // Mountain peak
      }
      colors.push(color.r, color.g, color.b);
    }

    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.computeVertexNormals();

    // 1. Terrain Mesh
    const material = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.8,
      metalness: 0.1,
      wireframe: false,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    terrainMeshRef.current = mesh;

    // 2. Point Cloud Representation
    const pointsMat = new THREE.PointsMaterial({
      size: 0.35,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
    });
    const pointCloud = new THREE.Points(geometry, pointsMat);
    pointCloud.visible = false;
    scene.add(pointCloud);
    pointCloudRef.current = pointCloud;

    // 3. Laser Scanner Plane (LiDAR beam simulation)
    const laserGeom = new THREE.PlaneGeometry(60, 2);
    laserGeom.rotateX(-Math.PI / 2);
    const laserMat = new THREE.MeshBasicMaterial({
      color: 0x00d4aa,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
    });
    const laser = new THREE.Mesh(laserGeom, laserMat);
    laser.position.y = 12;
    scene.add(laser);
    laserBeamRef.current = laser;

    // Simple Orbit interaction
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onMouseDown = (e) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      mesh.rotation.y += deltaX * 0.008;
      pointCloud.rotation.y += deltaX * 0.008;
      camera.position.y = Math.max(10, Math.min(80, camera.position.y - deltaY * 0.1));
      camera.lookAt(0, 0, 0);
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Animation Loop
    let animationFrameId;
    let laserDir = 1;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Slow terrain rotation when not dragging
      if (!isDragging) {
        mesh.rotation.y += 0.0015;
        pointCloud.rotation.y += 0.0015;
      }

      // Laser scan motion
      if (laserBeamRef.current && isScanning) {
        laserBeamRef.current.position.z += 0.25 * laserDir;
        if (laserBeamRef.current.position.z > 30) laserDir = -1;
        if (laserBeamRef.current.position.z < -30) laserDir = 1;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Handle Resize
    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight || 550;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      domEl.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (mountRef.current) {
        mountRef.current.innerHTML = '';
      }
    };
  }, []);

  // Update View Mode (elevation / wireframe / pointcloud)
  useEffect(() => {
    if (!terrainMeshRef.current || !pointCloudRef.current) return;

    if (viewMode === 'elevation') {
      terrainMeshRef.current.visible = true;
      terrainMeshRef.current.material.wireframe = false;
      pointCloudRef.current.visible = false;
    } else if (viewMode === 'wireframe') {
      terrainMeshRef.current.visible = true;
      terrainMeshRef.current.material.wireframe = true;
      pointCloudRef.current.visible = false;
    } else if (viewMode === 'pointcloud') {
      terrainMeshRef.current.visible = false;
      pointCloudRef.current.visible = true;
    }
  }, [viewMode]);

  // Update Exaggeration
  useEffect(() => {
    if (!terrainMeshRef.current) return;
    const geom = terrainMeshRef.current.geometry;
    const pos = geom.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const h1 = Math.sin(x * 0.12) * Math.cos(z * 0.12) * 5;
      const h2 = Math.sin(x * 0.25 + 1.2) * Math.sin(z * 0.25) * 2.5;
      const h3 = Math.cos(Math.sqrt(x * x + z * z) * 0.15) * 4;
      const elev = (h1 + h2 + h3 + 6) * 0.8;
      pos.setY(i, elev * exaggeration);
    }
    pos.needsUpdate = true;
    geom.computeVertexNormals();
  }, [exaggeration]);

  return (
    <div className="space-y-8 py-6 max-w-6xl mx-auto font-sans">
      {/* Title */}
      <div className="border-b border-[#1e3a5f]/60 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs font-mono text-[#00d4aa] mb-2 uppercase tracking-wider">
            <Box className="w-4 h-4" />
            <span>3D WEBGL ENGINE • UAV POINT CLOUD & ELEVATION</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white">
            Mô hình 3D Địa hình & Đám mây điểm LiDAR
          </h2>
          <p className="text-sm text-[#94a3b8] mt-2 max-w-2xl">
            Trình trực quan hóa mô hình số độ cao (DEM/DSM) và dữ liệu đám mây điểm 3D sau quá trình xử lý bay chụp Drone UAV.
            Hỗ trợ hiển thị phân tầng cao độ, lưới tam giác bất quy tắc (TIN) và chùm tia quét laser.
          </p>
        </div>

        {/* Live HUD Quick stats */}
        <div className="flex items-center space-x-4 bg-[#0a0f1a] p-3 rounded-xl border border-[#1e3a5f]/80 font-mono text-xs">
          <div>
            <div className="text-[10px] text-[#94a3b8]">MẬT ĐỘ ĐIỂM:</div>
            <div className="font-bold text-[#00d4aa]">{stats.points} pts</div>
          </div>
          <div className="h-6 w-px bg-[#1e3a5f]" />
          <div>
            <div className="text-[10px] text-[#94a3b8]">CAO ĐỘ MIN - MAX:</div>
            <div className="font-bold text-[#38bdf8]">{stats.minElev} - {stats.maxElev}</div>
          </div>
        </div>
      </div>

      {/* Main 3D Canvas Box */}
      <div className="relative rounded-2xl overflow-hidden border border-[#1e3a5f]/80 shadow-2xl bg-[#060b18]">
        {/* 3D Container */}
        <div ref={mountRef} className="w-full h-[540px] cursor-grab active:cursor-grabbing" />

        {/* Top Control Bar HUD */}
        <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2 p-2 rounded-xl bg-[#060b18]/85 border border-[#1e3a5f] backdrop-blur-md font-mono text-xs shadow-xl">
          <span className="text-[#94a3b8] px-2">Chế độ hiển thị:</span>
          {[
            { id: 'elevation', label: 'Bản đồ nhiệt Cao độ' },
            { id: 'wireframe', label: 'Lưới Trắc địa TIN' },
            { id: 'pointcloud', label: 'Đám mây điểm LiDAR' },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setViewMode(mode.id)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === mode.id
                  ? 'bg-[#00d4aa] text-[#060b18] font-bold shadow-md shadow-[#00d4aa]/20'
                  : 'text-[#94a3b8] hover:text-white hover:bg-[#111827]'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>

        {/* Laser Scanner toggle & Exaggeration HUD */}
        <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-[#060b18]/85 border border-[#1e3a5f] backdrop-blur-md font-mono text-xs shadow-xl">
          {/* Slider */}
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <Sliders className="w-4 h-4 text-[#00d4aa]" />
            <span className="text-[#94a3b8] whitespace-nowrap">Phóng đại cao độ Z:</span>
            <input
              type="range"
              min="0.5"
              max="3.0"
              step="0.1"
              value={exaggeration}
              onChange={(e) => setExaggeration(parseFloat(e.target.value))}
              className="w-36 accent-[#00d4aa]"
            />
            <span className="text-[#00d4aa] font-bold w-10">{exaggeration}x</span>
          </div>

          {/* Laser Scanner Toggle */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsScanning(!isScanning)}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border transition-all ${
                isScanning
                  ? 'bg-[#00d4aa]/15 text-[#00d4aa] border-[#00d4aa]'
                  : 'bg-[#111827] text-[#94a3b8] border-[#1e3a5f]'
              }`}
            >
              {isScanning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>Tia quét LiDAR: {isScanning ? 'ĐANG QUÉT' : 'TẮT'}</span>
            </button>
            <div className="text-[11px] text-[#94a3b8] hidden md:block">
              (Kéo chuột để xoay góc nhìn 360°)
            </div>
          </div>
        </div>
      </div>

      {/* Terrain Cross Section Visualizer */}
      <div className="p-6 rounded-xl bg-[#0a0f1a] border border-[#1e3a5f]/60 font-mono space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-[#00d4aa]">
            <Activity className="w-4 h-4" />
            <h3 className="font-bold text-sm text-white">MẶT CẮT TRẮC DỌC ĐỊA HÌNH (CROSS-SECTION PROFILE)</h3>
          </div>
          <span className="text-xs text-[#94a3b8]">Tuyến đo: Tuyến chính A - B</span>
        </div>

        {/* SVG Profile Chart */}
        <div className="p-4 rounded-lg bg-[#060b18] border border-[#1e3a5f]/40">
          <svg className="w-full h-32" viewBox="0 0 800 120" preserveAspectRatio="none">
            <defs>
              <linearGradient id="elevGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00d4aa" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#00d4aa" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            {/* Grid lines */}
            <line x1="0" y1="30" x2="800" y2="30" stroke="#1e3a5f" strokeDasharray="4 4" strokeWidth="0.8" />
            <line x1="0" y1="60" x2="800" y2="60" stroke="#1e3a5f" strokeDasharray="4 4" strokeWidth="0.8" />
            <line x1="0" y1="90" x2="800" y2="90" stroke="#1e3a5f" strokeDasharray="4 4" strokeWidth="0.8" />

            {/* Profile area & line */}
            <path
              d="M 0 100 Q 120 40, 240 75 T 480 35 T 650 85 T 800 20 L 800 120 L 0 120 Z"
              fill="url(#elevGrad)"
            />
            <path
              d="M 0 100 Q 120 40, 240 75 T 480 35 T 650 85 T 800 20"
              fill="none"
              stroke="#00d4aa"
              strokeWidth="2.5"
            />
          </svg>
          <div className="flex justify-between text-[11px] text-[#94a3b8] mt-2">
            <span>Điểm A (Km 0+000) • H: 12.5m</span>
            <span>Đỉnh đồi (Km 0+480) • H: 68.2m</span>
            <span>Điểm B (Km 0+800) • H: 84.0m</span>
          </div>
        </div>
      </div>
    </div>
  );
}
