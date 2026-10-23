import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { MapPin } from 'lucide-react';

interface MarkerData {
  id: string;
  lat: number;
  lng: number;
  name: string;
  category?: string;
}

interface MapComponentProps {
  markers?: MarkerData[];
  center?: [number, number]; // [lat, lng]
  zoom?: number;
  className?: string;
  interactive?: boolean;
}

// Cinematic Dark Style for Google Maps
const GOOGLE_MAPS_NIGHT_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#0b1120" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#070b14" }, { weight: 3 }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#f59e0b" }, { weight: 1.5 }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#cbd5e1" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#0f172a" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#1e293b" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#0f172a" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#ca8a04" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#fef08a" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#1e294b" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#060913" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#64748b" }],
  },
];

export interface GoogleMapsApi {
  maps: {
    Map: new (element: HTMLElement, options: Record<string, unknown>) => {
      setCenter: (latLng: { lat: number; lng: number }) => void;
      setZoom: (zoom: number) => void;
    };
    Marker: new (options: Record<string, unknown>) => {
      addListener: (event: string, handler: () => void) => void;
    };
    InfoWindow: new (options: { content: string }) => {
      open: (options: { anchor: unknown; map: unknown }) => void;
      close: () => void;
    };
    MapTypeControlStyle: { DROPDOWN_MENU: number };
    ControlPosition: { TOP_RIGHT: number };
    SymbolPath: { CIRCLE: number };
  };
}

interface WindowWithGoogle {
  google?: GoogleMapsApi;
}

// Helper to load Google Maps JS API script cleanly
function loadGoogleMaps(apiKey: string): Promise<GoogleMapsApi> {
  const win = window as unknown as WindowWithGoogle;
  if (win.google?.maps) {
    return Promise.resolve(win.google);
  }

  return new Promise((resolve, reject) => {
    const existing = document.getElementById('google-maps-js');
    if (existing) {
      existing.addEventListener('load', () => {
        if (win.google) resolve(win.google);
        else reject(new Error('Google Maps script loaded without window.google'));
      });
      existing.addEventListener('error', (e) => reject(e));
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-maps-js';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (win.google) resolve(win.google);
      else reject(new Error('Google Maps script loaded without window.google'));
    };
    script.onerror = (err) => reject(err);
    document.head.appendChild(script);
  });
}

export const MapComponent: React.FC<MapComponentProps> = ({
  markers = [],
  center = [18.93, 72.83],
  zoom = 12,
  className = 'h-72 w-full rounded-2xl',
  interactive = true,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [mapType, setMapType] = useState<'google' | 'osm'>('google');

  const googleApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyA7pXqfj071eC94R8h_h8yGuvhYGEdNcpg';

  useEffect(() => {
    if (!mapContainer.current) return;
    let isMounted = true;

    // Load Google Maps API
    if (googleApiKey && googleApiKey.trim() !== '') {
      loadGoogleMaps(googleApiKey)
        .then((google) => {
          if (!isMounted || !mapContainer.current) return;

          const map = new google.maps.Map(mapContainer.current, {
            center: { lat: center[0], lng: center[1] },
            zoom: zoom,
            styles: GOOGLE_MAPS_NIGHT_STYLE,
            disableDefaultUI: !interactive,
            zoomControl: interactive,
            mapTypeControl: interactive,
            mapTypeControlOptions: {
              style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
              position: google.maps.ControlPosition.TOP_RIGHT,
            },
            streetViewControl: interactive,
            fullscreenControl: interactive,
          });

          // Add Markers
          markers.forEach((m) => {
            const marker = new google.maps.Marker({
              position: { lat: m.lat, lng: m.lng },
              map: map,
              title: m.name,
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 7,
                fillColor: '#f59e0b',
                fillOpacity: 1,
                strokeColor: '#070b14',
                strokeWeight: 2,
              },
            });

            const infoWindow = new google.maps.InfoWindow({
              content: `
                <div style="color: #0b1120; font-family: sans-serif; padding: 4px; min-width: 140px;">
                  <h4 style="font-weight: bold; margin: 0 0 4px 0; font-size: 13px; color: #b45309;">${m.name}</h4>
                  ${m.category ? `<span style="font-size: 10px; text-transform: uppercase; background: #fef3c7; color: #92400e; padding: 2px 6px; border-radius: 4px; font-weight: 600;">${m.category}</span>` : ''}
                  <div style="margin-top: 6px;">
                    <a href="/listings/${m.id}" style="color: #d97706; font-size: 11px; font-weight: bold; text-decoration: underline;">View Details</a>
                  </div>
                </div>
              `,
            });

            marker.addListener('click', () => {
              infoWindow.open({
                anchor: marker,
                map,
              });
            });
          });

          setMapType('google');
        })
        .catch((err) => {
          console.warn('Google Maps load issue, falling back to MapLibre dark tiles:', err);
          initMapLibreFallback();
        });
    } else {
      initMapLibreFallback();
    }

    function initMapLibreFallback() {
      if (!mapContainer.current || !isMounted) return;
      setMapType('osm');

      const map = new maplibregl.Map({
        container: mapContainer.current,
        style: {
          version: 8,
          sources: {
            'osm-tiles': {
              type: 'raster',
              tiles: [
                'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
                'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
              ],
              tileSize: 256,
              attribution: '&copy; OpenStreetMap &copy; CARTO',
            },
          },
          layers: [
            {
              id: 'osm-tiles-layer',
              type: 'raster',
              source: 'osm-tiles',
              minzoom: 0,
              maxzoom: 19,
            },
          ],
        },
        center: [center[1], center[0]],
        zoom: zoom,
        interactive: interactive,
      });

      if (interactive) {
        map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right');
      }

      markers.forEach((m) => {
        const el = document.createElement('div');
        el.className = 'w-6 h-6 rounded-full bg-amber-500 border-2 border-slate-950 shadow-lg shadow-amber-500/50 flex items-center justify-center cursor-pointer';
        el.innerHTML = '<div class="w-2 h-2 rounded-full bg-slate-950"></div>';

        const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`
          <div class="text-xs font-sans">
            <p class="font-bold text-amber-400">${m.name}</p>
            ${m.category ? `<p class="text-[10px] uppercase text-slate-300">${m.category}</p>` : ''}
            <a href="/listings/${m.id}" class="inline-block mt-1 text-[11px] text-amber-300 underline font-medium">View Place</a>
          </div>
        `);

        new maplibregl.Marker({ element: el })
          .setLngLat([m.lng, m.lat])
          .setPopup(popup)
          .addTo(map);
      });
    }

    return () => {
      isMounted = false;
    };
  }, [center[0], center[1], zoom, markers.length, googleApiKey]);

  return (
    <div className="relative overflow-hidden border border-white/10 shadow-2xl rounded-2xl group">
      <div ref={mapContainer} className={className} />

      {/* Engine Status Badge */}
      <div className="absolute bottom-2 left-2 pointer-events-none z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-950/80 backdrop-blur-md border border-white/10 text-[10px] font-medium text-slate-300">
        <MapPin className="w-3 h-3 text-amber-400" />
        <span>{mapType === 'google' ? 'Google Maps Platform Active' : 'OpenStreetMap Engine'}</span>
      </div>
    </div>
  );
};
