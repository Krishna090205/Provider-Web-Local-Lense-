import React from 'react';

export const SkeletonCard: React.FC = () => {
  return (
    <div className="glass-card rounded-2xl overflow-hidden animate-pulse flex flex-col h-full border border-sunset-border">
      <div className="aspect-[16/10] bg-sunset-border/40" />
      <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="h-3 w-20 bg-sunset-border/60 rounded" />
            <div className="h-3 w-12 bg-sunset-border/60 rounded" />
          </div>
          <div className="h-5 w-3/4 bg-sunset-border/80 rounded" />
          <div className="h-3 w-full bg-sunset-border/40 rounded" />
          <div className="h-3 w-5/6 bg-sunset-border/40 rounded" />
        </div>
        <div className="pt-3 border-t border-sunset-border flex justify-between items-center">
          <div className="h-3 w-16 bg-sunset-border/50 rounded" />
          <div className="h-3 w-20 bg-sunset-border/50 rounded" />
        </div>
      </div>
    </div>
  );
};
