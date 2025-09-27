import { z } from 'zod';

export const verificationRequestSchema = z.object({
  body: z.object({
    patientAddress: z.string(),
    traitType: z.enum(['BRCA1', 'BRCA2', 'CYP2D6']),
    requirements: z.object({
      minRiskScore: z.number().min(0).max(1).optional(),
      maxRiskScore: z.number().min(0).max(1).optional(),
      requiredVariants: z.array(z.string()).optional(),
      excludedVariants: z.array(z.string()).optional()
    }).optional()
  })
});

export const verificationResponseSchema = z.object({
  params: z.object({
    requestId: z.string().uuid()
  }),
  body: z.object({
    approved: z.boolean()
  })
});

export type VerificationRequestInput = z.infer<typeof verificationRequestSchema>['body'];
export type VerificationResponseInput = z.infer<typeof verificationResponseSchema>['body'];