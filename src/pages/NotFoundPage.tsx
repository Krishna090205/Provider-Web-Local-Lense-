import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home, Search } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen pt-32 pb-20 px-4 flex items-center justify-center text-center text-sunset-text">
      <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-sunset-border max-w-lg space-y-6 animate-fade-in shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-sunset-accent/15 text-sunset-accent border border-sunset-accent/25 flex items-center justify-center mx-auto">
          <Compass className="w-8 h-8 stroke-[2]" />
        </div>
        
        <div className="space-y-2">
          <span className="text-4xl sm:text-6xl font-extrabold text-sunset-accent font-serif">404</span>
          <h1 className="text-2xl font-bold font-serif text-sunset-text">Off the Mumbai Map</h1>
          <p className="text-xs sm:text-sm text-sunset-muted leading-relaxed">
            You seem to have drifted into uncharted waters of the Arabian Sea or an unregistered gully. Let's guide you back.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="btn-accent px-5 py-2.5 text-xs sm:text-sm font-bold flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Return Home</span>
          </Link>
          <Link
            to="/explore"
            className="glass-panel px-5 py-2.5 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 border border-sunset-border text-sunset-muted hover:text-sunset-text"
          >
            <Search className="w-4 h-4" />
            <span>Explore Places</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
