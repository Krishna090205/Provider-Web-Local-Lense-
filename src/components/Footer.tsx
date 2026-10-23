import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ShieldCheck, Heart, MapPin, Settings } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-sunset-border bg-sunset-bg/95 backdrop-blur-lg pt-16 pb-12 text-sunset-muted transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-sunset-accent flex items-center justify-center shadow-md shadow-sunset-accent/20">
                <Compass className="w-5 h-5 text-sunset-on-accent" />
              </div>
              <span className="text-xl font-bold font-serif text-sunset-text">LocalLens Mumbai</span>
            </Link>
            <p className="text-sm leading-relaxed text-sunset-muted max-w-sm">
              Authentic city curation powered by genuine Mumbai residents, historians, and verified business providers. Experiencing Mumbai from Colaba to Vasai, and beyond to the imperial Sahyadri forts.
            </p>
            <div className="flex items-center gap-2 text-xs text-sunset-accent bg-sunset-accent/10 border border-sunset-accent/20 px-3 py-1.5 rounded-lg w-fit">
              <ShieldCheck className="w-4 h-4 text-sunset-accent" />
              <span>Strict Data Honesty: Zero synthetic reviews or invented hours.</span>
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-sunset-text mb-4 font-serif">Discover</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/explore?category=hotels" className="hover:text-sunset-accent transition-colors">Heritage Hotels</Link></li>
              <li><Link to="/explore?category=restaurants" className="hover:text-sunset-accent transition-colors">Iconic Irani & Street Cafes</Link></li>
              <li><Link to="/explore?category=shops" className="hover:text-sunset-accent transition-colors">Historic Bazaars</Link></li>
              <li><Link to="/explore?category=attractions" className="hover:text-sunset-accent transition-colors">Waterfronts & Art Deco</Link></li>
              <li><Link to="/forts" className="hover:text-sunset-accent transition-colors">Sahyadri Maratha Forts</Link></li>
            </ul>
          </div>

          {/* Portals */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-sunset-text mb-4 font-serif">Portals</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/dashboard/tourist" className="hover:text-sunset-accent transition-colors">Tourist Saved Places</Link></li>
              <li><Link to="/dashboard/provider" className="hover:text-sunset-accent transition-colors">Provider Dashboard</Link></li>
              <li><Link to="/auth?mode=signup&role=provider" className="hover:text-sunset-accent transition-colors">Provider Registration</Link></li>
              <li><Link to="/dashboard/admin" className="hover:text-sunset-accent transition-colors">Admin Curation Console</Link></li>
            </ul>
          </div>

          {/* Preferences & Support */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-sunset-text mb-4 font-serif">Preferences</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/settings" className="hover:text-sunset-accent transition-colors flex items-center gap-1.5"><Settings className="w-3.5 h-3.5" /><span>Theme & Settings</span></Link></li>
              <li><Link to="/about" className="hover:text-sunset-accent transition-colors">About LocalLens</Link></li>
              <li><Link to="/about#contact" className="hover:text-sunset-accent transition-colors">Contact Curation Team</Link></li>
              <li><span className="text-xs text-sunset-muted/70">Sample seed entries are clearly tagged [Sample].</span></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-sunset-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} LocalLens Mumbai. Built with React, Vite, Tailwind & Supabase.</p>
          <div className="flex items-center gap-1 text-sunset-muted">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
            <span>for the City of Dreams, Mumbai</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
