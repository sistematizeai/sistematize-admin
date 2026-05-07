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
  name: string;
  slug: string;
  subscription_status: string;
  plan_id: string | null;
  created_at: string;
}

export interface Plan {
  id: string;
  name: string;
  price_monthly: number;
  price_yearly: number;
  max_collaborators: number;
  max_services: number;
  max_appointments_month: number;
  is_active: boolean;
}
