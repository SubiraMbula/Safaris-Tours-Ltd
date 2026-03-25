import React, { useState, useEffect } from 'react';
import { dbService } from '../services/db';
import { Tour } from '../types';
import { Plus, Search, Edit2, Trash2, X, MapPin, Users, Clock, Tag } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const tourSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().min(0, 'Price must be positive'),
  capacity: z.number().min(1, 'Capacity must be at least 1'),
  availableSlots: z.number().min(0, 'Available slots cannot be negative'),
  durationDays: z.number().min(1, 'Duration must be at least 1 day'),
  location: z.string().min(2, 'Location is required'),
  imageUrl: z.string().url('Invalid image URL').optional().or(z.literal('')),
});

type TourFormData = z.infer<typeof tourSchema>;

export default function Tours() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTour, setEditingTour] = useState<Tour | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<TourFormData>({
    resolver: zodResolver(tourSchema),
    defaultValues: {
      price: 0,
      capacity: 1,
      availableSlots: 1,
      durationDays: 1
    }
  });

  useEffect(() => {
    const unsubscribe = dbService.subscribeToCollection<Tour>('tours', (data) => {
      setTours(data);
    });
    return () => unsubscribe();
  }, []);

  const onSubmit = async (data: TourFormData) => {
    if (editingTour) {
      await dbService.updateDocument('tours', editingTour.id, data);
    } else {
      await dbService.createDocument('tours', data);
    }
    closeModal();
  };

  const openModal = (tour?: Tour) => {
    if (tour) {
      setEditingTour(tour);
      setValue('name', tour.name);
      setValue('description', tour.description);
      setValue('price', tour.price);
      setValue('capacity', tour.capacity);
      setValue('availableSlots', tour.availableSlots);
      setValue('durationDays', tour.durationDays);
      setValue('location', tour.location);
      setValue('imageUrl', tour.imageUrl || '');
    } else {
      setEditingTour(null);
      reset();
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTour(null);
    reset();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this tour?')) {
      await dbService.deleteDocument('tours', id);
    }
  };

  const filteredTours = tours.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl text-[#5A5A40] mb-2">Safari Tours</h1>
          <p className="text-stone-500">Manage safari packages and availability.</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          New Tour
        </button>
      </div>

      <div className="glass-card p-4 flex items-center gap-4">
        <Search className="text-stone-400" size={20} />
        <input 
          type="text" 
          placeholder="Search by name or location..." 
          className="bg-transparent border-none outline-none flex-1 text-stone-700"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTours.map((tour) => (
          <div key={tour.id} className="glass-card overflow-hidden group">
            {tour.imageUrl && (
              <div className="h-48 overflow-hidden">
                <img 
                  src={tour.imageUrl} 
                  alt={tour.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-serif text-[#5A5A40]">{tour.name}</h3>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openModal(tour)} className="p-1 text-stone-400 hover:text-[#5A5A40]">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(tour.id)} className="p-1 text-stone-400 hover:text-red-500">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <p className="text-stone-600 text-sm mb-4 line-clamp-2">{tour.description}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2 text-xs text-stone-500">
                  <MapPin size={14} className="text-[#5A5A40]" />
                  <span>{tour.location}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-stone-500">
                  <Clock size={14} className="text-[#5A5A40]" />
                  <span>{tour.durationDays} Days</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-stone-500">
                  <Users size={14} className="text-[#5A5A40]" />
                  <span>{tour.availableSlots}/{tour.capacity} Slots</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-[#5A5A40]">
                  <Tag size={14} />
                  <span>${tour.price.toLocaleString()}</span>
                </div>
              </div>

              <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-[#5A5A40] h-full transition-all duration-500"
                  style={{ width: `${((tour.capacity - tour.availableSlots) / tour.capacity) * 100}%` }}
                />
              </div>
              <p className="text-[10px] text-stone-400 mt-1 text-right italic">
                {Math.round(((tour.capacity - tour.availableSlots) / tour.capacity) * 100)}% Booked
              </p>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-card w-full max-w-2xl p-8 relative max-h-[90vh] overflow-y-auto">
            <button onClick={closeModal} className="absolute top-4 right-4 text-stone-400 hover:text-stone-600">
              <X size={24} />
            </button>
            <h2 className="text-2xl font-serif mb-6">{editingTour ? 'Edit Tour' : 'Create New Tour'}</h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Tour Name</label>
                  <input 
                    {...register('name')}
                    className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:border-[#5A5A40] outline-none transition-all"
                    placeholder="e.g. Maasai Mara Luxury Safari"
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Location</label>
                  <input 
                    {...register('location')}
                    className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:border-[#5A5A40] outline-none transition-all"
                    placeholder="e.g. Narok, Kenya"
                  />
                  {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Description</label>
                <textarea 
                  {...register('description')}
                  className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:border-[#5A5A40] outline-none transition-all h-24 resize-none"
                  placeholder="Detailed tour itinerary and highlights..."
                />
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Price (USD)</label>
                  <input 
                    type="number"
                    {...register('price', { valueAsNumber: true })}
                    className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:border-[#5A5A40] outline-none transition-all"
                  />
                  {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Capacity</label>
                  <input 
                    type="number"
                    {...register('capacity', { valueAsNumber: true })}
                    className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:border-[#5A5A40] outline-none transition-all"
                  />
                  {errors.capacity && <p className="text-red-500 text-xs mt-1">{errors.capacity.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Available</label>
                  <input 
                    type="number"
                    {...register('availableSlots', { valueAsNumber: true })}
                    className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:border-[#5A5A40] outline-none transition-all"
                  />
                  {errors.availableSlots && <p className="text-red-500 text-xs mt-1">{errors.availableSlots.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Days</label>
                  <input 
                    type="number"
                    {...register('durationDays', { valueAsNumber: true })}
                    className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:border-[#5A5A40] outline-none transition-all"
                  />
                  {errors.durationDays && <p className="text-red-500 text-xs mt-1">{errors.durationDays.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Image URL</label>
                <input 
                  {...register('imageUrl')}
                  className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:border-[#5A5A40] outline-none transition-all"
                  placeholder="https://images.unsplash.com/..."
                />
                {errors.imageUrl && <p className="text-red-500 text-xs mt-1">{errors.imageUrl.message}</p>}
              </div>

              <div className="pt-4">
                <button type="submit" className="btn-primary w-full">
                  {editingTour ? 'Update Tour' : 'Create Tour'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
