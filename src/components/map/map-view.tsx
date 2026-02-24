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

  // Initialize map — runs once on mount
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    try {
      const map = new maplibregl.Map({
        container: containerRef.current,
        style: {
          version: 8,
          sources: {
            'osm-tiles': {
              type: 'raster',
              tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
              tileSize: 256,
              attribution: '&copy; OpenStreetMap contributors',
            },
          },
          layers: [
            {
              id: 'osm-tiles',
              type: 'raster',
              source: 'osm-tiles',
              minzoom: 0,
              maxzoom: 19,
            },
          ],
        },
        center: [center.lng, center.lat],
        zoom: 12.5,
      });

      mapRef.current = map;

      map.addControl(new maplibregl.NavigationControl(), 'bottom-right');

      map.on('load', () => {
        setReady(true);
      });

      map.on('error', (e) => {
        console.error('MapLibre error:', e);
        setError('Map failed to load. Check browser console for details.');
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
      map.addSource('incidents', {
        type: 'geojson',
        data: geojson,
      });

      map.addLayer({
        id: 'incidents-heat',
        type: 'heatmap',
        source: 'incidents',
        paint: {
          'heatmap-weight': 1,
          'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 10, 1, 15, 3],
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(0,0,0,0)',
            0.1, 'rgb(59,130,246)',
            0.3, 'rgb(96,165,250)',
            0.5, 'rgb(251,191,36)',
            0.7, 'rgb(245,158,11)',
            1, 'rgb(239,68,68)',
          ],
          'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 10, 15, 14, 25, 16, 40],
          'heatmap-opacity': 0.75,
        },
      });

      map.addLayer({
        id: 'incidents-points',
        type: 'circle',
        source: 'incidents',
        minzoom: 14,
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 14, 2, 18, 6],
          'circle-color': 'rgb(59,130,246)',
          'circle-opacity': 0.6,
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
