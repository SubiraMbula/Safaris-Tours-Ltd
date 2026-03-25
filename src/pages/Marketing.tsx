import React, { useState, useEffect } from 'react';
import { dbService } from '../services/db';
import { Customer } from '../types';
import { Search, Filter, Mail, MessageSquare, Users } from 'lucide-react';

export default function Marketing() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedPreference, setSelectedPreference] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  useEffect(() => {
    const unsub = dbService.subscribeToCollection<Customer>('customers', setCustomers);
    return () => unsub();
  }, []);

  const locations = Array.from(new Set(customers.map(c => c.location))).filter(Boolean);
  const preferences = Array.from(new Set(customers.flatMap(c => c.preferences))).filter(Boolean);

  const filteredCustomers = customers.filter(c => {
    const matchLocation = !selectedLocation || c.location === selectedLocation;
    const matchPreference = !selectedPreference || c.preferences.includes(selectedPreference);
    return matchLocation && matchPreference;
  });

  const handleSendCampaign = () => {
    if (filteredCustomers.length === 0) return;
    setIsSending(true);
    // Simulate campaign sending
    setTimeout(() => {
      setIsSending(false);
      setSentSuccess(true);
      setTimeout(() => setSentSuccess(false), 3000);
    }, 1500);
  };

  // Calculate segment stats
  const segmentPercentage = customers.length > 0 
    ? Math.round((filteredCustomers.length / customers.length) * 100) 
    : 0;
  
  const topPreference = filteredCustomers.length > 0
    ? Object.entries(
        filteredCustomers.flatMap(c => c.preferences).reduce((acc, p) => {
          acc[p] = (acc[p] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      ).sort((a, b) => b[1] - a[1])[0]?.[0]
    : 'N/A';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl text-[#5A5A40] mb-2">Marketing & Segmentation</h1>
        <p className="text-stone-500">Create targeted campaigns for your safari segments.</p>
      </div>

      <div className="glass-card p-6">
        <div className="flex flex-col md:flex-row gap-6 items-end">
          <div className="flex-1 space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Filter by Location</label>
            <select 
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:border-[#5A5A40] outline-none bg-white"
            >
              <option value="">All Locations</option>
              {locations.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div className="flex-1 space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Filter by Preference</label>
            <select 
              value={selectedPreference}
              onChange={(e) => setSelectedPreference(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:border-[#5A5A40] outline-none bg-white"
            >
              <option value="">All Preferences</option>
              {preferences.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <button 
            onClick={() => { setSelectedLocation(''); setSelectedPreference(''); }}
            className="btn-secondary"
          >
            Reset Filters
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-card overflow-hidden">
          <div className="p-6 border-b border-stone-100 flex justify-between items-center">
            <h3 className="font-serif text-lg">Segment Results ({filteredCustomers.length})</h3>
            <div className="flex gap-2">
              <button className="p-2 text-stone-400 hover:text-[#5A5A40] transition-colors" title="Export Segment">
                <Filter size={20} />
              </button>
            </div>
          </div>
          <div className="overflow-y-auto max-h-[500px]">
            <table className="w-full text-left">
              <thead className="sticky top-0 bg-stone-50 text-stone-500 text-[10px] uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Location</th>
                  <th className="px-6 py-3">Preferences</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredCustomers.map(c => (
                  <tr key={c.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-sm">{c.name}</p>
                      <p className="text-xs text-stone-400">{c.email}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-stone-600">{c.location}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {c.preferences.map((p, i) => (
                          <span key={i} className="px-2 py-0.5 bg-[#5A5A40]/5 text-[#5A5A40] text-[10px] rounded-full">
                            {p}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredCustomers.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-stone-400 italic">No customers match this segment.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6">
            <h3 className="font-serif text-lg mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button 
                onClick={handleSendCampaign}
                disabled={isSending || filteredCustomers.length === 0}
                className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all group ${
                  sentSuccess ? 'border-emerald-500 bg-emerald-50' : 'border-stone-100 hover:border-[#5A5A40] hover:bg-[#5A5A40]/5'
                } ${isSending ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className={`p-2 rounded-lg transition-colors ${
                  sentSuccess ? 'bg-emerald-500 text-white' : 'bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white'
                }`}>
                  <Mail size={20} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium">
                    {isSending ? 'Sending...' : sentSuccess ? 'Campaign Sent!' : 'Email Campaign'}
                  </p>
                  <p className="text-[10px] text-stone-400">
                    {sentSuccess ? 'Successfully dispatched' : `Send to ${filteredCustomers.length} travelers`}
                  </p>
                </div>
              </button>
              <button className="w-full flex items-center gap-3 p-4 rounded-xl border border-stone-100 hover:border-[#5A5A40] hover:bg-[#5A5A40]/5 transition-all group">
                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <MessageSquare size={20} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium">WhatsApp Broadcast</p>
                  <p className="text-[10px] text-stone-400">Direct mobile communication</p>
                </div>
              </button>
            </div>
          </div>

          <div className="glass-card p-6 bg-[#5A5A40] text-white">
            <div className="flex items-center gap-3 mb-6">
              <Users size={24} />
              <h3 className="font-serif text-lg">Segment Summary</h3>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-white/60 mb-1">Reach</p>
                  <p className="text-2xl font-serif">{filteredCustomers.length}</p>
                  <p className="text-[10px] text-white/40">{segmentPercentage}% of total</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-white/60 mb-1">Top Interest</p>
                  <p className="text-lg font-serif truncate">{topPreference}</p>
                </div>
              </div>
              
              <div className="pt-4 border-t border-white/10">
                <p className="text-[10px] uppercase tracking-widest text-white/60 mb-2">Segment Focus</p>
                <p className="text-xs italic text-white/80 leading-relaxed">
                  "Targeting travelers in <span className="text-white font-medium">{selectedLocation || 'all regions'}</span> who enjoy <span className="text-white font-medium">{selectedPreference || 'various safari experiences'}</span>."
                </p>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <div className="flex -space-x-2">
                  {[...Array(Math.min(3, filteredCustomers.length))].map((_, i) => (
                    <div key={i} className="w-6 h-6 rounded-full border-2 border-[#5A5A40] bg-stone-400 flex items-center justify-center text-[8px] font-bold">
                      {filteredCustomers[i].name[0]}
                    </div>
                  ))}
                  {filteredCustomers.length > 3 && (
                    <div className="w-6 h-6 rounded-full border-2 border-[#5A5A40] bg-stone-600 flex items-center justify-center text-[8px] font-bold">
                      +{filteredCustomers.length - 3}
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-white/60">Active Segment</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
