import { z } from 'zod';

export const EnvironmentSchema = z.enum(['development', 'staging', 'production', 'test']);

export const HealthStatusSchema = z.object({
  status: z.enum(['ok', 'degraded', 'down']),
  version: z.string(),
  environment: EnvironmentSchema,
  timestamp: z.string(),
  uptimeSeconds: z.number()
});

export type HealthStatus = z.infer<typeof HealthStatusSchema>;
