const { Pool } = require("pg");

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error("ERROR: DATABASE_URL is missing from .env");
    process.exit(1);
}

const pool = new Pool({
    connectionString,
});

pool.on("error", (error) => {
    console.error("Unexpected PostgreSQL error:", error.message);
});

module.exports = pool;
