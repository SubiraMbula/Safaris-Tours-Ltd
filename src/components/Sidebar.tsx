import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Target, 
  CalendarCheck, 
  MessageSquareWarning, 
  BarChart3, 
  Megaphone,
  LogOut,
  Compass
} from 'lucide-react';
import { useAuth } from './AuthProvider';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Customers', path: '/admin/customers', icon: Users },
  { name: 'Leads', path: '/admin/leads', icon: Target },
  { name: 'Tours', path: '/admin/tours', icon: Compass },
  { name: 'Bookings', path: '/admin/bookings', icon: CalendarCheck },
  { name: 'Complaints', path: '/admin/complaints', icon: MessageSquareWarning },
  { name: 'Reports', path: '/admin/reports', icon: BarChart3 },
  { name: 'Marketing', path: '/admin/marketing', icon: Megaphone },
  { name: 'Help', path: '/admin/help', icon: Compass },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const { logout, profile } = useAuth();

  const filteredNavItems = navItems.filter(item => {
    if (!profile) return false;
    if (profile.role === 'admin') return true;
    
    switch (item.name) {
      case 'Dashboard':
        return true;
      case 'Customers':
        return ['sales_manager', 'sales', 'support'].includes(profile.role);
      case 'Leads':
        return ['sales_manager', 'marketing_manager', 'sales'].includes(profile.role);
      case 'Tours':
        return ['admin', 'sales_manager', 'sales'].includes(profile.role);
      case 'Bookings':
        return ['sales_manager', 'sales'].includes(profile.role);
      case 'Complaints':
        return ['support'].includes(profile.role);
      case 'Reports':
        return ['sales_manager', 'marketing_manager'].includes(profile.role);
      case 'Marketing':
        return ['marketing_manager'].includes(profile.role);
      case 'Help':
        return true;
      default:
        return false;
    }
  });

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={cn(
        "w-64 h-screen bg-safari-green text-white flex flex-col fixed left-0 top-0 z-50 transition-transform duration-300 lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 flex items-center gap-3 border-b border-white/10">
          <div className="w-10 h-10 bg-safari-gold rounded-lg flex items-center justify-center">
            <Compass className="text-safari-green" size={24} />
          </div>
          <div>
            <h2 className="font-serif text-lg leading-tight">Safaris&Tours</h2>
            <span className="text-[10px] uppercase tracking-widest text-white/50">CRM System</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {filteredNavItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path === '/admin' && location.pathname === '/admin/');
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all group",
                  isActive 
                    ? "bg-safari-gold text-safari-green" 
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon size={20} className={cn(isActive ? "text-safari-green" : "text-white/40 group-hover:text-white/80")} />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-stone-700 flex items-center justify-center text-xs">
              {profile?.displayName?.[0] || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{profile?.displayName}</p>
              <p className="text-[10px] uppercase tracking-wider text-stone-500">{profile?.role}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-stone-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
