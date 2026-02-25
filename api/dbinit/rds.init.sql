-- Creates the ahp_prisma database and database users.
-- Follows examples from https://aws.amazon.com/blogs/database/managing-postgresql-users-and-roles/.

\set ON_ERROR_STOP on

-- Database
SELECT 'CREATE DATABASE ahp_prisma'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'ahp_prisma')\gexec
\c ahp_prisma

-- Revoke public privleges
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON DATABASE ahp_prisma FROM PUBLIC;

-- Roles
-- ahp_api
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'ahp_api') THEN
        CREATE USER ahp_api;
        GRANT rds_iam TO ahp_api;
        GRANT CONNECT ON DATABASE ahp_prisma TO ahp_api;
        GRANT ALL PRIVILEGES ON DATABASE ahp_prisma TO ahp_api;
        GRANT ALL PRIVILEGES ON SCHEMA public TO ahp_api;
    END IF;
END
$$;


-- ahp_readonly
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'ahp_readonly') THEN
        CREATE USER ahp_readonly;
        GRANT rds_iam TO ahp_readonly;
        GRANT CONNECT ON DATABASE ahp_prisma TO ahp_readonly;
        GRANT USAGE ON SCHEMA public TO ahp_readonly;
        GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO ahp_readonly;
    END IF;
END
$$;

-- Set local role within transation.
BEGIN;
SET LOCAL ROLE ahp_api;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO ahp_readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE ON SEQUENCES TO ahp_readonly;
COMMIT;
