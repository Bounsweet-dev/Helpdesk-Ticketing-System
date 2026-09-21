-- =========================================================
-- NexusDesk Database
-- =========================================================
-- WARNING:
-- This script recreates the database from scratch.
-- Existing NexusDesk data will be deleted.
-- Run only when you intentionally want a clean database.
-- Password hashes are populated separately by seed-users.js.
-- =========================================================


DROP DATABASE IF EXISTS nexusdeskdb;

CREATE DATABASE nexusdeskdb;

USE nexusdeskdb;


-- =========================================================
-- Departments
-- =========================================================

CREATE TABLE departments (
    department_id INT AUTO_INCREMENT PRIMARY KEY,
    department_name VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB;


INSERT INTO departments (
    department_name
)
VALUES
    ('L1 Helpdesk'),
    ('L2 Helpdesk'),
    ('Network'),
    ('Systems');


-- =========================================================
-- Users
-- =========================================================

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,

    employee_number VARCHAR(20) NOT NULL UNIQUE,
    username VARCHAR(100) NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,

    job_title VARCHAR(100),

    role ENUM(
        'employee',
        'technician',
        'admin'
    ) NOT NULL DEFAULT 'employee',

    department_id INT,

    password_hash VARCHAR(255),

    FOREIGN KEY (department_id)
        REFERENCES departments(department_id)
) ENGINE=InnoDB;


INSERT INTO users (
    employee_number,
    username,
    full_name,
    email,
    job_title,
    role,
    department_id
)
VALUES
(
    'EMP100',
    'admin',
    'NexusDesk Administrator',
    'admin@nexusdesk.com',
    'NexusDesk Administrator',
    'admin',
    NULL
),
(
    'EMP101',
    'l1tech',
    'L1 Technician',
    'l1tech@nexusdesk.com',
    'L1 Helpdesk Technician',
    'technician',
    1
),
(
    'EMP102',
    'l2tech',
    'L2 Technician',
    'l2tech@nexusdesk.com',
    'L2 Helpdesk Technician',
    'technician',
    2
),
(
    'EMP103',
    'employee',
    'NexusDesk Employee',
    'employee@nexusdesk.com',
    'Employee',
    'employee',
    NULL
),
(
    'EMP104',
    'l1tech2',
    'L1 Technician 2',
    'l1tech2@nexusdesk.com',
    'L1 Helpdesk Technician',
    'technician',
    1
),
(
    'EMP105',
    'nettech1',
    'Network Technician 1',
    'nettech1@nexusdesk.com',
    'Network Technician',
    'technician',
    3
),
(
    'EMP106',
    'nettech2',
    'Network Technician 2',
    'nettech2@nexusdesk.com',
    'Network Technician',
    'technician',
    3
),
(
    'EMP107',
    'systech1',
    'Systems Technician',
    'systech1@nexusdesk.com',
    'Systems Technician',
    4
),
(
    'EMP108',
    'employee2',
    'NexusDesk Employee 2',
    'employee2@nexusdesk.com',
    'Employee',
    'employee',
    NULL
),
(
    'EMP109',
    'employee3',
    'NexusDesk Employee 3',
    'employee3@nexusdesk.com',
    'Employee',
    'employee',
    NULL
);


-- =========================================================
-- Tickets
-- =========================================================

CREATE TABLE tickets (
    ticket_id INT AUTO_INCREMENT PRIMARY KEY,

    ticket_number VARCHAR(20) NOT NULL UNIQUE,

    requester_id INT NOT NULL,
    assigned_to_user_id INT,
    assigned_department_id INT,

    category VARCHAR(100),

    priority ENUM(
        'low',
        'medium',
        'high',
        'critical'
    ) NOT NULL DEFAULT 'low',

    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,

    status ENUM(
        'open',
        'in-progress',
        'on-hold',
        'pending',
        'resolved'
    ) NOT NULL DEFAULT 'open',

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at DATETIME,

    FOREIGN KEY (requester_id)
        REFERENCES users(user_id),

    FOREIGN KEY (assigned_to_user_id)
        REFERENCES users(user_id),

    FOREIGN KEY (assigned_department_id)
        REFERENCES departments(department_id)
) ENGINE=InnoDB;


-- =========================================================
-- Worknotes
-- =========================================================

CREATE TABLE worknotes (
    worknote_id INT AUTO_INCREMENT PRIMARY KEY,

    ticket_id INT NOT NULL,
    user_id INT NOT NULL,

    note TEXT NOT NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (ticket_id)
        REFERENCES tickets(ticket_id)
        ON DELETE CASCADE,

    FOREIGN KEY (user_id)
        REFERENCES users(user_id)
) ENGINE=InnoDB;


-- =========================================================
-- Knowledge Base
-- =========================================================

CREATE TABLE knowledge_base_articles (
    article_id INT AUTO_INCREMENT PRIMARY KEY,

    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,

    content TEXT NOT NULL,

    created_by INT NOT NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at DATETIME NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (created_by)
        REFERENCES users(user_id)
) ENGINE=InnoDB;


-- =========================================================
-- Knowledge Base Seed Articles
-- =========================================================

INSERT INTO knowledge_base_articles (
    title,
    category,
    content,
    created_by
)
VALUES
(
    'How to reset your password',

    'Accounts',

    JSON_OBJECT(

        'description',
        'Steps for helping employees regain access to their NexusDesk account.',

        'problem',
        'The employee cannot log in to their NexusDesk account.',

        'causes',
        JSON_ARRAY(
            'The username or password may be incorrect.',
            'The account may be temporarily unavailable.',
            'The employee may be using an outdated password.'
        ),

        'steps',
        JSON_ARRAY(
            'Confirm the username or email address being used.',
            'Verify that the employee is using the correct password.',
            'Check whether the account is active.',
            'Reset the password when necessary.'
        ),

        'resolution',
        'After confirming the employee information and resetting the password when required, have the employee log in again.'

    ),

    (
        SELECT user_id
        FROM users
        WHERE username = 'admin'
    )
),

(
    'Basic network troubleshooting',

    'Network',

    JSON_OBJECT(

        'description',
        'Basic steps for diagnosing common network connection problems.',

        'problem',
        'The employee is unable to connect to the network.',

        'causes',
        JSON_ARRAY(
            'The network cable may be disconnected.',
            'Wi-Fi may be disabled.',
            'The network device may be unavailable.',
            'There may be a broader network outage.'
        ),

        'steps',
        JSON_ARRAY(
            'Check the network cable or Wi-Fi connection.',
            'Restart the network adapter.',
            'Restart the computer if necessary.',
            'Check whether other users are experiencing the same issue.'
        ),

        'resolution',
        'Restore the physical or wireless network connection. Escalate the issue when multiple users are affected or the network equipment appears unavailable.'

    ),

    (
        SELECT user_id
        FROM users
        WHERE username = 'admin'
    )
),

(
    'How to report a hardware issue',

    'Hardware',

    JSON_OBJECT(

        'description',
        'Steps for reporting hardware problems to the IT Support team.',

        'problem',
        'The employee is experiencing a hardware problem with a company device.',

        'causes',
        JSON_ARRAY(
            'The device may have a damaged component.',
            'The device may not be receiving power.',
            'A peripheral or cable may be malfunctioning.',
            'The device may be showing a hardware-related error.'
        ),

        'steps',
        JSON_ARRAY(
            'Identify the affected device.',
            'Describe the symptoms or error messages.',
            'Check the power connection and connected peripherals.',
            'Submit a help request with the relevant details.'
        ),

        'resolution',
        'Review the reported symptoms and perform the appropriate hardware troubleshooting or escalation.'

    ),

    (
        SELECT user_id
        FROM users
        WHERE username = 'admin'
    )
);


-- =========================================================
-- End of Database Setup
-- =========================================================