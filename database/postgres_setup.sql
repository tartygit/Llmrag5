-- PostgreSQL Database Setup Script for Software Development Document Environment
-- Run this script to initialize the tables, sequences, and initial configurations.

DROP TABLE IF EXISTS app_audit_logs CASCADE;
DROP TABLE IF EXISTS app_documents CASCADE;
DROP TABLE IF EXISTS app_users CASCADE;
DROP TABLE IF EXISTS app_configs CASCADE;

-- Create Users table
CREATE TABLE app_users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT 'MAKER' NOT NULL, -- ADMIN, MAKER, CHECKER
    is_locked VARCHAR(1) DEFAULT 'N' NOT NULL, -- 'Y' or 'N'
    pwd_reset_token VARCHAR(100),
    pwd_expiry_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create Documents table
CREATE TABLE app_documents (
    id BIGSERIAL PRIMARY KEY,
    doc_id_code VARCHAR(30) UNIQUE NOT NULL, -- auto sequence e.g., SDE-P101, SDE-P201, SDE-P202
    app_code VARCHAR(3) NOT NULL,
    phase_number INTEGER NOT NULL, -- 1 to 7
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
    recommendations TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create Audit Logs table
CREATE TABLE app_audit_logs (
    id BIGSERIAL PRIMARY KEY,
    action_type VARCHAR(100) NOT NULL, -- UPLOAD, APPROVAL, REJECTION, USER_LOCK, USER_UNLOCK, PW_RESET
    doc_id_code VARCHAR(30),
    performed_by VARCHAR(50) NOT NULL,
    details VARCHAR(1000),
    log_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create System Configs table
CREATE TABLE app_configs (
    config_key VARCHAR(100) PRIMARY KEY,
    config_value VARCHAR(1000) NOT NULL
);

-- Seed Data
INSERT INTO app_users (username, password, role, is_locked, pwd_expiry_date)
VALUES ('admin', '$2a$10$8.UnVuG9HHgffUDAlk8GPuK1v5I4.u6H0I8.I8xXm16a6K78I0U7m', 'ADMIN', 'N', CURRENT_TIMESTAMP + INTERVAL '90 days'); -- password is 'admin123'

INSERT INTO app_users (username, password, role, is_locked, pwd_expiry_date)
VALUES ('maker', '$2a$10$8.UnVuG9HHgffUDAlk8GPuK1v5I4.u6H0I8.I8xXm16a6K78I0U7m', 'MAKER', 'N', CURRENT_TIMESTAMP + INTERVAL '90 days'); -- password is 'admin123'

INSERT INTO app_users (username, password, role, is_locked, pwd_expiry_date)
VALUES ('checker', '$2a$10$8.UnVuG9HHgffUDAlk8GPuK1v5I4.u6H0I8.I8xXm16a6K78I0U7m', 'CHECKER', 'N', CURRENT_TIMESTAMP + INTERVAL '90 days'); -- password is 'admin123'

INSERT INTO app_configs (config_key, config_value) VALUES ('APP_NAME', 'Software Development Document Environment');
INSERT INTO app_configs (config_key, config_value) VALUES ('DEFAULT_APP_CODE', 'SDE');
INSERT INTO app_configs (config_key, config_value) VALUES ('POLLING_DIR', './polling_folder');
INSERT INTO app_configs (config_key, config_value) VALUES ('ENABLE_SMS_AUTH_SIGNUP', 'false');
INSERT INTO app_configs (config_key, config_value) VALUES ('ENABLE_EMAIL_AUTH_SIGNUP', 'false');
INSERT INTO app_configs (config_key, config_value) VALUES ('ENABLE_APPROVER_SMS_NOTIFY', 'false');
INSERT INTO app_configs (config_key, config_value) VALUES ('ENABLE_APPROVER_EMAIL_NOTIFY', 'false');
