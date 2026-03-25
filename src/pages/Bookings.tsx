import React, { useState, useEffect } from 'react';
import { dbService } from '../services/db';
import { Booking, Customer, BookingStatus, Tour, PaymentStatus } from '../types';
import { Plus, Search, Edit2, Trash2, X, Calendar, CreditCard, Info } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format, addDays } from 'date-fns';

const bookingSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  tourId: z.string().min(1, 'Tour is required'),
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']),
  paymentStatus: z.enum(['unpaid', 'partial', 'paid', 'refunded']),
  totalAmount: z.number().min(0, 'Amount must be positive'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  packageDetails: z.string().min(5, 'Package details are required'),
});

type BookingFormData = z.infer<typeof bookingSchema>;

export default function Bookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);

  const { register, handleSubmit, reset, setValue, control, formState: { errors } } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { 
      status: 'pending',
      paymentStatus: 'unpaid',
      totalAmount: 0
    }
  });

  const selectedTourId = useWatch({ control, name: 'tourId' });
  const selectedStartDate = useWatch({ control, name: 'startDate' });

  useEffect(() => {
    const unsubBookings = dbService.subscribeToCollection<Booking>('bookings', (data) => setBookings(data));
    const unsubCustomers = dbService.subscribeToCollection<Customer>('customers', (data) => setCustomers(data));
    const unsubTours = dbService.subscribeToCollection<Tour>('tours', (data) => setTours(data));
    return () => { unsubBookings(); unsubCustomers(); unsubTours(); };
  }, []);

  useEffect(() => {
    if (selectedTourId && !editingBooking) {
      const tour = tours.find(t => t.id === selectedTourId);
      if (tour) {
        setValue('totalAmount', tour.price);
        setValue('packageDetails', `${tour.name} - ${tour.location}`);
        if (selectedStartDate) {
          const end = addDays(new Date(selectedStartDate), tour.durationDays);
          setValue('endDate', format(end, 'yyyy-MM-dd'));
        }
      }
    }
  }, [selectedTourId, selectedStartDate, tours, setValue, editingBooking]);

  const onSubmit = async (data: BookingFormData) => {
    if (editingBooking) {
      await dbService.updateDocument('bookings', editingBooking.id, data);
    } else {
      await dbService.createDocument('bookings', data);
      // Update tour availability
      const tour = tours.find(t => t.id === data.tourId);
      if (tour) {
        await dbService.updateDocument('tours', tour.id, {
          availableSlots: Math.max(0, tour.availableSlots - 1)
        });
      }
    }
    closeModal();
  };

  const openModal = (booking?: Booking) => {
    if (booking) {
      setEditingBooking(booking);
      setValue('customerId', booking.customerId);
      setValue('tourId', booking.tourId);
      setValue('status', booking.status);
      setValue('paymentStatus', booking.paymentStatus);
      setValue('totalAmount', booking.totalAmount);
      setValue('startDate', booking.startDate.split('T')[0]);
      setValue('endDate', booking.endDate.split('T')[0]);
      setValue('packageDetails', booking.packageDetails);
    } else {
      setEditingBooking(null);
      reset({ status: 'pending', paymentStatus: 'unpaid' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBooking(null);
    reset();
  };

  const getCustomerName = (id: string) => customers.find(c => c.id === id)?.name || 'Unknown';
  const getTourName = (id: string) => tours.find(t => t.id === id)?.name || 'Custom Package';

  const statusStyles: Record<BookingStatus, string> = {
    pending: 'bg-amber-100 text-amber-700',
    confirmed: 'bg-emerald-100 text-emerald-700',
    completed: 'bg-blue-100 text-blue-700',
    cancelled: 'bg-red-100 text-red-700'
  };

  const paymentStyles: Record<PaymentStatus, string> = {
    unpaid: 'bg-stone-100 text-stone-600',
    partial: 'bg-orange-100 text-orange-700',
    paid: 'bg-emerald-100 text-emerald-700',
    refunded: 'bg-purple-100 text-purple-700'
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl text-[#5A5A40] mb-2">Bookings</h1>
          <p className="text-stone-500">Manage safari itineraries and payment status.</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          New Booking
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bookings.map(booking => (
          <div key={booking.id} className="glass-card overflow-hidden group">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-2">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusStyles[booking.status]}`}>
                    {booking.status}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${paymentStyles[booking.paymentStatus]}`}>
                    {booking.paymentStatus}
                  </span>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openModal(booking)} className="text-stone-400 hover:text-[#5A5A40]"><Edit2 size={16} /></button>
                </div>
              </div>
              
              <h3 className="text-xl font-serif mb-1">{getCustomerName(booking.customerId)}</h3>
              <p className="text-[#5A5A40] text-xs font-bold mb-2 uppercase tracking-wide">{getTourName(booking.tourId)}</p>
              <p className="text-stone-500 text-sm mb-4 line-clamp-1">{booking.packageDetails}</p>
              
              <div className="space-y-2 border-t border-stone-100 pt-4">
                <div className="flex items-center gap-2 text-stone-600 text-sm">
                  <Calendar size={16} className="text-stone-400" />
                  <span>{format(new Date(booking.startDate), 'MMM d')} - {format(new Date(booking.endDate), 'MMM d, yyyy')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-stone-600 text-sm font-medium">
                    <CreditCard size={16} className="text-stone-400" />
                    <span>${booking.totalAmount.toLocaleString()}</span>
                  </div>
                  {booking.paymentStatus === 'paid' && (
                    <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      FULLY PAID
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        {bookings.length === 0 && (
          <div className="col-span-full glass-card p-12 text-center text-stone-400 italic">
            No bookings recorded yet.
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-card w-full max-w-2xl p-8 relative max-h-[90vh] overflow-y-auto">
            <button onClick={closeModal} className="absolute top-4 right-4 text-stone-400 hover:text-stone-600">
              <X size={24} />
            </button>
            <h2 className="text-2xl font-serif mb-6">{editingBooking ? 'Edit Booking' : 'New Booking'}</h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Tour Package</label>
                  <select 
                    {...register('tourId')}
                    className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:border-[#5A5A40] outline-none transition-all bg-white"
                  >
                    <option value="">Select a tour...</option>
                    {tours.map(t => (
                      <option key={t.id} value={t.id} disabled={t.availableSlots === 0}>
                        {t.name} ({t.availableSlots} left)
                      </option>
                    ))}
                  </select>
                  {errors.tourId && <p className="text-red-500 text-xs mt-1">{errors.tourId.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Booking Status</label>
                  <select 
                    {...register('status')}
                    className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:border-[#5A5A40] outline-none transition-all bg-white"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Payment Status</label>
                  <select 
                    {...register('paymentStatus')}
                    className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:border-[#5A5A40] outline-none transition-all bg-white"
                  >
                    <option value="unpaid">Unpaid</option>
                    <option value="partial">Partial</option>
                    <option value="paid">Paid</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Total Amount (USD)</label>
                  <input 
                    type="number"
                    {...register('totalAmount', { valueAsNumber: true })}
                    className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:border-[#5A5A40] outline-none transition-all"
                  />
                  {errors.totalAmount && <p className="text-red-500 text-xs mt-1">{errors.totalAmount.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Start Date</label>
                  <input 
                    type="date"
                    {...register('startDate')}
                    className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:border-[#5A5A40] outline-none transition-all"
                  />
                  {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">End Date</label>
                  <input 
                    type="date"
                    {...register('endDate')}
                    className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:border-[#5A5A40] outline-none transition-all"
                  />
                  {errors.endDate && <p className="text-red-500 text-xs mt-1">{errors.endDate.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Package Details</label>
                <textarea 
                  {...register('packageDetails')}
                  className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:border-[#5A5A40] outline-none transition-all h-24 resize-none"
                />
                {errors.packageDetails && <p className="text-red-500 text-xs mt-1">{errors.packageDetails.message}</p>}
              </div>

              <div className="bg-stone-50 p-4 rounded-xl flex items-start gap-3">
                <Info size={18} className="text-[#5A5A40] shrink-0 mt-0.5" />
                <p className="text-xs text-stone-500 leading-relaxed">
                  Selecting a tour will automatically set the price and calculate the end date based on the tour's duration. 
                  Confirmed bookings will reduce the available slots for that tour.
                </p>
              </div>

              <div className="pt-4">
                <button type="submit" className="btn-primary w-full">
                  {editingBooking ? 'Update Booking' : 'Create Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
