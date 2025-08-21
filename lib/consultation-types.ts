// Types exactly matching schema.sql for consultations

export interface Consultation {
  id: string;
  client_id: string;
  lawyer_id: string;
  service_id?: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pendiente' | 'aceptada' | 'en_proceso' | 'completada' | 'cancelada';
  estimated_price?: number;
  final_price?: number;
  deadline?: string; // DATE
  client_notes?: string;
  lawyer_notes?: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  client_name?: string;
  client_email?: string;
  lawyer_name?: string;
  lawyer_email?: string;
  lawyer_user_id?: string;
  service_title?: string;
  service_type?: string;
}

export interface CreateConsultationData {
  lawyer_id: string;
  service_id?: string;
  title: string;
  description: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  deadline?: string;
  client_notes?: string;
}

export interface UpdateConsultationData {
  id: string;
  title?: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  status?: 'pendiente' | 'aceptada' | 'en_proceso' | 'completada' | 'cancelada';
  estimated_price?: number;
  final_price?: number;
  deadline?: string;
  client_notes?: string;
  lawyer_notes?: string;
}

export interface ConsultationFilters {
  status?: string;
  priority?: string;
  lawyer_id?: string;
  client_id?: string;
  date_from?: string;
  date_to?: string;
}

// Status flow for consultations
export const CONSULTATION_STATUS_FLOW = {
  pendiente: ['aceptada', 'cancelada'],
  aceptada: ['en_proceso', 'cancelada'],
  en_proceso: ['completada', 'cancelada'],
  completada: [], // Final state
  cancelada: [] // Final state
} as const;

// Priority levels
export const CONSULTATION_PRIORITIES = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
  urgent: 'Urgente'
} as const;

// Status labels
export const CONSULTATION_STATUS_LABELS = {
  pendiente: 'Pendiente',
  aceptada: 'Aceptada',
  en_proceso: 'En Proceso',
  completada: 'Completada',
  cancelada: 'Cancelada'
} as const;