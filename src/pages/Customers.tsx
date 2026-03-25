import React, { useState, useEffect } from 'react';
import { dbService } from '../services/db';
import { Customer } from '../types';
import { Plus, Search, Edit2, Trash2, X, User } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../components/AuthProvider';

const customerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone must be at least 10 digits'),
  location: z.string().min(2, 'Location is required'),
  preferences: z.string().optional(),
});

type CustomerFormData = z.infer<typeof customerSchema>;

export default function Customers() {
  const { profile } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<string | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema)
  });

  useEffect(() => {
    const unsubscribe = dbService.subscribeToCollection<Customer>('customers', (data) => {
      setCustomers(data);
    });
    return () => unsubscribe();
  }, []);

  const onSubmit = async (data: CustomerFormData) => {
    const customerData = {
      ...data,
      preferences: data.preferences ? data.preferences.split(',').map(p => p.trim()) : [],
      updatedAt: new Date().toISOString()
    };

    if (editingCustomer) {
      await dbService.updateDocument('customers', editingCustomer.id, customerData);
    } else {
      await dbService.createDocument('customers', customerData);
    }
    
    closeModal();
  };

  const openModal = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer);
      setValue('name', customer.name);
      setValue('email', customer.email);
      setValue('phone', customer.phone);
      setValue('location', customer.location);
      setValue('preferences', customer.preferences.join(', '));
    } else {
      setEditingCustomer(null);
      reset();
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCustomer(null);
    reset();
  };

  const handleDeleteClick = (id: string) => {
    setCustomerToDelete(id);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (customerToDelete) {
      await dbService.deleteDocument('customers', customerToDelete);
      setIsDeleteConfirmOpen(false);
      setCustomerToDelete(null);
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl text-[#5A5A40] mb-2">Customers</h1>
          <p className="text-stone-500">Manage your safari travelers and their preferences.</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          Add Customer
        </button>
      </div>

      <div className="glass-card p-4 flex items-center gap-4">
        <Search className="text-stone-400" size={20} />
        <input 
          type="text" 
          placeholder="Search by name or email..." 
          className="bg-transparent border-none outline-none flex-1 text-stone-700"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-stone-50 text-stone-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Contact</th>
                <th className="px-6 py-4 font-medium">Location</th>
                <th className="px-6 py-4 font-medium">Preferences</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-stone-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#5A5A40]/10 flex items-center justify-center text-[#5A5A40]">
                        <User size={20} />
                      </div>
                      <span className="font-medium">{customer.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <p className="text-stone-700">{customer.email}</p>
                      <p className="text-stone-400">{customer.phone}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-stone-600 text-sm">{customer.location}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {customer.preferences.map((p, i) => (
                        <span key={i} className="px-2 py-0.5 bg-stone-100 text-stone-600 text-[10px] rounded-full">
                          {p}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openModal(customer)} className="p-2 text-stone-400 hover:text-[#5A5A40] transition-colors">
                        <Edit2 size={18} />
                      </button>
                      {profile?.role === 'admin' && (
                        <button onClick={() => handleDeleteClick(customer.id)} className="p-2 text-stone-400 hover:text-red-500 transition-colors">
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-stone-400 italic">
                    No customers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-card w-full max-w-lg p-8 relative">
            <button onClick={closeModal} className="absolute top-4 right-4 text-stone-400 hover:text-stone-600">
              <X size={24} />
            </button>
            <h2 className="text-2xl font-serif mb-6">{editingCustomer ? 'Edit Customer' : 'Add New Customer'}</h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Full Name</label>
                <input 
                  {...register('name')}
                  className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:border-[#5A5A40] outline-none transition-all"
                  placeholder="e.g. Jane Doe"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Email</label>
                  <input 
                    {...register('email')}
                    className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:border-[#5A5A40] outline-none transition-all"
                    placeholder="jane@example.com"
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Phone</label>
                  <input 
                    {...register('phone')}
                    className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:border-[#5A5A40] outline-none transition-all"
                    placeholder="+254..."
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Location</label>
                <input 
                  {...register('location')}
                  className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:border-[#5A5A40] outline-none transition-all"
                  placeholder="e.g. Nairobi, Kenya"
                />
                {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Preferences (comma separated)</label>
                <textarea 
                  {...register('preferences')}
                  className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:border-[#5A5A40] outline-none transition-all h-24 resize-none"
                  placeholder="e.g. Luxury, Photography, Bird Watching"
                />
              </div>

              <div className="pt-4">
                <button type="submit" className="btn-primary w-full">
                  {editingCustomer ? 'Update Customer' : 'Create Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <div className="glass-card w-full max-w-md p-8 text-center">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trash2 size={32} />
            </div>
            <h3 className="text-xl font-serif mb-2">Delete Customer?</h3>
            <p className="text-stone-500 mb-8">
              Are you sure you want to delete this customer? This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="flex-1 px-6 py-3 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 px-6 py-3 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-all font-bold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
