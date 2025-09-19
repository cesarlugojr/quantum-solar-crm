#!/bin/bash

# Quantum Solar CRM Database Migration Runner
# This script applies all database migrations in the correct order

set -e  # Exit on any error

# Configuration
DB_CONNECTION_STRING="postgresql://postgres.gkigjsfkfryozugxnzfh:39KHcOuqi8j39z5J@aws-0-us-west-1.pooler.supabase.com:6543/postgres"
MIGRATIONS_DIR="./migrations"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Quantum Solar CRM Database Migration Runner${NC}"
echo "================================================="

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ Error: psql is not installed or not in PATH${NC}"
    echo "Please install PostgreSQL client tools:"
    echo "  macOS: brew install postgresql@15"
    echo "  Linux: sudo apt-get install postgresql-client"
    exit 1
fi

# Check if migrations directory exists
if [ ! -d "$MIGRATIONS_DIR" ]; then
    echo -e "${RED}❌ Error: Migrations directory not found: $MIGRATIONS_DIR${NC}"
    exit 1
fi

# Function to run a migration file
run_migration() {
    local migration_file="$1"
    local migration_name=$(basename "$migration_file" .sql)
    
    echo -e "${YELLOW}📝 Running migration: $migration_name${NC}"
    
    if psql "$DB_CONNECTION_STRING" -f "$migration_file" -v ON_ERROR_STOP=1 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Successfully applied: $migration_name${NC}"
    else
        echo -e "${RED}❌ Failed to apply: $migration_name${NC}"
        echo "Please check the migration file and database connection."
        exit 1
    fi
}

# Function to test database connection
test_connection() {
    echo -e "${YELLOW}🔌 Testing database connection...${NC}"
    
    if psql "$DB_CONNECTION_STRING" -c "SELECT 1;" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Database connection successful${NC}"
    else
        echo -e "${RED}❌ Failed to connect to database${NC}"
        echo "Please check your connection string and network access."
        exit 1
    fi
}

# Main execution
main() {
    # Test database connection first
    test_connection
    
    echo ""
    echo -e "${YELLOW}📋 Found migrations to apply:${NC}"
    
    # List all migration files in order
    migration_files=($(ls "$MIGRATIONS_DIR"/*.sql 2>/dev/null | sort))
    
    if [ ${#migration_files[@]} -eq 0 ]; then
        echo -e "${YELLOW}⚠️  No migration files found in $MIGRATIONS_DIR${NC}"
        exit 0
    fi
    
    for file in "${migration_files[@]}"; do
        echo "  - $(basename "$file")"
    done
    
    echo ""
    read -p "Do you want to apply these migrations? (y/N): " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}⏸️  Migration cancelled by user${NC}"
        exit 0
    fi
    
    echo ""
    echo -e "${GREEN}🔄 Applying migrations...${NC}"
    echo ""
    
    # Apply each migration in order
    for file in "${migration_files[@]}"; do
        run_migration "$file"
    done
    
    echo ""
    echo -e "${GREEN}🎉 All migrations applied successfully!${NC}"
    echo ""
    
    # Show summary of created objects
    echo -e "${YELLOW}📊 Database Summary:${NC}"
    psql "$DB_CONNECTION_STRING" -c "
        SELECT 
            schemaname,
            tablename,
            CASE 
                WHEN schemaname = 'public' THEN '📋'
                ELSE '🔧'
            END as icon
        FROM pg_tables 
        WHERE schemaname IN ('public') 
        ORDER BY tablename;
    " -t | while read line; do
        echo "  $line"
    done
    
    echo ""
    echo -e "${GREEN}✨ Migration complete! Your CRM database is ready.${NC}"
}

# Handle script arguments
case "${1:-}" in
    --help|-h)
        echo "Quantum Solar CRM Database Migration Runner"
        echo ""
        echo "Usage: $0 [options]"
        echo ""
        echo "Options:"
        echo "  --help, -h     Show this help message"
        echo "  --test, -t     Test database connection only"
        echo "  --list, -l     List available migrations"
        echo ""
        echo "Environment Variables:"
        echo "  DB_CONNECTION_STRING  PostgreSQL connection string"
        echo ""
        exit 0
        ;;
    --test|-t)
        test_connection
        exit 0
        ;;
    --list|-l)
        echo "Available migrations:"
        ls "$MIGRATIONS_DIR"/*.sql 2>/dev/null | sort | while read file; do
            echo "  - $(basename "$file")"
        done
        exit 0
        ;;
    *)
        main
        ;;
esac