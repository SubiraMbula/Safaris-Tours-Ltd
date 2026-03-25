import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAuth } from './AuthProvider';
import { Compass, Menu, X } from 'lucide-react';

export function Layout() {
  const { user, profile } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-safari-sand">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <main className="flex-1 lg:ml-64 transition-all duration-300">
        <header className="h-16 bg-white/90 backdrop-blur-md border-b border-safari-earth/10 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-40">
          <div className="flex items-center gap-2 sm:gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-safari-green hover:bg-safari-green/5 rounded-lg transition-colors"
              aria-label="Open menu"
            >
              <Menu size={24} />
            </button>
            <Link to="/" className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-safari-earth hover:text-safari-green transition-colors flex items-center gap-1 sm:gap-2">
              <Compass size={14} />
              <span className="hidden xs:inline">Public Site</span>
            </Link>
          </div>
          <div className="flex items-center gap-3 lg:gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-safari-green">{user?.displayName}</p>
              <p className="text-[10px] uppercase tracking-widest text-safari-earth font-bold">{profile?.role}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-safari-green flex items-center justify-center text-white font-serif text-lg border-2 border-safari-gold shadow-sm">
              {user?.displayName?.[0]}
            </div>
          </div>
        </header>
        <div className="p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
