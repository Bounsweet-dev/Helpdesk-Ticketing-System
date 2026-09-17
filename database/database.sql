CREATE DATABASE IF NOT EXISTS nexusdeskdb;

USE nexusdeskdb;


-- =========================================
-- Departments
-- =========================================

CREATE TABLE departments (
    department_id INT AUTO_INCREMENT PRIMARY KEY,
    department_name VARCHAR(100) NOT NULL UNIQUE
);


INSERT INTO departments (department_name)
VALUES
    ('L1 Helpdesk'),
    ('L2 Helpdesk'),
    ('Network'),
    ('Systems');


-- =========================================
-- Users
-- =========================================

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    employee_number VARCHAR(20) NOT NULL UNIQUE,
    username VARCHAR(100) NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    job_title VARCHAR(100),
    role ENUM('employee', 'technician', 'admin') NOT NULL DEFAULT 'employee',
    department_id INT,
    password_hash VARCHAR(255),

    FOREIGN KEY (department_id)
        REFERENCES departments(department_id)
);


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
    'EMP001',
    'kballer',
    'Kevin Baller',
    'kballer@nexusdesk.com',
    'L2 Helpdesk',
    'technician',
    2
),
(
    'EMP002',
    'jdoe',
    'John Doe',
    'jdoe@nexusdesk.com',
    'L1 Helpdesk',
    'technician',
    1
),
(
    'EMP006',
    'maria',
    'Maria Santos',
    'maria@nexusdesk.com',
    'HR Staff',
    'employee',
    NULL
);


-- =========================================
-- Tickets
-- =========================================

CREATE TABLE tickets (
    ticket_id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_number VARCHAR(20) NOT NULL UNIQUE,

    requester_id INT NOT NULL,
    assigned_to_user_id INT,
    assigned_department_id INT,

    category VARCHAR(100),
    priority ENUM('low', 'medium', 'high', 'critical') NOT NULL DEFAULT 'low',
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
);

INSERT INTO tickets (
	ticket_number,
    requester_id,
    assigned_to_user_id,
    assigned_department_id,
    category,
    priority,
    subject,
    description,
    status
) 
VALUES (
	'INC1001',
    2,
    1,
    2,
    'hardware',
    'high',
    'Computer not turning on',
    'The user reports that their computer does not power on.',
    'open'
);


-- =========================================
-- Worknotes
-- =========================================

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
);

INSERT INTO worknotes (
	ticket_id,
    user_id,
    note
)
VALUES (
	1,
    1,
    'User confirmed that the power cable was loose.'
);

-- Verifying your tables
SELECT * FROM users;
SELECT * FROM departments;
SELECT * FROM tickets;
SELECT * FROM worknotes;