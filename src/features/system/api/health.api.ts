import { apiGet } from '@/lib/api-client';

export interface HealthPayload {
  status: 'ok' | 'degraded';
  environment: string;
  database: 'disconnected' | 'connected' | 'connecting' | 'disconnecting' | 'unknown';
  uptimeSeconds: number;
  timestamp: string;
}

export function fetchHealth(): Promise<HealthPayload> {
  return apiGet<HealthPayload>('/health');
}
