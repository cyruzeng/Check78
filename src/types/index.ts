export interface MeasurementResult {
  id?: string;
  name: string;
  length: number;
  evaluation: string;
  created_at?: string;
  ip_address?: string;
}

export interface UserAgreement {
  accepted: boolean;
  timestamp?: string;
}

export interface AdminConfig {
  id: string;
  forbidden_strings: string[];
  easter_eggs: Record<string, EasterEgg>;
  created_at?: string;
  updated_at?: string;
}

export interface EasterEgg {
  name: string;
  length: number;
  message: string;
  is_special: boolean;
}

export interface RankingItem {
  id: string;
  name: string;
  length: number;
  rank: number;
  created_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface MeasurementRequest {
  name: string;
  ip_address?: string;
}

export interface RankingSubmission {
  name: string;
  length: number;
  ip_address?: string;
}