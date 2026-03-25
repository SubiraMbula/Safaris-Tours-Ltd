import React from 'react';
import { 
  Users, 
  Target, 
  CalendarCheck, 
  TrendingUp,
  Compass,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

const data = [
  { name: 'Jan', bookings: 40, revenue: 2400 },
  { name: 'Feb', bookings: 30, revenue: 1398 },
  { name: 'Mar', bookings: 20, revenue: 9800 },
  { name: 'Apr', bookings: 27, revenue: 3908 },
  { name: 'May', bookings: 18, revenue: 4800 },
  { name: 'Jun', bookings: 23, revenue: 3800 },
  { name: 'Jul', bookings: 34, revenue: 4300 },
];

const StatCard = ({ title, value, icon: Icon, trend, trendValue }: any) => (
  <div className="glass-card p-6">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-[#5A5A40]/10 rounded-xl">
        <Icon className="text-[#5A5A40]" size={24} />
      </div>
      <div className={cn(
        "flex items-center text-xs font-medium px-2 py-1 rounded-full",
        trend === 'up' ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
      )}>
        {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
        {trendValue}%
      </div>
    </div>
    <h3 className="text-stone-500 text-sm font-medium mb-1">{title}</h3>
    <p className="text-3xl font-serif text-[#1a1a1a]">{value}</p>
  </div>
);

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { useAuth } from '../components/AuthProvider';
import { seedSampleData } from '../services/seedData';
import { Database } from 'lucide-react';
import { dbService } from '../services/db';
import { useState, useEffect } from 'react';

export default function Dashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    customers: '0',
    tours: '0',
    bookings: '0',
    revenue: '$0'
  });
  
  useEffect(() => {
    const unsubTours = dbService.subscribeToCollection('tours', (data) => {
      setStats(prev => ({ ...prev, tours: data.length.toString() }));
    });
    const unsubCustomers = dbService.subscribeToCollection('customers', (data) => {
      setStats(prev => ({ ...prev, customers: data.length.toLocaleString() }));
    });
    const unsubBookings = dbService.subscribeToCollection('bookings', (data) => {
      setStats(prev => ({ ...prev, bookings: data.length.toLocaleString() }));
      const totalRevenue = data.reduce((acc: number, curr: any) => acc + (curr.totalAmount || 0), 0);
      setStats(prev => ({ ...prev, revenue: `$${totalRevenue.toLocaleString()}` }));
    });

    return () => {
      unsubTours();
      unsubCustomers();
      unsubBookings();
    };
  }, []);

  const roleDisplay = profile?.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Staff';

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl text-[#5A5A40] mb-2">Welcome back, {roleDisplay}</h1>
          <p className="text-stone-500">Here's what's happening with Safaris&Tours today.</p>
        </div>
        {profile?.role === 'admin' && (
          <button 
            onClick={seedSampleData}
            className="flex items-center gap-2 px-4 py-2 bg-stone-100 text-stone-600 rounded-xl hover:bg-stone-200 transition-all text-sm font-medium"
          >
            <Database size={16} />
            Seed Sample Data
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {(profile?.role === 'admin' || profile?.role === 'sales_manager' || profile?.role === 'sales' || profile?.role === 'support') && (
          <StatCard title="Total Customers" value={stats.customers} icon={Users} trend="up" trendValue="12" />
        )}
        {(profile?.role === 'admin' || profile?.role === 'sales_manager' || profile?.role === 'sales') && (
          <StatCard title="Tours Available" value={stats.tours} icon={Compass} trend="up" trendValue="5" />
        )}
        {(profile?.role === 'admin' || profile?.role === 'sales_manager' || profile?.role === 'sales') && (
          <StatCard title="Confirmed Bookings" value={stats.bookings} icon={CalendarCheck} trend="down" trendValue="3" />
        )}
        {(profile?.role === 'admin' || profile?.role === 'sales_manager' || profile?.role === 'marketing_manager') && (
          <StatCard title="Monthly Revenue" value={stats.revenue} icon={TrendingUp} trend="up" trendValue="24" />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="text-lg font-serif mb-6">Booking Trends</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5A5A40" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#5A5A40" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="bookings" stroke="#5A5A40" fillOpacity={1} fill="url(#colorBookings)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-lg font-serif mb-6">Revenue Overview</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f5f5f5'}}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="revenue" fill="#5A5A40" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-stone-100 flex justify-between items-center">
          <h3 className="text-lg font-serif">Recent Inquiries</h3>
          <button className="text-[#5A5A40] text-sm font-medium hover:underline">View all</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-stone-50 text-stone-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Package</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {[
                { name: 'John Doe', package: 'Maasai Mara Safari', status: 'Pending', date: '2 hours ago' },
                { name: 'Sarah Wilson', package: 'Amboseli Adventure', status: 'Confirmed', date: '5 hours ago' },
                { name: 'Michael Chen', package: 'Coastal Retreat', status: 'Completed', date: 'Yesterday' },
                { name: 'Emma Brown', package: 'Mount Kenya Trek', status: 'Cancelled', date: '2 days ago' },
              ].map((item, i) => (
                <tr key={i} className="hover:bg-stone-50 transition-colors">
                  <td className="px-6 py-4 font-medium">{item.name}</td>
                  <td className="px-6 py-4 text-stone-600">{item.package}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      item.status === 'Confirmed' ? "bg-emerald-100 text-emerald-700" :
                      item.status === 'Pending' ? "bg-amber-100 text-amber-700" :
                      item.status === 'Completed' ? "bg-blue-100 text-blue-700" :
                      "bg-stone-100 text-stone-700"
                    )}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-stone-400 text-sm">{item.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
