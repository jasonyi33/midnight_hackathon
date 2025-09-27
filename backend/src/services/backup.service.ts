import { exec } from 'child_process';
import { promisify } from 'util';
import { createReadStream, createWriteStream, existsSync, mkdirSync, unlinkSync } from 'fs';
import { createCipheriv, randomBytes } from 'crypto';
import path from 'path';
import { config } from '@config/index';
import { logger } from '@utils/logger';
import { query } from '@config/database';

const execAsync = promisify(exec);

export class BackupService {
  private backupDir: string;
  private encryptionKey: Buffer;

  constructor() {
    this.backupDir = process.env.BACKUP_STORAGE_PATH || '/tmp/backups';
    this.encryptionKey = Buffer.from(
      process.env.BACKUP_ENCRYPTION_KEY || 'default_backup_key_32_bytes_long!',
      'utf8'
    ).subarray(0, 32);

    // Ensure backup directory exists
    if (!existsSync(this.backupDir)) {
      mkdirSync(this.backupDir, { recursive: true });
    }
  }

  /**
   * Create a database backup
   */
  async createBackup(): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `genomic_backup_${timestamp}.sql`;
    const backupPath = path.join(this.backupDir, backupFileName);
    const encryptedPath = `${backupPath}.enc`;

    try {
      // Create PostgreSQL dump
      const dumpCommand = `PGPASSWORD=password pg_dump -h localhost -U genomic -d genomic_privacy -f ${backupPath}`;

      logger.info('Starting database backup...');
      await execAsync(dumpCommand);

      // Encrypt the backup file
      await this.encryptFile(backupPath, encryptedPath);

      // Remove unencrypted backup
      unlinkSync(backupPath);

      // Log backup creation
      await this.logBackup(encryptedPath, 'success');

      // Clean old backups (keep last 7 days)
      await this.cleanOldBackups();

      logger.info(`Backup created successfully: ${encryptedPath}`);
      return encryptedPath;
    } catch (error) {
      logger.error('Backup failed:', error);
      await this.logBackup(backupPath, 'failed', error.message);
      throw error;
    }
  }

  /**
   * Restore from backup
   */
  async restoreBackup(encryptedBackupPath: string): Promise<void> {
    const decryptedPath = encryptedBackupPath.replace('.enc', '');

    try {
      logger.info('Starting database restore...');

      // Decrypt the backup file
      await this.decryptFile(encryptedBackupPath, decryptedPath);

      // Restore to PostgreSQL
      const restoreCommand = `PGPASSWORD=password psql -h localhost -U genomic -d genomic_privacy -f ${decryptedPath}`;
      await execAsync(restoreCommand);

      // Clean up decrypted file
      unlinkSync(decryptedPath);

      logger.info('Database restored successfully');
    } catch (error) {
      logger.error('Restore failed:', error);
      throw error;
    }
  }

  /**
   * Encrypt a file
   */
  private async encryptFile(inputPath: string, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const iv = randomBytes(16);
      const cipher = createCipheriv('aes-256-cbc', this.encryptionKey, iv);

      const input = createReadStream(inputPath);
      const output = createWriteStream(outputPath);

      // Write IV to the beginning of the file
      output.write(iv);

      input
        .pipe(cipher)
        .pipe(output)
        .on('finish', resolve)
        .on('error', reject);
    });
  }

  /**
   * Decrypt a file
   */
  private async decryptFile(inputPath: string, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const input = createReadStream(inputPath);
      const output = createWriteStream(outputPath);

      let iv: Buffer;
      let isFirstChunk = true;

      input.on('data', (chunk: Buffer) => {
        if (isFirstChunk) {
          // Extract IV from the beginning
          iv = chunk.subarray(0, 16);
          const encryptedData = chunk.subarray(16);

          const decipher = createCipheriv('aes-256-cbc', this.encryptionKey, iv);

          if (encryptedData.length > 0) {
            output.write(decipher.update(encryptedData));
          }

          input
            .pipe(decipher)
            .pipe(output)
            .on('finish', resolve)
            .on('error', reject);

          isFirstChunk = false;
        }
      });

      input.on('error', reject);
    });
  }

  /**
   * Clean old backups (keep last 7 days)
   */
  private async cleanOldBackups(): Promise<void> {
    const retentionDays = parseInt(process.env.BACKUP_RETENTION_DAYS || '7', 10);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    try {
      const { stdout } = await execAsync(`find ${this.backupDir} -name "*.enc" -type f -mtime +${retentionDays} -delete`);
      if (stdout) {
        logger.info(`Cleaned old backups: ${stdout}`);
      }
    } catch (error) {
      logger.error('Failed to clean old backups:', error);
    }
  }

  /**
   * Log backup operation
   */
  private async logBackup(
    filePath: string,
    status: 'success' | 'failed',
    error?: string
  ): Promise<void> {
    await query(
      `INSERT INTO audit_log (action, details, created_at)
       VALUES ($1, $2, NOW())`,
      [
        'database_backup',
        {
          file_path: filePath,
          status,
          error,
          timestamp: new Date().toISOString()
        }
      ]
    );
  }

  /**
   * Schedule automated backups (to be called from cron job or scheduler)
   */
  startAutomatedBackups(): void {
    const backupInterval = 6 * 60 * 60 * 1000; // 6 hours in milliseconds

    setInterval(async () => {
      try {
        await this.createBackup();
      } catch (error) {
        logger.error('Automated backup failed:', error);
      }
    }, backupInterval);

    logger.info('Automated backup scheduler started (every 6 hours)');
  }

  /**
   * Get backup status and history
   */
  async getBackupHistory(): Promise<any[]> {
    const result = await query(
      `SELECT * FROM audit_log
       WHERE action = 'database_backup'
       ORDER BY created_at DESC
       LIMIT 50`
    );
    return result;
  }
}

export const backupService = new BackupService();