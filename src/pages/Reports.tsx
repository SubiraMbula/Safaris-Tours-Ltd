import React, { useState, useEffect } from 'react';
import { dbService } from '../services/db';
import { Booking, Lead, Customer } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';

export default function Reports() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    const unsubB = dbService.subscribeToCollection<Booking>('bookings', setBookings);
    const unsubL = dbService.subscribeToCollection<Lead>('leads', setLeads);
    const unsubC = dbService.subscribeToCollection<Customer>('customers', setCustomers);
    return () => { unsubB(); unsubL(); unsubC(); };
  }, []);

  // Revenue by Month
  const last6Months = eachMonthOfInterval({
    start: subMonths(new Date(), 5),
    end: new Date()
  });

  const revenueData = last6Months.map(month => {
    const monthStr = format(month, 'MMM');
    const monthBookings = bookings.filter(b => {
      const date = new Date(b.createdAt);
      return date.getMonth() === month.getMonth() && date.getFullYear() === month.getFullYear();
    });
    const revenue = monthBookings.reduce((sum, b) => sum + b.totalAmount, 0);
    return { name: monthStr, revenue };
  });

  // Booking Status Distribution
  const statusData = [
    { name: 'Confirmed', value: bookings.filter(b => b.status === 'confirmed').length },
    { name: 'Pending', value: bookings.filter(b => b.status === 'pending').length },
    { name: 'Completed', value: bookings.filter(b => b.status === 'completed').length },
    { name: 'Cancelled', value: bookings.filter(b => b.status === 'cancelled').length },
  ].filter(d => d.value > 0);

  const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#ef4444'];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl text-[#5A5A40] mb-2">Analytics & Reports</h1>
        <p className="text-stone-500">Data-driven insights for Safaris&Tours Ltd.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="text-lg font-serif mb-6">Revenue Growth (Last 6 Months)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey="revenue" stroke="#5A5A40" strokeWidth={3} dot={{ r: 6, fill: '#5A5A40' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-lg font-serif mb-6">Booking Status Distribution</h3>
          <div className="h-80 flex items-center justify-center">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-stone-400 italic">No booking data available</p>
            )}
          </div>
          <div className="flex justify-center gap-4 mt-4">
            {statusData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                <span className="text-xs text-stone-600">{d.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 text-center">
          <p className="text-stone-500 text-sm mb-1 uppercase tracking-wider font-bold">Conversion Rate</p>
          <p className="text-4xl font-serif text-[#5A5A40]">
            {leads.length > 0 ? Math.round((bookings.length / leads.length) * 100) : 0}%
          </p>
          <p className="text-xs text-stone-400 mt-2">Leads to Bookings</p>
        </div>
        <div className="glass-card p-6 text-center">
          <p className="text-stone-500 text-sm mb-1 uppercase tracking-wider font-bold">Avg. Booking Value</p>
          <p className="text-4xl font-serif text-[#5A5A40]">
            ${bookings.length > 0 ? Math.round(bookings.reduce((s, b) => s + b.totalAmount, 0) / bookings.length).toLocaleString() : 0}
          </p>
          <p className="text-xs text-stone-400 mt-2">Per confirmed safari</p>
        </div>
        <div className="glass-card p-6 text-center">
          <p className="text-stone-500 text-sm mb-1 uppercase tracking-wider font-bold">Customer Growth</p>
          <p className="text-4xl font-serif text-[#5A5A40]">+{customers.length}</p>
          <p className="text-xs text-stone-400 mt-2">Total active profiles</p>
        </div>
      </div>
    </div>
  );
}
