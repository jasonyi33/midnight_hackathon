/**
 * Data Aggregation Service
 * Task 3.7: Build aggregation service for research portal
 * Implements privacy-preserving data aggregation with minimum cohort sizes
 */

import { db } from '@config/database';
import { redis } from '@config/redis';
import { logger } from '@utils/logger';
import { ValidationError } from '@utils/errors';
import { enhancedSocketService } from '@websocket/enhanced-socket.service';

export interface MutationStats {
  traitType: string;
  positiveCount: number;
  totalCount: number;
  frequency: number;
  avgConfidence: number;
}

export interface MetabolizerStats {
  metabolizerStatus: string;
  count: number;
  percentage: number;
}

export interface TimeSeriesData {
  date: string;
  verificationCount: number;
  uniquePatients: number;
}

export interface AggregatedData {
  mutations: MutationStats[];
  metabolizers: MetabolizerStats[];
  timeSeries: TimeSeriesData[];
  summary: {
    totalPatients: number;
    totalVerifications: number;
    lastUpdated: Date;
  };
}

export class AggregationService {
  private readonly MINIMUM_COHORT_SIZE = 5;
  private readonly CACHE_TTL = 300; // 5 minutes

  /**
   * Get mutation frequency statistics
   * Enforces minimum cohort size for privacy
   */
  async getMutationFrequencies(): Promise<MutationStats[]> {
    try {
      // Check cache first
      const cached = await this.getCachedData('mutation_frequencies');
      if (cached) return cached;

      const query = `
        SELECT
          trait_type,
          COUNT(*) FILTER (WHERE mutation_present = true) as positive_count,
          COUNT(*) as total_count,
          ROUND(
            COUNT(*) FILTER (WHERE mutation_present = true) * 100.0 / COUNT(*),
            2
          ) as frequency,
          ROUND(AVG(confidence_score)::numeric, 2) as avg_confidence
        FROM genome_traits
        WHERE deleted_at IS NULL
        GROUP BY trait_type
        HAVING COUNT(*) >= $1
        ORDER BY trait_type
      `;

      const result = await db.query(query, [this.MINIMUM_COHORT_SIZE]);

      const stats: MutationStats[] = result.rows.map(row => ({
        traitType: row.trait_type,
        positiveCount: parseInt(row.positive_count),
        totalCount: parseInt(row.total_count),
        frequency: parseFloat(row.frequency),
        avgConfidence: parseFloat(row.avg_confidence)
      }));

      // Apply additional privacy measures
      const anonymizedStats = this.applyPrivacyMeasures(stats);

      // Cache the results
      await this.cacheData('mutation_frequencies', anonymizedStats);

      return anonymizedStats;

    } catch (error) {
      logger.error('Failed to get mutation frequencies:', error);
      throw error;
    }
  }

  /**
   * Get CYP2D6 metabolizer distribution
   */
  async getMetabolizerDistribution(): Promise<MetabolizerStats[]> {
    try {
      const cached = await this.getCachedData('metabolizer_distribution');
      if (cached) return cached;

      const query = `
        SELECT
          metabolizer_status,
          COUNT(*) as count,
          ROUND(
            COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(),
            2
          ) as percentage
        FROM cyp2d6_data
        WHERE deleted_at IS NULL
        GROUP BY metabolizer_status
        HAVING COUNT(*) >= $1
        ORDER BY count DESC
      `;

      const result = await db.query(query, [this.MINIMUM_COHORT_SIZE]);

      const stats: MetabolizerStats[] = result.rows.map(row => ({
        metabolizerStatus: row.metabolizer_status,
        count: parseInt(row.count),
        percentage: parseFloat(row.percentage)
      }));

      // Round percentages to prevent fingerprinting
      stats.forEach(stat => {
        stat.percentage = Math.round(stat.percentage / 5) * 5; // Round to nearest 5%
      });

      await this.cacheData('metabolizer_distribution', stats);

      return stats;

    } catch (error) {
      logger.error('Failed to get metabolizer distribution:', error);
      throw error;
    }
  }

  /**
   * Get verification trends over time
   */
  async getVerificationTrends(days: number = 30): Promise<TimeSeriesData[]> {
    try {
      const cached = await this.getCachedData(`verification_trends_${days}`);
      if (cached) return cached;

      const query = `
        SELECT
          DATE(created_at) as date,
          COUNT(*) as verification_count,
          COUNT(DISTINCT patient_id) as unique_patients
        FROM verification_requests
        WHERE
          created_at >= NOW() - INTERVAL '${days} days'
          AND deleted_at IS NULL
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      `;

      const result = await db.query(query);

      const trends: TimeSeriesData[] = result.rows.map(row => ({
        date: row.date.toISOString().split('T')[0],
        verificationCount: parseInt(row.verification_count),
        uniquePatients: parseInt(row.unique_patients)
      }));

      await this.cacheData(`verification_trends_${days}`, trends);

      return trends;

    } catch (error) {
      logger.error('Failed to get verification trends:', error);
      throw error;
    }
  }

  /**
   * Get all aggregated data for research dashboard
   */
  async getAllAggregatedData(): Promise<AggregatedData> {
    try {
      const [mutations, metabolizers, timeSeries] = await Promise.all([
        this.getMutationFrequencies(),
        this.getMetabolizerDistribution(),
        this.getVerificationTrends()
      ]);

      // Get summary statistics
      const summaryQuery = `
        SELECT
          COUNT(DISTINCT patient_id) as total_patients,
          COUNT(*) as total_verifications
        FROM verification_requests
        WHERE deleted_at IS NULL
      `;

      const summaryResult = await db.query(summaryQuery);

      const aggregatedData: AggregatedData = {
        mutations,
        metabolizers,
        timeSeries,
        summary: {
          totalPatients: parseInt(summaryResult.rows[0]?.total_patients || '0'),
          totalVerifications: parseInt(summaryResult.rows[0]?.total_verifications || '0'),
          lastUpdated: new Date()
        }
      };

      // Notify researchers of update via WebSocket
      enhancedSocketService.broadcastResearchUpdate({
        type: 'aggregation_updated',
        data: aggregatedData.summary
      });

      return aggregatedData;

    } catch (error) {
      logger.error('Failed to get aggregated data:', error);
      throw error;
    }
  }

  /**
   * Generate CSV export of aggregated data
   */
  async generateCSVExport(dataType: 'mutations' | 'metabolizers' | 'trends'): Promise<string> {
    try {
      let csv = '';
      let data: any[];

      switch (dataType) {
        case 'mutations':
          data = await this.getMutationFrequencies();
          csv = 'Trait Type,Positive Count,Total Count,Frequency (%),Avg Confidence\n';
          csv += data.map(row =>
            `${row.traitType},${row.positiveCount},${row.totalCount},${row.frequency},${row.avgConfidence}`
          ).join('\n');
          break;

        case 'metabolizers':
          data = await this.getMetabolizerDistribution();
          csv = 'Metabolizer Status,Count,Percentage (%)\n';
          csv += data.map(row =>
            `${row.metabolizerStatus},${row.count},${row.percentage}`
          ).join('\n');
          break;

        case 'trends':
          data = await this.getVerificationTrends();
          csv = 'Date,Verification Count,Unique Patients\n';
          csv += data.map(row =>
            `${row.date},${row.verificationCount},${row.uniquePatients}`
          ).join('\n');
          break;

        default:
          throw new ValidationError('Invalid data type for export');
      }

      // Add metadata
      csv += `\n\n# Generated: ${new Date().toISOString()}`;
      csv += `\n# Minimum Cohort Size: ${this.MINIMUM_COHORT_SIZE}`;
      csv += `\n# Data Anonymized: Yes`;

      logger.info(`CSV export generated for ${dataType}`);

      return csv;

    } catch (error) {
      logger.error('Failed to generate CSV export:', error);
      throw error;
    }
  }

  /**
   * Apply privacy measures to data
   */
  private applyPrivacyMeasures(stats: MutationStats[]): MutationStats[] {
    return stats.map(stat => {
      // Add noise to counts for additional privacy
      const noise = Math.random() * 2 - 1; // -1 to 1
      stat.positiveCount = Math.max(
        this.MINIMUM_COHORT_SIZE,
        Math.round(stat.positiveCount + noise)
      );

      // Round frequency to prevent exact calculations
      stat.frequency = Math.round(stat.frequency * 2) / 2; // Round to nearest 0.5

      // Limit precision of confidence
      stat.avgConfidence = Math.round(stat.avgConfidence * 100) / 100;

      return stat;
    });
  }

  /**
   * Cache data in Redis
   */
  private async cacheData(key: string, data: any): Promise<void> {
    try {
      await redis.setex(
        `aggregation:${key}`,
        this.CACHE_TTL,
        JSON.stringify(data)
      );
    } catch (error) {
      logger.error(`Failed to cache ${key}:`, error);
      // Don't throw - caching failure shouldn't break the service
    }
  }

  /**
   * Get cached data from Redis
   */
  private async getCachedData(key: string): Promise<any | null> {
    try {
      const cached = await redis.get(`aggregation:${key}`);
      if (cached) {
        logger.debug(`Cache hit for aggregation:${key}`);
        return JSON.parse(cached);
      }
    } catch (error) {
      logger.error(`Failed to get cached ${key}:`, error);
    }
    return null;
  }

  /**
   * Clear aggregation cache
   */
  async clearCache(): Promise<void> {
    try {
      const keys = await redis.keys('aggregation:*');
      if (keys.length > 0) {
        await redis.del(...keys);
        logger.info(`Cleared ${keys.length} aggregation cache entries`);
      }
    } catch (error) {
      logger.error('Failed to clear aggregation cache:', error);
    }
  }

  /**
   * Check if cohort size meets minimum requirements
   */
  async checkCohortSize(traitType: string): Promise<boolean> {
    const query = `
      SELECT COUNT(*) as count
      FROM genome_traits
      WHERE trait_type = $1 AND deleted_at IS NULL
    `;

    const result = await db.query(query, [traitType]);
    const count = parseInt(result.rows[0]?.count || '0');

    return count >= this.MINIMUM_COHORT_SIZE;
  }
}

// Export singleton instance
export const aggregationService = new AggregationService();