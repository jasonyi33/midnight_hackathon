#!/bin/bash

# Genomic Privacy Database Restore Script
# This script restores the database from an encrypted backup

set -e  # Exit on error

# Configuration
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-genomic_privacy}"
DB_USER="${DB_USER:-genomic}"
DB_PASSWORD="${DB_PASSWORD:-password}"
ENCRYPTION_KEY="${BACKUP_ENCRYPTION_KEY:-default_backup_key_32_bytes_long!}"

# Check if backup file is provided
if [ -z "$1" ]; then
    echo "Usage: $0 <encrypted_backup_file>"
    echo "Example: $0 /tmp/backups/genomic_backup_20240101_120000.sql.enc"
    exit 1
fi

ENCRYPTED_FILE=$1

# Check if file exists
if [ ! -f "$ENCRYPTED_FILE" ]; then
    echo "Error: Backup file not found: $ENCRYPTED_FILE"
    exit 1
fi

# Generate temporary file for decrypted backup
TEMP_DIR=$(mktemp -d)
DECRYPTED_FILE="$TEMP_DIR/restore.sql"

echo "Starting restore at $(date)..."
echo "Restoring from: $ENCRYPTED_FILE"

# Decrypt the backup
echo "Decrypting backup..."
openssl enc -aes-256-cbc -d -in $ENCRYPTED_FILE -out $DECRYPTED_FILE -pass pass:$ENCRYPTION_KEY

if [ $? -eq 0 ]; then
    echo "Backup decrypted successfully"

    # Warning prompt
    echo ""
    echo "WARNING: This will restore the database to the state at the time of the backup."
    echo "All current data will be lost!"
    read -p "Are you sure you want to continue? (yes/no): " confirm

    if [ "$confirm" != "yes" ]; then
        echo "Restore cancelled"
        rm -rf $TEMP_DIR
        exit 0
    fi

    # Restore to PostgreSQL
    export PGPASSWORD=$DB_PASSWORD
    echo "Restoring database..."
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f $DECRYPTED_FILE

    if [ $? -eq 0 ]; then
        echo "Database restored successfully"

        # Clean up temporary files
        rm -rf $TEMP_DIR

        echo "Restore completed at $(date)"
        exit 0
    else
        echo "Error: Failed to restore database"
        rm -rf $TEMP_DIR
        exit 1
    fi
else
    echo "Error: Failed to decrypt backup"
    rm -rf $TEMP_DIR
    exit 1
fi