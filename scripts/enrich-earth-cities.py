#!/usr/bin/env python3
"""Append GeoNames population and feature code without changing names or coordinates.
Usage: python3 scripts/enrich-earth-cities.py assets/earth-cities.json cities15000.zip
"""
import json
import sys
import zipfile
from pathlib import Path

path = Path(sys.argv[1])
rows = json.loads(path.read_text())
with zipfile.ZipFile(sys.argv[2]) as archive:
    metadata = {}
    for line in archive.open('cities15000.txt'):
        parts = line.decode('utf-8').rstrip('\n').split('\t')
        metadata[parts[0]] = (float(parts[4]), float(parts[5]), int(parts[14]), parts[7])
for row in rows:
    lat, lon, population, feature = metadata[str(row[0])]
    if abs(row[4] - lat) > 0.000001 or abs(row[5] - lon) > 0.000001:
        raise ValueError('Coordinate mismatch for ' + str(row[0]))
    row[7:] = [population, feature]
path.write_text(json.dumps(rows, ensure_ascii=False, separators=(',', ':')))
print(f'Enriched {len(rows)} city records')
