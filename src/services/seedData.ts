import { dbService } from './db';
import { Tour, Customer } from '../types';

const sampleCustomers = [
  { name: 'John Smith', email: 'john.smith@example.com', phone: '+254 711 000111', location: 'London, UK', preferences: ['Luxury', 'Photography'], createdAt: new Date().toISOString() },
  { name: 'Sarah Johnson', email: 'sarah.j@example.com', phone: '+254 722 222333', location: 'New York, USA', preferences: ['Wildlife', 'Bird Watching'], createdAt: new Date().toISOString() },
  { name: 'Michael Chen', email: 'm.chen@example.com', phone: '+254 733 444555', location: 'Singapore', preferences: ['Adventure', 'Camping'], createdAt: new Date().toISOString() },
];

const sampleLeads = [
  { customerName: 'Alice Brown', email: 'alice.b@example.com', phone: '+1 555 0123', source: 'Website', status: 'new', interest: 'Masai Mara Safari', createdAt: new Date().toISOString() },
  { customerName: 'Bob Wilson', email: 'bob.w@example.com', phone: '+44 20 7946 0000', source: 'Referral', status: 'contacted', interest: 'Amboseli Photography', createdAt: new Date().toISOString() },
  { customerName: 'Elena Garcia', email: 'elena.g@example.com', phone: '+34 91 123 4567', source: 'Social Media', status: 'qualified', interest: 'Luxury Beach & Safari', createdAt: new Date().toISOString() },
];

const sampleBookings = [
  { customerId: 'temp_id_1', customerName: 'John Smith', safariName: '7-Day Masai Mara Migration', startDate: '2026-07-15', endDate: '2026-07-22', status: 'confirmed', totalAmount: 450000, paidAmount: 450000, createdAt: new Date().toISOString() },
  { customerId: 'temp_id_2', customerName: 'Sarah Johnson', safariName: 'Amboseli & Tsavo Adventure', startDate: '2026-08-10', endDate: '2026-08-17', status: 'pending', totalAmount: 320000, paidAmount: 50000, createdAt: new Date().toISOString() },
];

const sampleComplaints = [
  { customerId: 'temp_id_1', customerName: 'John Smith', subject: 'Delayed Airport Transfer', description: 'The driver was 30 minutes late for the pick-up.', status: 'resolved', priority: 'medium', createdAt: new Date().toISOString() },
  { customerId: 'temp_id_3', customerName: 'Michael Chen', subject: 'Dietary Requirements Not Met', description: 'The lodge did not have my vegetarian options ready.', status: 'open', priority: 'high', createdAt: new Date().toISOString() },
];

const sampleTours = [
  { 
    name: 'Maasai Mara Great Migration', 
    description: 'Experience the world-famous wildebeest migration in the heart of the Maasai Mara.', 
    price: 1200, 
    capacity: 12, 
    availableSlots: 8, 
    durationDays: 7, 
    location: 'Maasai Mara, Kenya', 
    imageUrl: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&q=80&w=1000',
    createdAt: new Date().toISOString() 
  },
  { 
    name: 'Amboseli Elephant Trail', 
    description: 'Get up close with the giant elephants of Amboseli with Mt. Kilimanjaro as your backdrop.', 
    price: 950, 
    capacity: 8, 
    availableSlots: 5, 
    durationDays: 5, 
    location: 'Amboseli, Kenya', 
    imageUrl: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=1000',
    createdAt: new Date().toISOString() 
  },
  { 
    name: 'Serengeti Plains Safari', 
    description: 'Witness the vastness of the Serengeti and its diverse wildlife on this luxury safari.', 
    price: 1500, 
    capacity: 10, 
    availableSlots: 6, 
    durationDays: 8, 
    location: 'Serengeti, Tanzania', 
    imageUrl: 'https://images.unsplash.com/photo-1534171472159-edb6d1e0b63c?auto=format&fit=crop&q=80&w=1000',
    createdAt: new Date().toISOString() 
  },
  { 
    name: 'Tsavo Red Elephant Safari', 
    description: 'Explore the vast landscapes of Tsavo East and West, home to the famous red elephants.', 
    price: 850, 
    capacity: 10, 
    availableSlots: 10, 
    durationDays: 6, 
    location: 'Tsavo, Kenya', 
    imageUrl: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&q=80&w=1000',
    createdAt: new Date().toISOString() 
  },
  { 
    name: 'Samburu Reserve Adventure', 
    description: 'Discover the unique wildlife of Samburu, including the Gerenuk and Grevy\'s Zebra.', 
    price: 1100, 
    capacity: 8, 
    availableSlots: 4, 
    durationDays: 4, 
    location: 'Samburu, Kenya', 
    imageUrl: 'https://images.unsplash.com/photo-1535941339077-2dd1c7963098?auto=format&fit=crop&q=80&w=1000',
    createdAt: new Date().toISOString() 
  },
  { 
    name: 'Diani Beach Retreat', 
    description: 'Relax on the pristine white sands of Diani Beach after your inland safari adventure.', 
    price: 700, 
    capacity: 20, 
    availableSlots: 15, 
    durationDays: 5, 
    location: 'Diani, Kenya', 
    imageUrl: 'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?auto=format&fit=crop&q=80&w=1000',
    createdAt: new Date().toISOString() 
  }
];

export const seedSampleData = async () => {
  try {
    // Get existing data to avoid duplicates
    const existingTours = await dbService.getCollection<Tour>('tours');
    const existingCustomers = await dbService.getCollection<Customer>('customers');
    const existingLeads = await dbService.getCollection<any>('leads');

    console.log('Seeding tours...');
    for (const tour of sampleTours) {
      if (!existingTours.some(t => t.name === tour.name)) {
        await dbService.createDocument('tours', tour);
      }
    }

    console.log('Seeding customers...');
    for (const customer of sampleCustomers) {
      if (!existingCustomers.some(c => c.email === customer.email)) {
        await dbService.createDocument('customers', customer);
      }
    }

    console.log('Seeding leads...');
    for (const lead of sampleLeads) {
      if (!existingLeads.some((l: any) => l.email === lead.email)) {
        await dbService.createDocument('leads', lead);
      }
    }

    alert('Sample data seeded successfully! Existing records were skipped to avoid duplicates.');
  } catch (error) {
    console.error('Error seeding data:', error);
    alert('Error seeding data. Check console for details.');
  }
};
