'use client';

import { useRef, useEffect, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface MapViewProps {
  center: { lat: number; lng: number };
  geojson: GeoJSON.FeatureCollection;
}

export default function MapView({ center, geojson }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize map once on mount
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    try {
      const map = new maplibregl.Map({
        container: containerRef.current,
        style: {
          version: 8,
          sources: {
            'carto-light': {
              type: 'raster',
              tiles: [
                'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
                'https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
                'https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
              ],
              tileSize: 256,
              attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            },
          },
          layers: [
            {
              id: 'carto-light',
              type: 'raster',
              source: 'carto-light',
              minzoom: 0,
              maxzoom: 19,
            },
          ],
        },
        center: [center.lng, center.lat],
        zoom: 11.5,
      });

      mapRef.current = map;
      map.addControl(new maplibregl.NavigationControl(), 'bottom-right');

      map.on('load', () => {
        setReady(true);
      });

      map.on('error', (e) => {
        console.error('MapLibre error:', e);
        setError('Map tiles failed to load.');
      });
    } catch (e) {
      console.error('MapLibre init error:', e);
      setError(`Map initialization failed: ${e}`);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update data source when geojson changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;

    const source = map.getSource('incidents') as maplibregl.GeoJSONSource | undefined;

    if (source) {
      source.setData(geojson);
    } else {
      map.addSource('incidents', { type: 'geojson', data: geojson });

      map.addLayer({
        id: 'incidents-heat',
        type: 'heatmap',
        source: 'incidents',
        paint: {
          'heatmap-weight': 1,
          'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 9, 0.5, 12, 2, 15, 4],
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(0,0,0,0)',
            0.15, 'rgba(59,130,246,0.4)',
            0.35, 'rgba(96,165,250,0.6)',
            0.5, 'rgba(251,191,36,0.7)',
            0.7, 'rgba(245,158,11,0.8)',
            1, 'rgba(239,68,68,0.85)',
          ],
          'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 9, 10, 12, 20, 15, 35],
          'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 13, 0.8, 16, 0.4],
        },
      });

      map.addLayer({
        id: 'incidents-points',
        type: 'circle',
        source: 'incidents',
        minzoom: 13,
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 13, 2, 17, 7],
          'circle-color': 'rgb(59,130,246)',
          'circle-opacity': ['interpolate', ['linear'], ['zoom'], 13, 0, 14, 0.6],
          'circle-stroke-width': 0.5,
          'circle-stroke-color': '#fff',
        },
      });
    }
  }, [geojson, ready]);

  if (error) {
    return (
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6' }}>
        <p style={{ fontSize: 14, color: '#ef4444' }}>{error}</p>
      </div>
    );
  }

  return (
    <>
      <div
        ref={containerRef}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' }}
      />
      {!ready && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6' }}>
          <p style={{ fontSize: 14, color: '#9ca3af' }}>Loading map...</p>
        </div>
      )}
    </>
  );
}
