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
const { error } = require("console");

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


// Protecting API endpoints by role

function requireApiRole (allowedRoles) {

    return function(req, res, next) {

        if (!req.session.userId) {
            res.status(401).json({
                error: "Not authenticated"
            });

            return;
        }

        if (!allowedRoles.includes(req.session.role)) {
            res.status(403).json({
                error: "You do not have permission to access this resource."
            });

            return;
        }

        next();

    }

}

// Detemine where each role should go

function getRoleHome(role) {

    if (role === "employee") {
        return "/user-help-request.html";
    }
    
    if (role === "technician" || role === "admin") {
        return "/dashboard.html";
    }

    return "index.html";

}

// Protecting HTML pages by role

function requirePageRole(allowedRoles) {

    return function(req, res, next) {

        if (!req.session.userId) {
            res.redirect("/index.html");
            return;
        }

        if (!req.session.role) {
            res.redirect("/index.html");
            return;
        }

        if (!allowedRoles.includes(req.session.role)) {
            res.redirect(getRoleHome(req.session.role));
            return;
        }

        next();
    };
}

// Page access map

const pageAccess = {

    "/dashboard.html": ["technician","admin"],
    "/create-ticket.html": ["technician","admin"],
    "/ticket-list.html": ["technician","admin"],
    "/ticket-main-page.html": ["technician","admin"],
    "/user-help-request.html": ["employee"],
    "/knowledge-base.html": ["employee","technician","admin"],
    "/knowledge-base-manage.html": ["admin"]

};

// Apply page role protection

app.use(function(req, res, next) {

    const allowedRoles = pageAccess[req.path];

    if (!allowedRoles) {
        next();
        return;
    }

    requirePageRole(allowedRoles)(req, res, next);

});

app.get(
    ["/", "/index.html"],
    function(req, res) {

        if (!req.session.userId) {

            res.sendFile(path.join(__dirname,"..", "index.html"));
            return;

        }

        res.redirect(getRoleHome(req.session.role));

    }
);

// Serve frontend files

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

});

// Test route

app.get("/", function (req, res) {
    res.send("NexusDesk backend is running.");
});

// =====================================
//    Ticket API - GET, POST, and PUT
// =====================================

// Getting all tickets

app.get("/api/tickets", requireApiRole(["technician", "admin"]), function (req, res) {

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

app.get("/api/tickets/:id", requireApiRole(["technician", "admin"]), function(req, res) {

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


    const {
        requesterId,
        category,
        priority,
        subject,
        description,
        status
    } = req.body;

    // Allowed Values

    const allowedPriorities = [
        "low",
        "medium",
        "high",
    ];

    const allowedStatuses = [
        "open",
        "in-progress",
        "on-hold",
        "pending",
        "resolved"
    ];

    // Basic validation
    if (!subject || !description) {
        res.status(400).json({
            error: "Subject and description are required."
        });
        return;
    }

    if (!allowedPriorities.includes(priority)) {

        res.status(400).json({
            error: "Invalid ticket priority."
        });

        return;

    }

    const currentUserId = req.session.userId;
    const currentUserRole = req.session.role;
    let finalRequesterId = requesterId;
    let finalStatus = status || "open";
    let assignedToUserId = null;
    let assignedDepartmentId = null;

    // Employee creating a help request
    if (currentUserRole === "employee") {

        finalRequesterId = currentUserId;
        finalStatus = "open";

    }

    // Technician or admin creating a ticket
    else if (
        currentUserRole === "technician" ||
        currentUserRole === "admin"
    ) {

        if (!finalRequesterId) {
            res.status(400).json({
                error: "Requester is required."
            });
            return;
        }
    
    }

    else {
        res.status(403).json({
            error: "You do not have permission to create tickets."});
            return;
    }

    // Validate final status

    if (!allowedStatuses.includes(finalStatus)) {
        res.status(400).json({
            error: "Invalid ticket status."
        });
        return;
    }

    // Validate requester exists


    const requesterSql = `
    
        SELECT user_id
        FROM users
        WHERE user_id = ?
        LIMIT 1
    
    `;

    db.query(
        requesterSql, [finalRequesterId],
        function(error, results) {

            if (error) {

                console.error("Failed to validate requester:", error);
                res.status(500).json({
                    error: "Failed to validate requester."
                });

                return;

            }

            if (results.length === 0) {

                res.status(400).json({
                    error: "Requester does not exist."
                });

                return;

            }

            if (currentUserRole == "technician") {
                const currentTechnicianSql = `
                
                    SELECT
                        user_id,
                        department_id
                    FROM users
                    WHERE user_id = ?
                        AND role = 'technician'
                    LIMIT 1
                
                `;

                db.query(

                    currentTechnicianSql, [currentUserId],
                    function(error, results) {

                        if (error) {

                            console.error("Failed to retrieve current technician:", error);
                            res.status(500).json({
                                error: "Failed to retrieve current technician."
                            });

                            return;

                        }

                        if (
                            results.length === 0 ||
                            results[0].department_id === null
                        ) {

                            res.status(400).json({
                                error: "Your technician account is not assigned to a department."
                            });
                            return;

                        }

                        assignedToUserId = results[0].user_id;
                        assignedDepartmentId = results[0].department_id;
                        createTicket();

                    }

                );
            } else {
                createTicket();
            }
            
            function createTicket() {

                // Generate ticket number

                const getNextTicketIdSql = `
                    SELECT COALESCE(MAX(ticket_id), 0) + 1
                    AS nextTicketId
                    FROM tickets
                `;

                db.query(
                    getNextTicketIdSql,
                    function(error, results) {

                        if (error) {

                            console.error(
                                "Failed to generate ticket number:",
                                error
                            );

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
                            insertTicketSql,
                            [
                                ticketNumber,
                                finalRequesterId,
                                assignedToUserId,
                                assignedDepartmentId,
                                category,
                                priority,
                                subject,
                                description,
                                finalStatus
                            ],
                            function(error, result) {

                                if (error) {

                                    console.error(
                                        "Failed to create ticket:",
                                        error
                                    );

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

                    }
                );

            }

        }
    );

});

// Editing a ticket through front end (PUT)

app.put("/api/tickets/:id", requireApiRole(["technician", "admin"]), function(req, res) {

    const ticketId = req.params.id;

    let {

        assignedToUserId,
        assignedDepartmentId,
        category,
        priority,
        subject,
        description,
        status

    } = req.body;

    // Convert empty values to null

    assignedToUserId = assignedToUserId || null;
    assignedDepartmentId = assignedDepartmentId || null;

    // Allowed priorities

    const allowedPriorities = [
        "low",
        "medium",
        "high",
        "critical"
    ];

    if (!allowedPriorities.includes(priority)) {

        res.status(400).json({
            error: "Invalid ticket priority."
        });

        return;
    }


    // Allowed statuses

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


    // Validate required fields

    if (!subject || !description) {

        res.status(400).json({
            error:
                "Subject and description are required."
        });

        return;
    }

    // Validate technician assignment only when a tech is actually assigned

    if (assignedDepartmentId !== null &&
        assignedToUserId === null
    ) {
        res.status(400).json({
            error: "Please assign a technician."
        });

        return;

    }

    if (assignedToUserId !== null &&
        assignedDepartmentId === null
    ) {
        res.status(400).json({
            error: "Please assign a department"
        });
    }

    if (assignedToUserId !== null) {

        const assignmentSql = `
        
            SELECT
                u.user_id,
                u.role,
                u.department_id
            FROM users u
            WHERE u.user_id = ?
            LIMIT 1

        `;

        db.query(
            assignmentSql, [assignedToUserId],
            function(error, results) {

                if(error) {

                    console.error("Failed to validate technician assignment:", error);
                    res.status(500).json({
                        error: "Failed to validate technician assignment."
                    });

                    return;

                }

                if (results.length === 0) {

                    res.status(400).json({
                        error: "Assigned user is not a technician."
                    });

                    return;
                    
                }

                const technician = results[0];

                if (technician.role !== "technician") {
                    res.status(400).json({
                        error: "Assigned user is not a technician."
                    });

                    return;
                }

                if (Number(technician.department_id) !== Number(assignedDepartmentId)) {

                    res.status(400).json({
                        error: "Assigned technician does not belong to the selected department."
                    });

                    return;

                }

                updateTicket();

            }
        );

    } else {

        // No department and technician
        updateTicket();

    }

    // Update ticket

    function updateTicket() {

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
                    WHEN ? = 'resolved' 
                        THEN CURRENT_TIMESTAMP
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

    }

});

// ==================================
//    Worknotes API - GET and POST
// ==================================

// Reading worknotes (GET)

app.get("/api/tickets/:id/worknotes", requireApiRole(["technician", "admin"]), function(req, res) {

    const ticketId = req.params.id;

    const ticketSql = `
        SELECT ticket_id
        FROM tickets
        WHERE ticket_id = ?
        LIMIT 1
    `;

    db.query(
        ticketSql,
        [ticketId],
        function(error, ticketResults) {

            if (error) {

                console.error(
                    "Failed to validate ticket:",
                    error
                );

                res.status(500).json({
                    error: "Failed to validate ticket."
                });

                return;
            }

            if (ticketResults.length === 0) {

                res.status(404).json({
                    error: "Ticket not found."
                });

                return;
            }

            const worknoteSql = `
                SELECT
                    w.worknote_id,
                    u.full_name,
                    w.note,
                    w.created_at
                FROM worknotes w
                JOIN users u
                    ON w.user_id = u.user_id
                WHERE w.ticket_id = ?
                ORDER BY w.created_at DESC
            `;

            db.query(
                worknoteSql,
                [ticketId],
                function(error, results) {

                    if (error) {

                        console.error(
                            "Failed to retrieve worknotes:",
                            error
                        );

                        res.status(500).json({
                            error:
                                "Failed to retrieve worknotes."
                        });

                        return;
                    }

                    res.json(results);

                }
            );

        }
    );

});

//Writing worknotes (POST)

app.post("/api/tickets/:id/worknotes", requireApiRole(["technician", "admin"]), function(req, res) {

    const ticketId = req.params.id;
    const userId = req.session.userId;
    const { note } = req.body;

    // Validate worknote

    if (!note || note.trim() === "") {
        res.status(400).json({
            error: "Worknote cannot be empty."
        });
        return;
    }

    // Check wether ticket exists

    const  ticketSql = `
    
        SELECT
            ticket_id
        FROM tickets
        WHERE ticket_id = ?
        LIMIT 1
    
    `;

    db.query(
        ticketSql, [ticketId],
        function(error, results) {

            if (error) {

                console.error("Failed to validate ticket:", error);
                res.status(500).json({
                    error: "Failed to validate ticket."
                });

                return;

            }

            if (results.length === 0) {

                res.status(404).json({
                    error: "Ticket not found."
                });

                return;

            }

            // Ticket exists -> create worknote

            const worknoteSql = `
            
                INSERT INTO worknotes (
                    ticket_id,
                    user_id,
                    note
                )
                VALUES (?, ?, ?)
            
            `;

            db.query(
                worknoteSql, [ticketId, userId, note.trim()],
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

        }
    );
});

// =====================================
//    Create Ticket Dynamic Searching
// =====================================

// Departments API (GET)

app.get("/api/departments", requireApiRole(["technician", "admin"]), function (req, res) {

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

app.get("/api/users", requireApiRole(["technician", "admin"]), function (req, res) {

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

app.get("/api/users/search", requireApiRole(["technician", "admin"]), function (req, res) {

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

app.get("/api/technicians", requireApiRole(["technician", "admin"]), function (req, res) {

    const departmentId = req.query.departmentId;

    let sql = `
        SELECT
            u.user_id,
            u.username, 
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
                    req.session.role = user.role;

                    req.session.save(function(error){

                        if (error) {
                            
                            console.error("Failed to save session:", error);
                            res.status(500).json({
                                error: "Login failed."
                            });

                        return;

                        }

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

                    });

                }

            );

        }

    );

});

// Checking logged in user (GET)

app.get("/api/me", requireApiLogin, function(req, res) {

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

        LIMIT 1
    
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

// ================================================
//    Knowlege Base API - GET, POST, PUT, DELETE
// ================================================

// Update the KB API to understan JSON

function parseKnowledgeBaseContent(content) {
    if (typeof content !== "string") {
        return content;
    }
    
    try {
        return JSON.parse(content);
    } catch (error) {

        return {
            problem: content,
            causes: [],
            steps: [],
            resolution: ""
        };

    }

}

function validateKnowledgeBaseContent(content) {

    if (!content ||
        typeof content !== "object" ||
        Array.isArray(content)
    ) {
        return "Article content must be an object.";
    }

    if (
        typeof content.problem !== "string" ||
        content.problem.trim() === ""
    ) {
        return "Article problem is required.";
    }

    if (!Array.isArray(content.causes)) {
        return "Article causes must be an array.";
    }

    if (content.causes.some(function(cause) {
        return typeof cause !== "string" || cause.trim() === "";
    })) {
        return "Article causes must contain valid text.";
    }

    if (!Array.isArray(content.steps)) {
        return "Article steps must be an array.";
    }

    if (content.steps.some(function(step) {
        return typeof step !== "string" || step.trim() === "";
    })) {
        return "Article steps must contain valid text.";
    }

    if (typeof content.resolution !== "string" || content.resolution.trim() === "") {
        return "Article resolution is required.";
    }

    return null;

}

// Get all articles

app.get("/api/knowledge-base", requireApiLogin, function(req, res)  {

    const query = req.query.query || "";
    const category = req.query.category || "";
    const sql = `
        SELECT
            kb.article_id,
            kb.title,
            kb.category,
            kb.content,
            kb.created_by,
            kb.created_at,
            kb.updated_at,
            u.full_name AS author
        FROM knowledge_base_articles kb

        JOIN users u
            ON kb.created_by = u.user_id

        WHERE
            (
                kb.title LIKE ?
                OR kb.content LIKE ?
            )
            AND (
                ? = ''
                OR kb.category = ?
            )

        ORDER BY kb.updated_at DESC
    `;

    const searchValue = `%${query}%`;

    db.query(
        sql, [searchValue, searchValue, category, category],
        function (error, results) {

            if (error) {
                console.error ("Failed to retrieve knowledge base articles:", error);
            
                res.status(500).json({
                    error: "Failed to retrieve knowledge base articles."
                });

                return;

            }

            const articles = results.map(function(article) {
                return{...article,
                    content: parseKnowledgeBaseContent(article.content)};
            });

            res.json(articles);

        }
    )

});

// Get one article

app.get("/api/knowledge-base/:id", requireApiLogin, function(req, res) {

    const articleId = req.params.id;
    const sql = `
        SELECT
            kb.article_id,
            kb.title,
            kb.category,
            kb.content,
            kb.created_by,
            kb.created_at,
            kb.updated_at,
            u.full_name AS author
        FROM knowledge_base_articles kb

        JOIN users u
            ON kb.created_by = u.user_id

        WHERE kb.article_id = ?

        LIMIT 1
    `;

    db.query(
        sql, [articleId],
        function(error, results) {

            if (error) {

                console.error("Failed to retrieve knowledge base article:", error);

                res.status(500).json({
                    error: "Failed to retrieve knowledge base article."
                });

                return;

            }

            if (results.length === 0) {

                res.status(404).json({
                    error: "Knowledge base article not found."
                });

                return;

            }

            const article = {
                ...results[0],
                content: parseKnowledgeBaseContent(results[0].content)
            };

            res.json(article);

        }
    );

});

// Creating an article

app.post("/api/knowledge-base", requireApiRole(["admin"]), function(req, res) {

    const {
        title,
        category,
        content
    } = req.body;

    if (
        !title ||
        !category ||
        !content
    ) {

        res.status(400).json({
            error: "Title, category, and content are required."
        });
        
        return;
        
    }

    // Validate structured article content

    const contentError = validateKnowledgeBaseContent(content);

    if (contentError) {

        res.status(400).json({
            error: contentError
        });

        return;

    }

    const sql = `
        INSERT INTO knowledge_base_articles (
            title,
            category,
            content,
            created_by
        )
        VALUES (?, ?, ?, ?)
    `;

    db.query(

        sql, [title.trim(), category.trim(), JSON.stringify(content), req.session.userId],
        function(error, result) {

            if (error) {

                console.error("Failed to create knowledge base article:", error);
                res.status(500).json({
                    error: "Failed to create knwoeldge base article."
                });

                return;

            }

            res.status(201).json({
                message: "Knowledge base article created successfully.",
                articleId: result.insertId
            });

        }

    );

});

// Updating an article

app.put("/api/knowledge-base/:id", requireApiRole(["admin"]), function(req, res) {

    const articleId = req.params.id;
    const {
        title,
        category,
        content
    } = req.body;

    if (
        !title ||
        !category ||
        !content
    ) {
        res.status(400).json({
            error: "Title, category, and content are required."
        });

        return;
    }

    const contentError = validateKnowledgeBaseContent(content);

    if (contentError) {

        res.status(400).json({
            error: contentError
        });

        return;

    }

    const sql = `
        UPDATE knowledge_base_articles
        SET
            title = ?,
            category = ?,
            content = ?
        WHERE article_id = ?
    `;

    db.query(
        sql, [title.trim(), category.trim(), JSON.stringify(content), articleId],
        function(error, result) {

            if (error) {

                console.error("Failed to update knowledge base article:", error);
                res.status(500).json({
                    error: "Failed to update knowledge base article."
                });

                return;

            }

            if (result.affectedRows === 0) {
                res.status(404).json({
                    error: "Knowledge base article not found."
                });

                return;
            }

            res.json({
                message: "Knowledge base article updated successfully."
            });

        }
    );

});

// Deleting an article

app.delete("/api/knowledge-base/:id", requireApiRole(["admin"]), function(req, res) {

    const articleId = req.params.id;
    const sql = `
        DELETE FROM knowledge_base_articles
        WHERE article_id = ?
    `;

    db.query(

        sql, [articleId], function(error, result) {

            if (error) {

                console.error("Failed to delete knowledge base article:", error);
                res.status(500).json({error: "Failed to delete knowledge base article."});
                
                return;

            }

            if (result.affectedRows === 0) {
                res.status(404).json({
                    error: "Knowledge base article not found."
                });

                return;
            }

            res.json({
                message: "Knowledge base article deleted successfully."
            });



        }

    );

});

// Start Server

app.listen(PORT, function () {
    console.log(`NexusDesk backend running at http://localhost:${PORT}`);
});