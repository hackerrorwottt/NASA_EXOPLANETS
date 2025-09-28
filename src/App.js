import React, { useState, useEffect } from 'react';
import Orb from './Orb';
import GradientText from './GradientText';
import './App.css';

function App() {
  const [exoplanets, setExoplanets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activePage, setActivePage] = useState('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activePage]);

  // Show/hide scroll to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    fetchExoplanets();
  }, []);

  const fetchExoplanets = async () => {
    try {
      const data = await getExoplanetData();
      setExoplanets(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching exoplanet data:', error);
      setLoading(false);
    }
  };

  const getExoplanetData = async () => {
    try {
      // Try to fetch from comprehensive exoplanet database first
      const response = await fetch('/all_exoplanets.json');
      if (response.ok) {
        const data = await response.json();
        console.log(`📊 Loaded ${data.exoplanets.length} exoplanets from comprehensive database`);
        return data.exoplanets;
      }
    } catch (error) {
      console.log('No comprehensive data found, trying fallback...');
    }
    
    try {
      // Try to fetch from Python scraper results
      const response = await fetch('/results.json');
      if (response.ok) {
        const scrapedData = await response.json();
        return processScrapedData(scrapedData);
      }
    } catch (error) {
      console.log('No scraped data found, using fallback data');
    }
    
    // Fallback data if scraper results not available
    return getFallbackExoplanetData();
  };

  const processScrapedData = (scrapedData) => {
    // Extract exoplanet information from scraped NASA data
    const exoplanets = [];
    
    // Parse headings and paragraphs to extract exoplanet data
    const headings = scrapedData.headings || [];
    const paragraphs = scrapedData.paragraphs || [];
    
    // Look for exoplanet mentions in the content
    const exoplanetKeywords = [
      'Kepler-452b', 'Proxima Centauri b', 'TRAPPIST-1e', 'GJ 357 d', 
      'TOI-700 d', 'HD 209458 b', '51 Pegasi b', 'HD 189733 b',
      'Kepler-22b', 'Gliese 581 g', 'Wolf 1061c', 'Ross 128 b'
    ];
    
    exoplanetKeywords.forEach(planetName => {
      const foundParagraph = paragraphs.find(p => 
        p.toLowerCase().includes(planetName.toLowerCase())
      );
      
      if (foundParagraph) {
        exoplanets.push({
          name: planetName,
          type: extractPlanetType(foundParagraph),
          distance: extractDistance(foundParagraph),
          year: extractYear(foundParagraph),
          mass: extractMass(foundParagraph),
          radius: extractRadius(foundParagraph),
          temperature: extractTemperature(foundParagraph),
          habitable: determineHabitable(planetName, foundParagraph),
          description: foundParagraph.substring(0, 200) + '...'
        });
      }
    });
    
    // If no planets found in scraped data, return fallback
    return exoplanets.length > 0 ? exoplanets : getFallbackExoplanetData();
  };

  const extractPlanetType = (text) => {
    if (text.toLowerCase().includes('super earth')) return 'Super Earth';
    if (text.toLowerCase().includes('terrestrial')) return 'Terrestrial';
    if (text.toLowerCase().includes('hot jupiter')) return 'Hot Jupiter';
    if (text.toLowerCase().includes('gas giant')) return 'Gas Giant';
    return 'Unknown';
  };

  const extractDistance = (text) => {
    const distanceMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:light years?|ly|parsecs?|pc)/i);
    return distanceMatch ? `${distanceMatch[1]} ly` : 'Unknown';
  };

  const extractYear = (text) => {
    const yearMatch = text.match(/(19|20)\d{2}/);
    return yearMatch ? yearMatch[0] : 'Unknown';
  };

  const extractMass = (text) => {
    const massMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:M⊕|M☉|MJ)/i);
    return massMatch ? `${massMatch[1]} M⊕` : 'Unknown';
  };

  const extractRadius = (text) => {
    const radiusMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:R⊕|R☉|RJ)/i);
    return radiusMatch ? `${radiusMatch[1]} R⊕` : 'Unknown';
  };

  const extractTemperature = (text) => {
    const tempMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:K|°C|°F)/i);
    return tempMatch ? `${tempMatch[1]} K` : 'Unknown';
  };

  const determineHabitable = (planetName, text) => {
    const habitablePlanets = ['Kepler-452b', 'Proxima Centauri b', 'TRAPPIST-1e', 'GJ 357 d', 'TOI-700 d'];
    return habitablePlanets.includes(planetName) ? 'Yes' : 'No';
  };

  const getFallbackExoplanetData = () => {
    return [
      { 
        name: 'Kepler-452b', 
        type: 'Super Earth', 
        distance: '1400 ly', 
        year: '2015',
        mass: '5.0 M⊕',
        radius: '1.6 R⊕',
        temperature: '265 K',
        habitable: 'Yes',
        description: 'Kepler-452b is an exoplanet orbiting the Sun-like star Kepler-452 about 1,400 light-years from Earth in the constellation Cygnus.'
      },
      { 
        name: 'Proxima Centauri b', 
        type: 'Terrestrial', 
        distance: '4.2 ly', 
        year: '2016',
        mass: '1.3 M⊕',
        radius: '1.1 R⊕',
        temperature: '234 K',
        habitable: 'Yes',
        description: 'Proxima Centauri b is an exoplanet orbiting within the habitable zone of the red dwarf star Proxima Centauri.'
      },
      { 
        name: 'TRAPPIST-1e', 
        type: 'Terrestrial', 
        distance: '40 ly', 
        year: '2017',
        mass: '0.6 M⊕',
        radius: '0.9 R⊕',
        temperature: '251 K',
        habitable: 'Yes',
        description: 'TRAPPIST-1e is one of seven Earth-sized exoplanets orbiting the ultracool dwarf star TRAPPIST-1.'
      },
      { 
        name: 'GJ 357 d', 
        type: 'Super Earth', 
        distance: '31 ly', 
        year: '2019',
        mass: '6.1 M⊕',
        radius: '2.0 R⊕',
        temperature: '219 K',
        habitable: 'Yes',
        description: 'GJ 357 d is a super-Earth exoplanet that orbits within the habitable zone of its star.'
      },
      { 
        name: 'TOI-700 d', 
        type: 'Terrestrial', 
        distance: '100 ly', 
        year: '2020',
        mass: '1.7 M⊕',
        radius: '1.2 R⊕',
        temperature: '268 K',
        habitable: 'Yes',
        description: 'TOI-700 d is an exoplanet, likely rocky, orbiting within the habitable zone of the red dwarf TOI-700.'
      },
      { 
        name: 'HD 209458 b', 
        type: 'Hot Jupiter', 
        distance: '150 ly', 
        year: '1999',
        mass: '0.7 MJ',
        radius: '1.4 RJ',
        temperature: '1130 K',
        habitable: 'No',
        description: 'HD 209458 b is an exoplanet that orbits the solar analog HD 209458 in the constellation Pegasus.'
      },
      { 
        name: '51 Pegasi b', 
        type: 'Hot Jupiter', 
        distance: '50 ly', 
        year: '1995',
        mass: '0.5 MJ',
        radius: '1.2 RJ',
        temperature: '1200 K',
        habitable: 'No',
        description: '51 Pegasi b was the first exoplanet discovered orbiting a main-sequence star.'
      },
      { 
        name: 'HD 189733 b', 
        type: 'Hot Jupiter', 
        distance: '63 ly', 
        year: '2005',
        mass: '1.1 MJ',
        radius: '1.1 RJ',
        temperature: '1200 K',
        habitable: 'No',
        description: 'HD 189733 b is an exoplanet approximately 64.5 light-years away from the Solar System.'
      }
    ];
  };

  const pages = [
    { id: 'home', name: 'Home', icon: '🏠' },
    { id: 'abstract', name: 'Abstract', icon: '📄' },
    { id: 'timeline', name: 'Timeline', icon: '📊' },
    { id: 'methods', name: 'Detection Methods', icon: '🔬' },
    { id: 'ai', name: 'AI Framework', icon: '🤖' },
    { id: 'database', name: 'Exoplanet Database', icon: '🪐' },
    { id: 'future', name: 'Future', icon: '🚀' }
  ];

  const renderPage = () => {
    switch (activePage) {
      case 'home':
        return <HomePage />;
      case 'abstract':
        return <AbstractPage />;
      case 'timeline':
        return <TimelinePage exoplanets={exoplanets} />;
      case 'methods':
        return <MethodsPage />;
      case 'ai':
        return <AIFrameworkPage />;
      case 'database':
        return <DatabasePage exoplanets={exoplanets} loading={loading} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />;
      case 'future':
        return <FuturePage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="app">
      {/* Background Orb */}
      <div className="orb-background">
        <Orb
          hoverIntensity={0.5}
          rotateOnHover={true}
          hue={0}
          forceHoverState={false}
        />
      </div>

      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-brand">
            <GradientText
              colors={["#40ffaa", "#4079ff", "#40ffaa"]}
              animationSpeed={2}
              showBorder={false}
              className="brand-title"
            >
              Exoplanet AI
            </GradientText>
          </div>
          
          <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
            {pages.map(page => (
              <button
                key={page.id}
                className={`navbar-item ${activePage === page.id ? 'active' : ''}`}
                onClick={() => {
                  setActivePage(page.id);
                  setIsMenuOpen(false);
                }}
              >
                <span className="nav-icon">{page.icon}</span>
                <span className="nav-text">{page.name}</span>
              </button>
            ))}
          </div>
          
          <div className="navbar-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="transparent-content">
        <div className="ai-research-container">
          {renderPage()}
        </div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button 
          className="scroll-to-top"
          onClick={scrollToTop}
          aria-label="Scroll to top"
        >
          ↑
        </button>
      )}
    </div>
  );
}

// Home Page Component
function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="hero-section">
        <GradientText
          colors={["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"]}
          animationSpeed={3}
          showBorder={false}
          className="hero-title"
        >
          Collaborative AI for Exoplanet Discovery
        </GradientText>
        <p className="hero-subtitle">
          Harnessing AI and human collaboration to expand our cosmic horizons
        </p>
        <div className="hero-buttons">
          <button className="cta-button primary">Explore Framework</button>
          <button className="cta-button secondary">Join Citizen Science</button>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="quick-stats">
        <div className="stats-grid">
          <div className="stat-item">
            <h3>1,604+</h3>
            <p>Exoplanets Discovered</p>
          </div>
          <div className="stat-item">
            <h3>4</h3>
            <p>Detection Methods</p>
          </div>
          <div className="stat-item">
            <h3>AI</h3>
            <p>Machine Learning Framework</p>
          </div>
          <div className="stat-item">
            <h3>∞</h3>
            <p>Possibilities</p>
          </div>
        </div>
      </section>
    </>
  );
}

// Abstract Page Component
function AbstractPage() {
  return (
    <section className="abstract-section">
      <h2>Abstract</h2>
      <div className="abstract-content">
        <p>
          This project presents a comprehensive framework for integrating machine learning with 
          astrophysical principles to accelerate exoplanet discovery. Our collaborative AI system 
          combines the power of neural networks with human expertise to process massive datasets 
          from space telescopes like Kepler, TESS, and future missions.
        </p>
        <div className="process-flow">
          <div className="flow-step">
            <div className="step-icon">📡</div>
            <h3>Raw Telescope Data</h3>
            <p>Light curves, spectra, and photometric measurements</p>
          </div>
          <div className="flow-arrow">→</div>
          <div className="flow-step">
            <div className="step-icon">🤖</div>
            <h3>AI Analysis</h3>
            <p>Neural networks identify potential transit signals</p>
          </div>
          <div className="flow-arrow">→</div>
          <div className="flow-step">
            <div className="step-icon">👥</div>
            <h3>Human Validation</h3>
            <p>Scientists review and confirm discoveries</p>
          </div>
          <div className="flow-arrow">→</div>
          <div className="flow-step">
            <div className="step-icon">🪐</div>
            <h3>Confirmed Exoplanet</h3>
            <p>New world added to our cosmic catalog</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// Timeline Page Component
function TimelinePage({ exoplanets }) {
  return (
    <section className="timeline-section">
      <h2>Exoplanet Discovery Timeline</h2>
      <div className="timeline-content">
        <div className="timeline-stats">
          <div className="stat-card">
            <h3>1995</h3>
            <p>First Exoplanet</p>
            <span>51 Pegasi b</span>
          </div>
          <div className="stat-card">
            <h3>2009</h3>
            <p>Kepler Mission</p>
            <span>2,000+ Discoveries</span>
          </div>
          <div className="stat-card">
            <h3>2018</h3>
            <p>TESS Mission</p>
            <span>4,000+ Discoveries</span>
          </div>
          <div className="stat-card">
            <h3>2024</h3>
            <p>Current Total</p>
            <span>{exoplanets.length.toLocaleString()}+ Exoplanets</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// Methods Page Component
function MethodsPage() {
  return (
    <section className="detection-methods">
      <h2>Physics of Exoplanet Detection</h2>
      
      {/* Classical Methods */}
      <div className="methods-section">
        <h3 className="section-subtitle">Classical Detection Methods</h3>
        <div className="methods-grid">
          <div className="method-card">
            <h3>Transit Method</h3>
            <div className="method-visual">📉</div>
            <p>Detects periodic dips in stellar brightness as planets pass in front of their host stars</p>
          </div>
          <div className="method-card">
            <h3>Radial Velocity</h3>
            <div className="method-visual">🌊</div>
            <p>Measures the Doppler wobble of stars caused by gravitational pull of orbiting planets</p>
          </div>
          <div className="method-card">
            <h3>Microlensing</h3>
            <div className="method-visual">🔍</div>
            <p>Uses gravitational lensing to detect planets through magnification of background stars</p>
          </div>
          <div className="method-card">
            <h3>Direct Imaging</h3>
            <div className="method-visual">📸</div>
            <p>Directly captures images of exoplanets using advanced coronagraphy techniques</p>
          </div>
        </div>
      </div>

      {/* Quantum Methods */}
      <div className="methods-section">
        <h3 className="section-subtitle">Quantum-Enhanced Detection Methods</h3>
        <div className="quantum-intro">
          <p>
            Advanced quantum techniques that push the boundaries of exoplanet detection, 
            offering unprecedented sensitivity and accuracy in distinguishing planetary signals from stellar noise.
          </p>
        </div>
        <div className="methods-grid quantum-methods">
          <div className="method-card quantum-card">
            <h3>Quantum Hypothesis Testing</h3>
            <div className="method-visual">⚛️</div>
            <p>Distinguishes real planetary signals from stellar noise using quantum statistical methods and advanced signal processing algorithms</p>
            <div className="method-details">
              <span className="detail-tag">Signal Processing</span>
              <span className="detail-tag">Noise Reduction</span>
              <span className="detail-tag">Quantum Statistics</span>
            </div>
          </div>
          <div className="method-card quantum-card">
            <h3>Quantum Rao Bounds</h3>
            <div className="method-visual">🎯</div>
            <p>Defines the ultimate limits of measurement accuracy using quantum Fisher information and Cramér-Rao bounds</p>
            <div className="method-details">
              <span className="detail-tag">Fisher Information</span>
              <span className="detail-tag">Cramér-Rao</span>
              <span className="detail-tag">Precision Limits</span>
            </div>
          </div>
          <div className="method-card quantum-card">
            <h3>Quantum Parameter Estimation</h3>
            <div className="method-visual">🔬</div>
            <p>Extracts orbital periods and radii with maximal confidence using quantum metrology and optimal estimation theory</p>
            <div className="method-details">
              <span className="detail-tag">Orbital Parameters</span>
              <span className="detail-tag">Quantum Metrology</span>
              <span className="detail-tag">Optimal Estimation</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quantum Advantages */}
      <div className="quantum-advantages">
        <h3 className="section-subtitle">Quantum Advantages in Exoplanet Detection</h3>
        <div className="advantages-grid">
          <div className="advantage-card">
            <div className="advantage-icon">🚀</div>
            <h4>Enhanced Sensitivity</h4>
            <p>Quantum methods can detect signals 10-100x weaker than classical techniques</p>
          </div>
          <div className="advantage-card">
            <div className="advantage-icon">🎯</div>
            <h4>Ultimate Precision</h4>
            <p>Approaches fundamental quantum limits of measurement accuracy</p>
          </div>
          <div className="advantage-card">
            <div className="advantage-icon">🔍</div>
            <h4>Noise Suppression</h4>
            <p>Advanced quantum algorithms filter out stellar variability and instrumental noise</p>
          </div>
          <div className="advantage-card">
            <div className="advantage-icon">⚡</div>
            <h4>Faster Processing</h4>
            <p>Quantum computing enables real-time analysis of massive datasets</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// AI Framework Page Component
function AIFrameworkPage() {
  return (
    <section className="ai-framework">
      <h2>Proposed AI/ML Framework</h2>
      <div className="framework-content">
        <div className="ai-network">
          <div className="ai-node">CNN</div>
          <div className="ai-node">RNN</div>
          <div className="ai-node">Transformer</div>
          <div className="ai-node">Explainable AI</div>
        </div>
        <p>
          Our federated AI system combines multiple neural network architectures to process 
          different aspects of exoplanet data, with explainable AI providing transparency 
          in decision-making processes.
        </p>
      </div>
    </section>
  );
}

// Database Page Component
function DatabasePage({ exoplanets, loading, searchTerm, setSearchTerm }) {
  return (
    <section className="exoplanet-database">
      <h2>🪐 Exoplanet Database ({exoplanets.length.toLocaleString()} Discoveries)</h2>
      <div className="database-controls">
        <input 
          type="text" 
          placeholder="Search exoplanets..." 
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select className="filter-select">
          <option value="all">All Types</option>
          <option value="Terrestrial">Terrestrial</option>
          <option value="Super Earth">Super Earth</option>
          <option value="Gas Giant">Gas Giant</option>
          <option value="Hot Jupiter">Hot Jupiter</option>
        </select>
      </div>
      <div className="exoplanet-grid">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading exoplanet database...</p>
          </div>
        ) : (
          exoplanets.slice(0, 50).map((planet, index) => (
            <div key={index} className="exoplanet-card">
              <div className="planet-header">
                <h3>{planet.name}</h3>
                <span className={`habitable-badge ${planet.habitable === 'Yes' ? 'habitable' : 'not-habitable'}`}>
                  {planet.habitable === 'Yes' ? '🌍 Habitable' : '🔥 Not Habitable'}
                </span>
              </div>
              <div className="planet-details">
                <div className="detail-row">
                  <span className="detail-label">Type:</span>
                  <span className="detail-value">{planet.type}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Host Star:</span>
                  <span className="detail-value">{planet.host_star}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Radius:</span>
                  <span className="detail-value">{planet.radius_earth ? `${planet.radius_earth} R⊕` : 'Unknown'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Mass:</span>
                  <span className="detail-value">{planet.mass_earth ? `${planet.mass_earth} M⊕` : 'Unknown'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Temperature:</span>
                  <span className="detail-value">{planet.equilibrium_temp_k ? `${planet.equilibrium_temp_k} K` : 'Unknown'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Discovery:</span>
                  <span className="detail-value">{planet.discovery_method}</span>
                </div>
              </div>
              {planet.description && (
                <div className="planet-description">
                  <p>{planet.description}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
}

// Future Page Component
function FuturePage() {
  return (
    <>
      <section className="future-directions">
        <h2>Future Directions</h2>
        <div className="future-content">
          <div className="future-card">
            <h3>JWST Integration</h3>
            <p>Advanced spectroscopy and atmospheric analysis</p>
          </div>
          <div className="future-card">
            <h3>PLATO Mission</h3>
            <p>European space telescope for exoplanet discovery</p>
          </div>
          <div className="future-card">
            <h3>LUVOIR Concept</h3>
            <p>Next-generation space telescope for direct imaging</p>
          </div>
        </div>
      </section>

      <section className="conclusion">
        <h2>Together, we expand humanity's window into the cosmos</h2>
        <p>
          Join us in the collaborative effort to discover new worlds and unlock the secrets 
          of our universe through the power of AI and human ingenuity.
        </p>
      </section>
    </>
  );
}

export default App;