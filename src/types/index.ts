export interface User {
  id: string;
  full_name: string;
  email: string;
  role: 'master_admin' | 'sub_admin' | 'owner' | 'collaborator';
  business_id: string | null;
  totp_enabled: boolean;
}

export interface AuthResponse {
  token: string;
  user: { id: string; role: string; business_id: string | null };
}

export interface Business {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  phone: string | null;
  whatsapp: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  cep: string | null;
  cnpj: string | null;
  description: string | null;
  instagram: string | null;
  facebook: string | null;
  tiktok: string | null;
  booking_enabled: boolean;
  subscription_status: string;
  trial_ends_at: string | null;
  plan_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  owner_name: string | null;
  owner_email: string | null;
  owner_document: string | null;
  owner_document_type: string | null;
  plan_name: string | null;
}

export interface Plan {
  id: string;
  name: string;
  description: string | null;
  price_monthly: number;
  price_yearly: number;
  max_collaborators: number;
  max_services: number;
  max_appointments_month: number;
  is_active: boolean;
}
