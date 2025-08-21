// Types exactly matching schema.sql

export interface LawyerProfile {
  id: string;
  user_id: string;
  license_number: string;
  bar_association: string;
  years_experience: number;
  education: string;
  bio: string;
  hourly_rate: number;
  consultation_rate: number;
  is_verified: boolean;
  rating: number;
  total_reviews: number;
  total_consultations: number;
  availability_schedule: object; // JSONB field
  office_address: string;
  languages: string;
  created_at: string;
  updated_at: string;
  // Joined fields from users table
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
  // Related data
  specialties?: LegalSpecialty[];
  services?: LawyerService[];
}

export interface LegalSpecialty {
  id: string;
  name: string;
  description: string;
  icon: string;
  is_active: boolean;
  created_at: string;
}

export interface LawyerService {
  id: string;
  lawyer_id: string;
  title: string;
  description: string;
  price: number;
  duration_minutes: number;
  service_type: string;
  status: 'activo' | 'inactivo' | 'suspendido';
  requirements: string;
  deliverables: string;
  created_at: string;
  updated_at: string;
}

export interface CreateLawyerProfileData {
  license_number: string;
  bar_association: string;
  years_experience: number;
  education: string;
  bio: string;
  hourly_rate: number;
  consultation_rate: number;
  office_address: string;
  languages: string;
  availability_schedule?: object;
  specialties?: string[]; // Array of specialty IDs
}

export interface UpdateLawyerProfileData {
  id: string;
  license_number?: string;
  bar_association?: string;
  years_experience?: number;
  education?: string;
  bio?: string;
  hourly_rate?: number;
  consultation_rate?: number;
  office_address?: string;
  languages?: string;
  availability_schedule?: object;
}

export interface CreateLawyerServiceData {
  title: string;
  description: string;
  price: number;
  duration_minutes: number;
  service_type: string;
  requirements?: string;
  deliverables?: string;
}

export interface UpdateLawyerServiceData {
  id: string;
  title?: string;
  description?: string;
  price?: number;
  duration_minutes?: number;
  service_type?: string;
  status?: 'activo' | 'inactivo' | 'suspendido';
  requirements?: string;
  deliverables?: string;
}