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
    EMP100: process.env.SEED_PASSWORD_EMP100,
    EMP101: process.env.SEED_PASSWORD_EMP101,
    EMP102: process.env.SEED_PASSWORD_EMP102,
    EMP103: process.env.SEED_PASSWORD_EMP103,
    EMP104: process.env.SEED_PASSWORD_EMP104,
    EMP105: process.env.SEED_PASSWORD_EMP105,
    EMP106: process.env.SEED_PASSWORD_EMP106,
    EMP107: process.env.SEED_PASSWORD_EMP107,
    EMP108: process.env.SEED_PASSWORD_EMP108,
    EMP109: process.env.SEED_PASSWORD_EMP109
};

db.connect(async function(error) {

    if (error) {
        console.error(
            "MySQL connection failed:",
            error
        );

        return;
    }

    console.log("Connected to MySQL.");

    try {

        const hashes = {};

        for (const employeeNumber in passwords) {

            hashes[employeeNumber] =
                await bcrypt.hash(
                    passwords[employeeNumber],
                    10
                );

        }


        const sql = `
            UPDATE users
            SET password_hash = CASE employee_number

                WHEN 'EMP100' THEN ?
                WHEN 'EMP101' THEN ?
                WHEN 'EMP102' THEN ?
                WHEN 'EMP103' THEN ?
                WHEN 'EMP104' THEN ?
                WHEN 'EMP105' THEN ?
                WHEN 'EMP106' THEN ?
                WHEN 'EMP107' THEN ?
                WHEN 'EMP108' THEN ?
                WHEN 'EMP109' THEN ?

            END

            WHERE employee_number IN (
                'EMP100',
                'EMP101',
                'EMP102',
                'EMP103',
                'EMP104',
                'EMP105',
                'EMP106',
                'EMP107',
                'EMP108',
                'EMP109'
            )
        `;


        db.query(
            sql,
            [
                hashes.EMP100,
                hashes.EMP101,
                hashes.EMP102,
                hashes.EMP103,
                hashes.EMP104,
                hashes.EMP105,
                hashes.EMP106,
                hashes.EMP107,
                hashes.EMP108,
                hashes.EMP109
            ],
            function(error, result) {

                if (error) {

                    console.error(
                        "Failed to update passwords:",
                        error
                    );

                    db.end();
                    return;
                }

                console.log(
                    `${result.affectedRows} users updated.`
                );

                db.end();

            }
        );

    } catch (error) {

        console.error(
            "Failed to hash passwords:",
            error
        );

        db.end();

    }

});