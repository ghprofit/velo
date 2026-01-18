-- Connect to your database first, then run these commands
-- Replace 'your_database_user' with your actual database username from DATABASE_URL

-- Grant all privileges on the database
GRANT ALL PRIVILEGES ON DATABASE velo TO your_database_user;

-- Connect to the velo database, then run:
\c velo

-- Grant schema permissions
GRANT ALL ON SCHEMA public TO your_database_user;
GRANT CREATE ON SCHEMA public TO your_database_user;
GRANT USAGE ON SCHEMA public TO your_database_user;

-- Grant table permissions (for existing and future tables)
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_database_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO your_database_user;

-- Grant sequence permissions (for auto-increment fields)
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_database_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO your_database_user;

-- Grant function permissions
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO your_database_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO your_database_user;

-- If you're using RDS, you might also need:
-- GRANT rds_superuser TO your_database_user;
