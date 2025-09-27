/**
 * Real WebSocket Hook Implementation
 * Dev 1 & Dev 2: Task 3.6 - Enable WebSocket client integration
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

// WebSocket configuration
const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3000';
const RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 3000;

// Event types
export interface ProofProgressEvent {
  jobId: string;
  progress: number;
  stage?: string;
  traitType?: string;
}

export interface VerificationRequestEvent {
  from: string;
  timestamp: Date;
  action: 'REVIEW_REQUIRED' | 'APPROVED' | 'DENIED';
  requestId?: string;
}

export interface DataUpdatedEvent {
  type: string;
  data: any;
  timestamp: Date;
}

export interface WebSocketHookReturn {
  socket: Socket | null;
  connected: boolean;
  connecting: boolean;
  error: string | null;
  // Event handlers
  onProofProgress: (callback: (data: ProofProgressEvent) => void) => void;
  onVerificationRequest: (callback: (data: VerificationRequestEvent) => void) => void;
  onDataUpdated: (callback: (data: DataUpdatedEvent) => void) => void;
  // Actions
  joinRoom: (room: string) => void;
  leaveRoom: (room: string) => void;
  emit: (event: string, data: any) => void;
  reconnect: () => void;
}

export function useRealWebSocket(): WebSocketHookReturn {
  const { isAuthenticated, accessToken, user } = useAuthStore();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reconnectAttempts = useRef(0);
  const eventHandlers = useRef<Map<string, Function>>(new Map());

  /**
   * Initialize WebSocket connection
   */
  const initializeSocket = useCallback(() => {
    if (!isAuthenticated || !accessToken) {
      console.log('WebSocket: Not authenticated, skipping connection');
      return;
    }

    setConnecting(true);
    setError(null);

    console.log('WebSocket: Initializing connection to', WS_URL);

    const newSocket = io(WS_URL, {
      auth: {
        token: accessToken,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: RECONNECT_ATTEMPTS,
      reconnectionDelay: RECONNECT_DELAY,
      reconnectionDelayMax: RECONNECT_DELAY * 2,
    });

    // Connection handlers
    newSocket.on('connect', () => {
      console.log('WebSocket: Connected successfully');
      setConnected(true);
      setConnecting(false);
      setError(null);
      reconnectAttempts.current = 0;

      // Auto-join rooms based on user role
      if (user?.role === 'patient') {
        newSocket.emit('join:patient-room', user.id);
      } else if (user?.role === 'doctor') {
        newSocket.emit('join:doctor-room');
      } else if (user?.role === 'researcher') {
        newSocket.emit('join:research-updates');
      }

      toast.success('Real-time connection established');
    });

    newSocket.on('connect_error', (error) => {
      console.error('WebSocket: Connection error:', error);
      setConnecting(false);
      setError(error.message);

      if (reconnectAttempts.current < RECONNECT_ATTEMPTS) {
        reconnectAttempts.current++;
        toast.error(`Connection failed. Retrying... (${reconnectAttempts.current}/${RECONNECT_ATTEMPTS})`);
      } else {
        toast.error('Could not establish real-time connection');
      }
    });

    newSocket.on('disconnect', (reason) => {
      console.log('WebSocket: Disconnected:', reason);
      setConnected(false);

      if (reason === 'io server disconnect') {
        // Server initiated disconnect, try to reconnect
        newSocket.connect();
      }
    });

    // Custom event: Server notification
    newSocket.on('server:message', (data: any) => {
      console.log('Server message:', data);
      if (data.type === 'info') {
        toast.success(data.message);
      } else if (data.type === 'warning') {
        toast(data.message, { icon: '⚠️' });
      } else if (data.type === 'error') {
        toast.error(data.message);
      }
    });

    // Proof progress events
    newSocket.on('proof:progress', (data: ProofProgressEvent) => {
      console.log('Proof progress:', data);
      const handler = eventHandlers.current.get('proof:progress');
      if (handler) handler(data);
    });

    newSocket.on('proof:complete', (data: any) => {
      console.log('Proof complete:', data);
      toast.success('Proof generation completed!');
      const handler = eventHandlers.current.get('proof:complete');
      if (handler) handler(data);
    });

    newSocket.on('proof:error', (data: any) => {
      console.error('Proof error:', data);
      toast.error(`Proof generation failed: ${data.message}`);
      const handler = eventHandlers.current.get('proof:error');
      if (handler) handler(data);
    });

    // Verification events
    newSocket.on('verification:request', (data: VerificationRequestEvent) => {
      console.log('Verification request:', data);
      toast(`New verification request from ${data.from}`, { icon: '🔔' });
      const handler = eventHandlers.current.get('verification:request');
      if (handler) handler(data);
    });

    newSocket.on('verification:approved', (data: any) => {
      console.log('Verification approved:', data);
      toast.success('Verification request approved');
      const handler = eventHandlers.current.get('verification:approved');
      if (handler) handler(data);
    });

    newSocket.on('verification:denied', (data: any) => {
      console.log('Verification denied:', data);
      toast.error('Verification request denied');
      const handler = eventHandlers.current.get('verification:denied');
      if (handler) handler(data);
    });

    // Research/aggregation events
    newSocket.on('data:updated', (data: DataUpdatedEvent) => {
      console.log('Data updated:', data);
      const handler = eventHandlers.current.get('data:updated');
      if (handler) handler(data);
    });

    // Status events
    newSocket.on('status:updated', (data: any) => {
      console.log('Status updated:', data);
      const handler = eventHandlers.current.get('status:updated');
      if (handler) handler(data);
    });

    setSocket(newSocket);

    return newSocket;
  }, [isAuthenticated, accessToken, user]);

  /**
   * Setup event handler
   */
  const setupEventHandler = useCallback((event: string, callback: Function) => {
    eventHandlers.current.set(event, callback);
  }, []);

  /**
   * Join a room
   */
  const joinRoom = useCallback((room: string) => {
    if (socket && connected) {
      socket.emit('join:room', room);
      console.log(`Joined room: ${room}`);
    }
  }, [socket, connected]);

  /**
   * Leave a room
   */
  const leaveRoom = useCallback((room: string) => {
    if (socket && connected) {
      socket.emit('leave:room', room);
      console.log(`Left room: ${room}`);
    }
  }, [socket, connected]);

  /**
   * Emit custom event
   */
  const emit = useCallback((event: string, data: any) => {
    if (socket && connected) {
      socket.emit(event, data);
      console.log(`Emitted event: ${event}`, data);
    } else {
      console.warn(`Cannot emit ${event}: Not connected`);
    }
  }, [socket, connected]);

  /**
   * Manual reconnect
   */
  const reconnect = useCallback(() => {
    if (socket) {
      socket.disconnect();
      socket.connect();
    } else {
      initializeSocket();
    }
  }, [socket, initializeSocket]);

  /**
   * Event handler setters
   */
  const onProofProgress = useCallback((callback: (data: ProofProgressEvent) => void) => {
    setupEventHandler('proof:progress', callback);
  }, [setupEventHandler]);

  const onVerificationRequest = useCallback((callback: (data: VerificationRequestEvent) => void) => {
    setupEventHandler('verification:request', callback);
  }, [setupEventHandler]);

  const onDataUpdated = useCallback((callback: (data: DataUpdatedEvent) => void) => {
    setupEventHandler('data:updated', callback);
  }, [setupEventHandler]);

  /**
   * Initialize socket on mount and auth change
   */
  useEffect(() => {
    let socketInstance: Socket | null = null;

    if (isAuthenticated && accessToken) {
      socketInstance = initializeSocket();
    }

    // Cleanup on unmount
    return () => {
      if (socketInstance) {
        console.log('WebSocket: Cleaning up connection');
        socketInstance.removeAllListeners();
        socketInstance.disconnect();
      }
      eventHandlers.current.clear();
    };
  }, [isAuthenticated, accessToken]);

  /**
   * Handle visibility change - reconnect when tab becomes visible
   */
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && socket && !connected) {
        console.log('Tab became visible, attempting reconnect');
        reconnect();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [socket, connected, reconnect]);

  /**
   * Debug: Log connection status
   */
  useEffect(() => {
    console.log('WebSocket Status:', {
      connected,
      connecting,
      error,
      hasSocket: !!socket,
    });
  }, [connected, connecting, error, socket]);

  return {
    socket,
    connected,
    connecting,
    error,
    onProofProgress,
    onVerificationRequest,
    onDataUpdated,
    joinRoom,
    leaveRoom,
    emit,
    reconnect,
  };
}

// Export a simpler hook for components that only need connection status
export function useWebSocketStatus() {
  const { connected, connecting, error } = useRealWebSocket();
  return { connected, connecting, error };
}

// Export a hook specifically for proof progress
export function useProofProgress(jobId: string | null) {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState<string>('');
  const { onProofProgress, joinRoom, leaveRoom } = useRealWebSocket();

  useEffect(() => {
    if (!jobId) return;

    // Join job-specific room
    joinRoom(`proof:${jobId}`);

    // Setup progress handler
    onProofProgress((data) => {
      if (data.jobId === jobId) {
        setProgress(data.progress);
        setStage(data.stage || '');
      }
    });

    // Cleanup
    return () => {
      leaveRoom(`proof:${jobId}`);
    };
  }, [jobId, joinRoom, leaveRoom, onProofProgress]);

  return { progress, stage };
}

// Export a hook for verification requests
export function useVerificationNotifications() {
  const [pendingRequests, setPendingRequests] = useState<VerificationRequestEvent[]>([]);
  const { onVerificationRequest } = useRealWebSocket();

  useEffect(() => {
    onVerificationRequest((data) => {
      setPendingRequests((prev) => [...prev, data]);

      // Auto-clear after 10 seconds
      setTimeout(() => {
        setPendingRequests((prev) => prev.filter((r) => r.requestId !== data.requestId));
      }, 10000);
    });
  }, [onVerificationRequest]);

  return pendingRequests;
}