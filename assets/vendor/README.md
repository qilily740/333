Local ebook parsing dependencies (loaded only when needed):

- `fflate/fflate.min.js`: fflate 0.8.2 UMD build, MIT. Source: https://github.com/101arrowz/fflate. License is retained in `fflate/LICENSE`.
- `pdfjs/pdf.mjs` and `pdfjs/pdf.worker.mjs`: PDF.js 4.10.38, `pdfjs-dist` legacy builds, Apache-2.0. Source: https://github.com/mozilla/pdf.js. License is retained in `pdfjs/LICENSE`.
- `pdfjs/cmaps/` and `pdfjs/standard_fonts/`: matching PDF.js package resources, including their supplied license files. These support local extraction of CJK and standard-font PDFs.

The distributions are unmodified. No CDN request is required to import a book. The reader extracts text into Iris paper pages; it does not execute imported ebook scripts or render imported HTML.

### Leaflet 1.9.4

`leaflet/leaflet.js` and `leaflet/leaflet.css` are the official 1.9.4 distribution from https://unpkg.com/leaflet@1.9.4/dist/ . The BSD 2-Clause license is included at `leaflet/LICENSE`. Loaded only when the shared-travel map opens; custom SVG icons avoid loading external marker assets.

Shared-travel maps use manually triggered Photon searches (https://github.com/komoot/photon), cached during the session and throttled to at most one request per second, and visible OpenStreetMap tiles with attribution. No map prefetching, bulk search or generated coordinates. Endpoints can be changed through `settings.travelMapSearchUrl` and `settings.travelMapTileUrl` for a private or alternative service. Public services are best effort; search and tile failures remain visible without manufacturing a map or location.

### Unicode CLDR 48 currency data

`scripts/travel-currency.js` embeds territory legal-tender histories and currency decimal precision derived from CLDR supplemental currencyData: https://github.com/unicode-org/cldr-json/blob/main/cldr-json/cldr-core/supplemental/currencyData.json . Territory order is preserved for the default local currency; dates filter historic currencies. The Unicode license is retained in `unicode-cldr/LICENSE`. Runtime currency lookup is local and does not request a CDN.
