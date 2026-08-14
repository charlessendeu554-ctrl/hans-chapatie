require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const pool = require("./config/database");

const productsRouter = require("./routes/products");
const ordersRouter = require("./routes/orders");
const adminRouter = require("./routes/admin");
const authRouter = require("./routes/auth");

const requireAdmin = require("./middleware/auth");

const app = express();

const PORT = Number(process.env.PORT) || 10000;


// =====================================================
// MIDDLEWARE
// =====================================================

app.use(
    cors({
        origin: "*"
    })
);

app.use(
    express.json({
        limit: "1mb"
    })
);

app.use(
    express.urlencoded({
        extended: true
    })
);


// =====================================================
// REQUEST LOGGER
// =====================================================

app.use((req, res, next) => {

    console.log(
        `${new Date().toISOString()} ${req.method} ${req.originalUrl}`
    );

    next();

});


// =====================================================
// FRONTEND PATHS
// =====================================================

const frontendPath =
    path.join(__dirname, "../frontend");

const adminFrontendPath =
    path.join(__dirname, "../frontend/admin");


// =====================================================
// SERVE CUSTOMER FRONTEND
// =====================================================

app.use(
    express.static(frontendPath)
);


// =====================================================
// SERVE ADMIN FRONTEND
// =====================================================

app.use(
    "/admin",
    express.static(adminFrontendPath)
);


// =====================================================
// API HEALTH CHECK
// =====================================================

app.get(
    "/api/health",
    (req, res) => {

        res.json({
            success: true,
            business: "Hans Chapatie Centre",
            message: "Hans Chapatie API is running",
            status: "OK"
        });

    }
);


// =====================================================
// DATABASE TEST
// =====================================================

app.get(
    "/api/test-db",
    async (req, res) => {

        try {

            const result = await pool.query(
                "SELECT NOW() AS time"
            );

            res.json({

                success: true,

                message:
                    "Database connection successful",

                time:
                    result.rows[0].time

            });

        } catch (error) {

            console.error(
                "DATABASE ERROR:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Database connection failed",

                error:
                    error.message

            });

        }

    }
);


// =====================================================
// PUBLIC AUTH ROUTES
// =====================================================

app.use(
    "/api/auth",
    authRouter
);


// =====================================================
// PUBLIC CUSTOMER ROUTES
// =====================================================

app.use(
    "/api/products",
    productsRouter
);

app.use(
    "/api/orders",
    ordersRouter
);


// =====================================================
// PROTECTED ADMIN ROUTES
// =====================================================

app.use(
    "/api/admin",
    requireAdmin,
    adminRouter
);


// =====================================================
// CUSTOMER WEBSITE
// =====================================================

app.get(
    "/",
    (req, res) => {

        res.sendFile(
            path.join(
                frontendPath,
                "index.html"
            )
        );

    }
);


// =====================================================
// ADMIN LOGIN PAGE
// =====================================================

app.get(
    "/admin",
    (req, res) => {

        res.sendFile(
            path.join(
                adminFrontendPath,
                "index.html"
            )
        );

    }
);


// =====================================================
// ADMIN DASHBOARD PAGE
// =====================================================

app.get(
    "/admin/dashboard",
    (req, res) => {

        res.sendFile(
            path.join(
                adminFrontendPath,
                "dashboard.html"
            )
        );

    }
);


// =====================================================
// 404 HANDLER
// =====================================================

app.use(
    (req, res) => {

        // API 404
        if (
            req.originalUrl.startsWith("/api/")
        ) {

            return res.status(404).json({

                success: false,

                message:
                    "API route not found",

                method:
                    req.method,

                path:
                    req.originalUrl

            });

        }


        // Website 404
        res.status(404).send(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Page Not Found</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        text-align: center;
                        padding: 60px;
                        background: #f5f5f4;
                        color: #451a03;
                    }

                    h1 {
                        font-size: 48px;
                    }

                    a {
                        color: #b45309;
                        text-decoration: none;
                        font-weight: bold;
                    }
                </style>
            </head>

            <body>

                <h1>404</h1>

                <h2>
                    Page Not Found
                </h2>

                <p>
                    Hans Chapatie Centre
                </p>

                <a href="/">
                    Return Home
                </a>

            </body>
            </html>
        `);

    }
);


// =====================================================
// ERROR HANDLER
// =====================================================

app.use(
    (
        error,
        req,
        res,
        next
    ) => {

        console.error(
            "SERVER ERROR:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Internal server error",

            error:
                error.message

        });

    }
);


// =====================================================
// START SERVER
// =====================================================

async function startServer() {

    try {

        await pool.query(
            "SELECT 1"
        );

        console.log(
            "PostgreSQL connection successful"
        );


        app.listen(
            PORT,
            "0.0.0.0",
            () => {

                console.log(
                    `Hans Chapatie server running on port ${PORT}`
                );

                console.log(
                    `Customer website: http://127.0.0.1:${PORT}`
                );

                console.log(
                    `Admin login: http://127.0.0.1:${PORT}/admin`
                );

                console.log(
                    `Admin dashboard: http://127.0.0.1:${PORT}/admin/dashboard`
                );

                console.log(
                    `API: http://127.0.0.1:${PORT}/api`
                );

            }
        );

    } catch (error) {

        console.error(
            "Unable to connect to PostgreSQL:"
        );

        console.error(
            error.message
        );

        console.error("PostgreSQL unavailable; API process will continue.");

    }

}



// Start HTTP server only when running directly with Node.
if (require.main === module) {
    startServer();
}

module.exports = app;
