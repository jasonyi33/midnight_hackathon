import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { apiClient } from '../lib/api/client'
import { demoEvents } from '../lib/realtime/demo-events'
import { getSocket } from '../lib/realtime/socket'
import type { ConsentResponsePayload, VerificationRequest } from '../lib/api/types'
import { useAuthStore } from '../stores/auth-store'
import { useEffect } from 'react'

const VERIFICATION_REQUESTS_KEY = ['verification-requests']
const DEMO_MODE = (import.meta.env.VITE_DEMO_MODE ?? 'true').toLowerCase() === 'true'

export const useVerificationRequests = () => {
  const queryClient = useQueryClient()
  const { tokens } = useAuthStore((state) => ({ tokens: state.tokens }))

  useEffect(() => {
    if (DEMO_MODE) {
      const listener = () => {
        queryClient.invalidateQueries({ queryKey: VERIFICATION_REQUESTS_KEY })
      }
      demoEvents.addEventListener('consent:updated', listener)
      return () => {
        demoEvents.removeEventListener('consent:updated', listener)
      }
    }

    const socket = getSocket(tokens?.accessToken)
    if (!socket) return

    socket.on('verification:new', () => {
      queryClient.invalidateQueries({ queryKey: VERIFICATION_REQUESTS_KEY })
      toast.success('new verification request received')
    })

    socket.on('verification:updated', () => {
      queryClient.invalidateQueries({ queryKey: VERIFICATION_REQUESTS_KEY })
    })

    return () => {
      socket.off('verification:new')
      socket.off('verification:updated')
    }
  }, [queryClient, tokens])

  return useQuery({
    queryKey: VERIFICATION_REQUESTS_KEY,
    queryFn: () => apiClient.listVerificationRequests(),
    staleTime: 30 * 1000,
  })
}

export const useRespondToVerification = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (payload: {
      requestId: string
      approved: boolean
      expiryTime?: string
    }) => {
      return apiClient.respondToVerification({
        requestId: payload.requestId,
        decision: payload.approved ? 'approved' : 'denied',
        expiresAt: payload.expiryTime
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VERIFICATION_REQUESTS_KEY })
      toast.success('verification request updated')
    },
    onError: (error) => {
      toast.error(`failed to update request: ${error instanceof Error ? error.message : 'unknown error'}`)
    }
  })
}

export const useVerificationResponse = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: ConsentResponsePayload) => {
      return apiClient.respondToVerification(payload)
    },
    onSuccess: (data) => {
      queryClient.setQueryData<VerificationRequest[]>(VERIFICATION_REQUESTS_KEY, (prevRequests) => {
        if (!prevRequests) return [data]
        return prevRequests.map((r) => (r.id === data.id ? data : r))
      })
      toast.success(`Request ${data.status === 'approved' ? 'approved' : 'denied'}`)
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : 'Failed to respond to request')
    },
  })
}