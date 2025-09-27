import { config } from '@config/index';
import { logger } from '@utils/logger';

/**
 * tDUST Balance Display Service
 * Handles fetching and caching tDUST token balances from Midnight blockchain
 */

interface DustBalance {
  address: string;
  balance: string;
  formattedBalance: string;
  decimals: number;
  lastUpdated: Date;
}

export class DustBalanceService {
  private readonly DUST_DECIMALS = 18;
  private balanceCache: Map<string, DustBalance> = new Map();
  private readonly CACHE_TTL_MS = 30000; // 30 seconds

  /**
   * Get tDUST balance for a wallet address
   */
  async getBalance(walletAddress: string): Promise<DustBalance> {
    // Check cache first
    const cached = this.balanceCache.get(walletAddress);
    if (cached && this.isCacheValid(cached.lastUpdated)) {
      logger.debug(`Returning cached balance for ${walletAddress}`);
      return cached;
    }

    try {
      // TODO: Integrate with Midnight SDK to fetch actual balance
      // For now, return mock balance for development
      const mockBalance = this.getMockBalance(walletAddress);

      // Cache the result
      this.balanceCache.set(walletAddress, mockBalance);

      logger.info(`Fetched tDUST balance for ${walletAddress}: ${mockBalance.formattedBalance}`);
      return mockBalance;
    } catch (error) {
      logger.error('Failed to fetch tDUST balance:', error);
      throw new Error('Failed to fetch balance');
    }
  }

  /**
   * Get balances for multiple addresses
   */
  async getBalances(walletAddresses: string[]): Promise<DustBalance[]> {
    return Promise.all(walletAddresses.map(addr => this.getBalance(addr)));
  }

  /**
   * Format balance from wei to human-readable format
   */
  formatBalance(balanceWei: string): string {
    const balance = BigInt(balanceWei);
    const divisor = BigInt(10 ** this.DUST_DECIMALS);
    const whole = balance / divisor;
    const remainder = balance % divisor;

    // Format with up to 4 decimal places
    const decimal = remainder.toString().padStart(this.DUST_DECIMALS, '0').slice(0, 4);
    return `${whole}.${decimal} tDUST`;
  }

  /**
   * Check if user has minimum balance for operations
   */
  async hasMinimumBalance(
    walletAddress: string,
    minimumRequired: string
  ): Promise<boolean> {
    const balance = await this.getBalance(walletAddress);
    return BigInt(balance.balance) >= BigInt(minimumRequired);
  }

  /**
   * Estimate transaction fee
   */
  estimateTransactionFee(operationType: 'upload' | 'proof' | 'verify'): string {
    // Mock fee estimation
    const fees = {
      upload: '1000000000000000', // 0.001 tDUST
      proof: '5000000000000000',  // 0.005 tDUST
      verify: '2000000000000000'  // 0.002 tDUST
    };

    return fees[operationType];
  }

  /**
   * Subscribe to balance updates (for WebSocket)
   */
  subscribeToBalanceUpdates(
    walletAddress: string,
    callback: (balance: DustBalance) => void
  ): () => void {
    // TODO: Implement WebSocket subscription to Midnight RPC
    // For now, poll every 30 seconds
    const intervalId = setInterval(async () => {
      try {
        const balance = await this.getBalance(walletAddress);
        callback(balance);
      } catch (error) {
        logger.error('Balance update subscription error:', error);
      }
    }, 30000);

    // Return unsubscribe function
    return () => clearInterval(intervalId);
  }

  /**
   * Check if cache is still valid
   */
  private isCacheValid(lastUpdated: Date): boolean {
    return Date.now() - lastUpdated.getTime() < this.CACHE_TTL_MS;
  }

  /**
   * Get mock balance for development
   */
  private getMockBalance(walletAddress: string): DustBalance {
    // Generate deterministic mock balance based on address
    const addressNum = parseInt(walletAddress.slice(2, 10), 16);
    const balance = (1000 + (addressNum % 9000)).toString() + '000000000000000000';

    return {
      address: walletAddress,
      balance,
      formattedBalance: this.formatBalance(balance),
      decimals: this.DUST_DECIMALS,
      lastUpdated: new Date()
    };
  }

  /**
   * Clear balance cache
   */
  clearCache(walletAddress?: string): void {
    if (walletAddress) {
      this.balanceCache.delete(walletAddress);
    } else {
      this.balanceCache.clear();
    }
  }

  /**
   * Get balance statistics for analytics
   */
  async getBalanceStats(walletAddresses: string[]): Promise<{
    totalBalance: string;
    averageBalance: string;
    minBalance: string;
    maxBalance: string;
  }> {
    const balances = await this.getBalances(walletAddresses);
    const balanceValues = balances.map(b => BigInt(b.balance));

    const total = balanceValues.reduce((sum, val) => sum + val, BigInt(0));
    const avg = balanceValues.length > 0 ? total / BigInt(balanceValues.length) : BigInt(0);
    const min = balanceValues.length > 0 ? balanceValues.reduce((a, b) => a < b ? a : b) : BigInt(0);
    const max = balanceValues.length > 0 ? balanceValues.reduce((a, b) => a > b ? a : b) : BigInt(0);

    return {
      totalBalance: total.toString(),
      averageBalance: avg.toString(),
      minBalance: min.toString(),
      maxBalance: max.toString()
    };
  }
}

export const dustBalanceService = new DustBalanceService();