#!/bin/bash

# ============================================================
# SettleKar Database Cleanup Script
# ============================================================
# This script removes ALL data from the settlekar_db database
# while respecting referential integrity (foreign key constraints).
#
# HOW TO RUN:
#   1. Make it executable:     chmod +x cleanup_db.sh
#   2. Run it:                 ./cleanup_db.sh
#   3. Or with custom creds:   ./cleanup_db.sh -u root -p YourPassword -d settlekar_db -h localhost -P 3306
#
# WARNING: This will DELETE ALL DATA in the database!
# ============================================================

set -e

# Default values
DB_USER="root"
DB_PASS=""
DB_NAME="settlekar_db"
DB_HOST="localhost"
DB_PORT="3306"

# Parse command-line arguments
while getopts "u:p:d:h:P:" opt; do
  case $opt in
    u) DB_USER="$OPTARG" ;;
    p) DB_PASS="$OPTARG" ;;
    d) DB_NAME="$OPTARG" ;;
    h) DB_HOST="$OPTARG" ;;
    P) DB_PORT="$OPTARG" ;;
    *) echo "Usage: $0 [-u user] [-p password] [-d database] [-h host] [-P port]"; exit 1 ;;
  esac
done

MYSQL_CMD="mysql -u${DB_USER} ${DB_PASS:+-p${DB_PASS}} -h${DB_HOST} -P${DB_PORT} ${DB_NAME}"

echo "============================================"
echo "  SettleKar Database Cleanup"
echo "============================================"
echo ""
echo "  Database: ${DB_NAME}"
echo "  Host:     ${DB_HOST}:${DB_PORT}"
echo "  User:     ${DB_USER}"
echo ""
echo "  WARNING: This will DELETE ALL DATA!"
echo ""
read -p "  Are you sure you want to proceed? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
  echo ""
  echo "  Aborted. No changes were made."
  exit 0
fi

echo ""
echo "Starting cleanup..."
echo ""

# The order matters - delete child tables first to respect foreign key constraints
# Order: most dependent -> least dependent

$MYSQL_CMD <<'SQL'

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Payment-related tables (deepest children)
DELETE FROM payments;
SELECT CONCAT('  Deleted ', ROW_COUNT(), ' rows from payments') AS status;

-- 2. Payment reminders
DELETE FROM payment_reminders;
SELECT CONCAT('  Deleted ', ROW_COUNT(), ' rows from payment_reminders') AS status;

-- 3. Settlements (depend on groups and users)
DELETE FROM settlements;
SELECT CONCAT('  Deleted ', ROW_COUNT(), ' rows from settlements') AS status;

-- 4. Expense shares (depend on expenses and users)
DELETE FROM expense_shares;
SELECT CONCAT('  Deleted ', ROW_COUNT(), ' rows from expense_shares') AS status;

-- 5. Expenses (depend on groups and users)
DELETE FROM expenses;
SELECT CONCAT('  Deleted ', ROW_COUNT(), ' rows from expenses') AS status;

-- 6. Recurring expenses (depend on groups and users)
DELETE FROM recurring_expenses;
SELECT CONCAT('  Deleted ', ROW_COUNT(), ' rows from recurring_expenses') AS status;

-- 7. Transaction ledger (depend on groups and users)
DELETE FROM transaction_ledger;
SELECT CONCAT('  Deleted ', ROW_COUNT(), ' rows from transaction_ledger') AS status;

-- 8. Group members (depend on groups and users)
DELETE FROM group_members;
SELECT CONCAT('  Deleted ', ROW_COUNT(), ' rows from group_members') AS status;

-- 9. Groups (depend on users via created_by)
DELETE FROM expense_groups;
SELECT CONCAT('  Deleted ', ROW_COUNT(), ' rows from expense_groups') AS status;

-- 10. Password reset tokens (depend on users)
DELETE FROM password_reset_tokens;
SELECT CONCAT('  Deleted ', ROW_COUNT(), ' rows from password_reset_tokens') AS status;

-- 11. Verification tokens (depend on users)
DELETE FROM verification_tokens;
SELECT CONCAT('  Deleted ', ROW_COUNT(), ' rows from verification_tokens') AS status;

-- 12. Users (root table - delete last)
DELETE FROM users;
SELECT CONCAT('  Deleted ', ROW_COUNT(), ' rows from users') AS status;

SET FOREIGN_KEY_CHECKS = 1;

SQL

echo ""
echo "============================================"
echo "  Cleanup complete! All data has been removed."
echo "============================================"
echo ""
echo "  The database schema (tables, indexes, etc.) is preserved."
echo "  You can now restart the Spring Boot application -"
echo "  it will work with a fresh empty database."
echo ""
