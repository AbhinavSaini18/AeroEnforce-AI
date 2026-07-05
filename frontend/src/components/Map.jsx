import React, { useState, useRef, useEffect } from 'react';
import { 
  ZoomIn, ZoomOut, Maximize2, Layers, 
  MapPin, AlertTriangle, Wind, Flame, Eye 
} from 'lucide-react';

export default function Map({ 
  selectedArea, 
  onSelectArea, 
  activeLayers, 
  timelineIndex, 
  areasData 
}) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [tooltip, setTooltip] = useState(null);
  const [showLayerMenu, setShowLayerMenu] = useState(true);
  
  const mapRef = useRef(null);
  
  // Calculate dynamic active AQI percentage for scale pointer positioning
  const selectedAreaAQI = selectedArea.timelineAQI[timelineIndex];
  const aqiPercentage = Math.max(0, Math.min(100, ((selectedAreaAQI - 50) / 300) * 100));

  // Zoom handlers
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.75));
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Dragging handlers for map panning
  const handleMouseDown = (e) => {
    if (e.target.tagName === 'button' || e.target.closest('button') || e.target.closest('.layer-toggle-panel')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // District definitions for Delhi
  const districts = [
    {
      id: 'north',
      name: 'North Delhi (Aazadpur)',
      path: 'M 170,80 L 250,60 L 320,100 L 300,180 L 230,170 L 160,140 Z',
      center: { x: 230, y: 120 },
      wardNo: 'Ward no: 15',
      coordinates: 'North Delhi, 77.19E'
    },
    {
      id: 'west',
      name: 'West Delhi (Dwarka)',
      path: 'M 80,180 L 160,140 L 200,210 L 170,300 L 90,320 L 70,250 Z',
      center: { x: 130, y: 220 },
      wardNo: 'Ward no: 42',
      coordinates: 'West Delhi, 77.06E'
    },
    {
      id: 'southwest',
      name: 'South-West Delhi (NH48)',
      path: 'M 90,320 L 170,300 L 220,350 L 180,440 L 110,430 Z',
      center: { x: 150, y: 370 },
      wardNo: 'Ward no: 68',
      coordinates: 'SW Delhi, 77.12E'
    },
    {
      id: 'central',
      name: 'Connaught Place & Central',
      path: 'M 230,170 L 300,180 L 320,240 L 270,310 L 200,280 L 200,210 Z',
      center: { x: 255, y: 235 },
      wardNo: 'Ward no: 123',
      coordinates: 'North Delhi, 77.1E' // Matches mockup coordinates exactly
    },
    {
      id: 'southeast',
      name: 'South-East Delhi (DND)',
      path: 'M 320,240 L 400,220 L 430,300 L 370,390 L 300,370 L 270,310 Z',
      center: { x: 350, y: 310 },
      wardNo: 'Ward no: 99',
      coordinates: 'SE Delhi, 77.25E'
    },
    {
      id: 'noida_border',
      name: 'Noida Border (FNG)',
      path: 'M 400,220 L 470,230 L 490,310 L 430,360 L 400,300 Z',
      center: { x: 440, y: 280 },
      wardNo: 'Ward no: 104',
      coordinates: 'Noida Border, 77.38E'
    },
    {
      id: 'east',
      name: 'East Delhi (Yamuna Vihar)',
      path: 'M 320,100 L 390,90 L 430,150 L 400,220 L 300,180 Z',
      center: { x: 360, y: 150 },
      wardNo: 'Ward no: 55',
      coordinates: 'East Delhi, 77.29E'
    },
    {
      id: 'south',
      name: 'South Delhi (Saket)',
      path: 'M 270,310 L 300,370 L 280,460 L 210,450 L 220,350 Z',
      center: { x: 250, y: 390 },
      wardNo: 'Ward no: 84',
      coordinates: 'South Delhi, 77.20E'
    }
  ];

  // Map AQI levels to colors
  const getAQIColor = (aqi) => {
    if (aqi <= 50) return 'var(--aqi-good)';
    if (aqi <= 100) return 'var(--aqi-moderate)';
    if (aqi <= 150) return 'var(--aqi-sensitive)';
    if (aqi <= 200) return 'var(--aqi-poor)';
    if (aqi <= 300) return 'var(--aqi-very-unhealthy)';
    return 'var(--aqi-hazardous)';
  };

  const getAQILabel = (aqi) => {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Sensitive';
    if (aqi <= 200) return 'Poor';
    if (aqi <= 300) return 'Very Unhealthy';
    return 'Hazardous';
  };

  // Find dynamic data for a district at the current timeline
  const getDistrictAQI = (id) => {
    const area = areasData.find(a => a.id === id);
    if (!area) return 100;
    return area.timelineAQI[timelineIndex];
  };

  const handleDistrictClick = (dist) => {
    const area = areasData.find(a => a.id === dist.id);
    if (area) {
      onSelectArea(area);
    }
  };

  const handleDistrictMouseEnter = (dist, e) => {
    const aqi = getDistrictAQI(dist.id);
    setTooltip({
      name: dist.name,
      wardNo: dist.wardNo,
      coordinates: dist.coordinates,
      aqi: aqi,
      x: dist.center.x,
      y: dist.center.y - 20
    });
  };

  const handleDistrictMouseLeave = () => {
    setTooltip(null);
  };

  // Selected area marker location
  const activeDistrictObj = districts.find(d => d.id === selectedArea.id);
  const markerPos = activeDistrictObj ? activeDistrictObj.center : { x: 255, y: 235 };

  return (
    <div className="map-panel" ref={mapRef}>
      <div 
        className="map-container-inner"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        {/* Map Zoom Controls */}
        <div className="map-controls-top-left">
          <button className="map-btn" onClick={handleZoomIn} title="Zoom In">
            <ZoomIn size={18} />
          </button>
          <button className="map-btn" onClick={handleZoomOut} title="Zoom Out">
            <ZoomOut size={18} />
          </button>
          <button className="map-btn" onClick={handleReset} title="Reset View">
            <Maximize2 size={16} />
          </button>
          <button 
            className={`map-btn ${showLayerMenu ? 'active' : ''}`} 
            onClick={() => setShowLayerMenu(!showLayerMenu)}
            title="Layer Legend"
          >
            <Layers size={16} />
          </button>
        </div>

        {/* Dynamic Layer Legend Floating Menu (Top Left Overlay) */}
        {showLayerMenu && (
          <div className="layer-toggle-panel glass-panel">
            <div className="layer-toggle-title">
              <span>Layer Toggle</span>
              <button className="layer-toggle-close" onClick={() => setShowLayerMenu(false)}>×</button>
            </div>
            <div className="layer-list">
              <div className={`layer-item ${activeLayers.landUse ? 'active' : ''}`}>
                <div className="layer-checkbox"></div>
                <div className="layer-dot" style={{ background: '#10b981' }}></div>
                <span>Land Use</span>
              </div>
              <div className={`layer-item ${activeLayers.traffic ? 'active' : ''}`}>
                <div className="layer-checkbox"></div>
                <div className="layer-dot" style={{ background: '#f59e0b' }}></div>
                <span>Traffic</span>
              </div>
              <div className={`layer-item ${activeLayers.construction ? 'active' : ''}`}>
                <div className="layer-checkbox"></div>
                <div className="layer-dot" style={{ background: '#ef4444' }}></div>
                <span>Construction</span>
              </div>
              <div className={`layer-item ${activeLayers.satellite ? 'active' : ''}`}>
                <div className="layer-checkbox"></div>
                <div className="layer-dot" style={{ background: '#3b82f6' }}></div>
                <span>Satellite Thermal</span>
              </div>
              <div className={`layer-item ${activeLayers.meteo ? 'active' : ''}`}>
                <div className="layer-checkbox"></div>
                <div className="layer-dot" style={{ background: '#a855f7' }}></div>
                <span>Meteo</span>
              </div>
            </div>
          </div>
        )}

        {/* Main Map SVG Wrapper */}
        <svg 
          className="map-svg-element" 
          viewBox="0 0 500 500"
          style={{
            transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
            transformOrigin: 'center center'
          }}
        >
          {/* Custom Definitions: Gradients and Filters */}
          <defs>
            {/* Glow Filter */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="4" stdDeviation="5" floodOpacity="0.5"/>
            </filter>
            
            {/* AQI Radial Gradients for Heatmap */}
            {districts.map(dist => {
              const aqi = getDistrictAQI(dist.id);
              const color = getAQIColor(aqi);
              return (
                <radialGradient id={`heat-${dist.id}`} key={dist.id}>
                  <stop offset="0%" stopColor={color} stopOpacity="0.6" />
                  <stop offset="50%" stopColor={color} stopOpacity="0.25" />
                  <stop offset="100%" stopColor={color} stopOpacity="0" />
                </radialGradient>
              );
            })}

            {/* Grid Pattern */}
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="var(--map-grid)" strokeWidth="1" />
            </pattern>
          </defs>

          {/* Background Grid */}
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Map Wards (Districts) */}
          <g id="districts-group">
            {districts.map(dist => {
              const aqi = getDistrictAQI(dist.id);
              const isSelected = selectedArea.id === dist.id;
              
              // Custom land use fill logic
              let distFill = 'var(--map-district-bg)';
              if (activeLayers.landUse) {
                if (dist.id === 'west' || dist.id === 'east') distFill = 'var(--land-use-green)'; // residential green
                else if (dist.id === 'north' || dist.id === 'central') distFill = 'var(--land-use-gold)'; // commercial gold
                else if (dist.id === 'south' || dist.id === 'southeast') distFill = 'var(--land-use-mixed)'; // mixed
                else distFill = 'var(--land-use-industrial)'; // industrial / construction
              }

              return (
                <path
                  key={dist.id}
                  d={dist.path}
                  className={`map-district ${isSelected ? 'active-district' : ''}`}
                  fill={distFill}
                  onClick={() => handleDistrictClick(dist)}
                  onMouseEnter={(e) => handleDistrictMouseEnter(dist, e)}
                  onMouseLeave={handleDistrictMouseLeave}
                  style={{
                    transition: 'fill 0.4s ease'
                  }}
                />
              );
            })}
          </g>

          {/* River Yamuna (Flowing Overlay) */}
          <path 
            d="M 310,50 C 310,130 330,180 340,210 C 350,230 380,260 380,310 C 380,360 360,400 370,450"
            fill="none"
            stroke="#1e3a8a"
            strokeWidth="6"
            strokeLinecap="round"
            opacity="0.4"
          />
          <path 
            d="M 310,50 C 310,130 330,180 340,210 C 350,230 380,260 380,310 C 380,360 360,400 370,450"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.75"
            filter="url(#glow)"
          />

          {/* Heatmap Layer */}
          {activeLayers.satellite && (
            <g id="heatmap-layer" style={{ pointerEvents: 'none' }}>
              {districts.map(dist => {
                const aqi = getDistrictAQI(dist.id);
                // Heat radius proportional to AQI
                const radius = Math.max(45, Math.min(100, aqi / 3));
                return (
                  <circle
                    key={`heat-c-${dist.id}`}
                    cx={dist.center.x}
                    cy={dist.center.y}
                    r={radius}
                    fill={`url(#heat-${dist.id})`}
                    style={{
                      transition: 'r 0.5s ease, fill 0.5s ease'
                    }}
                  />
                );
              })}
            </g>
          )}

          {/* Traffic Layer Overlay (Major Roads) */}
          {activeLayers.traffic && (
            <g id="traffic-roads" fill="none" strokeLinecap="round">
              {/* Outer Ring Road */}
              <circle cx="250" cy="250" r="140" stroke="rgba(245, 158, 11, 0.4)" strokeWidth="3" />
              <circle cx="250" cy="250" r="140" stroke="#f59e0b" strokeWidth="1.5" className="traffic-flow" />

              {/* DND Flyway (Orange/Red) */}
              <path d="M 255,235 C 290,260 320,280 350,310" stroke="rgba(239, 68, 68, 0.4)" strokeWidth="4" />
              <path d="M 255,235 C 290,260 320,280 350,310" stroke="#ef4444" strokeWidth="2.0" className="traffic-flow" />

              {/* NH48 (Orange) */}
              <path d="M 150,370 C 180,330 220,280 255,235" stroke="rgba(249, 115, 22, 0.4)" strokeWidth="4.5" />
              <path d="M 150,370 C 180,330 220,280 255,235" stroke="#f97316" strokeWidth="2.0" className="traffic-flow" />
              
              {/* FNG Expressway Noida (Yellow) */}
              <path d="M 440,220 L 440,360" stroke="rgba(245, 158, 11, 0.3)" strokeWidth="3.5" />
              <path d="M 440,220 L 440,360" stroke="#f59e0b" strokeWidth="1.5" className="traffic-flow" />
            </g>
          )}

          {/* Construction Layer Overlay */}
          {activeLayers.construction && (
            <g id="construction-sites">
              {[
                { x: 440, y: 280, area: 'FNG Expressway' },
                { x: 150, y: 370, area: 'NH48 Roadworks' },
                { x: 130, y: 220, area: 'Dwarka Construction' }
              ].map((site, i) => (
                <g key={`const-${i}`} transform={`translate(${site.x - 8}, ${site.y - 8})`}>
                  {/* Flashing backing ring */}
                  <circle cx="8" cy="8" r="10" fill="none" stroke="#f59e0b" strokeWidth="1.5" opacity="0.8">
                    <animate attributeName="r" values="6;16;6" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.8;0;0.8" dur="2s" repeatCount="indefinite" />
                  </circle>
                  {/* Triangle indicator */}
                  <path d="M 8,1 L 15,14 L 1,14 Z" fill="#eab308" stroke="#000" strokeWidth="1" />
                  <line x1="8" y1="5" x2="8" y2="10" stroke="#000" strokeWidth="1.5" strokeLinecap="round" />
                  <circle cx="8" cy="12" r="1" fill="#000" />
                </g>
              ))}
            </g>
          )}

          {/* Meteo Wind Vector Layer */}
          {activeLayers.meteo && (
            <g id="meteo-wind" fill="none" stroke="rgba(168, 85, 247, 0.4)" strokeWidth="1.5" strokeLinecap="round">
              <path d="M 50,100 Q 150,120 250,90 T 450,110" className="wind-vector" />
              <path d="M 60,180 Q 180,210 280,170 T 440,190" className="wind-vector" />
              <path d="M 40,290 Q 140,320 260,280 T 460,300" className="wind-vector" />
              <path d="M 80,390 Q 200,410 300,370 T 420,380" className="wind-vector" />
            </g>
          )}

          {/* District Pins & Labels */}
          <g id="district-labels" style={{ pointerEvents: 'none' }}>
            {districts.map(dist => {
              const aqi = getDistrictAQI(dist.id);
              const color = getAQIColor(aqi);
              return (
                <g key={`lbl-${dist.id}`} transform={`translate(${dist.center.x}, ${dist.center.y})`}>
                  {/* Outer circle indicator */}
                  <circle cx="0" cy="0" r="14" fill="var(--map-pin-bg)" stroke={color} strokeWidth="1.5" />
                  <text 
                    x="0" 
                    y="4" 
                    fill="var(--map-pin-text)" 
                    fontSize="9.5" 
                    fontWeight="800" 
                    textAnchor="middle"
                    fontFamily="var(--font-display)"
                  >
                    {aqi}
                  </text>
                </g>
              );
            })}
          </g>

          {/* Active Highlight Pointer Marker (moves dynamically) */}
          <g 
            className="map-marker"
            transform={`translate(${markerPos.x}, ${markerPos.y - 14})`}
            filter="url(#shadow)"
          >
            {/* Glowing Ring */}
            <circle cx="0" cy="0" r="12" fill="none" stroke="var(--primary)" strokeWidth="2" opacity="0.6">
              <animate attributeName="r" values="8;20;8" dur="1.8s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.8;0;0.8" dur="1.8s" repeatCount="indefinite" />
            </circle>
            {/* Pin Graphic */}
            <path 
              d="M 0,-18 C -7,-18 -12,-13 -12,-6 C -12,4 0,16 0,16 C 0,16 12,4 12,-6 C 12,-13 7,-18 0,-18 Z" 
              fill="var(--primary)" 
              className="map-marker-pin"
            />
            <circle cx="0" cy="-6" r="4.5" fill="#fff" className="map-marker-pin" />
          </g>
        </svg>

        {/* Map Legend (Bottom Right Overlay) */}
        <div className="map-legend">
          <div className="legend-title">AQI Index</div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', position: 'relative' }}>
            <div style={{ position: 'relative', height: '110px', display: 'flex', alignItems: 'center' }}>
              <div className="legend-bar"></div>
              {/* Dynamic Sliding AQI Indicator Arrow + Label */}
              <div 
                className="legend-pointer-label"
                style={{
                  position: 'absolute',
                  bottom: `${aqiPercentage}%`,
                  left: '12px',
                  transform: 'translateY(50%)',
                  background: 'var(--primary)',
                  color: '#fff',
                  fontSize: '0.62rem',
                  fontWeight: '800',
                  padding: '2px 5px',
                  borderRadius: '4px',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 0 8px var(--primary-glow)',
                  transition: 'bottom 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  zIndex: 2,
                  border: '1px solid rgba(255,255,255,0.2)'
                }}
              >
                ◀ {selectedAreaAQI}
              </div>
            </div>
            <div className="legend-labels">
              <span>350+</span>
              <span>300</span>
              <span>250</span>
              <span>200</span>
              <span>150</span>
              <span>100</span>
              <span>50</span>
            </div>
          </div>
        </div>

        {/* Map Hover Tooltip */}
        {tooltip && (
          <div 
            className="map-tooltip"
            style={{
              left: `${tooltip.x}px`,
              top: `${tooltip.y - 45}px`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className="tooltip-title">{tooltip.name}</div>
            <div className="tooltip-meta">{tooltip.wardNo} • {tooltip.coordinates}</div>
            <div className="tooltip-aqi" style={{ color: getAQIColor(tooltip.aqi) }}>
              <span className="aqi-dot" style={{ backgroundColor: getAQIColor(tooltip.aqi), boxShadow: `0 0 8px ${getAQIColor(tooltip.aqi)}` }}></span>
              AQI: {tooltip.aqi} ({getAQILabel(tooltip.aqi)})
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
