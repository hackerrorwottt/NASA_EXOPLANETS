# comprehensive_exoplanet_scraper.py
"""
Comprehensive Exoplanet Scraper for NASA Data
- Scrapes from multiple NASA exoplanet sources
- Gets ALL exoplanets, not just featured ones
- Integrates with NASA Exoplanet Archive API
- Saves comprehensive data for React app
"""

import requests
import json
import time
from datetime import datetime
from urllib.parse import urljoin
import sys

class ComprehensiveExoplanetScraper:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (compatible; ExoplanetResearch/1.0; +https://exoplanet-research.org)'
        })
        self.exoplanets = []
        
    def scrape_nasa_archive(self):
        """Scrape from NASA Exoplanet Archive API"""
        print("🔍 Scraping NASA Exoplanet Archive...")
        
        # NASA Exoplanet Archive API endpoints
        endpoints = [
            "https://exoplanetarchive.ipac.caltech.edu/TAP/sync?query=select+pl_name,hostname,pl_orbper,pl_rade,pl_bmasse,pl_eqt,pl_orbincl,pl_orbeccen,pl_trandep,pl_trandur,pl_ratdor,pl_ratror,pl_imppar,pl_occe,pl_esinw,pl_ecosw,pl_teq,pl_a,pl_dens,pl_insol,pl_logg,pl_massj,pl_radj,pl_orbvel,pl_orbsmax,pl_ratdor,pl_ratror,pl_imppar,pl_occe,pl_esinw,pl_ecosw,pl_teq,pl_a,pl_dens,pl_insol,pl_logg,pl_massj,pl_radj,pl_orbvel,pl_orbsmax,pl_eqt,pl_orbincl,pl_orbeccen,pl_trandep,pl_trandur,pl_ratdor,pl_ratror,pl_imppar,pl_occe,pl_esinw,pl_ecosw,pl_teq,pl_a,pl_dens,pl_insol,pl_logg,pl_massj,pl_radj,pl_orbvel,pl_orbsmax+from+ps&format=json",
            "https://exoplanetarchive.ipac.caltech.edu/TAP/sync?query=select+pl_name,hostname,pl_orbper,pl_rade,pl_bmasse,pl_eqt,pl_orbincl,pl_orbeccen,pl_trandep,pl_trandur,pl_ratdor,pl_ratror,pl_imppar,pl_occe,pl_esinw,pl_ecosw,pl_teq,pl_a,pl_dens,pl_insol,pl_logg,pl_massj,pl_radj,pl_orbvel,pl_orbsmax+from+pscomppars&format=json",
            "https://exoplanetarchive.ipac.caltech.edu/TAP/sync?query=select+pl_name,hostname,pl_orbper,pl_rade,pl_bmasse,pl_eqt,pl_orbincl,pl_orbeccen,pl_trandep,pl_trandur,pl_ratdor,pl_ratror,pl_imppar,pl_occe,pl_esinw,pl_ecosw,pl_teq,pl_a,pl_dens,pl_insol,pl_logg,pl_massj,pl_radj,pl_orbvel,pl_orbsmax+from+ps&format=json&where=pl_rade+>+0"
        ]
        
        all_planets = []
        
        for i, endpoint in enumerate(endpoints):
            try:
                print(f"  📡 Fetching from endpoint {i+1}/{len(endpoints)}...")
                response = self.session.get(endpoint, timeout=30)
                response.raise_for_status()
                
                data = response.json()
                print(f"  ✅ Retrieved {len(data)} exoplanets")
                
                for planet in data:
                    processed_planet = self.process_planet_data(planet)
                    if processed_planet:
                        all_planets.append(processed_planet)
                
                time.sleep(1)  # Be respectful to the API
                
            except Exception as e:
                print(f"  ❌ Error with endpoint {i+1}: {e}")
                continue
        
        # Remove duplicates based on planet name
        unique_planets = {}
        for planet in all_planets:
            if planet['name'] not in unique_planets:
                unique_planets[planet['name']] = planet
        
        self.exoplanets = list(unique_planets.values())
        print(f"🎯 Total unique exoplanets: {len(self.exoplanets)}")
        return self.exoplanets
    
    def process_planet_data(self, raw_data):
        """Process raw planet data into standardized format"""
        try:
            # Extract basic information
            name = raw_data.get('pl_name', 'Unknown')
            hostname = raw_data.get('hostname', 'Unknown')
            
            if name == 'Unknown' or not name:
                return None
            
            # Calculate habitable zone status
            habitable = self.determine_habitability(raw_data)
            
            # Extract physical properties
            radius_earth = raw_data.get('pl_rade', 0)
            mass_earth = raw_data.get('pl_bmasse', 0)
            mass_jupiter = raw_data.get('pl_massj', 0)
            radius_jupiter = raw_data.get('pl_radj', 0)
            
            # Determine planet type
            planet_type = self.classify_planet_type(radius_earth, mass_earth, mass_jupiter)
            
            # Extract orbital properties
            orbital_period = raw_data.get('pl_orbper', 0)
            semi_major_axis = raw_data.get('pl_a', 0)
            eccentricity = raw_data.get('pl_orbeccen', 0)
            inclination = raw_data.get('pl_orbincl', 0)
            
            # Extract atmospheric properties
            equilibrium_temp = raw_data.get('pl_eqt', 0)
            insolation = raw_data.get('pl_insol', 0)
            density = raw_data.get('pl_dens', 0)
            surface_gravity = raw_data.get('pl_logg', 0)
            
            # Extract transit properties
            transit_depth = raw_data.get('pl_trandep', 0)
            transit_duration = raw_data.get('pl_trandur', 0)
            
            return {
                'name': name,
                'host_star': hostname,
                'type': planet_type,
                'habitable': habitable,
                'radius_earth': radius_earth,
                'mass_earth': mass_earth,
                'mass_jupiter': mass_jupiter,
                'radius_jupiter': radius_jupiter,
                'orbital_period_days': orbital_period,
                'semi_major_axis_au': semi_major_axis,
                'eccentricity': eccentricity,
                'inclination_deg': inclination,
                'equilibrium_temp_k': equilibrium_temp,
                'insolation_earth': insolation,
                'density_g_cm3': density,
                'surface_gravity_ms2': surface_gravity,
                'transit_depth_ppm': transit_depth,
                'transit_duration_hours': transit_duration,
                'discovery_method': self.determine_discovery_method(raw_data),
                'description': self.generate_description(name, planet_type, habitable, radius_earth, mass_earth)
            }
            
        except Exception as e:
            print(f"  ⚠️ Error processing planet {raw_data.get('pl_name', 'Unknown')}: {e}")
            return None
    
    def determine_habitability(self, data):
        """Determine if planet is in habitable zone"""
        try:
            insolation = data.get('pl_insol', 0)
            radius = data.get('pl_rade', 0)
            mass = data.get('pl_bmasse', 0)
            
            # Basic habitable zone criteria
            if insolation > 0 and 0.3 <= insolation <= 1.7:
                if radius > 0 and 0.5 <= radius <= 2.0:
                    return 'Yes'
            return 'No'
        except:
            return 'Unknown'
    
    def classify_planet_type(self, radius_earth, mass_earth, mass_jupiter):
        """Classify planet type based on size and mass"""
        try:
            if radius_earth > 0:
                if radius_earth < 0.8:
                    return 'Sub-Earth'
                elif radius_earth < 1.25:
                    return 'Terrestrial'
                elif radius_earth < 2.0:
                    return 'Super Earth'
                elif radius_earth < 6.0:
                    return 'Mini Neptune'
                else:
                    return 'Gas Giant'
            elif mass_jupiter > 0:
                if mass_jupiter < 0.1:
                    return 'Super Earth'
                elif mass_jupiter < 0.5:
                    return 'Neptune-like'
                else:
                    return 'Jupiter-like'
            else:
                return 'Unknown'
        except:
            return 'Unknown'
    
    def determine_discovery_method(self, data):
        """Determine primary discovery method"""
        methods = []
        if data.get('pl_trandep', 0) > 0:
            methods.append('Transit')
        if data.get('pl_orbvel', 0) > 0:
            methods.append('Radial Velocity')
        if data.get('pl_imppar', 0) > 0:
            methods.append('Microlensing')
        return ', '.join(methods) if methods else 'Unknown'
    
    def generate_description(self, name, planet_type, habitable, radius, mass):
        """Generate a description for the planet"""
        desc_parts = [f"{name} is a {planet_type.lower()} exoplanet"]
        
        if radius > 0:
            if radius < 1:
                desc_parts.append(f"with a radius of {radius:.2f} Earth radii")
            else:
                desc_parts.append(f"with a radius of {radius:.2f} Earth radii")
        
        if mass > 0:
            if mass < 1:
                desc_parts.append(f"and a mass of {mass:.2f} Earth masses")
            else:
                desc_parts.append(f"and a mass of {mass:.2f} Earth masses")
        
        if habitable == 'Yes':
            desc_parts.append("located within the habitable zone of its star")
        elif habitable == 'No':
            desc_parts.append("located outside the habitable zone")
        
        return '. '.join(desc_parts) + '.'
    
    def save_data(self, filename='comprehensive_exoplanets.json'):
        """Save all exoplanet data to JSON file"""
        data = {
            'metadata': {
                'total_exoplanets': len(self.exoplanets),
                'scrape_date': datetime.now().isoformat(),
                'source': 'NASA Exoplanet Archive',
                'version': '1.0'
            },
            'exoplanets': self.exoplanets
        }
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        print(f"💾 Saved {len(self.exoplanets)} exoplanets to {filename}")
        return filename

def main():
    """Main execution function"""
    print("🌌 Comprehensive Exoplanet Scraper")
    print("=" * 50)
    
    scraper = ComprehensiveExoplanetScraper()
    
    try:
        # Scrape all exoplanets
        exoplanets = scraper.scrape_nasa_archive()
        
        if exoplanets:
            # Save data
            filename = scraper.save_data()
            
            # Copy to React public directory
            import shutil
            import os
            
            react_public = os.path.join(os.path.dirname(__file__), 'public')
            if os.path.exists(react_public):
                shutil.copy2(filename, os.path.join(react_public, 'comprehensive_exoplanets.json'))
                print("📁 Data copied to React public directory")
            
            print(f"\n🎉 Successfully scraped {len(exoplanets)} exoplanets!")
            print("📊 Data includes:")
            print(f"  - Planet names and classifications")
            print(f"  - Physical properties (radius, mass, density)")
            print(f"  - Orbital characteristics")
            print(f"  - Atmospheric properties")
            print(f"  - Habitable zone status")
            print(f"  - Discovery methods")
            
        else:
            print("❌ No exoplanets found")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
