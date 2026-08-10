require("dotenv").config();

const express = require("express");
const cors = require("cors");

const pool = require("./config/database");

const productsRouter = require("./routes/products");
const ordersRouter = require("./routes/orders");
const adminRouter = require("./routes/admin");
const authRouter = require("./routes/auth");

const requireAdmin = require("./middleware/auth");

const app = express();

const PORT = Number(process.env.PORT) || 5000;


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
// HEALTH CHECK
// =====================================================

app.get("/", (req, res) => {

    res.json({
        business: "Hans Chapatie Centre",
        message: "Hans Chapatie system is running",
        status: "OK"
    });

});


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
                message: "Database connection successful",
                time: result.rows[0].time
            });

        } catch (error) {

            console.error(
                "DATABASE ERROR:",
                error
            );

            res.status(500).json({
                success: false,
                message: "Database connection failed",
                error: error.message
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
// 404 HANDLER
// =====================================================

app.use((req, res) => {

    res.status(404).json({

        success: false,

        message: "Route not found",

        method: req.method,

        path: req.originalUrl

    });

});


// =====================================================
// ERROR HANDLER
// =====================================================

app.use(
    (error, req, res, next) => {

        console.error(
            "SERVER ERROR:",
            error
        );

        res.status(500).json({

            success: false,

            message: "Internal server error",

            error: error.message

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
            "127.0.0.1",
            () => {

                console.log(
                    `Hans Chapatie server running on http://127.0.0.1:${PORT}`
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

        process.exit(1);

    }

}


startServer();
