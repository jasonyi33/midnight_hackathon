import { z } from 'zod';

// Genomic data validation schemas based on PRD Appendix A
export const geneticMarkerSchema = z.object({
  status: z.enum(['wild_type', 'heterozygous', 'homozygous', 'mutation_detected']),
  variants: z.array(z.string()),
  riskScore: z.number().min(0).max(1),
  confidence: z.number().min(0).max(1)
});

export const pharmacogenomicMarkerSchema = geneticMarkerSchema.extend({
  phenotype: z.enum([
    'poor_metabolizer',
    'intermediate_metabolizer',
    'normal_metabolizer',
    'rapid_metabolizer',
    'ultrarapid_metabolizer'
  ]),
  diplotype: z.string(),
  activityScore: z.number().min(0).max(3)
});

export const genomicDataSchema = z.object({
  body: z.object({
    patientId: z.string(),
    sequenceDate: z.string().datetime(),
    genome: z.object({
      BRCA1: geneticMarkerSchema,
      BRCA2: geneticMarkerSchema,
      CYP2D6: pharmacogenomicMarkerSchema,
      APOE: geneticMarkerSchema.optional(),
      HER2: geneticMarkerSchema.optional()
    }),
    metadata: z.object({
      version: z.string(),
      laboratory: z.string().optional(),
      qualityScore: z.number().min(0).max(100).optional()
    })
  })
});

export const genomeUploadSchema = z.object({
  body: z.object({
    genomicData: genomicDataSchema.shape.body,
    encrypt: z.boolean().default(true)
  })
});

export const genomeRetrieveSchema = z.object({
  params: z.object({
    commitmentHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/)
  })
});

export type GenomicData = z.infer<typeof genomicDataSchema>['body'];
export type GeneticMarker = z.infer<typeof geneticMarkerSchema>;
export type PharmacogenomicMarker = z.infer<typeof pharmacogenomicMarkerSchema>;
export type GenomeUploadInput = z.infer<typeof genomeUploadSchema>['body'];

export interface GenomeCommitment {
  id: string;
  userId: string;
  commitmentHash: string;
  ipfsCid: string;
  encryptedKey: string;
  createdAt: Date;
}