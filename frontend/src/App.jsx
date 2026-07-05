import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Search, User, Flame, 
  Car, HardHat, CloudSun, Send, Wind, 
  MapPin, RefreshCw, BarChart2, BookOpen, 
  Calendar, FileText, Download, CheckCircle, 
  AlertCircle, ChevronRight, Droplet, Users,
  Layers, Sun, Moon
} from 'lucide-react';
import './App.css';
import Map from './components/Map';

// Initial areas database matching mockup values and expanding with forecasting/details
const INITIAL_AREAS = [
  {
    id: 'central',
    name: 'Connaught Place & Central Delhi',
    shortName: 'Connaught Place',
    wardNo: '123',
    coordinates: 'North Delhi, 77.1E',
    type: 'Ambient Urban',
    primaryPolluter: 'Crop Smoke & Traffic',
    timelineAQI: [150, 232, 175], // Yesterday, Today, Tomorrow
    attribution: [
      { name: 'Crop Burning Smoke', value: 35, color: '#10b981' },
      { name: 'Traffic', value: 30, color: '#f59e0b' },
      { name: 'Inversion/Weather', value: 25, color: '#3b82f6' },
      { name: 'Construction Dust', value: 10, color: '#ec4899' }
    ],
    confidence: 89,
    aiAnalysis: "Connaught Place is showing an elevated AQI of 232 (Poor). Rural agricultural crop residues burning in adjoining states accounts for the dominant 35% aerosol attribution. Local vehicular combustion at the Inner and Outer ring roads contributes 30%. Dynamic cooling at the atmospheric boundary layer has trapped pollutants, restricting vertical dispersion.",
    recommendations: [
      "Mobilize water mist cannons along Radial Roads 1 to 8.",
      "Implement odd-even private vehicle restrictions in the central commercial district.",
      "Issue advisory recommending high-efficiency N95 masks for outdoor shoppers."
    ]
  },
  {
    id: 'noida_border',
    name: 'FNG Expressway Construction Belt',
    shortName: 'FNG Expressway',
    wardNo: '104',
    coordinates: 'Noida Border, 77.38E',
    type: 'Infrastructure Construction',
    primaryPolluter: 'Construction Dust',
    timelineAQI: [220, 320, 290],
    attribution: [
      { name: 'Construction Dust', value: 50, color: '#ec4899' },
      { name: 'Traffic', value: 25, color: '#f59e0b' },
      { name: 'Crop Burning Smoke', value: 15, color: '#10b981' },
      { name: 'Inversion/Weather', value: 10, color: '#3b82f6' }
    ],
    confidence: 94,
    aiAnalysis: "FNG Expressway section exhibits a hazardous AQI of 320. Massive soil excavation, grading, and cement batching activities release dense PM10 dust clouds (50%). Rapid truck transits resuspend heavy particles. High dry-weather conditions aggravate wind-blown dust dispersion along local residential borders.",
    recommendations: [
      "Mandate continuous chemical dust suppressant sprays on unpaved roads.",
      "Enforce mandatory covering of all materials transport tippers.",
      "Halt dry excavation and grading operations during peak wind hours (11:00-15:00)."
    ]
  },
  {
    id: 'southeast',
    name: 'DND Traffic Corridor',
    shortName: 'DND Traffic',
    wardNo: '99',
    coordinates: 'SE Delhi, 77.25E',
    type: 'Traffic Congestion',
    primaryPolluter: 'Vehicular Exhaust',
    timelineAQI: [190, 280, 210],
    attribution: [
      { name: 'Traffic', value: 65, color: '#f59e0b' },
      { name: 'Inversion/Weather', value: 15, color: '#3b82f6' },
      { name: 'Crop Burning Smoke', value: 10, color: '#10b981' },
      { name: 'Construction Dust', value: 10, color: '#ec4899' }
    ],
    confidence: 92,
    aiAnalysis: "DND flyway traffic congestion has generated an AQI of 280 (Very Unhealthy). High concentrations of NOx, black carbon, and carbon monoxide result from heavy stop-and-go diesel traffic (65%) during commute hours. The riverbed humidity creates micro-fog, condensing particulates closer to ground level.",
    recommendations: [
      "Activate smart flow metering at DND toll plazas to minimize idling.",
      "Enforce dedicated lanes for cargo trucks and restrict older commercial diesels.",
      "Deploy localized roadside active carbon filter pillars along exit ramps."
    ]
  },
  {
    id: 'west',
    name: 'Dwarka Waste Burning Sector',
    shortName: 'Dwarka Waste Burning',
    wardNo: '42',
    coordinates: 'West Delhi, 77.06E',
    type: 'Refuse Incineration',
    primaryPolluter: 'Biomass Incineration',
    timelineAQI: [120, 195, 155],
    attribution: [
      { name: 'Crop Burning Smoke', value: 55, color: '#10b981' },
      { name: 'Inversion/Weather', value: 20, color: '#3b82f6' },
      { name: 'Traffic', value: 15, color: '#f59e0b' },
      { name: 'Construction Dust', value: 10, color: '#ec4899' }
    ],
    confidence: 86,
    aiAnalysis: "Dwarka Sector 10 is showing an AQI of 195 (Poor). Frequent unauthorized burning of municipal dry waste and leaf litter in vacant plots dominates the localized particulate spike. Drifting regional agricultural smoke accounts for 55% of PM2.5, which is trapped under light wind conditions.",
    recommendations: [
      "Deploy night-patrol infrared drones to detect and locate active fire spots.",
      "Conduct community sensor integrations to flag toxic plumes in real-time.",
      "Initiate immediate cleaning and containment of municipal dump storage vaults."
    ]
  },
  {
    id: 'north',
    name: 'Aazadpur Mandi Logistics Hub',
    shortName: 'Aazadpur Mandi Traffic',
    wardNo: '15',
    coordinates: 'North Delhi, 77.19E',
    type: 'Logistics Center',
    primaryPolluter: 'Heavy Duty Diesels',
    timelineAQI: [180, 210, 190],
    attribution: [
      { name: 'Traffic', value: 50, color: '#f59e0b' },
      { name: 'Crop Burning Smoke', value: 20, color: '#10b981' },
      { name: 'Inversion/Weather', value: 20, color: '#3b82f6' },
      { name: 'Construction Dust', value: 10, color: '#ec4899' }
    ],
    confidence: 88,
    aiAnalysis: "Aazadpur Mandi logistics zone reports an AQI of 210 (Very Unhealthy). Heavy-duty freight diesel transport and continuous loading operations release substantial elemental carbon (50%). Extended engine idling in the mandi periphery causes localized NOx levels to breach limits.",
    recommendations: [
      "Mandate strict 'No-Idling' protocols for freight carriers inside the depot.",
      "Shift loading/unloading operations of heavy vehicles to a rotational hourly grid.",
      "Incentivize local cargo loaders to transition to small electric distribution units."
    ]
  },
  {
    id: 'southwest',
    name: 'NH48 Airport Road Construction',
    shortName: 'NH48 Construction Belt',
    wardNo: '68',
    coordinates: 'SW Delhi, 77.12E',
    type: 'Highway Infrastructure',
    primaryPolluter: 'Silica & Road Dust',
    timelineAQI: [200, 260, 240],
    attribution: [
      { name: 'Construction Dust', value: 40, color: '#ec4899' },
      { name: 'Traffic', value: 30, color: '#f59e0b' },
      { name: 'Inversion/Weather', value: 20, color: '#3b82f6' },
      { name: 'Crop Burning Smoke', value: 10, color: '#10b981' }
    ],
    confidence: 90,
    aiAnalysis: "NH48 Expressway corridor AQI stands at 260 (Very Unhealthy). Underpass digging, road resurfacing, and concrete drilling release high levels of respirable silica dust (40%). Fast highway vehicles resuspend loose aggregate, maintaining high PM10 levels throughout daylight hours.",
    recommendations: [
      "Apply high-adhesion organic dust suppressants to construction lanes.",
      "Install 4-meter windbreak panels along active flyover construction sectors.",
      "Operate continuous vacuum sweeping trucks along highway shoulders."
    ]
  },
  {
    id: 'east',
    name: 'East Delhi (Yamuna Vihar)',
    shortName: 'Yamuna Vihar',
    wardNo: '55',
    coordinates: 'East Delhi, 77.29E',
    type: 'Residential Suburban',
    primaryPolluter: 'Local Biomass',
    timelineAQI: [90, 100, 85],
    attribution: [
      { name: 'Crop Burning Smoke', value: 45, color: '#10b981' },
      { name: 'Traffic', value: 20, color: '#f59e0b' },
      { name: 'Inversion/Weather', value: 25, color: '#3b82f6' },
      { name: 'Construction Dust', value: 10, color: '#ec4899' }
    ],
    confidence: 85,
    aiAnalysis: "Yamuna Vihar in East Delhi registers a Moderate AQI of 100. Primary pollution sources are drifting agricultural smoke (45%) from boundary states combined with light local vehicular fuel combustion. Favorable wind speeds are assisting dispersion.",
    recommendations: [
      "Optimize local green parks sprinkling networks.",
      "Increase inspections of local community garbage bins.",
      "Advisory is clear; suitable for regular outdoor activity."
    ]
  },
  {
    id: 'south',
    name: 'South Delhi (Saket)',
    shortName: 'Saket',
    wardNo: '84',
    coordinates: 'South Delhi, 77.20E',
    type: 'Commercial & Residential',
    primaryPolluter: 'Urban Congestion',
    timelineAQI: [80, 100, 95],
    attribution: [
      { name: 'Crop Burning Smoke', value: 30, color: '#10b981' },
      { name: 'Traffic', value: 40, color: '#f59e0b' },
      { name: 'Inversion/Weather', value: 20, color: '#3b82f6' },
      { name: 'Construction Dust', value: 10, color: '#ec4899' }
    ],
    confidence: 87,
    aiAnalysis: "Saket is showing an AQI of 100 (Moderate). Urban commercial traffic emissions and local shopping hub congestions constitute 40% of localized aerosols. Drifting particulates are lower than in northern border zones.",
    recommendations: [
      "Deploy vacuum sweepers to clear dust on commercial roads.",
      "Optimize traffic lights at Saket commercial crossings.",
      "Sensible outdoor activities are generally safe for the public."
    ]
  }
];

export default function App() {
  const [theme, setTheme] = useState('dark');
  const [activeTab, setActiveTab] = useState('MAP VIEW');
  const [selectedArea, setSelectedArea] = useState(INITIAL_AREAS[0]);
  const [timelineIndex, setTimelineIndex] = useState(1); // 0 = Yesterday, 1 = Today, 2 = Tomorrow
  const [activeLayers, setActiveLayers] = useState({
    landUse: true,
    traffic: false,
    construction: false,
    satellite: true,
    meteo: false
  });

  // Sync theme with body class
  useEffect(() => {
    document.body.className = `theme-${theme}`;
  }, [theme]);
  
  // AI assistant states
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Enforcement view states
  const [enforcementTasks, setEnforcementTasks] = useState([
    { id: 1, area: 'FNG Expressway', measure: 'Mist Spraying', status: 'Pending', icon: Droplet, time: 'Scheduled 20 mins ago' },
    { id: 2, area: 'NH48 Construction', measure: 'Install Windbreaks', status: 'In Progress', icon: HardHat, time: 'Started 1 hr ago' },
    { id: 3, area: 'DND Traffic', measure: 'Speed Flow Metering', status: 'Completed', icon: Car, time: 'Done 3 hrs ago' },
    { id: 4, area: 'Dwarka Waste', measure: 'Drone Infrared Patrol', status: 'Pending', icon: Flame, time: 'Scheduled at 21:00' }
  ]);

  // Sync selected area data when selectedArea changes or timelineIndex changes
  useEffect(() => {
    // Refresh the response text based on the selected area
    setAiResponse(selectedArea.aiAnalysis);
  }, [selectedArea]);

  // Animate AI Response typewriter effect
  const triggerAIResponse = (text) => {
    setIsTyping(true);
    setAiResponse('');
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setAiResponse(prev => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 15);
  };

  // Handle custom "Ask AI" queries
  const handleAISubmit = (e) => {
    if (e) e.preventDefault();
    if (!aiQuery.trim()) return;

    const query = aiQuery.toLowerCase();
    let responseText = `Regarding your query "${aiQuery}": `;

    if (query.includes('cp') || query.includes('connaught')) {
      responseText += "Connaught Place is primarily affected by drifting crop smoke (35%) and central ring traffic emissions (30%). Current weather inversion traps particulate matter. We recommend activating air cannons.";
    } else if (query.includes('fng') || query.includes('noida') || query.includes('construction')) {
      responseText += "FNG Expressway and NH48 report heavy PM10 construction dust. The grading and soil displacement are main causes. Strict dust suppressants and windbreak setups are actively mandated.";
    } else if (query.includes('traffic') || query.includes('dnd') || query.includes('car') || query.includes('truck')) {
      responseText += "Diesel exhaust from commercial vehicles and slow toll-gate speeds are causing local NOx emissions to spike by 65% near the DND corridor. High-capacity filters are deployed.";
    } else if (query.includes('burning') || query.includes('waste') || query.includes('dwarka')) {
      responseText += "Dwarka Sector 10 is facing biomass trash burning issues. Patrol drones have been deployed to detect thermal signatures and notify local fire mitigation squads.";
    } else if (query.includes('tomorrow') || query.includes('forecast') || query.includes('forecast')) {
      responseText += "Tomorrow's meteorological model predicts a 15% improvement in AQI due to increased north-westerly wind velocities, dispersing current particulate stagnation.";
    } else {
      responseText += "Our machine learning models indicate high thermal inversion across Delhi. Ground level particulate concentration is high. Priority sectors should halt dust-producing activity immediately.";
    }

    triggerAIResponse(responseText);
    setAiQuery('');
  };

  // Quick layer selection toggler
  const toggleLayer = (layerName) => {
    setActiveLayers(prev => ({
      ...prev,
      [layerName]: !prev[layerName]
    }));
  };

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

  const handleEnforcementAction = (id) => {
    setEnforcementTasks(prev => 
      prev.map(task => {
        if (task.id === id) {
          const nextStatus = task.status === 'Pending' ? 'In Progress' : 'Completed';
          return { ...task, status: nextStatus, time: 'Updated just now' };
        }
        return task;
      })
    );
  };

  const handleDispatchAll = () => {
    setEnforcementTasks(prev => 
      prev.map(task => ({ ...task, status: 'In Progress', time: 'Dispatched in batch just now' }))
    );
  };

  // Solid pie chart calculations representing reasons attribution
  const renderPieChart = () => {
    const R = 16; // Radius for solid pie chart
    const C = 2 * Math.PI * R; // Circumference = ~100.53
    let accumulatedPercent = 0;

    return (
      <svg width="100" height="100" className="donut-chart-svg">
        <circle cx="50" cy="50" r={R} fill="transparent" stroke="var(--bg-primary)" strokeWidth="32" />
        {selectedArea.attribution.map((seg, idx) => {
          const strokeLength = (seg.value / 100) * C;
          const strokeOffset = C - strokeLength + (accumulatedPercent / 100) * C;
          accumulatedPercent -= seg.value;

          return (
            <circle
              key={idx}
              className="donut-segment"
              cx="50"
              cy="50"
              r={R}
              fill="transparent"
              stroke={seg.color}
              strokeWidth="32"
              strokeDasharray={`${strokeLength} ${C}`}
              strokeDashoffset={strokeOffset}
              style={{
                strokeDashoffset: strokeOffset,
                transformOrigin: '50% 50%'
              }}
            />
          );
        })}
      </svg>
    );
  };

  return (
    <div className="app-container">
      {/* Top Navigation Header */}
      <header className="app-header">
        <div className="header-left">
          <ShieldAlert className="logo-icon" size={24} />
          <h1 className="app-title">AEROSHIELD AI</h1>
        </div>

        <nav className="nav-links">
          {['MAP VIEW', 'ENFORCEMENT', 'REPORTS', 'ADVISORY'].map(tab => (
            <button
              key={tab}
              className={`nav-item ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </nav>

        <div className="header-right">
          <form className="search-box" onSubmit={handleAISubmit}>
            <Search size={14} className="text-muted" />
            <input 
              type="text" 
              className="search-input"
              placeholder="Ask AI (eg. Why is CP AQI high...)"
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
            />
            <button type="submit" className="search-btn">
              <Send size={12} />
            </button>
          </form>
          
          <button 
            type="button"
            className="theme-toggle-btn"
            onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <div className="user-profile">
            <User size={18} />
          </div>
        </div>
      </header>

      {/* Conditional Rendering of Tabs */}

      {activeTab === 'MAP VIEW' && (
        <main className="dashboard-grid">
          {/* Column 1: Priority Enforcement Areas */}
          <section className="sidebar-panel">
            <div className="panel-header">
              <h2 className="panel-title">
                <ShieldAlert size={14} className="text-muted" />
                Priority Areas
              </h2>
              <p className="panel-subtitle">Sectors requiring immediate intervention</p>
            </div>
            
            <div className="panel-scroll-container">
              {INITIAL_AREAS.map(area => {
                const aqi = area.timelineAQI[timelineIndex];
                const color = getAQIColor(aqi);
                const isSelected = selectedArea.id === area.id;

                return (
                  <div
                    key={area.id}
                    className={`area-card glass-panel ${isSelected ? 'active' : ''}`}
                    onClick={() => setSelectedArea(area)}
                  >
                    <div className="area-card-header">
                      <div className="area-name">{area.shortName}</div>
                      <div className="aqi-indicator" style={{ color: color, background: `${color}15` }}>
                        <span className="aqi-dot" style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }}></span>
                        {aqi}
                      </div>
                    </div>
                    <div className="area-card-body">
                      <span className="area-tag">{area.type}</span>
                      <span className="area-polluter">
                        {area.id === 'noida_border' || area.id === 'southwest' ? (
                          <HardHat size={12} className="text-muted" />
                        ) : area.id === 'southeast' || area.id === 'north' ? (
                          <Car size={12} className="text-muted" />
                        ) : area.id === 'west' ? (
                          <Flame size={12} className="text-muted" />
                        ) : (
                          <CloudSun size={12} className="text-muted" />
                        )}
                        {area.primaryPolluter}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Column 2: Central SVG Map & Controls */}
          <section className="map-panel">
            {/* Quick Overlays Control Row (Top Floating) */}
            <div className="map-controls-top-right">
              <button 
                className={`quick-layer-btn ${activeLayers.landUse ? 'active' : ''}`}
                onClick={() => toggleLayer('landUse')}
              >
                <Layers />
                <span>Land Use</span>
              </button>
              <button 
                className={`quick-layer-btn ${activeLayers.traffic ? 'active' : ''}`}
                onClick={() => toggleLayer('traffic')}
              >
                <Car />
                <span>Traffic</span>
              </button>
              <button 
                className={`quick-layer-btn ${activeLayers.construction ? 'active' : ''}`}
                onClick={() => toggleLayer('construction')}
              >
                <HardHat />
                <span>Construction</span>
              </button>
              <div className="quick-layer-divider"></div>
              <button 
                className={`quick-layer-btn ${activeLayers.satellite ? 'active' : ''}`}
                onClick={() => toggleLayer('satellite')}
              >
                <CloudSun />
                <span>Satellite</span>
              </button>
              <button 
                className={`quick-layer-btn ${activeLayers.meteo ? 'active' : ''}`}
                onClick={() => toggleLayer('meteo')}
              >
                <Wind />
                <span>Meteo</span>
              </button>
            </div>

            {/* Interactive map element */}
            <Map 
              selectedArea={selectedArea}
              onSelectArea={setSelectedArea}
              activeLayers={activeLayers}
              timelineIndex={timelineIndex}
              areasData={INITIAL_AREAS}
            />

            {/* Timeframe Slider Panel */}
            <div className="map-timeline-panel">
              <div className="timeline-slider-wrapper">
                <input 
                  type="range" 
                  min="0" 
                  max="2" 
                  className="timeline-slider"
                  value={timelineIndex}
                  onChange={(e) => setTimelineIndex(parseInt(e.target.value))}
                />
                <div className="timeline-labels">
                  <span 
                    className={`timeline-label ${timelineIndex === 0 ? 'active' : ''}`}
                    onClick={() => setTimelineIndex(0)}
                  >
                    Yesterday
                  </span>
                  <span 
                    className={`timeline-label ${timelineIndex === 1 ? 'active' : ''}`}
                    onClick={() => setTimelineIndex(1)}
                  >
                    Today
                  </span>
                  <span 
                    className={`timeline-label ${timelineIndex === 2 ? 'active' : ''}`}
                    onClick={() => setTimelineIndex(2)}
                  >
                    Tomorrow
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Column 3: Metrics & Source Analysis */}
          <section className="metrics-panel">
            {/* Card 1: Selected Area Detail */}
            <div className="metric-card glass-panel">
              <div className="metric-card-header">
                <span className="card-label">Selected Zone</span>
                <div className="area-info-main">
                  <div>
                    <h3 className="area-info-title">{selectedArea.shortName}</h3>
                    <div className="area-info-sub">
                      <MapPin size={12} className="text-primary" />
                      <span>{selectedArea.coordinates} • Ward: {selectedArea.wardNo}</span>
                    </div>
                  </div>
                  
                  <div 
                    className="aqi-badge" 
                    style={{ 
                      background: `${getAQIColor(selectedArea.timelineAQI[timelineIndex])}12`,
                      border: `1px solid ${getAQIColor(selectedArea.timelineAQI[timelineIndex])}30`,
                      color: getAQIColor(selectedArea.timelineAQI[timelineIndex]),
                      boxShadow: `0 0 10px ${getAQIColor(selectedArea.timelineAQI[timelineIndex])}15`
                    }}
                  >
                    <span className="aqi-badge-value">{selectedArea.timelineAQI[timelineIndex]}</span>
                    <span className="aqi-badge-label">{getAQILabel(selectedArea.timelineAQI[timelineIndex])}</span>
                  </div>
                </div>
              </div>

              {/* Source Attribution Chart */}
              <div>
                <span className="card-label" style={{ display: 'block', marginBottom: '10px' }}>
                  Source Attribution Breakdown
                </span>
                
                <div className="chart-container">
                  {/* Solid Pie Chart SVG */}
                  {renderPieChart()}

                  {/* Chart Legend */}
                  <div className="chart-legend">
                    {selectedArea.attribution.map((attr, idx) => (
                      <div key={idx} className="legend-item">
                        <div className="legend-color-label">
                          <span className="legend-color-dot" style={{ backgroundColor: attr.color }}></span>
                          <span>{attr.name}</span>
                        </div>
                        <span className="legend-value">{attr.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="confidence-footer">
                  <span>Confidence Level</span>
                  <span className="confidence-value">{selectedArea.confidence}%</span>
                </div>
              </div>
            </div>

            {/* Card 2: AI Insights & Recommendation */}
            <div className="metric-card glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div className="metric-card-header">
                <span className="card-label">AI Diagnostic Analysis</span>
              </div>
              
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div className={`ai-analysis-text ${isTyping ? 'ai-typing' : ''}`}>
                  {aiResponse}
                </div>
                
                <div className="ai-recommendation-list">
                  <span className="card-label">Recommended Interventions</span>
                  {selectedArea.recommendations.map((rec, idx) => (
                    <div key={idx} className="ai-recommendation-item">
                      <Droplet size={14} />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>

                {/* Sub-card AI Dialog input */}
                <form className="ai-footer-input" onSubmit={handleAISubmit}>
                  <input 
                    type="text" 
                    placeholder="Ask AeroShield about this sector..."
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                  />
                  <button type="submit" className="ai-send-btn">
                    <Send size={12} />
                  </button>
                </form>
              </div>
            </div>
          </section>
        </main>
      )}

      {activeTab === 'ENFORCEMENT' && (
        <main className="dashboard-grid" style={{ gridTemplateColumns: '1fr 380px' }}>
          <section className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.25rem', marginBottom: '4px' }}>Active Mitigation Patrols</h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Manage drone deployments, water mist cannons, and clean air response units</p>
              </div>
              <button 
                onClick={handleDispatchAll}
                style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <RefreshCw size={14} />
                Dispatch All Mitigation Units
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {enforcementTasks.map(task => {
                const TaskIcon = task.icon;
                return (
                  <div 
                    key={task.id} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between', 
                      padding: '16px', 
                      background: 'rgba(255,255,255,0.02)', 
                      border: '1px solid var(--card-border)', 
                      borderRadius: '12px' 
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                        <TaskIcon size={20} />
                      </div>
                      <div>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 600 }}>{task.measure}</h4>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{task.area} • {task.time}</p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <span 
                        style={{ 
                          fontSize: '0.75rem', 
                          fontWeight: 700, 
                          padding: '4px 10px', 
                          borderRadius: '12px',
                          color: task.status === 'Completed' ? 'var(--aqi-good)' : task.status === 'In Progress' ? 'var(--aqi-moderate)' : 'var(--text-muted)',
                          background: task.status === 'Completed' ? 'rgba(16, 185, 129, 0.12)' : task.status === 'In Progress' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(255,255,255,0.05)'
                        }}
                      >
                        {task.status}
                      </span>
                      {task.status !== 'Completed' && (
                        <button 
                          onClick={() => handleEnforcementAction(task.id)}
                          style={{ background: 'rgba(255,255,255,0.05)', hover: { background: 'rgba(255,255,255,0.1)' }, color: 'var(--text-primary)', border: '1px solid var(--card-border)', padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                        >
                          {task.status === 'Pending' ? 'Begin Work' : 'Mark Complete'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="glass-panel" style={{ padding: '20px' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={16} className="text-primary" />
                Patrol Fleet Status
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Mist Sweepers:</span>
                  <span style={{ fontWeight: 700 }}>4 Active / 6 Total</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Inspection Drones:</span>
                  <span style={{ fontWeight: 700 }}>3 Airborne / 4 Total</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Stationary Mist Cannons:</span>
                  <span style={{ fontWeight: 700 }}>12 Online / 15 Total</span>
                </div>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '20px', flex: 1 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={16} className="text-primary" />
                Emergency Directives
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                <div style={{ borderLeft: '3px solid var(--aqi-hazardous)', paddingLeft: '10px' }}>
                  <h5 style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '2px' }}>GRAP IV Enforced</h5>
                  <p>Ban on commercial diesel trucks entering Delhi borders; only essential supply logs permitted.</p>
                </div>
                <div style={{ borderLeft: '3px solid var(--aqi-poor)', paddingLeft: '10px' }}>
                  <h5 style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '2px' }}>School Outdoor Suspension</h5>
                  <p>All physical training and outdoor recess suspended in Wards 10-120.</p>
                </div>
                <div style={{ borderLeft: '3px solid var(--aqi-poor)', paddingLeft: '10px' }}>
                  <h5 style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '2px' }}>Construction Halt Order</h5>
                  <p>All private real estate masonry and dry plastering works put on hold till further advisory.</p>
                </div>
              </div>
            </div>
          </section>
        </main>
      )}

      {activeTab === 'REPORTS' && (
        <main className="dashboard-grid" style={{ gridTemplateColumns: '1fr' }}>
          <section className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '16px', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.25rem', marginBottom: '4px' }}>Pollution Research & Historical Analytics</h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Examine ambient metrics, seasonal attributions, and export datasets</p>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button style={{ background: 'rgba(255,255,255,0.04)', color: '#fff', border: '1px solid var(--card-border)', padding: '8px 16px', borderRadius: '8px', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar size={14} />
                  June 2026
                </button>
                <button style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Download size={14} />
                  Export Data (CSV)
                </button>
              </div>
            </div>

            {/* Reports charts mock layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
              <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '16px' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '16px' }}>Average Weekly AQI Trend</h4>
                {/* Visual mock chart */}
                <div style={{ height: '180px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '10px 20px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                  {[120, 160, 240, 290, 210, 195, 232].map((val, idx) => {
                    const pct = (val / 350) * 100;
                    return (
                      <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: '8px' }}>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 700 }}>{val}</span>
                        <div style={{ width: '20px', height: `${pct}px`, background: getAQIColor(val), borderRadius: '4px 4px 0 0', boxShadow: `0 0 8px ${getAQIColor(val)}30` }}></div>
                        <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][idx]}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '16px' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '16px' }}>Source Contributions this Month</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { name: 'Crop Residue Smoke', value: '38%', count: '76 hrs logged', color: '#10b981' },
                    { name: 'Diesel Vehicle Exhaust', value: '32%', count: '64 hrs logged', color: '#f59e0b' },
                    { name: 'Suspended Construction Dust', value: '18%', count: '36 hrs logged', color: '#ec4899' },
                    { name: 'Industrial Emissions', value: '12%', count: '24 hrs logged', color: '#3b82f6' }
                  ].map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>{item.name}</span>
                        <span style={{ fontWeight: 700 }}>{item.value}</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: item.value, height: '100%', background: item.color, borderRadius: '3px' }}></div>
                      </div>
                      <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '16px' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '12px' }}>Logged Pollution Violations (Last 48h)</h4>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--card-border)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '10px' }}>Timestamp</th>
                    <th style={{ padding: '10px' }}>Location</th>
                    <th style={{ padding: '10px' }}>Violation Type</th>
                    <th style={{ padding: '10px' }}>Evidence Source</th>
                    <th style={{ padding: '10px' }}>Action Taken</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { time: 'June 29, 17:40', loc: 'FNG Sector 104', type: 'Uncovered aggregate storage', source: 'LIDAR Drone-03', action: 'Fine Issued (₹50,000)' },
                    { time: 'June 29, 14:15', loc: 'Dwarka Sector 10', type: 'Illegal waste burn spot', source: 'Thermal Satellite-4', action: 'Patrol dispatched, doused' },
                    { time: 'June 28, 23:10', loc: 'Aazadpur Gate 2', type: 'Commercial truck idling limit exceeded', source: 'Mandi CCTV Sensor', action: 'Warning Issued' },
                    { time: 'June 28, 08:30', loc: 'NH48 Flyover works', type: 'Missing water spray logistics', source: 'Resident Photo Upload', action: 'Work Suspended 24h' }
                  ].map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <td style={{ padding: '10px', color: 'var(--text-secondary)' }}>{row.time}</td>
                      <td style={{ padding: '10px', fontWeight: 600 }}>{row.loc}</td>
                      <td style={{ padding: '10px' }}>{row.type}</td>
                      <td style={{ padding: '10px', color: 'var(--text-secondary)' }}>{row.source}</td>
                      <td style={{ padding: '10px', color: 'var(--primary)', fontWeight: 600 }}>{row.action}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      )}

      {activeTab === 'ADVISORY' && (
        <main className="dashboard-grid" style={{ gridTemplateColumns: '1fr' }}>
          <section className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '16px', marginBottom: '20px' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.25rem', marginBottom: '4px' }}>Public Health Advisories & Safety Guidelines</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>AI-synthesized instructions for citizens and risk cohorts based on current air toxicity</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ padding: '20px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.15)', borderRadius: '12px' }}>
                  <h3 style={{ color: 'var(--aqi-poor)', fontSize: '0.95rem', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertCircle size={18} />
                    High Health Risk Warning (AQI Average: 251)
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    The atmospheric boundary layer is trapping toxic micro-pollutants including PM2.5 and Ozone. Significant increases in bronchial congestion and breathing difficulties are recorded across northern and central zones.
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '16px' }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle size={14} className="text-primary" />
                      Dos for Citizens
                    </h4>
                    <ul style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <li>Ensure internal air purifiers are running with closed door frames.</li>
                      <li>Incorporate high antioxidant-rich foods into diets to counter oxidative stress.</li>
                      <li>Transition workouts indoors, preferring air-conditioned fitness centres.</li>
                      <li>Switch vehicle air ventilation modes to recirculate air loop.</li>
                    </ul>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '16px' }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <AlertCircle size={14} style={{ color: 'var(--aqi-poor)' }} />
                      Don'ts for Citizens
                    </h4>
                    <ul style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <li>Do not conduct early morning runs when particulate concentration is dense.</li>
                      <li>Avoid heavy traffic corridors during high temperature peaks.</li>
                      <li>Refrain from burning dry leaves, firewood, or outdoor barbecue grills.</li>
                      <li>Do not operate gas-powered gardening sweepers or leaf blowers.</li>
                    </ul>
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '16px' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '12px' }}>Vulnerable Cohorts Management</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    <div style={{ padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                      <h5 style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '4px' }}>Asthmatics / COPD</h5>
                      <p>Carry rescue inhalers at all times. Connect with physicians if heart rate spikes or coughing persists.</p>
                    </div>
                    <div style={{ padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                      <h5 style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '4px' }}>Infants & Children</h5>
                      <p>Minimize outdoor school commutes. Suppress strenuous play to protect developing respiratory systems.</p>
                    </div>
                    <div style={{ padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                      <h5 style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '4px' }}>Senior Citizens</h5>
                      <p>Avoid evening and morning parks walks. Restrict outings to mid-afternoons when dispersion is highest.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="glass-panel" style={{ padding: '16px' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '12px' }}>Local Mask Advisory</h4>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', background: 'rgba(0,0,0,0.1)', padding: '12px', borderRadius: '8px' }}>
                    <ShieldAlert size={28} style={{ color: 'var(--primary)' }} />
                    <div>
                      <h6 style={{ fontSize: '0.8rem', fontWeight: 600 }}>N95 Mandated</h6>
                      <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Standard cloth and surgical masks do not filter PM2.5 nanoparticles</p>
                    </div>
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: '16px', flex: 1 }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '12px' }}>Emergency Contacts</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Pollution Complaint:</span>
                      <span style={{ fontWeight: 700 }}>1800-11-2288</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Medical Emergency:</span>
                      <span style={{ fontWeight: 700 }}>102 / 112</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>GRAP Hotline:</span>
                      <span style={{ fontWeight: 700 }}>011-23378822</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>DPCC Center:</span>
                      <span style={{ fontWeight: 700 }}>dpcc.delhi.gov.in</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      )}
    </div>
  );
}
