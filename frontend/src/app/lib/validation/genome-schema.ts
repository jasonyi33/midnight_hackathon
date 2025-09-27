import { z } from 'zod'
import type { TraitType } from '../api/types'

const TRAIT_IDS: TraitType[] = ['BRCA1', 'BRCA2', 'CYP2D6']

export const genomeSchema = z.object({
  patient: z.object({
    id: z.string().min(1),
    createdAt: z.string().optional(),
  }),
  markers: z.record(
    z.enum(TRAIT_IDS),
    z.object({
      present: z.boolean().optional(),
      absent: z.boolean().optional(),
      score: z.number().min(0).max(3).optional(),
      confidence: z.number().min(0).max(1).optional(),
    }),
  ),
})

export type ParsedGenome = z.infer<typeof genomeSchema>

export const validateGenome = (input: unknown): ParsedGenome => {
  return genomeSchema.parse(input)
}
