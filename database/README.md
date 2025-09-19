# Quantum Solar CRM Database Architecture

This directory contains the complete database schema and migration system for the Quantum Solar CRM extension, implementing Phase 1 of the Complete Implementation Guide.

## 🏗️ Architecture Overview

### Custom ID System
- **QSLID000001** - Quantum Solar Lead ID (for leads)
- **QSOID000001** - Quantum Solar Opportunity ID (for sales opportunities)
- **QSPID000001** - Quantum Solar Project ID (for projects)
- **QSIID000001** - Quantum Solar Installation ID (for equipment)

### Core Tables Enhanced

#### Enhanced Existing Tables
1. **splash_leads** - Enhanced with custom IDs and solar-specific fields
2. **projects** - Enhanced with 11-stage pipeline tracking and equipment details

#### New Tables Created
3. **opportunities** - Sales pipeline management between leads and projects
4. **installation_equipment** - Equipment tracking and inventory management
5. **profiles** - User roles and permissions for RLS

## 📁 Migration Files

| File | Purpose | Description |
|------|---------|-------------|
| `001_create_custom_id_system.sql` | ID Functions | Creates sequences and ID generation functions |
| `002_enhance_existing_tables.sql` | Schema Enhancement | Adds custom IDs and solar fields to existing tables |
| `003_create_opportunities_table.sql` | Sales Pipeline | Creates opportunities table for sales management |
| `004_create_installation_equipment_table.sql` | Equipment Tracking | Creates equipment inventory and tracking table |
| `005_configure_row_level_security.sql` | Security | Implements RLS policies and user profiles |
| `006_create_performance_indexes.sql` | Optimization | Creates indexes for optimal query performance |

## 🚀 Quick Start

### Prerequisites
- PostgreSQL client tools installed (`psql`)
- Access to your Supabase database
- Database connection string

### Running Migrations

1. **Test Connection:**
   ```bash
   ./run_migrations.sh --test
   ```

2. **List Available Migrations:**
   ```bash
   ./run_migrations.sh --list
   ```

3. **Apply All Migrations:**
   ```bash
   ./run_migrations.sh
   ```

### Manual Migration (Alternative)
If you prefer to run migrations manually:

```bash
# Connect to your database
psql "postgresql://your-connection-string"

# Run each migration in order
\i migrations/001_create_custom_id_system.sql
\i migrations/002_enhance_existing_tables.sql
\i migrations/003_create_opportunities_table.sql
\i migrations/004_create_installation_equipment_table.sql
\i migrations/005_configure_row_level_security.sql
\i migrations/006_create_performance_indexes.sql
```

## 📊 Database Schema

### Enhanced Lead Management
```sql
-- Example: Creating a new lead with custom ID
INSERT INTO splash_leads (first_name, last_name, email, phone, utility_company)
VALUES ('John', 'Doe', 'john@example.com', '555-0123', 'ComEd');
-- Automatically generates: QSLID000001
```

### Opportunity Pipeline
```sql
-- Example: Converting lead to opportunity
INSERT INTO opportunities (lead_id, estimated_system_size, estimated_cost, financing_type)
VALUES (
  (SELECT id FROM splash_leads WHERE custom_id = 'QSLID000001'),
  7.5, 25000.00, 'loan'
);
-- Automatically generates: QSOID000001
```

### Project Tracking
```sql
-- Example: Converting opportunity to project
INSERT INTO projects (customer_name, system_size_kw, current_stage)
VALUES ('John Doe', 7.5, 1);
-- Automatically generates: QSPID000001
```

### Equipment Management
```sql
-- Example: Adding equipment to project
INSERT INTO installation_equipment (project_id, equipment_type, manufacturer, model, quantity)
VALUES (
  (SELECT id FROM projects WHERE custom_id = 'QSPID000001'),
  'solar_panel', 'SunPower', 'SPR-X22-370', 20
);
-- Automatically generates: QSIID000001
```

## 🔐 Security Features

### Row Level Security (RLS)
- **Admin/Manager**: Full access to all records
- **Sales Rep**: Access to assigned leads and opportunities
- **Installer**: Access to assigned project equipment and photos
- **User**: Read-only access to relevant records

### User Roles
- `admin` - Full system access
- `manager` - Team management and oversight
- `sales_rep` - Lead and opportunity management
- `installer` - Equipment and installation management
- `user` - Read-only access

## 🔍 Performance Optimizations

### Indexes Created
- **Custom ID indexes** for fast lookups
- **Status and assignment indexes** for dashboard queries
- **Full-text search indexes** for lead and project search
- **Composite indexes** for common query patterns
- **Partial indexes** for active records only

### Query Performance
- Optimized for dashboard queries
- Fast search across leads and projects
- Efficient filtering by status, assignment, and date ranges
- Geographic queries for location-based features

## 🧪 Testing

### Verify Installation
```sql
-- Test custom ID generation
SELECT generate_lead_id(), generate_opportunity_id(), generate_project_id(), generate_installation_id();

-- Check table structure
\d+ splash_leads
\d+ opportunities
\d+ projects
\d+ installation_equipment

-- Verify RLS policies
\d+ splash_leads (shows RLS status)
```

### Sample Data Queries
```sql
-- View leads with custom IDs
SELECT custom_id, first_name, last_name, status, created_at 
FROM splash_leads 
ORDER BY created_at DESC LIMIT 10;

-- View opportunities pipeline
SELECT o.custom_id, l.first_name, l.last_name, o.status, o.estimated_cost
FROM opportunities o
JOIN splash_leads l ON o.lead_id = l.id
ORDER BY o.created_at DESC;

-- View active projects
SELECT custom_id, customer_name, current_stage, system_size_kw, overall_status
FROM projects 
WHERE overall_status = 'active'
ORDER BY updated_at DESC;
```

## 🔄 Next Steps (Phase 2)

After completing Phase 1, you can proceed to:

1. **Mobile Foundation** - React Native app setup
2. **API Enhancements** - TypeScript types and API routes
3. **Real-time Features** - Supabase subscriptions
4. **Integration Setup** - Google Drive, Calendar, SMS

## 📚 Additional Resources

- [Complete Implementation Guide](../Complete%20Implementation%20Guide%20for%20Quantum%20Solar%20CRM%20Extension.md)
- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## 🐛 Troubleshooting

### Common Issues

1. **Connection Failed**
   - Verify your database connection string
   - Check network access to Supabase
   - Ensure PostgreSQL client is installed

2. **Migration Failed**
   - Check for syntax errors in migration files
   - Verify you have appropriate database permissions
   - Look for conflicting existing objects

3. **RLS Issues**
   - Ensure profiles table is populated with user data
   - Check user roles are correctly assigned
   - Verify auth.users table has corresponding entries

### Getting Help
- Check the migration logs for specific error messages
- Review the database connection and permissions
- Consult the Complete Implementation Guide for additional context