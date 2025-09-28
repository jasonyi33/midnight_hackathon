import { Server } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { config } from '@config/index';
import { logger } from '@utils/logger';

export class SocketService {
  private io!: Server;
  private static instance: SocketService;

  static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  initialize(httpServer: HTTPServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: config.CORS_ORIGIN,
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    // Authentication middleware
    this.io.use((socket, next) => {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication failed - no token'));
      }

      try {
        const decoded = jwt.verify(token, config.JWT_SECRET) as any;
        socket.data.userId = decoded.userId;
        socket.data.role = decoded.role;
        next();
      } catch (err) {
        next(new Error('Authentication failed - invalid token'));
      }
    });

    this.setupHandlers();

    logger.info('WebSocket server initialized');
  }

  private setupHandlers() {
    this.io.on('connection', (socket) => {
      const userId = socket.data.userId;
      const role = socket.data.role;

      logger.info(`User ${userId} (${role}) connected via WebSocket`);

      // Join user's personal room
      socket.join(`user:${userId}`);

      // Join role-based room
      socket.join(`role:${role}`);

      // Handle joining specific rooms
      socket.on('join:patient-room', (patientId: string) => {
        if (role === 'doctor' || userId === patientId) {
          socket.join(`patient:${patientId}`);
          logger.debug(`User ${userId} joined patient room: ${patientId}`);
        }
      });

      socket.on('join:doctor-room', (doctorId: string) => {
        if (role === 'patient' || userId === doctorId) {
          socket.join(`doctor:${doctorId}`);
          logger.debug(`User ${userId} joined doctor room: ${doctorId}`);
        }
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        logger.info(`User ${userId} disconnected from WebSocket`);
      });

      // Handle errors
      socket.on('error', (error) => {
        logger.error(`WebSocket error for user ${userId}:`, error);
      });
    });
  }

  // Emit proof generation progress
  emitProofProgress(userId: string, jobId: string, progress: number) {
    this.io.to(`user:${userId}`).emit('proof:progress', {
      jobId,
      progress,
      timestamp: Date.now()
    });
  }

  // Emit proof completion
  emitProofComplete(userId: string, jobId: string, proof: any) {
    this.io.to(`user:${userId}`).emit('proof:complete', {
      jobId,
      proof,
      timestamp: Date.now()
    });
  }

  // Emit proof error to user
  emitProofError(userId: string, error: { message: string; code: string }) {
    this.io.to(`user:${userId}`).emit('proof:error', {
      error,
      timestamp: Date.now()
    });
  }

  // Emit verification request to patient
  emitVerificationRequest(patientId: string, request: any) {
    this.io.to(`user:${patientId}`).emit('verification:requested', {
      request,
      timestamp: Date.now()
    });
  }

  // Emit verification response to doctor
  emitVerificationResponse(doctorId: string, response: any) {
    this.io.to(`user:${doctorId}`).emit('verification:responded', {
      response,
      timestamp: Date.now()
    });
  }

  // Broadcast to all users in a role
  broadcastToRole(role: string, event: string, data: any) {
    this.io.to(`role:${role}`).emit(event, {
      data,
      timestamp: Date.now()
    });
  }

  // Get connected users count
  getConnectedUsersCount(): number {
    return this.io.sockets.sockets.size;
  }
}

export const socketService = SocketService.getInstance();