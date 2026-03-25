export type UserRole = 'admin' | 'sales' | 'support' | 'sales_manager' | 'marketing_manager';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  preferences: string[];
  createdAt: string;
  updatedAt: string;
}

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'lost';

export interface Lead {
  id: string;
  customerId: string;
  source: string;
  status: LeadStatus;
  notes: string;
  assignedTo: string;
  createdAt: string;
}

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'partial' | 'paid' | 'refunded';

export interface Tour {
  id: string;
  name: string;
  description: string;
  price: number;
  capacity: number;
  availableSlots: number;
  durationDays: number;
  location: string;
  imageUrl?: string;
  createdAt: string;
}

export interface Booking {
  id: string;
  customerId: string;
  tourId: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  startDate: string;
  endDate: string;
  packageDetails: string;
  createdAt: string;
}

export type ComplaintStatus = 'open' | 'resolved';

export interface Complaint {
  id: string;
  customerId: string;
  description: string;
  status: ComplaintStatus;
  assignedTo: string;
  resolution?: string;
  satisfactionScore?: number;
  createdAt: string;
}
