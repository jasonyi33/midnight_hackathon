import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { apiClient } from '../lib/api/client'
import { encryptGenome } from '../lib/crypto/genome-encryption'
import { validateGenome } from '../lib/validation/genome-schema'

const GENOME_QUERY_KEY = ['genome-summary'] as const
const GENOME_PROOFS_KEY = ['proof-records'] as const
const PASSPHRASE = import.meta.env.VITE_GENOME_PASSPHRASE ?? 'demo-genome-secret'

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
      const encrypted = await encryptGenome(contents, `${PASSPHRASE}:${address}`)
      const response = await apiClient.uploadGenome({
        encryptedData: encrypted.encryptedData,
        iv: encrypted.iv,
        salt: encrypted.salt,
        size: file.size,
        originalName: file.name,
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
