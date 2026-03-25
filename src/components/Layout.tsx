import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAuth } from './AuthProvider';
import { Compass } from 'lucide-react';

export function Layout() {
  const { user, profile } = useAuth();

  return (
    <div className="flex min-h-screen bg-safari-sand">
      <Sidebar />
      <main className="flex-1 ml-64">
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-safari-earth/10 flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-xs font-bold uppercase tracking-widest text-safari-earth hover:text-safari-green transition-colors flex items-center gap-2">
              <Compass size={14} />
              View Public Site
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-bold text-safari-green">{user?.displayName}</p>
              <p className="text-[10px] uppercase tracking-widest text-safari-earth font-bold">{profile?.role}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-safari-green flex items-center justify-center text-white font-serif text-lg border-2 border-safari-gold shadow-sm">
              {user?.displayName?.[0]}
            </div>
          </div>
        </header>
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
