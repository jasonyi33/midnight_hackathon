import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';

export class WebSocketService {
  private io: Server | null = null;
  private userSockets: Map<string, Set<string>> = new Map();

  initialize(httpServer: HTTPServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    this.setupMiddleware();
    this.setupHandlers();

    logger.info('WebSocket service initialized');
  }

  private setupMiddleware() {
    if (!this.io) return;

    this.io.use(async (socket: Socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

        if (!token) {
          return next(new Error('No authentication token provided'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret') as any;
        socket.data.userId = decoded.userId;
        socket.data.role = decoded.role;

        // Track user socket connections
        if (!this.userSockets.has(decoded.userId)) {
          this.userSockets.set(decoded.userId, new Set());
        }
        this.userSockets.get(decoded.userId)?.add(socket.id);

        next();
      } catch (err) {
        logger.error('WebSocket authentication failed:', err);
        next(new Error('Authentication failed'));
      }
    });
  }

  private setupHandlers() {
    if (!this.io) return;

    this.io.on('connection', (socket: Socket) => {
      const userId = socket.data.userId;
      const role = socket.data.role;

      logger.info(`User ${userId} connected via WebSocket (role: ${role})`);

      // Join user-specific room
      socket.join(`user:${userId}`);

      // Join role-specific room
      if (role) {
        socket.join(`role:${role}`);
      }

      // Handle patient-specific events
      socket.on('join:patient-room', (patientId: string) => {
        if (socket.data.role === 'doctor' || socket.data.userId === patientId) {
          socket.join(`patient:${patientId}`);
          logger.debug(`Socket ${socket.id} joined patient room: ${patientId}`);
        }
      });

      // Handle proof progress subscription
      socket.on('subscribe:proof-progress', (jobId: string) => {
        socket.join(`proof:${jobId}`);
        logger.debug(`Socket ${socket.id} subscribed to proof progress: ${jobId}`);
      });

      // Handle verification request subscription
      socket.on('subscribe:verifications', () => {
        socket.join(`verifications:${userId}`);
        logger.debug(`Socket ${socket.id} subscribed to verifications`);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        logger.info(`User ${userId} disconnected from WebSocket`);

        // Remove from user sockets tracking
        const userSocketSet = this.userSockets.get(userId);
        if (userSocketSet) {
          userSocketSet.delete(socket.id);
          if (userSocketSet.size === 0) {
            this.userSockets.delete(userId);
          }
        }
      });

      // Send initial connection confirmation
      socket.emit('connected', {
        userId,
        role,
        socketId: socket.id
      });
    });
  }

  // Emit proof generation progress
  emitProofProgress(jobId: string, progress: number, stage?: string) {
    if (!this.io) return;

    this.io.to(`proof:${jobId}`).emit('proof:progress', {
      jobId,
      progress,
      stage,
      timestamp: new Date().toISOString()
    });

    logger.debug(`Emitted proof progress: ${jobId} - ${progress}% (${stage})`);
  }

  // Emit proof completion
  emitProofComplete(jobId: string, proof: any) {
    if (!this.io) return;

    this.io.to(`proof:${jobId}`).emit('proof:complete', {
      jobId,
      proof,
      timestamp: new Date().toISOString()
    });

    logger.info(`Emitted proof completion: ${jobId}`);
  }

  // Emit verification request notification
  emitVerificationRequest(patientId: string, request: any) {
    if (!this.io) return;

    this.io.to(`user:${patientId}`).emit('verification:request', {
      request,
      timestamp: new Date().toISOString()
    });

    logger.info(`Emitted verification request to patient: ${patientId}`);
  }

  // Emit verification response notification
  emitVerificationResponse(doctorId: string, response: any) {
    if (!this.io) return;

    this.io.to(`user:${doctorId}`).emit('verification:response', {
      response,
      timestamp: new Date().toISOString()
    });

    logger.info(`Emitted verification response to doctor: ${doctorId}`);
  }

  // Emit data update for researchers
  emitDataUpdate(updateType: string, data?: any) {
    if (!this.io) return;

    this.io.to('role:researcher').emit('data:update', {
      type: updateType,
      data,
      timestamp: new Date().toISOString()
    });

    logger.info(`Emitted data update to researchers: ${updateType}`);
  }

  // Check if user is connected
  isUserConnected(userId: string): boolean {
    return this.userSockets.has(userId) && this.userSockets.get(userId)!.size > 0;
  }

  // Get connected users count
  getConnectedUsersCount(): number {
    return this.userSockets.size;
  }

  // Broadcast to all connected users
  broadcast(event: string, data: any) {
    if (!this.io) return;

    this.io.emit(event, data);
    logger.debug(`Broadcast event: ${event}`);
  }

  // Send to specific user
  sendToUser(userId: string, event: string, data: any) {
    if (!this.io) return;

    this.io.to(`user:${userId}`).emit(event, data);
    logger.debug(`Sent ${event} to user: ${userId}`);
  }

  // Get socket instance
  getIO(): Server | null {
    return this.io;
  }
}

// Export singleton instance
export const websocketService = new WebSocketService();