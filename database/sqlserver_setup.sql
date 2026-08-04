-- SQL Server Database Setup Script for Software Development Document Environment
-- Run this script to initialize the tables, sequences, and initial configurations.

IF OBJECT_ID('dbo.app_audit_logs', 'U') IS NOT NULL DROP TABLE dbo.app_audit_logs;
IF OBJECT_ID('dbo.app_documents', 'U') IS NOT NULL DROP TABLE dbo.app_documents;
IF OBJECT_ID('dbo.app_users', 'U') IS NOT NULL DROP TABLE dbo.app_users;
IF OBJECT_ID('dbo.app_configs', 'U') IS NOT NULL DROP TABLE dbo.app_configs;

-- Create Users table
CREATE TABLE app_users (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT 'MAKER' NOT NULL, -- ADMIN, MAKER, CHECKER
    is_locked CHAR(1) DEFAULT 'N' NOT NULL, -- 'Y' or 'N'
    pwd_reset_token VARCHAR(100),
    pwd_expiry_date DATETIME NOT NULL,
    created_at DATETIME DEFAULT GETDATE() NOT NULL
);

-- Create Documents table
CREATE TABLE app_documents (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    doc_id_code VARCHAR(30) UNIQUE NOT NULL, -- auto sequence e.g., SDE-P101, SDE-P201, SDE-P202
    app_code VARCHAR(3) NOT NULL,
    phase_number INT NOT NULL, -- 1 to 7
    document_title VARCHAR(150) NOT NULL, --deliverable title e.g. Business Case / Functional Specification
    description VARCHAR(500) NOT NULL, -- configurable description
    version_number VARCHAR(20) NOT NULL,
    document_code VARCHAR(50) NOT NULL,
    file_path VARCHAR(500),
    file_name VARCHAR(250),
    status VARCHAR(30) DEFAULT 'PENDING' NOT NULL, -- PENDING, APPROVED, REJECTED, PROCESSED
    maker_username VARCHAR(50) NOT NULL,
    checker_username VARCHAR(50),
    checker_remarks VARCHAR(500),
    processed_status VARCHAR(50) DEFAULT 'NOT PROCESSED' NOT NULL, -- PROCESSED, NOT PROCESSED
    recommendations NVARCHAR(MAX),
    created_at DATETIME DEFAULT GETDATE() NOT NULL,
    updated_at DATETIME DEFAULT GETDATE() NOT NULL
);

-- Create Audit Logs table
CREATE TABLE app_audit_logs (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    action_type VARCHAR(100) NOT NULL, -- UPLOAD, APPROVAL, REJECTION, USER_LOCK, USER_UNLOCK, PW_RESET
    doc_id_code VARCHAR(30),
    performed_by VARCHAR(50) NOT NULL,
    details VARCHAR(1000),
    log_timestamp DATETIME DEFAULT GETDATE() NOT NULL
);

-- Create System Configs table
CREATE TABLE app_configs (
    config_key VARCHAR(100) PRIMARY KEY,
    config_value VARCHAR(1000) NOT NULL
);

-- Seed Data
INSERT INTO app_users (username, password, role, is_locked, pwd_expiry_date)
VALUES ('admin', '$2a$10$8.UnVuG9HHgffUDAlk8GPuK1v5I4.u6H0I8.I8xXm16a6K78I0U7m', 'ADMIN', 'N', DATEADD(day, 90, GETDATE())); -- password is 'admin123'

INSERT INTO app_users (username, password, role, is_locked, pwd_expiry_date)
VALUES ('maker', '$2a$10$8.UnVuG9HHgffUDAlk8GPuK1v5I4.u6H0I8.I8xXm16a6K78I0U7m', 'MAKER', 'N', DATEADD(day, 90, GETDATE())); -- password is 'admin123'

INSERT INTO app_users (username, password, role, is_locked, pwd_expiry_date)
VALUES ('checker', '$2a$10$8.UnVuG9HHgffUDAlk8GPuK1v5I4.u6H0I8.I8xXm16a6K78I0U7m', 'CHECKER', 'N', DATEADD(day, 90, GETDATE())); -- password is 'admin123'

INSERT INTO app_configs (config_key, config_value) VALUES ('APP_NAME', 'Software Development Document Environment');
INSERT INTO app_configs (config_key, config_value) VALUES ('DEFAULT_APP_CODE', 'SDE');
INSERT INTO app_configs (config_key, config_value) VALUES ('POLLING_DIR', './polling_folder');
INSERT INTO app_configs (config_key, config_value) VALUES ('ENABLE_SMS_AUTH_SIGNUP', 'false');
INSERT INTO app_configs (config_key, config_value) VALUES ('ENABLE_EMAIL_AUTH_SIGNUP', 'false');
INSERT INTO app_configs (config_key, config_value) VALUES ('ENABLE_APPROVER_SMS_NOTIFY', 'false');
INSERT INTO app_configs (config_key, config_value) VALUES ('ENABLE_APPROVER_EMAIL_NOTIFY', 'false');
