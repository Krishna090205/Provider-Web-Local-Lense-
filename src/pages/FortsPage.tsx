import React, { useState } from 'react';
import { Shield, MapPin, Mountain, Clock, Calendar, Navigation, Compass, ExternalLink } from 'lucide-react';
import { HISTORICAL_FORTS_DATA } from '../lib/seedData';
import { MapComponent } from '../components/MapComponent';

export const FortsPage: React.FC = () => {
  const [selectedFortId, setSelectedFortId] = useState<string>(HISTORICAL_FORTS_DATA[0].id);

  const selectedFort = HISTORICAL_FORTS_DATA.find(f => f.id === selectedFortId) || HISTORICAL_FORTS_DATA[0];

  const mapMarkers = HISTORICAL_FORTS_DATA.map(f => ({
    id: f.id,
    name: f.name,
    lat: f.coords[0],
    lng: f.coords[1],
    category: 'forts' as const
  }));

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12 text-sunset-text">
      
      {/* Header Banner */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full glass-panel border border-sunset-border text-sunset-accent text-xs font-semibold uppercase tracking-widest shadow-md font-serif">
          <Shield className="w-3.5 h-3.5 text-sunset-accent" />
          <span>Maharashtra Fort Heritage</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold font-serif text-sunset-text">
          Historic Maratha & Coastal Forts
        </h1>
        <p className="text-sm sm:text-base text-sunset-muted font-normal leading-relaxed">
          From the crowning peak of Chhatrapati Shivaji Maharaj's capital at Raigad to the ancient maritime bastion of Vasai. Real archival histories, verified GPS locations, elevation data, and trek guidelines.
        </p>
      </div>

      {/* Fort Selector Tabs */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {HISTORICAL_FORTS_DATA.map((fort) => (
          <button
            key={fort.id}
            onClick={() => setSelectedFortId(fort.id)}
            className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all border flex items-center gap-2 ${
              selectedFortId === fort.id
                ? 'btn-accent shadow-lg shadow-sunset-accent/20 scale-105'
                : 'glass-panel text-sunset-muted border-sunset-border hover:text-sunset-text'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>{fort.name}</span>
          </button>
        ))}
      </div>

      {/* Selected Fort Spotlight Showcase */}
      <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-sunset-border space-y-8 animate-fade-in shadow-2xl">
        
        {/* Top Split: Photo & Highlights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          
          {/* Photo */}
          <div className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-sunset-border shadow-2xl">
            <img
              src={selectedFort.photo}
              alt={selectedFort.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
            
            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
              <div>
                <span className="text-xs text-sunset-accent font-bold uppercase tracking-wider block">
                  {selectedFort.marathiName}
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-serif">
                  {selectedFort.name}
                </h2>
              </div>
              <span className="px-3 py-1 rounded-lg text-xs font-bold bg-sunset-accent text-sunset-on-accent">
                {selectedFort.elevation}
              </span>
            </div>
          </div>

          {/* Quick Specifications */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-sunset-accent font-serif">
              {selectedFort.title}
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-sunset-bg/60 border border-sunset-border space-y-1">
                <span className="text-sunset-muted flex items-center gap-1.5 font-semibold">
                  <Mountain className="w-3.5 h-3.5 text-sunset-accent" /> Elevation
                </span>
                <p className="font-bold text-sunset-text text-sm">{selectedFort.elevation}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-sunset-bg/60 border border-sunset-border space-y-1">
                <span className="text-sunset-muted flex items-center gap-1.5 font-semibold">
                  <Calendar className="w-3.5 h-3.5 text-sunset-accent" /> Key Milestone
                </span>
                <p className="font-bold text-sunset-text text-sm">{selectedFort.coronationYear}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-sunset-bg/60 border border-sunset-border space-y-1">
                <span className="text-sunset-muted flex items-center gap-1.5 font-semibold">
                  <Compass className="w-3.5 h-3.5 text-sunset-accent" /> Distance
                </span>
                <p className="font-bold text-sunset-text text-sm">{selectedFort.distanceFromMumbai}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-sunset-bg/60 border border-sunset-border space-y-1">
                <span className="text-sunset-muted flex items-center gap-1.5 font-semibold">
                  <Clock className="w-3.5 h-3.5 text-sunset-accent" /> Best Season
                </span>
                <p className="font-bold text-sunset-text text-sm">{selectedFort.bestSeason}</p>
              </div>
            </div>

            {/* Directions Action */}
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${selectedFort.coords[0]},${selectedFort.coords[1]}`}
              target="_blank"
              rel="noreferrer"
              className="btn-accent inline-flex items-center gap-2 px-6 py-3 text-xs sm:text-sm font-bold shadow-lg"
            >
              <Navigation className="w-4 h-4" />
              <span>Get Driving Directions to Base</span>
            </a>
          </div>

        </div>

        {/* Historical Narrative */}
        <div className="pt-6 border-t border-sunset-border space-y-3">
          <h4 className="text-lg font-bold text-sunset-text font-serif">Verified Historical Record</h4>
          <p className="text-sm sm:text-base text-sunset-muted leading-relaxed">
            {selectedFort.history}
          </p>
        </div>

        {/* Trekking & Access Guide */}
        <div className="p-4 rounded-2xl bg-sunset-accent/10 border border-sunset-accent/20 text-xs sm:text-sm text-sunset-text flex items-start gap-3">
          <Mountain className="w-5 h-5 text-sunset-accent flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-sunset-accent block mb-0.5 font-serif">Trek and Terrain Logistics:</strong>
            <span className="text-sunset-muted">{selectedFort.trekInfo}</span>
          </div>
        </div>

      </div>

      {/* Map of All Regional Fortresses */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-sunset-border space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xl font-bold text-sunset-text font-serif flex items-center gap-2">
              <MapPin className="w-5 h-5 text-sunset-accent" />
              <span>Geographic Citadel Map</span>
            </h3>
            <p className="text-xs text-sunset-muted">
              Interactive OpenStreetMap overview showing Mumbai and Sahyadri defense lines
            </p>
          </div>
          <span className="text-xs font-semibold text-sunset-accent bg-sunset-accent/10 px-3 py-1 rounded-lg border border-sunset-accent/20 w-fit">
            MapLibre GL JS • Free Carto Tiles
          </span>
        </div>

        <MapComponent
          center={[selectedFort.coords[0], selectedFort.coords[1]]}
          zoom={9}
          className="h-96 w-full rounded-2xl"
          markers={mapMarkers}
        />
      </div>

      {/* All 4 Forts Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {HISTORICAL_FORTS_DATA.map((f) => (
          <div
            key={f.id}
            onClick={() => { setSelectedFortId(f.id); window.scrollTo({ top: 300, behavior: 'smooth' }); }}
            className={`glass-card p-5 rounded-2xl cursor-pointer border transition-all ${
              selectedFortId === f.id ? 'border-sunset-accent bg-sunset-accent/10' : 'border-sunset-border hover:border-sunset-accent/40'
            }`}
          >
            <div className="flex items-start gap-4">
              <img src={f.photo} alt={f.name} className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
              <div className="space-y-1">
                <span className="text-[10px] text-sunset-accent font-bold uppercase">{f.marathiName}</span>
                <h4 className="text-base font-bold text-sunset-text font-serif">{f.name}</h4>
                <p className="text-xs text-sunset-muted line-clamp-2">{f.title}</p>
                <span className="text-[11px] text-sunset-muted/70 block pt-1">{f.distanceFromMumbai}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
