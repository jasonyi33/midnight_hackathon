import jwt from 'jsonwebtoken';
import { createHash } from 'crypto';
import { config } from '@config/index';
import { query, queryActive } from '@config/database';
import { AuthTokens, User } from '@types';
import { AuthenticationError } from '@utils/errors';

export class AuthService {
  generateTokens(user: User): AuthTokens {
    const accessToken = jwt.sign(
      {
        userId: user.id,
        walletAddress: user.walletAddress,
        role: user.role,
        type: 'access'
      },
      config.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
      {
        userId: user.id,
        type: 'refresh'
      },
      config.JWT_REFRESH_SECRET,
      { expiresIn: '24h' }
    );

    return { accessToken, refreshToken };
  }

  verifyRefreshToken(token: string): { userId: string } {
    try {
      const decoded = jwt.verify(token, config.JWT_REFRESH_SECRET) as any;
      if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type');
      }
      return { userId: decoded.userId };
    } catch (error) {
      throw new AuthenticationError('Invalid refresh token');
    }
  }

  async connectWallet(walletAddress: string, signature: string, message: string): Promise<{ user: User; tokens: AuthTokens }> {
    // TODO: Verify signature with Midnight SDK
    // Mock verification for development
    if (!this.mockVerifySignature(walletAddress, signature, message)) {
      throw new AuthenticationError('Invalid signature');
    }

    // Generate deterministic user ID from wallet address (FR-002)
    const deterministicId = createHash('sha256')
      .update(walletAddress.toLowerCase())
      .digest('hex');

    // Check if user exists (excluding soft deleted)
    let users = await queryActive<User>(
      'SELECT * FROM users WHERE wallet_address = $1',
      [walletAddress]
    );

    let user: User;

    if (users.length === 0) {
      // Create new user with deterministic ID
      const result = await query<User>(
        `INSERT INTO users (id, wallet_address, role, created_at, updated_at)
         VALUES ($1, $2, $3, NOW(), NOW())
         RETURNING *`,
        [deterministicId, walletAddress, 'patient']
      );
      user = result[0];
    } else {
      user = users[0];
    }

    const tokens = this.generateTokens(user);

    return { user, tokens };
  }

  async getUserById(userId: string): Promise<User | null> {
    const users = await queryActive<User>(
      'SELECT * FROM users WHERE id = $1',
      [userId]
    );

    return users.length > 0 ? users[0] : null;
  }

  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    const { userId } = this.verifyRefreshToken(refreshToken);
    const user = await this.getUserById(userId);

    if (!user) {
      throw new AuthenticationError('User not found');
    }

    // Use refresh token manager for secure rotation
    // Note: This requires importing refreshTokenManager from security middleware
    // For now, keeping the existing implementation until security middleware is fully integrated
    return this.generateTokens(user);
  }

  /**
   * Mock signature verification for development
   * TODO: Replace with actual Midnight SDK verification
   */
  private mockVerifySignature(walletAddress: string, signature: string, message: string): boolean {
    // Basic validation for development
    if (!walletAddress || !signature || !message) {
      return false;
    }

    // Check signature format (mock)
    if (signature.length < 64) {
      return false;
    }

    // In production, this would verify the cryptographic signature
    // For now, we accept any properly formatted signature
    console.log('WARNING: Using mock signature verification - NOT SECURE FOR PRODUCTION');
    return true;
  }
}

export const authService = new AuthService();