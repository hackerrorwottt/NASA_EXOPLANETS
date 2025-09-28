# NASA Exoplanets Research App

A professional React application that displays NASA exoplanet data with WebGL background effects and gradient text animations. The app integrates with a Python web scraper to fetch real-time data from NASA's exoplanet archive.

## Features

- 🌌 **WebGL Orb Background** - Interactive 3D orb with hover effects
- 🪐 **Exoplanet Database** - Comprehensive exoplanet information
- 🎨 **Gradient Text Animations** - Beautiful animated text effects
- 🔍 **Python Web Scraping** - Real-time data from NASA's website
- 📱 **Responsive Design** - Works on all devices
- 🌍 **Habitable Zone Indicators** - Visual habitable status

## Setup

### 1. Install Python Dependencies

```bash
pip install requests beautifulsoup4
```

### 2. Run the Python Scraper

```bash
# Run the scraper directly
python nasa_exoplanets_scraper.py

# Or use the helper script
python run_scraper.py
```

### 3. Install React Dependencies

```bash
npm install
```

### 4. Start the React App

```bash
npm start
```

## How It Works

### Python Scraper Integration

The app automatically tries to load data from the Python scraper:

1. **Scraper runs** → Fetches data from `https://science.nasa.gov/exoplanets/`
2. **Data processing** → Extracts exoplanet information from scraped content
3. **JSON output** → Saves results to `results.json`
4. **React integration** → App loads scraped data or falls back to static data

### Data Processing

The React app processes scraped data by:

- **Parsing headings and paragraphs** for exoplanet mentions
- **Extracting scientific data** (mass, radius, temperature, distance)
- **Determining habitable status** based on planet characteristics
- **Creating descriptions** from scraped content

### Fallback System

If scraped data isn't available, the app uses comprehensive fallback data with:

- 8 detailed exoplanets
- Complete scientific measurements
- Professional descriptions
- Habitable zone classifications

## File Structure

```
space_research_app/
├── src/
│   ├── App.js              # Main React component
│   ├── App.css             # Styling
│   ├── Orb.js              # WebGL orb component
│   ├── GradientText.js     # Animated text component
│   └── GradientText.css    # Text animations
├── public/
│   └── results.json        # Scraped data (generated)
├── nasa_exoplanets_scraper.py  # Python scraper
├── run_scraper.py          # Scraper runner script
└── results.html            # Scraper output viewer
```

## Exoplanet Data

The app displays detailed information for each exoplanet:

- **Name** - Official exoplanet designation
- **Type** - Super Earth, Terrestrial, Hot Jupiter, etc.
- **Distance** - Light years from Earth
- **Mass** - Relative to Earth (M⊕) or Jupiter (MJ)
- **Radius** - Relative to Earth (R⊕) or Jupiter (RJ)
- **Temperature** - Surface temperature in Kelvin
- **Discovery Year** - When the planet was found
- **Habitable Status** - Whether it's in the habitable zone
- **Description** - Scientific description from NASA

## Customization

### Adding More Exoplanets

Edit the `exoplanetKeywords` array in `App.js`:

```javascript
const exoplanetKeywords = [
  'Kepler-452b', 'Proxima Centauri b', 'TRAPPIST-1e',
  // Add more planet names here
];
```

### Modifying Scraper

The Python scraper can be customized to:

- Target different NASA pages
- Extract additional data fields
- Modify the parsing logic
- Change output format

### Styling Changes

- **Colors**: Modify gradient colors in `GradientText` components
- **Layout**: Adjust grid layouts in `App.css`
- **Animations**: Customize hover effects and transitions

## Technical Details

### WebGL Orb

- Uses OGL library for WebGL rendering
- GLSL shaders for advanced visual effects
- Mouse interaction and hover animations
- Fallback CSS orb if WebGL fails

### Data Extraction

- Regex patterns for scientific measurements
- Text parsing for planet characteristics
- Intelligent fallback for missing data
- Real-time data processing

### Performance

- Lazy loading of scraped data
- Efficient React state management
- Optimized CSS animations
- Responsive image handling

## Troubleshooting

### Scraper Issues

```bash
# Check if packages are installed
pip list | grep -E "(requests|beautifulsoup4)"

# Run scraper with verbose output
python nasa_exoplanets_scraper.py --verbose
```

### React App Issues

```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Data Loading

- Check if `results.json` exists in the `public` directory
- Verify the scraper ran successfully
- Check browser console for data loading errors

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with both scraped and fallback data
5. Submit a pull request

## License

This project is open source and available under the MIT License.# NASA_EXOPLANETS
