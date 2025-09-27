import { useCallback, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { apiClient } from '../lib/api/client'
import { demoEvents } from '../lib/realtime/demo-events'
import { getSocket } from '../lib/realtime/socket'
import type { ProofGenerationPayload, ProofJob } from '../lib/api/types'
import { useAuthStore } from '../stores/auth-store'

const PROOF_JOB_KEY = (jobId: string) => ['proof-job', jobId]
const PROOF_RECORDS_KEY = ['proof-records']
const DEMO_MODE = (import.meta.env.VITE_DEMO_MODE ?? 'true').toLowerCase() === 'true'

export const useProofHistory = () => {
  return useQuery({
    queryKey: PROOF_RECORDS_KEY,
    queryFn: () => apiClient.listProofs(),
    staleTime: 15 * 1000,
  })
}

export const useProofJob = (jobId: string | null) => {
  const queryClient = useQueryClient()
  const { tokens } = useAuthStore((state) => ({ tokens: state.tokens }))

  useEffect(() => {
    if (!jobId) return
    const queryKey = PROOF_JOB_KEY(jobId)

    const handleProgress = (update: ProofJob) => {
      if (update.jobId !== jobId) return
      queryClient.setQueryData(queryKey, update)
      if (update.status === 'completed') {
        queryClient.invalidateQueries({ queryKey: PROOF_RECORDS_KEY })
      }
    }

    if (DEMO_MODE) {
      const listener = (event: Event) => {
        const detail = (event as CustomEvent<ProofJob>).detail
        handleProgress(detail)
      }
      demoEvents.addEventListener('proof:progress', listener)
      return () => demoEvents.removeEventListener('proof:progress', listener)
    }

    const socket = getSocket(tokens?.accessToken)
    if (!socket) return

    socket.emit('proof:subscribe', { jobId })

    const socketListener = (detail: ProofJob) => handleProgress(detail)
    socket.on('proof:progress', socketListener)

    return () => {
      socket.emit('proof:unsubscribe', { jobId })
      socket.off('proof:progress', socketListener)
    }
  }, [jobId, queryClient, tokens])

  return useQuery({
    queryKey: jobId ? PROOF_JOB_KEY(jobId) : ['proof-job'],
    queryFn: () => (jobId ? apiClient.getProofJob(jobId) : Promise.resolve(null)),
    enabled: Boolean(jobId),
    refetchOnWindowFocus: false,
    refetchInterval: (query) => {
      const data = query.state.data as ProofJob | null
      if (!data || data.status === 'completed' || data.status === 'failed') return false
      return 1500
    },
  })
}

export const useProofGenerator = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: ProofGenerationPayload) => apiClient.requestProof(payload),
    onSuccess: ({ jobId }) => {
      toast.success('Proof generation started')
      queryClient.invalidateQueries({ queryKey: PROOF_RECORDS_KEY })
      return jobId
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : 'Failed to queue proof')
    },
  })
}

export const useProofProgressSubscription = (jobId: string | null) => {
  const { data } = useProofJob(jobId)
  return data
}

export const useTraitProofAvailability = () => {
  const { data } = useProofHistory()
  return useCallback(
    (trait: ProofGenerationPayload['traitType']) => {
      return data?.some((proof) => proof.traitType === trait && proof.status === 'valid') ?? false
    },
    [data],
  )
}

// Aliases for consistent naming
export const useProofJobs = useProofHistory
export const useProofRecords = useProofHistory
