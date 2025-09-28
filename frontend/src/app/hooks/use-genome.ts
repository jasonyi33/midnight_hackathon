import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { apiClient } from '../lib/api/client'
import { validateGenome } from '../lib/validation/genome-schema'

const GENOME_QUERY_KEY = ['genome-summary'] as const
const GENOME_PROOFS_KEY = ['proof-records'] as const

export const useGenomeSummary = () => {
  return useQuery({
    queryKey: GENOME_QUERY_KEY,
    queryFn: () => apiClient.getGenomeSummary(),
    staleTime: 30 * 1000,
  })
}

type UploadArgs = {
  file: File
  address: string
}

const readFile = (file: File) => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read file'))
    reader.readAsText(file)
  })
}

export const useGenomeUpload = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ file, address }: UploadArgs) => {
      const contents = await readFile(file)
      const parsed = validateGenome(JSON.parse(contents))
      
      // Transform to backend format
      const genomicData = {
        patientId: parsed.patient.id,
        metadata: {
          uploadedBy: 'patient',
          timestamp: new Date().toISOString(),
          address: address
        },
        markers: parsed.markers,
        traits: Object.keys(parsed.markers).reduce((traits, trait) => {
          const marker = parsed.markers[trait as keyof typeof parsed.markers]
          traits[trait] = {
            mutation_present: marker?.present || false,
            confidence_score: marker?.confidence || 0.95,
            score: marker?.score || 0
          }
          return traits
        }, {} as Record<string, any>),
        clinical_annotations: {}
      }
      
      // Send raw genomic data to backend for server-side encryption
      const response = await apiClient.uploadGenome({
        genomicData,
        encrypt: true
      })
      return { response, preview: parsed }
    },
    onSuccess: ({ response }) => {
      queryClient.setQueryData(GENOME_QUERY_KEY, response)
      queryClient.invalidateQueries({ queryKey: GENOME_PROOFS_KEY })
      toast.success('Genome encrypted and uploaded successfully')
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : 'Genome upload failed')
    },
  })
}
