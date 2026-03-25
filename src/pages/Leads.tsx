import React, { useState, useEffect } from 'react';
import { dbService } from '../services/db';
import { Lead, Customer, LeadStatus } from '../types';
import { Plus, Search, Edit2, Trash2, X, Target, User } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const leadSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  source: z.string().min(2, 'Source is required'),
  status: z.enum(['new', 'contacted', 'qualified', 'lost']),
  notes: z.string().optional(),
});

type LeadFormData = z.infer<typeof leadSchema>;

export default function Leads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: { status: 'new' }
  });

  useEffect(() => {
    const unsubLeads = dbService.subscribeToCollection<Lead>('leads', (data) => setLeads(data));
    const unsubCustomers = dbService.subscribeToCollection<Customer>('customers', (data) => setCustomers(data));
    return () => { unsubLeads(); unsubCustomers(); };
  }, []);

  const onSubmit = async (data: LeadFormData) => {
    if (editingLead) {
      await dbService.updateDocument('leads', editingLead.id, data);
    } else {
      await dbService.createDocument('leads', data);
    }
    closeModal();
  };

  const openModal = (lead?: Lead) => {
    if (lead) {
      setEditingLead(lead);
      setValue('customerId', lead.customerId);
      setValue('source', lead.source);
      setValue('status', lead.status);
      setValue('notes', lead.notes);
    } else {
      setEditingLead(null);
      reset({ status: 'new' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingLead(null);
    reset();
  };

  const getCustomerName = (id: string) => customers.find(c => c.id === id)?.name || 'Unknown';

  const statusColors: Record<LeadStatus, string> = {
    new: 'bg-blue-100 text-blue-700',
    contacted: 'bg-amber-100 text-amber-700',
    qualified: 'bg-emerald-100 text-emerald-700',
    lost: 'bg-stone-100 text-stone-700'
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl text-[#5A5A40] mb-2">Leads</h1>
          <p className="text-stone-500">Track potential safari bookings and follow-ups.</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          New Lead
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {(['new', 'contacted', 'qualified', 'lost'] as LeadStatus[]).map(status => (
          <div key={status} className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xs font-bold uppercase tracking-widest text-stone-500">{status}</h3>
              <span className="text-xs bg-stone-200 text-stone-600 px-2 py-0.5 rounded-full">
                {leads.filter(l => l.status === status).length}
              </span>
            </div>
            <div className="space-y-3">
              {leads.filter(l => l.status === status).map(lead => (
                <div key={lead.id} className="glass-card p-4 hover:border-[#5A5A40]/30 transition-all cursor-pointer group" onClick={() => openModal(lead)}>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-sm">{getCustomerName(lead.customerId)}</h4>
                    <button className="opacity-0 group-hover:opacity-100 text-stone-400 hover:text-[#5A5A40]">
                      <Edit2 size={14} />
                    </button>
                  </div>
                  <p className="text-[10px] text-stone-400 uppercase tracking-wider mb-2">Source: {lead.source}</p>
                  <p className="text-xs text-stone-600 line-clamp-2 italic">"{lead.notes || 'No notes...'}"</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-card w-full max-w-lg p-8 relative">
            <button onClick={closeModal} className="absolute top-4 right-4 text-stone-400 hover:text-stone-600">
              <X size={24} />
            </button>
            <h2 className="text-2xl font-serif mb-6">{editingLead ? 'Edit Lead' : 'New Lead'}</h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Customer</label>
                <select 
                  {...register('customerId')}
                  className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:border-[#5A5A40] outline-none transition-all bg-white"
                >
                  <option value="">Select a customer...</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {errors.customerId && <p className="text-red-500 text-xs mt-1">{errors.customerId.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Source</label>
                  <input 
                    {...register('source')}
                    className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:border-[#5A5A40] outline-none transition-all"
                    placeholder="e.g. Website, Referral"
                  />
                  {errors.source && <p className="text-red-500 text-xs mt-1">{errors.source.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Status</label>
                  <select 
                    {...register('status')}
                    className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:border-[#5A5A40] outline-none transition-all bg-white"
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="qualified">Qualified</option>
                    <option value="lost">Lost</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Notes</label>
                <textarea 
                  {...register('notes')}
                  className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:border-[#5A5A40] outline-none transition-all h-32 resize-none"
                  placeholder="Interaction history, specific interests..."
                />
              </div>

              <div className="pt-4">
                <button type="submit" className="btn-primary w-full">
                  {editingLead ? 'Update Lead' : 'Create Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
