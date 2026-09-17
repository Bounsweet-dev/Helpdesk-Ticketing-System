//
//
//
// ========================
//    Backend JavaScript
// ========================

// Imports

require("dotenv").config();

const path = require("path");
const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const { stat } = require("fs");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

// Protecting HTML pages and forces user to login screen if not logged in

function requireLogin(req, res, next) {
    if (!req.session.userId) {
        res.redirect("/index.html");
        return;
    }

    next();
}

// Protecting API endpoints preventing users to not manually send requests to database

function requireApiLogin (req, res, next) {

    if (!req.session.userId) {
        res.status(401).json({
            error: "Not authenticated."
        });

        return;
    }

    next();

}

app.use(function(req, res, next) {

    if (
        req.path.endsWith(".html") &&
        req.path !== "/index.html"
    ) {
        requireLogin(req, res, next);
        return;
    }

    next();

});

app.use(express.static(path.join(__dirname, "..")));



// Allow server to read JSON sent by frontend.

app.use(express.json());

// MySQL connection

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

db.connect(function(error) {

    if(error) {
        console.error("MySQL connection failed:", error);
        return;
    }

    console.log("Connected to MySQL.");

});

// Test route

app.get("/", function (req, res) {
    res.send("NexusDesk backend is running.");
});

// =====================================
//    Ticket API - GET, POST, and PUT
// =====================================

// Getting all tickets

app.get("/api/tickets", requireApiLogin, function(req, res) {

    const sql = `
        SELECT
            t.ticket_id,
            t.ticket_number,
            requester.username AS requester,
            requester.employee_number,
            requester.email,
            requester.job_title,
            t.category,
            t.priority,
            t.subject,
            t.description,
            t.status,
            technician.username AS assigned_to,
            d.department_name AS assigned_department,
            t.created_at,
            t.resolved_at
        FROM tickets t
        
        JOIN users requester
            ON t.requester_id = requester.user_id
            
        LEFT JOIN users technician
            ON t.assigned_to_user_id = technician.user_id
        
        LEFT JOIN departments d
            ON t.assigned_department_id = d.department_id
            
        ORDER BY t.created_at DESC
    `;

    db.query(sql, function(error, results) {

        if(error) {
            
            console.error("Failed to retrieve tickets:", error);

            res.status(500).json({
                error: "Failed to retrieve tickets."
            });

            return;

        }

        res.json(results);

    });

});

// Getting individual tickets (GET)

app.get("/api/tickets/:id", requireApiLogin, function(req, res) {

    const ticketId = req.params.id;

    const sql = `
        SELECT
            t.ticket_id,
            t.ticket_number,
            t.requester_id,
            requester.username AS requester,
            requester.employee_number,
            requester.email,
            requester.job_title,
            t.assigned_to_user_id,
            t.assigned_department_id,
            t.category,
            t.priority,
            t.subject,
            t.description,
            t.status,
            technician.username AS assigned_to,
            d.department_name AS assigned_department,
            t.created_at,
            t.resolved_at
        FROM tickets t

        JOIN users requester
            ON t.requester_id = requester.user_id

        LEFT JOIN users technician
            ON t.assigned_to_user_id = technician.user_id

        LEFT JOIN departments d
            ON t.assigned_department_id = d.department_id

        WHERE t.ticket_id = ?
    `;

    db.query(sql, [ticketId], function(error, results) {

        if (error) {
            console.error("Failed to retrieve ticket:", error);

            res.status(500).json({
                error: "Failed to retrieve ticket."
            });

            return;
        }

        if (results.length === 0) {

            res.status(404).json({
                error: "Ticket not found."
            });

            return;
        }

        res.json(results[0]);

    });

});

// Creating a ticket through Node.js (POST)

app.post("/api/tickets", requireApiLogin, function(req, res) {

    let {

        requesterId,
        assignedToUserId = null,
        assignedDepartmentId = null,
        category,
        priority,
        subject,
        description,
        status = "open"

    } = req.body;

    if (!subject || description) {

        res.status(400).json({
            error: "Subject and description are required."
        });

        return;

    }

    // Get currently logged in user

    const currentUserSql = `
        SELECT
            user_id,
            role
        FROM users
        WHERE user_id = ?    

    `;

    db.query(
        currentUserSql, [req.session.userId],
        function(error, results) {
            
            if (error) {

                console.error("Failed to retrieve current user.", error);
                res.status(500).json({
                    error: "Failed to create ticket."
                });

                return;

            }

            const currentUser = results[0];

            // Employee Help Request / User logged in is an Employee

            if (currentUser.role === "employee") {
                requesterId = currentUser.user_id;
                assignedToUserId = null;
                assignedDepartmentId = null;
                status = "open";
            }

            // Ticket Creation / User logged in is a Technician

            else {

                if (!requesterId) {
                    res.status(400).json({
                        error: "Requester is required."
                    });

                    return;
                }

            }

            // Generate ticket number

            const getNextTicketIdSql = `
    
                SELECT COALESCE(MAX(ticket_id), 0) + 1 AS nextTicketId
                FROM tickets

            `;

            db.query(getNextTicketIdSql, function(error, results) {

                if(!requesterId || !subject || !description) {
                    res.status(400).json({
                        error: "Requester, subject, and description are required."
                    });

                    return;
                }

                const allowedStatuses = [
                    "open",
                    "in-progress",
                    "on-hold",
                    "pending",
                    "resolved"
                ];

                if (!allowedStatuses.includes(status)) {
                    res.status(400).json({
                        error: "Invalid ticket status."
                    });

                    return;
                }

                if(error) {

                    console.error("Failed to generate ticket number:", error);
                    res.status(500).json({
                        error: "Failed to generate ticket number."
                    });

                    return;

                }

                const nextTicketId = results[0].nextTicketId;
                const ticketNumber = `INC${1000 + nextTicketId}`;
                const insertTicketSql = `

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
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)

                `;

                db.query(

                    insertTicketSql, [
                        
                        ticketNumber,
                        requesterId,
                        assignedToUserId,
                        assignedDepartmentId,
                        category,
                        priority,
                        subject,
                        description,
                        status

                    ],
                    function(error, result) {

                        if (error) {
                            
                            console.error("Failed to create ticket:", error);
                            res.status(500).json({
                                error: "Failed to create ticket."
                            });

                            return;

                        }

                        res.status(201).json({

                            message: "Ticket created successfully.",
                            ticketId: result.insertId,
                            ticketNumber: ticketNumber
                            
                        });

                    }

                );

            });
            

        }
    );

});

// Editing a ticket through front end (PUT)

app.put("/api/tickets/:id", requireApiLogin, function(req, res) {

    const ticketId = req.params.id;

    const {

        assignedToUserId,
        assignedDepartmentId,
        category,
        priority,
        subject,
        description,
        status

    } = req.body;

    const sql = `
    
        UPDATE tickets
        SET
            assigned_to_user_id = ?,
            assigned_department_id = ?,
            category = ?,
            priority = ?,
            subject = ?,
            description = ?,
            status = ?,
            resolved_at = CASE
                WHEN ? = 'resolved' THEN CURRENT_TIMESTAMP
                ELSE NULL
            END
        WHERE ticket_id = ?
    
    `;

    db.query(

        sql, [

            assignedToUserId,
            assignedDepartmentId,
            category,
            priority,
            subject,
            description,
            status,
            status,
            ticketId

        ],

        function(error, result) {

            if (error) {

                console.error("Failed to update ticket:", error);
                res.status(500).json({
                    error: "Failed to update ticket."
                });

                return;

            }

            if (result.affectedRows === 0) {
                res.status(404).json({
                    error: "Ticket not found."
                });

                return;
            }

            res.json({
                message: "Ticket updated successfully."
            });

        }

    );

});

// ==================================
//    Worknotes API - GET and POST
// ==================================

// Reading worknotes (GET)

app.get("/api/tickets/:id/worknotes", requireApiLogin, function(req, res) {

    const ticketId = req.params.id;

    const sql = `
    
        SELECT
            w.worknote_id,
            w.ticket_id,
            u.username,
            w.note,
            w.created_at
        FROM worknotes w

        JOIN users u
            ON w.user_id = u.user_id

        WHERE w.ticket_id = ?

        ORDER BY w.created_at DESC

    `;

    db.query(sql, [ticketId], function(error, results) {

        if (error) {

            console.error("Failed to retrieve worknotes:", error);
            res.status(500).json({
                error: "Failed to retrieve worknotes."
            });

            return;

        }

        res.json(results);

    });

});

//Writing worknotes (POST)

app.post("/api/tickets/:id/worknotes", requireApiLogin, function(req, res) {

    if (!req.session.userId) {
        res.status(401).json({
            error: "Not authenticated."
        });

        return;
    }

    const ticketId = req.params.id;
    const userId = req.session.userId;
    const { note } = req.body;

    if (!note || note.trim() === "") {
        res.status(400).json({
            error: "Worknote is required."
        });

        return;
    }

    const sql = `
        INSERT INTO worknotes (
            ticket_id,
            user_id,
            note
        )
        VALUES (?, ?, ?)
    `;

    db.query(
        sql,
        [ticketId, userId, note.trim()],
        function(error, result) {

            if (error) {
                console.error("Failed to create worknote:", error);

                res.status(500).json({
                    error: "Failed to create worknote."
                });

                return;
            }

            res.status(201).json({
                message: "Worknote added successfully.",
                worknoteId: result.insertId
            });
        }
    );
});

// =====================================
//    Create Ticket Dynamic Searching
// =====================================

// Departments API (GET)

app.get("/api/departments", requireApiLogin, function(req, res) {

    const sql = `
    
        SELECT
            department_id,
            department_name
        FROM departments
        ORDER BY department_name

    `;

    db.query(sql, function(error, results) {

        if (error) {

            console.error("Failed to retrieve departments:", error);
            res.status(500).json({
                error: "Failed to retrieve departments."
            });

            return;

        }

        res.json(results);

    });

});

// Users API (GET)

app.get("/api/users", requireApiLogin, function(req, res) {

    const sql = `
    
        SELECT
            u.user_id,
            u.employee_number,
            u.username,
            u.email,
            u.job_title,
            u.role,
            d.department_id,
            d.department_name
        FROM users u

        LEFT JOIN departments d
            ON u.department_id = d.department_id

        ORDER BY u.username

    `;

    db.query(sql, function(error, results) {

        if(error) {

            console.error("Failed to retrievee users:", error);
            res.status(500).json({
                error: "Failed to retrieve users."
            });

            return;

        }

        res.json(results);

    });

});

// Single User Searching (GET)

app.get("/api/users/search", requireApiLogin, function(req, res) {

    const searchQuery = req.query.query || "";
    const sql = `
    
        SELECT
            u.user_id,
            u.employee_number,
            u.username,
            u.full_name,
            u.email,
            u.job_title,
            u.role,
            d.department_id,
            d.department_name
        FROM users u

        LEFT JOIN departments d
            ON u.department_id = d.department_id

        WHERE
            u.full_name LIKE ?
            OR u.username LIKE ?
            OR u.employee_number LIKE ?
            OR u.email LIKE ?

        ORDER BY u.full_name
        LIMIT 10

    `;

    const searchValue = `%${searchQuery}%`;

    db.query(

        sql, [searchValue, searchValue, searchValue, searchValue],

        function(error, results) {

            if(error) {

                console.error("Failed to search users:", error);
                res.status(500).json({
                    error: "Failed to search users."
                });

                return;

            }

            res.json(results);

        }

    );

});

// Technician Search (GET)

app.get("/api/technicians", requireApiLogin, function(req, res) {

    const departmentId = req.query.departmentId;

    let sql = `
        SELECT
            u.user_id,
            u.employee_number,
            u.full_name,
            u.email,
            u.job_title,
            d.department_id,
            d.department_name
        FROM users u

        LEFT JOIN departments d
            ON u.department_id = d.department_id

        WHERE u.role = 'technician'
    `;

    const parameters = [];

    if (departmentId) {

        sql += `
            AND u.department_id = ?
        `;

        parameters.push(departmentId);

    }

    sql += `
        ORDER BY u.full_name
    `;

    db.query(
        sql,
        parameters,
        function(error, results) {

            if (error) {
                console.error("Failed to retrieve technicians:", error);

                res.status(500).json({
                    error: "Failed to retrieve technicians."
                });

                return;
            }

            res.json(results);
        }
    );
});

// Login API (POST)

app.post("/api/login", function(req, res) {

    const {username, password} = req.body;

    if (!username || !password) {
        res.status(400).json({
            error: "Username and password are required."
        });

        return;
    }

    const sql = `
    
        SELECT
            u.user_id,
            u.username,
            u.full_name,
            u.email,
            u.employee_number,
            u.job_title,
            u.role,
            u.password_hash,
            d.department_id,
            d.department_name
        FROM users u

        LEFT JOIN departments d
            ON u.department_id = d.department_id
        
        WHERE
            u.username = ?
            OR u.email = ?
        LIMIT 1
    
    `;

    db.query(

        sql, [username, username],
        function(error, results) {

            if (error) {
                console.error("Failed to find user:", error);
                res.status(500).json({
                    error: "Login Failed."
                });

                return;
            }

            if (results.length === 0) {
                res.status(401).json({
                    error: "Invalid username or password."
                });

                return;
            }

            const user = results[0];

            bcrypt.compare(

                password, user.password_hash,
                function(error, passwordMatch) {

                    if (error) {
                        console.error("Password comparison failed:", error);

                        res.status(500).json({
                            error: "Login Failed."
                        });

                        return;
                    }

                    if (!passwordMatch) {
                        res.status(401).json({
                            error: "Invalid username or password."
                        });

                        return;
                    }

                    req.session.userId = user.user_id;

                    res.json({

                        message: "Login successful.",
                        user: {
                            userId: user.user_id,
                            username: user.username,
                            fullName: user.full_name,
                            email: user.email,
                            employeeNumber: user.employee_number,
                            jobTitle: user.job_title,
                            role: user.role,
                            departmentId: user.department_id,
                            departmentName: user.department_name
                        }

                    });

                }

            );

        }

    );

});

// Checking logged in user (GET)

app.get("/api/me", function(req, res) {

    if (!req.session.userId) {

        res.status(401).json({
            error: "Not authenticated."
        });

        return;

    }

    const sql = `
    
        SELECT
            u.user_id,
            u.username,
            u.full_name,
            u.email,
            u.employee_number,
            u.job_title,
            u.role,
            d.department_id,
            d.department_name
        FROM users u

        LEFT JOIN departments d
            ON u.department_id = d.department_id

        WHERE u.user_id = ?
    
    `;

    db.query(sql, [req.session.userId], function(error, results) {

        if (error) {

            console.error("Failed to retrieve correct user:", error);
            res.status(500).json({
                error: "Failed to retrieve current user."
            });

            return;

        }

        if (results.length === 0) {
            res.status(404).json({
                error: "User not found."
            });

            return;
        }

        const user = results[0];

        res.json({

            userId: user.user_id,
            username: user.username,
            fullName: user.full_name,
            email: user.email,
            employeeNumber: user.employee_number,
            jobTitle: user.job_title,
            role: user.role,
            departmentId: user.department_id,
            departmentName: user.department_name

        });

    });

});

// Logout API (POST)

app.post("/api/logout", function(req, res) {

    req.session.destroy(function(error) {

        if(error) {

            console.error("Logout failed:", error);
            res.status(500).json({
                error: "Logout failed."
            });

            return;

        }

        res.json({
            message: "Logout successful."
        });

    });

});
















// Start Server

app.listen(PORT, function () {
    console.log(`NexusDesk backend running at http://localhost:${PORT}`);
});