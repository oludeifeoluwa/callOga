import { useEffect, useRef, useState } from 'react';
import {
  Map as MapInstance,
  Marker,
  Popup,
  NavigationControl,
  LngLatBounds,
  type StyleSpecification,
  type MapMouseEvent
} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Layers, MapPin, LocateFixed } from 'lucide-react';

export type Pin = {
  id: string;
  latitude: number;
  longitude: number;
  label: string;
  live?: boolean;
  accuracy?: number;
  heading?: number | null;
};

export function MapView({
  pins,
  token,
  onPick,
  center,
  zoom = 12
}: {
  pins: Pin[];
  token?: string;
  onPick?: (lat: number, lng: number) => void;
  center?: [number, number];
  zoom?: number;
}) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<MapInstance | null>(null);
  const markers = useRef<Marker[]>([]);
  const [mapStyle, setMapStyle] = useState<'streets' | 'satellite' | 'dark'>('streets');
  const [error, setError] = useState('');
  const [locating, setLocating] = useState(false);
  const [camera, setCamera] = useState<[number, number] | undefined>(center);
  const initialCamera = center ?? camera ?? (pins[0] ? [pins[0].longitude, pins[0].latitude] as [number, number] : undefined);
  const pick = useRef(onPick);
  pick.current = onPick;

  function useCurrentLocation() {
    setError('');
    if (!window.isSecureContext) {
      setError('Location needs a secure connection. Use localhost here or HTTPS on your phone.');
      return;
    }
    if (!navigator.geolocation) {
      setError('Location is unavailable in this browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const next: [number, number] = [coords.longitude, coords.latitude];
        setCamera(next);
        pick.current?.(coords.latitude, coords.longitude);
        setLocating(false);
      },
      (reason) => {
        setLocating(false);
        setError(reason.code === 1 ? 'Location permission was denied. Allow it in your browser settings and try again.' : 'We could not get your location. You can place the pin on the map instead.');
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );
  }

  useEffect(() => {
    if (!el.current || !initialCamera) return;

    // High definition raster tile sources (Retina 512px with 2x scale or OSM / CartoDB fallback)
    let tiles: string[];
    let maxZoom = 19;
    let attribution = '© OpenStreetMap contributors';

    if (token && mapStyle === 'satellite') {
      tiles = [`https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/tiles/512/{z}/{x}/{y}@2x?access_token=${token}`];
      attribution = '© Mapbox © Maxar';
    } else if (token && mapStyle === 'streets') {
      tiles = [`https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/512/{z}/{x}/{y}@2x?access_token=${token}`];
      attribution = '© Mapbox © OpenStreetMap';
    } else if (mapStyle === 'dark') {
      tiles = ['https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png'];
      attribution = '© CartoDB © OpenStreetMap';
    } else if (mapStyle === 'satellite') {
      // Fallback satellite using ESRI World Imagery when no Mapbox token is present
      tiles = ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'];
      attribution = '© Esri, Maxar, Earthstar Geographics';
    } else {
      // Crisp CartoDB Voyager / OSM tiles for crisp high-dpi display
      tiles = ['https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png'];
      attribution = '© OpenStreetMap contributors, © CARTO';
    }

    const style: StyleSpecification = {
      version: 8,
      sources: {
        basemap: {
          type: 'raster',
          tiles,
          tileSize: 256,
          attribution
        }
      },
      layers: [
        {
          id: 'basemap-layer',
          type: 'raster',
          source: 'basemap'
        }
      ]
    };

    try {
      const m = new MapInstance({
        container: el.current,
        style,
        center: initialCamera,
        zoom: center ? zoom : pins.length > 1 ? 6 : 14,
        maxZoom,
        attributionControl: { compact: true }
      });
      map.current = m;

      m.addControl(new NavigationControl({ showCompass: true, visualizePitch: true }), 'top-right');

      m.on('click', (e: MapMouseEvent) => {
        pick.current?.(e.lngLat.lat, e.lngLat.lng);
      });

      m.on('error', () => {
        setError('HD map tiles could not load. Using standard fallback.');
      });

      const resize = new ResizeObserver(() => m.resize());
      resize.observe(el.current);

      return () => {
        resize.disconnect();
        markers.current.forEach((x) => x.remove());
        markers.current = [];
        m.remove();
        map.current = null;
      };
    } catch {
      setError('Interactive WebGL maps are unavailable in this environment.');
    }
  }, [token, mapStyle, initialCamera?.[0], initialCamera?.[1], pins.length]);

  // Update pins on coordinate changes
  useEffect(() => {
    const m = map.current;
    if (!m) return;

    markers.current.forEach((x) => x.remove());
    markers.current = [];

    for (const p of pins) {
      const node = document.createElement('div');
      node.className = `hd-map-marker-container ${p.live ? 'live-tracking' : ''}`;

      if (p.live) {
        // Live location marker with an optional heading.
        node.innerHTML = `
          <div class="hd-live-pulse"></div>
          <div class="hd-live-core" style="${p.heading !== null && p.heading !== undefined ? `transform: rotate(${p.heading}deg);` : ''}">
            <span class="hd-live-dot"></span>
            ${p.heading !== null && p.heading !== undefined ? '<span class="hd-live-arrow">▲</span>' : ''}
          </div>
        `;
      } else {
        node.innerHTML = `
          <div class="hd-standard-marker">
            <span class="hd-marker-pin"></span>
          </div>
        `;
      }

      node.setAttribute('aria-label', p.label);
      node.title = p.label;

      const popup = new Popup({ offset: 18, closeButton: false, className: 'hd-map-popup' }).setHTML(`
        <div class="p-2 text-xs font-sans">
          <div class="font-bold text-gray-900">${p.label}</div>
          ${p.live ? '<div class="text-emerald-600 font-semibold flex items-center gap-1 mt-0.5"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span> Live GPS Stream</div>' : ''}
          ${p.accuracy ? `<div class="text-gray-500 text-[10px] mt-0.5">Accuracy: ±${Math.round(p.accuracy)}m</div>` : ''}
        </div>
      `);

      const marker = new Marker({ element: node })
        .setLngLat([p.longitude, p.latitude])
        .setPopup(popup)
        .addTo(m);

      markers.current.push(marker);
    }

    if (pins.length === 1) {
      m.easeTo({ center: [pins[0].longitude, pins[0].latitude], zoom: 14, duration: 600 });
    } else if (pins.length > 1) {
      const bounds = new LngLatBounds();
      pins.forEach((p) => bounds.extend([p.longitude, p.latitude]));
      m.fitBounds(bounds, { padding: 60, maxZoom: 15, duration: 600 });
    }
  }, [pins]);

  return (
    <div className="relative w-full h-full min-h-[320px] rounded-2xl overflow-hidden shadow-inner border border-gray-200/80 bg-slate-900/5">
      {initialCamera ? <div ref={el} className="w-full h-full min-h-[320px]" /> : <div className="w-full h-full min-h-[320px] flex flex-col items-center justify-center gap-3 bg-[#f7f2eb] px-5 text-center">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-emerald-800 shadow-sm"><MapPin size={20}/></span>
        <div><strong className="block text-sm text-stone-800">Add a real location to open the map</strong><span className="mt-1 block max-w-xs text-xs leading-relaxed text-stone-500">This map will appear when a job, artisan profile, or selected location has coordinates.</span></div>
        {onPick && <button type="button" disabled={locating} onClick={useCurrentLocation} className="rounded-lg bg-emerald-800 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-900 disabled:opacity-60">{locating ? 'Finding your location…' : 'Use my current location'}</button>}
        {error && <p role="alert" className="max-w-xs text-xs text-amber-800">{error}</p>}
      </div>}

      {/* Layer selector bar */}
      {initialCamera && <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-2 py-1.5 rounded-xl shadow-lg border border-gray-200/80 text-xs font-medium">
        <button
          type="button"
          className={`px-2.5 py-1 rounded-lg transition-colors ${mapStyle === 'streets' ? 'bg-emerald-600 text-white font-semibold shadow-sm' : 'text-gray-700 hover:bg-gray-100'}`}
          onClick={() => setMapStyle('streets')}
        >
          Street
        </button>
        <button
          type="button"
          className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 ${mapStyle === 'satellite' ? 'bg-emerald-600 text-white font-semibold shadow-sm' : 'text-gray-700 hover:bg-gray-100'}`}
          onClick={() => setMapStyle('satellite')}
        >
          <Layers size={13} />
          Satellite
        </button>
        <button
          type="button"
          className={`px-2.5 py-1 rounded-lg transition-colors ${mapStyle === 'dark' ? 'bg-emerald-600 text-white font-semibold shadow-sm' : 'text-gray-700 hover:bg-gray-100'}`}
          onClick={() => setMapStyle('dark')}
        >
          Voyager
        </button>
      </div>}

      {onPick && initialCamera && (
        <div className="absolute top-3 left-3 z-10 flex items-center gap-2"><span className="bg-white/90 backdrop-blur-md text-emerald-950 px-3 py-1.5 rounded-xl shadow-sm text-xs font-medium flex items-center gap-1.5 border border-emerald-100"><MapPin size={13} className="text-emerald-600" />Tap map to place the pin</span><button type="button" disabled={locating} onClick={useCurrentLocation} className="bg-white/95 text-emerald-800 px-3 py-1.5 rounded-xl shadow-sm text-xs font-semibold flex items-center gap-1.5 border border-emerald-100 disabled:opacity-60"><LocateFixed size={13}/>{locating ? 'Locating…' : 'Use my location'}</button></div>
      )}

      {error && initialCamera && (
        <div className="absolute top-3 right-3 z-10 bg-amber-50/90 border border-amber-200 text-amber-800 px-3 py-1.5 rounded-xl text-xs shadow-sm">
          {error}
        </div>
      )}
    </div>
  );
}
