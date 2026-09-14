# NexusDesk

## Overview

NexusDesk is a web-based IT helpdesk and ticket management system inspired by platforms such as ServiceNow.

The project is being developed as a learning and portfolio project to practice web development, ticket management workflows, frontend development, and eventually backend/database integration.

The system is designed primarily for IT administrators and helpdesk technicians to create, manage, track, and resolve support tickets through a centralized dashboard.

## Technologies Used

### Frontend

* HTML5
* CSS3
* JavaScript
* Lucide Icons
* Chart.js

### Current Data Storage

* Browser `localStorage`

### Planned Backend

* Node.js
* Express.js
* MySQL

## Features

### Dashboard

The dashboard provides an overview of the current ticket workload, including:

* Total tickets
* Unassigned tickets
* Pending tickets
* Resolved tickets
* Recent tickets
* Ticket priority counts
* Tickets created today
* Tickets resolved today
* Ticket activity chart

### Ticket Creation

Administrators can create new IT support tickets with information such as:

* User information
* Employee number
* Employee email
* Job title
* Ticket category
* Priority
* Subject
* Description
* Assigned department
* Assigned technician

### Ticket Management

Individual tickets can be opened and managed through a dedicated ticket page.

The system currently supports:

* Viewing ticket information
* Editing ticket details
* Assigning technicians
* Assigning departments
* Changing ticket priority
* Changing ticket status
* Adding worknotes
* Saving changes
* Resolving tickets
* Reopening resolved tickets
* Tracking creation and resolution dates

### Ticket List

The ticket list provides an overview of recorded tickets and includes filtering by:

* Ticket number
* User
* Assigned department
* Assigned technician
* Priority
* Status
* Creation date
* Category

The ticket list also displays the number of tickets matching the current filters.

### Knowledge Base

A Knowledge Base section is included as part of the helpdesk system and is intended to provide technicians and users with troubleshooting information and support documentation.

## Current Project Architecture

The current version is frontend-focused and uses browser `localStorage` for temporary ticket storage.

```text
HTML
  ↓
CSS
  ↓
JavaScript
  ↓
localStorage
```

The planned architecture will replace `localStorage` with a Node.js/Express backend and MySQL database:

```text
HTML / CSS / JavaScript
          ↓
      Node.js
      Express.js
          ↓
        MySQL
```

The frontend interface and ticket management workflow are being developed first before backend and database integration.

## Project Status

NexusDesk is currently **under development**.

### Completed

* Dashboard
* Ticket creation
* Ticket list
* Ticket filtering
* Individual ticket management
* Ticket status management
* Resolve and reopen functionality
* Worknotes
* Local ticket storage
* Dashboard ticket statistics
* Ticket activity chart

### Planned

* Node.js backend
* Express.js API
* MySQL database
* User authentication
* Persistent ticket storage
* Server-side filtering
* Improved ticket searching
* Additional dashboard features
* Expanded Knowledge Base functionality

## Purpose

This project is being developed to gain practical experience in building a complete IT helpdesk system from the ground up.

The project will progressively move from a frontend prototype into a full-stack application using **JavaScript, Node.js, Express.js, and MySQL**.
