import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { MapPin } from 'lucide-react';
import { useTheme } from '../features/theme';

export interface MarkerData {
  id: string;
  lat: number;
  lng: number;
  name: string;
  category?: string;
}

export interface MapComponentProps {
  markers?: MarkerData[];
  center?: [number, number]; // [lat, lng]
  zoom?: number;
  className?: string;
  interactive?: boolean;
  onMarkerClick?: (marker: MarkerData) => void;
}

// Cinematic Dark Style for Google Maps
export const GOOGLE_MAPS_NIGHT_STYLE = [
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

// Sunlight / Daylight Warm Style for Google Maps in Light Mode
export const GOOGLE_MAPS_LIGHT_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#f8fafc" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#ffffff" }, { weight: 3 }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#334155" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#b45309" }, { weight: 1.5 }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#64748b" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#e2e8f0" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#ffffff" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#e2e8f0" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#fed7aa" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9a3412" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#f1f5f9" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#bfdbfe" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#2563eb" }],
  },
];

export interface GoogleMapsApi {
  maps: {
    Map: new (element: HTMLElement, options: Record<string, unknown>) => {
      setCenter: (latLng: { lat: number; lng: number }) => void;
      setZoom: (zoom: number) => void;
      setOptions: (options: Record<string, unknown>) => void;
    };
    Marker: new (options: Record<string, unknown>) => {
      addListener: (event: string, handler: () => void) => void;
      setIcon: (icon: Record<string, unknown>) => void;
      setMap: (map: unknown) => void;
    };
    InfoWindow: new (options: { content: string }) => {
      open: (options: { anchor: unknown; map: unknown }) => void;
      close: () => void;
      setContent: (content: string) => void;
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

export function getMapLibreStyle(isDark: boolean): maplibregl.StyleSpecification {
  return {
    version: 8,
    sources: {
      'osm-tiles': {
        type: 'raster',
        tiles: isDark
          ? [
              'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
              'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
              'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
              'https://d.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
            ]
          : [
              'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
              'https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
              'https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
              'https://d.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
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
  };
}

export function createGoogleInfoWindowContent(m: MarkerData, isDark: boolean): string {
  return `
    <div style="color: ${isDark ? '#f8fafc' : '#1e293b'}; background: ${isDark ? '#0f172a' : '#ffffff'}; font-family: sans-serif; padding: 6px 8px; border-radius: 8px; min-width: 140px;">
      <h4 style="font-weight: bold; margin: 0 0 4px 0; font-size: 13px; color: ${isDark ? '#fbbf24' : '#d97706'};">${m.name}</h4>
      ${m.category ? `<span style="font-size: 10px; text-transform: uppercase; background: ${isDark ? '#78350f' : '#fef3c7'}; color: ${isDark ? '#fef3c7' : '#92400e'}; padding: 2px 6px; border-radius: 4px; font-weight: 600;">${m.category}</span>` : ''}
      <div style="margin-top: 6px;">
        <a href="/listings/${m.id}" style="color: ${isDark ? '#f59e0b' : '#d97706'}; font-size: 11px; font-weight: bold; text-decoration: underline;">View Details</a>
      </div>
    </div>
  `;
}

export function createMapLibrePopupContent(m: MarkerData): string {
  return `
    <div class="text-xs font-sans">
      <p class="font-bold text-sunset-accent text-[13px]">${m.name}</p>
      ${m.category ? `<p class="text-[10px] uppercase font-semibold text-sunset-muted mt-0.5">${m.category}</p>` : ''}
      <a href="/listings/${m.id}" class="inline-block mt-1.5 text-[11px] text-sunset-accent hover:underline font-semibold">View Place &rarr;</a>
    </div>
  `;
}

export const MapComponent: React.FC<MapComponentProps> = ({
  markers = [],
  center = [18.93, 72.83],
  zoom = 12,
  className = 'h-72 w-full rounded-2xl',
  interactive = true,
  onMarkerClick,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [mapType, setMapType] = useState<'google' | 'osm'>('google');

  // Reactively track theme (light vs dark)
  let resolvedTheme = 'dark';
  try {
    const themeContext = useTheme();
    resolvedTheme = themeContext.resolvedTheme;
  } catch {
    if (typeof document !== 'undefined') {
      resolvedTheme = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    }
  }
  const isDark = resolvedTheme === 'dark';

  const googleApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyA7pXqfj071eC94R8h_h8yGuvhYGEdNcpg';

  // Instance refs to preserve map across state changes and update reactively
  const googleMapRef = useRef<any>(null);
  const googleMarkersRef = useRef<{ marker: any; infoWindow: any; data: MarkerData }[]>([]);
  const maplibreMapRef = useRef<maplibregl.Map | null>(null);
  const maplibreMarkersRef = useRef<{ marker: maplibregl.Marker; el: HTMLDivElement; popup: maplibregl.Popup; data: MarkerData }[]>([]);

  // 1. Initial map mount and recreation if container changes
  useEffect(() => {
    if (!mapContainer.current) return;
    let isMounted = true;

    // Load Google Maps API
    if (googleApiKey && googleApiKey.trim() !== '') {
      loadGoogleMaps(googleApiKey)
        .then((google) => {
          if (!isMounted || !mapContainer.current) return;

          // Clean up any existing MapLibre
          if (maplibreMapRef.current) {
            maplibreMapRef.current.remove();
            maplibreMapRef.current = null;
          }

          const map = new google.maps.Map(mapContainer.current, {
            center: { lat: center[0], lng: center[1] },
            zoom: zoom,
            styles: isDark ? GOOGLE_MAPS_NIGHT_STYLE : GOOGLE_MAPS_LIGHT_STYLE,
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

          googleMapRef.current = map;
          googleMarkersRef.current = [];

          // Add Markers
          markers.forEach((m) => {
            const marker = new google.maps.Marker({
              position: { lat: m.lat, lng: m.lng },
              map: map,
              title: m.name,
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 7,
                fillColor: isDark ? '#f59e0b' : '#ea580c',
                fillOpacity: 1,
                strokeColor: isDark ? '#070b14' : '#ffffff',
                strokeWeight: 2,
              },
            });

            const infoWindow = new google.maps.InfoWindow({
              content: createGoogleInfoWindowContent(m, isDark),
            });

            marker.addListener('click', () => {
              infoWindow.open({
                anchor: marker,
                map,
              });
              onMarkerClick?.(m);
            });

            googleMarkersRef.current.push({ marker, infoWindow, data: m });
          });

          setMapType('google');
        })
        .catch((err) => {
          console.warn('Google Maps load issue, falling back to MapLibre tiles:', err);
          initMapLibreFallback();
        });
    } else {
      initMapLibreFallback();
    }

    function initMapLibreFallback() {
      if (!mapContainer.current || !isMounted) return;
      setMapType('osm');

      if (maplibreMapRef.current) {
        maplibreMapRef.current.remove();
        maplibreMapRef.current = null;
      }

      const map = new maplibregl.Map({
        container: mapContainer.current,
        style: getMapLibreStyle(isDark),
        center: [center[1], center[0]],
        zoom: zoom,
        interactive: interactive,
      });

      maplibreMapRef.current = map;
      maplibreMarkersRef.current = [];

      if (interactive) {
        map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right');
      }

      markers.forEach((m) => {
        const el = document.createElement('div');
        el.className = isDark
          ? 'w-6 h-6 rounded-full bg-amber-500 border-2 border-slate-950 shadow-lg shadow-amber-500/50 flex items-center justify-center cursor-pointer transition-transform hover:scale-110'
          : 'w-6 h-6 rounded-full bg-amber-500 border-2 border-white shadow-lg shadow-amber-600/40 flex items-center justify-center cursor-pointer transition-transform hover:scale-110';
        el.addEventListener('click', () => {
          onMarkerClick?.(m);
        });

        const popup = new maplibregl.Popup({ offset: 25 }).setHTML(createMapLibrePopupContent(m));

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([m.lng, m.lat])
          .setPopup(popup)
          .addTo(map);

        maplibreMarkersRef.current.push({ marker, el, popup, data: m });
      });
    }

    return () => {
      isMounted = false;
      if (maplibreMapRef.current) {
        maplibreMapRef.current.remove();
        maplibreMapRef.current = null;
      }
      googleMapRef.current = null;
      googleMarkersRef.current = [];
      maplibreMarkersRef.current = [];
    };
  }, [googleApiKey, markers.length]);

  // 2. Reactively switch Map styles when user switches between Light & Dark mode
  useEffect(() => {
    // A. Update Google Maps styles
    if (googleMapRef.current) {
      googleMapRef.current.setOptions({
        styles: isDark ? GOOGLE_MAPS_NIGHT_STYLE : GOOGLE_MAPS_LIGHT_STYLE,
      });

      googleMarkersRef.current.forEach(({ marker, infoWindow, data }) => {
        marker.setIcon({
          path: (window as unknown as WindowWithGoogle).google?.maps?.SymbolPath?.CIRCLE ?? 0,
          scale: 7,
          fillColor: isDark ? '#f59e0b' : '#ea580c',
          fillOpacity: 1,
          strokeColor: isDark ? '#070b14' : '#ffffff',
          strokeWeight: 2,
        });

        infoWindow.setContent(createGoogleInfoWindowContent(data, isDark));
      });
    }

    // B. Update MapLibre GL JS Carto Tiles
    if (maplibreMapRef.current) {
      maplibreMapRef.current.setStyle(getMapLibreStyle(isDark));

      maplibreMarkersRef.current.forEach(({ el }) => {
        el.className = isDark
          ? 'w-6 h-6 rounded-full bg-amber-500 border-2 border-slate-950 shadow-lg shadow-amber-500/50 flex items-center justify-center cursor-pointer transition-transform hover:scale-110'
          : 'w-6 h-6 rounded-full bg-amber-500 border-2 border-white shadow-lg shadow-amber-600/40 flex items-center justify-center cursor-pointer transition-transform hover:scale-110';
        el.innerHTML = isDark
          ? '<div class="w-2 h-2 rounded-full bg-slate-950"></div>'
          : '<div class="w-2 h-2 rounded-full bg-white"></div>';
      });
    }
  }, [isDark]);

  // 3. Update center and zoom smoothly
  useEffect(() => {
    if (googleMapRef.current) {
      googleMapRef.current.setCenter({ lat: center[0], lng: center[1] });
      googleMapRef.current.setZoom(zoom);
    }
    if (maplibreMapRef.current) {
      maplibreMapRef.current.flyTo({ center: [center[1], center[0]], zoom });
    }
  }, [center[0], center[1], zoom]);

  // 4. Resize map smoothly on container size changes
  useEffect(() => {
    if (!mapContainer.current) return;
    const observer = new ResizeObserver(() => {
      if (maplibreMapRef.current) {
        maplibreMapRef.current.resize();
      }
    });
    observer.observe(mapContainer.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className={`relative overflow-hidden border border-sunset-border shadow-2xl rounded-2xl group transition-colors duration-300 ${className || 'h-64 w-full'}`}>
      <div ref={mapContainer} className="w-full h-full" />

      {/* Engine Status Badge */}
      <div className="absolute bottom-2 left-2 pointer-events-none z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-sunset-surface/90 backdrop-blur-md border border-sunset-border text-[10px] font-medium text-sunset-text shadow-sm transition-colors duration-300">
        <MapPin className="w-3 h-3 text-sunset-accent" />
        <span>{mapType === 'google' ? 'Google Maps Platform Active' : 'OpenStreetMap Engine'}</span>
      </div>
    </div>
  );
};
