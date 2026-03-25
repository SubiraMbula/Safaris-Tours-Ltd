import React, { useState, useEffect } from 'react';
import { dbService } from '../services/db';
import { Complaint, Customer, ComplaintStatus } from '../types';
import { Plus, Search, Edit2, Trash2, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';

const complaintSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  status: z.enum(['open', 'resolved']),
  resolution: z.string().optional(),
  satisfactionScore: z.number().min(0).max(5).optional(),
});

type ComplaintFormData = z.infer<typeof complaintSchema>;

export default function Complaints() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingComplaint, setEditingComplaint] = useState<Complaint | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<ComplaintFormData>({
    resolver: zodResolver(complaintSchema),
    defaultValues: { 
      status: 'open',
      satisfactionScore: 0,
      resolution: ''
    }
  });

  const currentStatus = watch('status');

  useEffect(() => {
    const unsubComplaints = dbService.subscribeToCollection<Complaint>('complaints', (data) => setComplaints(data));
    const unsubCustomers = dbService.subscribeToCollection<Customer>('customers', (data) => setCustomers(data));
    return () => { unsubComplaints(); unsubCustomers(); };
  }, []);

  const onSubmit = async (data: ComplaintFormData) => {
    setIsSubmitting(true);
    try {
      if (editingComplaint) {
        await dbService.updateDocument('complaints', editingComplaint.id, data);
      } else {
        await dbService.createDocument('complaints', data);
      }
      closeModal();
    } catch (error) {
      console.error('Error saving complaint:', error);
      alert('Failed to save complaint. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openModal = (complaint?: Complaint) => {
    if (complaint) {
      setEditingComplaint(complaint);
      setValue('customerId', complaint.customerId);
      setValue('description', complaint.description);
      setValue('status', complaint.status);
      setValue('resolution', complaint.resolution || '');
      setValue('satisfactionScore', complaint.satisfactionScore || 0);
    } else {
      setEditingComplaint(null);
      reset({ status: 'open' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingComplaint(null);
    reset();
  };

  const getCustomerName = (id: string) => customers.find(c => c.id === id)?.name || 'Unknown';

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl text-[#5A5A40] mb-2">Complaints</h1>
          <p className="text-stone-500">Log and resolve customer feedback to improve service.</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          Log Complaint
        </button>
      </div>

      <div className="space-y-4">
        {complaints.map(complaint => (
          <div key={complaint.id} className="glass-card p-6 flex gap-6 items-start group">
            <div className={`p-3 rounded-xl ${complaint.status === 'open' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
              {complaint.status === 'open' ? <AlertCircle size={24} /> : <CheckCircle2 size={24} />}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-serif">{getCustomerName(complaint.customerId)}</h3>
                  <p className="text-xs text-stone-400 uppercase tracking-widest">{format(new Date(complaint.createdAt), 'MMM d, yyyy HH:mm')}</p>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openModal(complaint)} className="btn-secondary py-1 px-4 text-xs">Manage</button>
                </div>
              </div>
              <p className="text-stone-700 mb-4">{complaint.description}</p>
              {complaint.status === 'resolved' && (
                <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
                  <p className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Resolution</p>
                  <p className="text-sm text-stone-600">{complaint.resolution}</p>
                  {complaint.satisfactionScore && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs text-stone-400">Satisfaction:</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(s => (
                          <div key={s} className={`w-2 h-2 rounded-full ${s <= complaint.satisfactionScore! ? 'bg-amber-400' : 'bg-stone-200'}`} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        {complaints.length === 0 && (
          <div className="glass-card p-12 text-center text-stone-400 italic">
            No complaints logged.
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-card w-full max-w-lg p-8 relative">
            <button onClick={closeModal} className="absolute top-4 right-4 text-stone-400 hover:text-stone-600">
              <X size={24} />
            </button>
            <h2 className="text-2xl font-serif mb-6">{editingComplaint ? 'Manage Complaint' : 'Log Complaint'}</h2>
            
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

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Description</label>
                <textarea 
                  {...register('description')}
                  className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:border-[#5A5A40] outline-none transition-all h-32 resize-none"
                  placeholder="Details of the issue..."
                />
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Status</label>
                <select 
                  {...register('status')}
                  className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:border-[#5A5A40] outline-none transition-all bg-white"
                >
                  <option value="open">Open</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>

              {currentStatus === 'resolved' && (
                <>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Resolution Details</label>
                    <textarea 
                      {...register('resolution')}
                      className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:border-[#5A5A40] outline-none transition-all h-24 resize-none"
                      placeholder="How was this issue fixed?"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Satisfaction Score (1-5)</label>
                    <input 
                      type="number"
                      {...register('satisfactionScore', { valueAsNumber: true })}
                      className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:border-[#5A5A40] outline-none transition-all"
                      min="1"
                      max="5"
                    />
                  </div>
                </>
              )}

              <div className="pt-4">
                {Object.keys(errors).length > 0 && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs">
                    Please check the form for errors.
                  </div>
                )}
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Saving...' : (editingComplaint ? 'Update Complaint' : 'Log Complaint')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
