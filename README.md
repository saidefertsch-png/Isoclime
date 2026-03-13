# IsoClime 🌍

> **Detect. Deflect. Protect.**  
> Bringing Microclimates into Focus

IsoClime is a Y2K retro-futuristic interactive web app for microclimate analysis. It helps users identify environmental risks in their neighborhood and receive AI-powered recommendations.

## Features

- 🗺️ **Interactive Leaflet Map** – Browse zones with glowing risk indicators
- 🤖 **AI Climate Diagnosis** – 5-question questionnaire to profile your environment
- 📊 **Risk Dashboard** – Animated gauges for Mold Risk, Heat Retention, and Humidity
- ⚡ **Personalized Recommendations** – Immediate, low-cost, and long-term action plans
- 🎨 **Y2K Aesthetic** – Chrome metallic effects, glass panels, teal/aqua gradients

## Screens

| Screen | File | Description |
|--------|------|-------------|
| Landing | `index.html` | Logo, tagline, start button |
| Search | `screens/search.html` | Leaflet map + neighborhood search |
| Diagnosis | `screens/diagnosis.html` | Multi-step climate questionnaire |
| Processing | `screens/processing.html` | AI analysis animation |
| Results | `screens/results.html` | Dashboard with gauges and recommendations |

## Usage

Simply open `index.html` in a modern web browser. No build step required — all dependencies are loaded via CDN.

```bash
# Using Python's built-in server (optional)
python3 -m http.server 8080
# Then open http://localhost:8080
```

## Tech Stack

- HTML5 / CSS3 (custom Y2K design system)
- Vanilla JavaScript (ES6+)
- [Leaflet.js](https://leafletjs.com/) for interactive maps
- [Google Fonts](https://fonts.google.com/) – Orbitron, Share Tech Mono, Rajdhani
- SessionStorage for cross-page state management
