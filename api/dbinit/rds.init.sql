-- Creates the affordable_housing_portal database and database users.
-- Follows examples from https://aws.amazon.com/blogs/database/managing-postgresql-users-and-roles/.

\set ON_ERROR_STOP on

-- Database
SELECT 'CREATE DATABASE affordable_housing_portal'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'affordable_housing_portal')\gexec
\c affordable_housing_portal

-- Revoke public privleges
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON DATABASE affordable_housing_portal FROM PUBLIC;

-- Roles
-- bloom_api
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'bloom_api') THEN
        CREATE USER bloom_api;
        GRANT rds_iam TO bloom_api;
        GRANT CONNECT ON DATABASE affordable_housing_portal TO bloom_api;
        GRANT ALL PRIVILEGES ON DATABASE affordable_housing_portal TO bloom_api;
        GRANT ALL PRIVILEGES ON SCHEMA public TO bloom_api;
    END IF;
END
$$;


-- bloom_readonly
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'bloom_readonly') THEN
        CREATE USER bloom_readonly;
        GRANT rds_iam TO bloom_readonly;
        GRANT CONNECT ON DATABASE affordable_housing_portal TO bloom_readonly;
        GRANT USAGE ON SCHEMA public TO bloom_readonly;
        GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO bloom_readonly;
    END IF;
END
$$;

-- Set local role within transation.
BEGIN;
SET LOCAL ROLE bloom_api;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO bloom_readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE ON SEQUENCES TO bloom_readonly;
COMMIT;
