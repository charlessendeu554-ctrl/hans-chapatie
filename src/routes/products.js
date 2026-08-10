const express = require("express");
const pool = require("../config/database");

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                id,
                name,
                description,
                price,
                image_url,
                available
            FROM products
            WHERE available = TRUE
            ORDER BY id ASC
        `);

        res.json({
            success: true,
            products: result.rows
        });

    } catch (error) {
        console.error("PRODUCTS ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Failed to get products",
            error: error.message
        });
    }
});

module.exports = router;

