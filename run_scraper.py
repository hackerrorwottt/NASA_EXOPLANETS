#!/usr/bin/env python3
"""
NASA Exoplanets Scraper Runner
This script runs the NASA exoplanets scraper and prepares the data for the React app.
"""

import subprocess
import sys
import os
import json
from pathlib import Path

def run_scraper():
    """Run the NASA exoplanets scraper"""
    print("🚀 Starting NASA Exoplanets Scraper...")
    
    # Get the directory where this script is located
    script_dir = Path(__file__).parent
    scraper_file = script_dir / "nasa_exoplanets_scraper.py"
    
    if not scraper_file.exists():
        print(f"❌ Scraper file not found: {scraper_file}")
        return False
    
    try:
        # Run the scraper
        result = subprocess.run([
            sys.executable, str(scraper_file)
        ], capture_output=True, text=True, cwd=script_dir)
        
        if result.returncode == 0:
            print("✅ Scraper completed successfully!")
            print("📄 Output:", result.stdout)
            
            # Check if results.json was created
            results_file = script_dir / "results.json"
            if results_file.exists():
                print(f"📊 Results saved to: {results_file}")
                
                # Copy results.json to public directory for React app
                public_dir = script_dir / "public"
                if public_dir.exists():
                    import shutil
                    shutil.copy2(results_file, public_dir / "results.json")
                    print("📁 Results copied to public directory for React app")
                else:
                    print("⚠️  Public directory not found, results.json not copied")
                
                return True
            else:
                print("❌ results.json not found after scraping")
                return False
        else:
            print("❌ Scraper failed!")
            print("Error:", result.stderr)
            return False
            
    except Exception as e:
        print(f"❌ Error running scraper: {e}")
        return False

def check_dependencies():
    """Check if required Python packages are installed"""
    required_packages = ['requests', 'beautifulsoup4']
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        print(f"❌ Missing required packages: {', '.join(missing_packages)}")
        print("📦 Install them with: pip install " + " ".join(missing_packages))
        return False
    
    print("✅ All required packages are installed")
    return True

def main():
    """Main function"""
    print("🌌 NASA Exoplanets Scraper Integration")
    print("=" * 50)
    
    # Check dependencies
    if not check_dependencies():
        return
    
    # Run the scraper
    if run_scraper():
        print("\n🎉 Scraping completed successfully!")
        print("🔄 You can now refresh your React app to see the scraped data")
        print("📝 The app will automatically use scraped data if available, or fallback to static data")
    else:
        print("\n❌ Scraping failed. The React app will use fallback data.")

if __name__ == "__main__":
    main()
