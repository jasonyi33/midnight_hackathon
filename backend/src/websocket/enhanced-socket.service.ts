/**
 * Enhanced WebSocket Service Implementation
 * Task 3.5: Implement WebSocket server with JWT authentication and room management
 */

import { Server, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { config } from '@config/index';
import { logger } from '@utils/logger';
import { redis } from '@config/redis';

export interface SocketUser {
  userId: string;
  role: 'patient' | 'doctor' | 'researcher';
  walletAddress: string;
}

export interface ProofProgressData {
  jobId: string;
  progress: number;
  stage?: string;
  traitType?: string;
}

export interface VerificationRequestData {
  from: string;
  timestamp: Date;
  action: 'REVIEW_REQUIRED' | 'APPROVED' | 'DENIED';
  requestId?: string;
}

export class EnhancedSocketService {
  private io: Server | null = null;
  private connectedUsers: Map<string, SocketUser> = new Map();
  private userSockets: Map<string, Set<string>> = new Map(); // userId -> socketIds

  /**
   * Initialize WebSocket server
   */
  initialize(httpServer: HTTPServer) {
    logger.info('Initializing WebSocket server...');

    this.io = new Server(httpServer, {
      cors: {
        origin: config.CORS_ORIGIN || 'http://localhost:5173',
        credentials: true
      },
      transports: ['websocket', 'polling'],
      path: '/socket.io',
      pingTimeout: 60000,
      pingInterval: 25000
    });

    this.setupMiddleware();
    this.setupHandlers();

    logger.info('WebSocket server initialized successfully');
  }

  /**
   * Setup authentication middleware
   */
  private setupMiddleware() {
    if (!this.io) return;

    this.io.use(async (socket: Socket, next) => {
      try {
        const token = socket.handshake.auth.token;

        if (!token) {
          return next(new Error('No authentication token provided'));
        }

        // Verify JWT token
        const decoded = jwt.verify(token, config.JWT_SECRET) as any;

        if (!decoded.userId || !decoded.role) {
          return next(new Error('Invalid token payload'));
        }

        // Attach user data to socket
        socket.data.userId = decoded.userId;
        socket.data.role = decoded.role;
        socket.data.walletAddress = decoded.walletAddress;

        // Store user connection
        this.addUserConnection(socket.id, {
          userId: decoded.userId,
          role: decoded.role,
          walletAddress: decoded.walletAddress
        });

        logger.info(`User ${decoded.userId} authenticated via WebSocket`);
        next();

      } catch (error) {
        logger.error('WebSocket authentication failed:', error);
        next(new Error('Authentication failed'));
      }
    });
  }

  /**
   * Setup socket event handlers
   */
  private setupHandlers() {
    if (!this.io) return;

    this.io.on('connection', (socket: Socket) => {
      const userId = socket.data.userId;
      const role = socket.data.role;

      logger.info(`User ${userId} (${role}) connected via WebSocket`);

      // Handle room joining based on user role
      this.handleRoomJoining(socket);

      // Setup event handlers
      this.setupSocketEventHandlers(socket);

      // Handle disconnection
      socket.on('disconnect', (reason) => {
        logger.info(`User ${userId} disconnected: ${reason}`);
        this.removeUserConnection(socket.id);
      });

      // Handle errors
      socket.on('error', (error) => {
        logger.error(`Socket error for user ${userId}:`, error);
      });

      // Send initial connection success
      socket.emit('connected', {
        userId,
        role,
        timestamp: new Date()
      });
    });
  }

  /**
   * Handle room joining based on user role
   */
  private handleRoomJoining(socket: Socket) {
    const userId = socket.data.userId;
    const role = socket.data.role;

    // Join user's personal room
    socket.join(`user:${userId}`);

    // Role-specific room handling
    switch (role) {
      case 'patient':
        socket.on('join:patient-room', (patientId: string) => {
          if (patientId === userId) {
            socket.join(`patient:${patientId}`);
            logger.debug(`Patient ${userId} joined their room`);
          }
        });
        break;

      case 'doctor':
        socket.on('join:doctor-room', () => {
          socket.join('doctors');
          logger.debug(`Doctor ${userId} joined doctors room`);
        });

        // Allow doctors to join patient rooms for monitoring
        socket.on('join:patient-monitoring', (patientId: string) => {
          // In production, verify doctor has permission
          socket.join(`patient:${patientId}:monitoring`);
          logger.debug(`Doctor ${userId} monitoring patient ${patientId}`);
        });
        break;

      case 'researcher':
        socket.on('join:research-updates', () => {
          socket.join('research:updates');
          logger.debug(`Researcher ${userId} joined research updates room`);
        });
        break;
    }
  }

  /**
   * Setup specific socket event handlers
   */
  private setupSocketEventHandlers(socket: Socket) {
    const userId = socket.data.userId;

    // Handle proof generation subscription
    socket.on('subscribe:proof-progress', (jobId: string) => {
      socket.join(`proof:${jobId}`);
      logger.debug(`User ${userId} subscribed to proof ${jobId} progress`);
    });

    // Handle verification request subscription
    socket.on('subscribe:verification-requests', () => {
      socket.join(`verification:${userId}`);
      logger.debug(`User ${userId} subscribed to verification requests`);
    });

    // Handle real-time chat (doctor-patient communication)
    socket.on('message:send', async (data: any) => {
      await this.handleMessage(socket, data);
    });

    // Handle status updates
    socket.on('status:update', (status: string) => {
      this.updateUserStatus(userId, status);
    });

    // Handle ping for connection health
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: Date.now() });
    });
  }

  /**
   * Emit proof generation progress
   */
  emitProofProgress(userId: string, progress: number, data?: Partial<ProofProgressData>) {
    if (!this.io) return;

    const progressData: ProofProgressData = {
      jobId: data?.jobId || '',
      progress,
      stage: data?.stage,
      traitType: data?.traitType
    };

    // Emit to user's personal room
    this.io.to(`user:${userId}`).emit('proof:progress', progressData);

    // Emit to patient room
    this.io.to(`patient:${userId}`).emit('proof:progress', progressData);

    // If job-specific room exists, emit there too
    if (data?.jobId) {
      this.io.to(`proof:${data.jobId}`).emit('proof:progress', progressData);
    }

    logger.debug(`Emitted proof progress ${progress}% to user ${userId}`);
  }

  /**
   * Emit proof generation error
   */
  emitProofError(userId: string, error: { message: string; code: string }) {
    if (!this.io) return;

    this.io.to(`user:${userId}`).emit('proof:error', {
      ...error,
      timestamp: new Date()
    });

    logger.error(`Emitted proof error to user ${userId}:`, error);
  }

  /**
   * Notify new verification request
   */
  notifyVerificationRequest(patientId: string, doctorName: string, requestId: string) {
    if (!this.io) return;

    const notification: VerificationRequestData = {
      from: doctorName,
      timestamp: new Date(),
      action: 'REVIEW_REQUIRED',
      requestId
    };

    // Notify patient
    this.io.to(`user:${patientId}`).emit('verification:request', notification);
    this.io.to(`patient:${patientId}`).emit('verification:request', notification);

    logger.info(`Notified patient ${patientId} of verification request from ${doctorName}`);
  }

  /**
   * Notify verification approval
   */
  notifyVerificationApproval(doctorId: string, patientId: string, requestId: string) {
    if (!this.io) return;

    const notification = {
      patientId,
      requestId,
      status: 'approved',
      timestamp: new Date()
    };

    // Notify doctor
    this.io.to(`user:${doctorId}`).emit('verification:approved', notification);

    // Notify monitoring room
    this.io.to(`patient:${patientId}:monitoring`).emit('verification:approved', notification);

    logger.info(`Notified doctor ${doctorId} of verification approval`);
  }

  /**
   * Broadcast research data update
   */
  broadcastResearchUpdate(data: any) {
    if (!this.io) return;

    this.io.to('research:updates').emit('data:updated', {
      ...data,
      timestamp: new Date()
    });

    logger.info('Broadcasted research data update');
  }

  /**
   * Handle real-time messages
   */
  private async handleMessage(socket: Socket, data: any) {
    const senderId = socket.data.userId;
    const { recipientId, message, type } = data;

    // Store message in Redis for persistence (optional)
    const messageData = {
      id: `msg_${Date.now()}`,
      senderId,
      recipientId,
      message,
      type,
      timestamp: new Date()
    };

    // Send to recipient
    if (this.io) {
      this.io.to(`user:${recipientId}`).emit('message:received', messageData);
    }

    // Acknowledge to sender
    socket.emit('message:sent', {
      ...messageData,
      delivered: true
    });

    logger.debug(`Message sent from ${senderId} to ${recipientId}`);
  }

  /**
   * Update user status
   */
  private async updateUserStatus(userId: string, status: string) {
    // Store status in Redis
    await redis.setex(`user:status:${userId}`, 300, status); // 5 min TTL

    // Broadcast to relevant rooms
    if (this.io) {
      this.io.to(`user:${userId}`).emit('status:updated', {
        userId,
        status,
        timestamp: new Date()
      });
    }
  }

  /**
   * Add user connection tracking
   */
  private addUserConnection(socketId: string, user: SocketUser) {
    this.connectedUsers.set(socketId, user);

    // Track multiple connections per user
    if (!this.userSockets.has(user.userId)) {
      this.userSockets.set(user.userId, new Set());
    }
    this.userSockets.get(user.userId)?.add(socketId);
  }

  /**
   * Remove user connection tracking
   */
  private removeUserConnection(socketId: string) {
    const user = this.connectedUsers.get(socketId);

    if (user) {
      this.connectedUsers.delete(socketId);

      // Remove from user's socket set
      const userSocketSet = this.userSockets.get(user.userId);
      if (userSocketSet) {
        userSocketSet.delete(socketId);

        // If no more connections for this user, remove the set
        if (userSocketSet.size === 0) {
          this.userSockets.delete(user.userId);
        }
      }
    }
  }

  /**
   * Check if user is connected
   */
  isUserConnected(userId: string): boolean {
    return this.userSockets.has(userId);
  }

  /**
   * Get connected users count
   */
  getConnectedUsersCount(): number {
    return this.userSockets.size;
  }

  /**
   * Get connected users by role
   */
  getConnectedUsersByRole(role: string): string[] {
    const users: string[] = [];
    this.connectedUsers.forEach((user) => {
      if (user.role === role && !users.includes(user.userId)) {
        users.push(user.userId);
      }
    });
    return users;
  }

  /**
   * Emit to specific user (all their connections)
   */
  emitToUser(userId: string, event: string, data: any) {
    if (!this.io) return;

    this.io.to(`user:${userId}`).emit(event, data);
  }

  /**
   * Cleanup and shutdown
   */
  async shutdown() {
    if (this.io) {
      // Notify all clients
      this.io.emit('server:shutdown', {
        message: 'Server shutting down',
        timestamp: new Date()
      });

      // Close all connections
      this.io.disconnectSockets();

      // Close server
      this.io.close();

      logger.info('WebSocket server shut down');
    }
  }
}

// Export singleton instance
export const enhancedSocketService = new EnhancedSocketService();