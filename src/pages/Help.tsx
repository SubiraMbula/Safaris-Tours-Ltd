import React from 'react';
import { HelpCircle, BookOpen, Mail, Shield } from 'lucide-react';

export default function Help() {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-12">
        <h1 className="text-4xl font-serif mb-4">CRM Help Center</h1>
        <p className="text-stone-500">Everything you need to know about using the Safaris&Tours CRM system.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-card p-8">
          <div className="w-12 h-12 bg-safari-green/10 rounded-2xl flex items-center justify-center text-safari-green mb-6">
            <BookOpen size={24} />
          </div>
          <h3 className="text-xl font-serif mb-3">User Manual</h3>
          <p className="text-stone-600 text-sm leading-relaxed mb-6">
            Access the full user manual including role-based permissions and module guides.
          </p>
          <button className="text-safari-green font-bold text-sm hover:underline">Download PDF Manual</button>
        </div>

        <div className="glass-card p-8">
          <div className="w-12 h-12 bg-safari-green/10 rounded-2xl flex items-center justify-center text-safari-green mb-6">
            <Shield size={24} />
          </div>
          <h3 className="text-xl font-serif mb-3">Role Permissions</h3>
          <div className="space-y-3 text-sm text-stone-600">
            <p><span className="font-bold text-safari-green">Admin:</span> Full system access.</p>
            <p><span className="font-bold text-safari-green">Sales:</span> Customers, Leads, Tours, Bookings.</p>
            <p><span className="font-bold text-safari-green">Marketing:</span> Leads, Reports, Marketing.</p>
          </div>
        </div>

        <div className="glass-card p-8">
          <div className="w-12 h-12 bg-safari-green/10 rounded-2xl flex items-center justify-center text-safari-green mb-6">
            <HelpCircle size={24} />
          </div>
          <h3 className="text-xl font-serif mb-3">Common Tasks</h3>
          <ul className="list-disc list-inside text-sm text-stone-600 space-y-2">
            <li>How to convert a lead to a booking</li>
            <li>Generating monthly sales reports</li>
            <li>Updating customer preferences</li>
            <li>Managing tour availability</li>
          </ul>
        </div>

        <div className="glass-card p-8">
          <div className="w-12 h-12 bg-safari-green/10 rounded-2xl flex items-center justify-center text-safari-green mb-6">
            <Mail size={24} />
          </div>
          <h3 className="text-xl font-serif mb-3">Technical Support</h3>
          <p className="text-stone-600 text-sm leading-relaxed mb-4">
            Need help with a technical issue or role update?
          </p>
          <a href="mailto:subbysav123@gmail.com" className="btn-primary inline-block py-2 px-6 text-sm">Contact Admin</a>
        </div>
      </div>
    </div>
  );
}
