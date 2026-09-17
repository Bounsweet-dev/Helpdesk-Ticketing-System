require("dotenv").config();

const mysql = require("mysql2");
const bcrypt = require("bcryptjs");

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

const passwords = {
    "EMP001": "tech123",
    "EMP002": "user123",
    "EMP006" : "employee123"
};

db.connect(function(error) {

    if (error) {
        console.error("MySQL connection failed:", error);
        return;
    }

    console.log("Connected to MySQL.");

    bcrypt.hash(passwords.EMP001, 10, function(error, technicianHash) {

        if (error) {
            console.error("Failed to hash technician password:", error);
            return;
        }

        bcrypt.hash(passwords.EMP002, 10, function(error, userHash) {

            if (error) {
                console.error("Failed to hash user password:", error);
                return;
            }

            bcrypt.hash(passwords.EMP006, 10, function(error, employeeHash){

                if (error) {
                    console.error("Failed to hash employee password:", error);
                    return;
                }

                const sql = `
                    UPDATE users
                    SET password_hash = CASE employee_number
                        WHEN 'EMP001' THEN ?
                        WHEN 'EMP002' THEN ?
                        WHEN 'EMP006' THEN ?
                    END
                    WHERE employee_number IN ('EMP001', 'EMP002', 'EMP006')
                `;

                db.query(
                    sql,
                    [technicianHash, userHash, employeeHash],
                    function(error, result) {

                        if (error) {
                            console.error("Failed to update passwords:", error);
                            return;
                        }

                        console.log(`${result.affectedRows} users updated.`);
                        db.end();
                    }
                );

            });

        });
    });
});