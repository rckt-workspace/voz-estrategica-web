import { z } from "zod";

export const IntegrationDetailsSchema = z.record(z.unknown()).optional();

export const IntegrationSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.enum(["connected", "pending", "error"]),
  description: z.string(),
  latencyMs: z.number().nullable().optional(),
  details: IntegrationDetailsSchema,
});

export const IntegrationsHealthResponseSchema = z.object({
  success: z.boolean(),
  checkedAt: z.string(),
  integrations: z.array(IntegrationSchema),
});

export type Integration = z.infer<typeof IntegrationSchema>;
export type IntegrationsHealthResponse = z.infer<typeof IntegrationsHealthResponseSchema>;
