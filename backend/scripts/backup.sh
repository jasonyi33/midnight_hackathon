#!/bin/bash

# Genomic Privacy Database Backup Script
# This script creates encrypted backups of the PostgreSQL database

set -e  # Exit on error

# Configuration
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-genomic_privacy}"
DB_USER="${DB_USER:-genomic}"
DB_PASSWORD="${DB_PASSWORD:-password}"
BACKUP_DIR="${BACKUP_DIR:-/tmp/backups}"
ENCRYPTION_KEY="${BACKUP_ENCRYPTION_KEY:-default_backup_key_32_bytes_long!}"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Generate timestamp for backup file
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/genomic_backup_$TIMESTAMP.sql"
ENCRYPTED_FILE="$BACKUP_FILE.enc"

echo "Starting backup at $(date)..."

# Create PostgreSQL dump
export PGPASSWORD=$DB_PASSWORD
pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f $BACKUP_FILE

if [ $? -eq 0 ]; then
    echo "Database dump created successfully"

    # Encrypt the backup using OpenSSL
    openssl enc -aes-256-cbc -salt -in $BACKUP_FILE -out $ENCRYPTED_FILE -pass pass:$ENCRYPTION_KEY

    if [ $? -eq 0 ]; then
        echo "Backup encrypted successfully"

        # Remove unencrypted backup
        rm $BACKUP_FILE

        # Calculate file size
        SIZE=$(du -h $ENCRYPTED_FILE | cut -f1)
        echo "Backup completed: $ENCRYPTED_FILE (Size: $SIZE)"

        # Clean old backups (keep last 7 days)
        find $BACKUP_DIR -name "*.enc" -type f -mtime +7 -delete
        echo "Old backups cleaned"

        exit 0
    else
        echo "Error: Failed to encrypt backup"
        rm -f $BACKUP_FILE
        exit 1
    fi
else
    echo "Error: Failed to create database dump"
    exit 1
fi