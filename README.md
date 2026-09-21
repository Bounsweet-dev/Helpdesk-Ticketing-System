# NexusDesk
IT Support Platform

## Overview

NexusDesk is a web-based IT support and ticket management platform designed to centralize employee help requests, incident tracking, technician assignment, worknotes, and IT knowledge-base management.

## Features

### Authentication

* Username or email login
* Session-based authentication
* Remember Me
* Role-based access control
* Secure password hashing with bcrypt
* Logout and session destruction
* Logged-in users are redirected to their appropriate landing page

### Employee Support

* Submit IT help requests
* Automatic requester identification from the logged-in account
* View and search the Knowledge Base
* Employee-specific sidebar navigation
* Forgot Password support request placeholder

### Ticket Management

* Create and manage support tickets
* Ticket categories and priorities
* Ticket status management
* Requester information
* Department and technician assignment
* Automatic technician and department assignment when a technician creates a ticket
* Ticket searching and filtering
* Date-created filtering
* Worknote history
* Ticket resolution and reopening
* Unsaved-change protection when editing tickets
* Assignment validation to prevent invalid technician/department combinations

### Knowledge Base

* View Knowledge Base articles
* Search articles
* Filter by category
* Structured article content
* Related articles
* Create articles
* Edit articles
* Delete articles
* Admin-only article management
* JSON-based article content stored in MySQL

### User Interface

* Role-specific sidebar navigation
* Sticky sidebar
* Account menu with current user information
* About page
* Responsive form and navigation layout
* Lucide icons
* NexusDesk custom UI styling

## Technology Stack

### Frontend

* HTML5
* CSS3
* JavaScript
* Lucide Icons
* Markdown rendering with Marked

### Backend

* Node.js
* Express.js
* Express Session
* bcryptjs

### Database

* MySQL
* mysql2

### GitHub Repository

* Git Bash

## Requirements

### In developing NexusDesk, I used:

Main IDE - Visual Studio Code
- HTML
- JavaScript
- CSS3
- Node.js
- Express.js
- bcryptjs

Database
- MySQL

## Installation

### 1. Clone the repository

Enter on Git Bash one line at a time:

git clone <repository-url> (Get on the "Code" button above.)

cd NexusDesk/

### 2. Install Dependencies

Installing node.js and bcryptjs on Visual Studio

- On Visual Studio Code terminal, enter "npm install"

### 3. Create the Environment File

Create a .env file in the project root and enter

DB_HOST=localhost
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=nexusdeskdb
DB_PORT=3306

SESSION_SECRET=nexusdesk

SEED_PASSWORD_EMP100=your_admin_password
SEED_PASSWORD_EMP101=your_l1_password
SEED_PASSWORD_EMP102=your_l2_password
SEED_PASSWORD_EMP103=your_employee_password
SEED_PASSWORD_EMP104=your_l1_password
SEED_PASSWORD_EMP105=your_network_password
SEED_PASSWORD_EMP106=your_network_password
SEED_PASSWORD_EMP107=your_systems_password
SEED_PASSWORD_EMP108=your_employee_password
SEED_PASSWORD_EMP109=your_employee_password

## Database Setup

### 1. Create the database

Execute database.sql using MySQL Workbench

The database creates:

nexusdeskdb
├── departments
├── users
├── tickets
├── worknotes
└── knowledge_base_articles

### 2. Seed user passwords

On your Visual Studio Code, enter "node backend/seed-users.js" in the terminal

This is hash the user passwords adding layer to the password security

## Running the Application

Start the backend first on your Visual Studio Code terminal:

node backend/server.js

The application is available at: http://localhost:3000

## API Overview

### Authentication

* POST /api/login
* POST /api/logout
* GET /api/me

## Tickets

* GET    /api/tickets
* GET    /api/tickets/:id
* POST   /api/tickets
* PUT    /api/tickets/:id

## Worknotes

* GET  /api/tickets/:id/worknotes
* POST /api/tickets/:id/worknotes

## Users and Lookups

* GET /api/users/search
* GET /api/technicians
* GET /api/departments

## Knowledge Base

* GET    /api/knowledge-base
* GET    /api/knowledge-base/:id
* POST   /api/knowledge-base
* PUT    /api/knowledge-base/:id
* DELETE /api/knowledge-base/:id

### Protected API endpoints use authentication and role-based authorization.

## Development Notes

NexusDesk was developed as a learning and portfolio project focused on building a practical IT support workflow using a web application architecture.

The project emphasizes:

* Role-based systems
* REST-style API development
* Database relationships
* Server-side validation
* Authentication and sessions
* IT support workflows
* Maintainable frontend/backend separation

## License

This project is intended for educational and portfolio purposes.

