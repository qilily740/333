# Earth resources

Downloaded 2026-10-21. No runtime map service, CDN library, or geocoding key.

## Current style: Natural Earth grayscale paper globe

- Local file: `earth-paper.svg` (2048 × 1024 equirectangular atlas).
- Original land polygons: https://naturalearth.s3.amazonaws.com/110m_physical/ne_110m_land.zip
- Dataset: https://www.naturalearthdata.com/downloads/110m-physical-vectors/110m-land/
- Terms: https://www.naturalearthdata.com/about/terms-of-use/ — public domain.
- Credit: Made with Natural Earth.
- Changes: projected 127 land polygon records to a local SVG, recolored oceans off-white (#f7f7f7) and land grey (#9b9b9b); no country boundary claims, external fonts, scripts, or embedded external images.
- Rebuild: `python3 scripts/build-earth-paper.py ne_110m_land.zip assets/earth-paper.svg`. The builder uses only Python standard-library modules.
- Natural Earth 1:110m is a generalized small-scale geography suitable for a globe; very small islands and detailed coasts may be omitted. City markers continue to use independent GeoNames coordinates.

## Previous satellite style: NASA Blue Marble

- Local file: `earth-blue-marble.jpg` (2048 × 1024, original JPEG, no modification).
- Original: https://eoimages.gsfc.nasa.gov/images/imagerecords/57000/57730/land_ocean_ice_2048.jpg
- Collection/context: https://visibleearth.nasa.gov/images/57723/the-blue-marble
- Credit: NASA / Visible Earth, Blue Marble (land surface, ocean color, sea ice).
- NASA image use guidance: https://www.nasa.gov/nasa-brand-center/images-and-media/
- NASA-produced imagery is generally not subject to US copyright; retain credit. No NASA logos or endorsement claims are used. This is a global composite, not a live satellite feed.

## GeoNames cities

- Local file: `earth-cities.json`.
- Original: https://download.geonames.org/export/dump/cities15000.zip
- Documentation: https://download.geonames.org/export/dump/readme.txt
- Attribution: GeoNames, https://www.geonames.org/ — Creative Commons Attribution 4.0: https://creativecommons.org/licenses/by/4.0/
- Changes: converted the cities15000 text extract into compact JSON; retained ID, primary name, ISO country code, admin1 code, latitude, longitude, primary/ASCII names and Chinese alternate names; removed other columns and alternate languages. 34,174 records.
- Schema per row: `[geonameId, name, countryCode, admin1Code, latitude, longitude, aliases]`.
- Exact unique aliases are automatically located. Ambiguous names require a user-selected ID. Unmatched places remain unlocated. This city subset is not exhaustive and does not establish historical geography.

## Boarding pass artwork

- Local file: `earth-boarding-pass.webp`.
- Supplied by the user from Desktop `ChatGPT 图像 2026年10月21日 19_46_45.png`, explicitly requested for this ticket UI. Copied without modifying image pixels.
- Cities and ticket fields are HTML overlays, not baked into the image.

## City alias expansion

- Added 3,561 Simplified Chinese aliases from existing GeoNames names using the system Foundation/ICU Traditional-Simplified transform. Original names, IDs and WGS84 coordinates are retained.
- Reproducible tool: `scripts/build-earth-city-aliases.swift`; no runtime translation service or new key required.
- ISO country/region fields filter candidates in the local dataset; model-supplied coordinates are still ignored.

## Same-name city metadata

- Appended GeoNames population and feature code to each record using the original official cities15000 archive; all IDs and coordinates were checked against that archive.
- Row schema is now `[id, name, country, admin1, lat, lon, aliases, population, featureCode]`.
- Reproducible tool: `scripts/enrich-earth-cities.py`. Names/aliases and existing IDs remain unchanged.
- Unqualified cross-country names can default to a clearly dominant administrative city only when no explicit country or conflicting nearby country anchors apply: at least 100,000 population, district-seat status or higher, larger administrative rank and at least four times every competing population. Explicit country and saved manual selection take precedence.

## Persisted route geocoding

Unique matches and explicit candidate choices save their GeoNames ID, country, admin1 and coordinates per route endpoint. Model-provided coordinates are never stored. Ambiguous choices are requested only during explicit generation or city-location completion, through the configured Experiences API. Playback and review use saved selections. Prompt: `docs/earth-city-location-prompt.md`. No additional map-service account/key is required.
