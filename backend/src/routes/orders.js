const express = require("express");
const pool = require("../config/database");

const router = express.Router();


// ==========================================
// CREATE ORDER
// POST /api/orders
// ==========================================

router.post("/", async (req, res) => {

    const client = await pool.connect();

    try {

        const {
            customer_name,
            phone,
            address,
            items,
            notes
        } = req.body || {};


        // -----------------------------
        // VALIDATION
        // -----------------------------

        if (!customer_name) {

            return res.status(400).json({
                success: false,
                message: "Customer name is required"
            });

        }


        if (!phone) {

            return res.status(400).json({
                success: false,
                message: "Phone number is required"
            });

        }


        if (!Array.isArray(items) || items.length === 0) {

            return res.status(400).json({
                success: false,
                message: "At least one product is required"
            });

        }


        // -----------------------------
        // START TRANSACTION
        // -----------------------------

        await client.query("BEGIN");


        // -----------------------------
        // CUSTOMER
        // -----------------------------

        const customerResult = await client.query(
            `
            INSERT INTO customers
                (name, phone, address)

            VALUES
                ($1, $2, $3)

            RETURNING id
            `,
            [
                customer_name.trim(),
                phone.trim(),
                address || null
            ]
        );


        const customerId =
            customerResult.rows[0].id;


        // -----------------------------
        // CREATE ORDER NUMBER
        // -----------------------------

        const orderNumber =
            "HC-" +
            Date.now();


        // -----------------------------
        // CREATE ORDER
        // -----------------------------

        const orderResult = await client.query(
            `
            INSERT INTO orders
                (
                    order_number,
                    customer_id,
                    total_amount,
                    status,
                    payment_status,
                    notes
                )

            VALUES
                (
                    $1,
                    $2,
                    0,
                    'NEW',
                    'PENDING',
                    $3
                )

            RETURNING
                id,
                order_number,
                total_amount,
                status,
                payment_status
            `,
            [
                orderNumber,
                customerId,
                notes || null
            ]
        );


        const order =
            orderResult.rows[0];


        let total = 0;


        // -----------------------------
        // PRODUCTS
        // -----------------------------

        for (const item of items) {

            const productId =
                Number(item.product_id);

            const quantity =
                Number(item.quantity);


            if (
                !Number.isInteger(productId) ||
                !Number.isInteger(quantity) ||
                quantity <= 0
            ) {

                throw new Error(
                    "Invalid product_id or quantity"
                );

            }


            const productResult =
                await client.query(
                    `
                    SELECT
                        id,
                        name,
                        price,
                        available

                    FROM products

                    WHERE id = $1

                    FOR UPDATE
                    `,
                    [productId]
                );


            if (
                productResult.rows.length === 0
            ) {

                throw new Error(
                    `Product ${productId} not found`
                );

            }


            const product =
                productResult.rows[0];


            if (!product.available) {

                throw new Error(
                    `${product.name} is not available`
                );

            }


            const unitPrice =
                Number(product.price);


            const subtotal =
                unitPrice * quantity;


            total += subtotal;


            await client.query(
                `
                INSERT INTO order_items
                    (
                        order_id,
                        product_id,
                        quantity,
                        unit_price,
                        subtotal
                    )

                VALUES
                    ($1, $2, $3, $4, $5)
                `,
                [
                    order.id,
                    productId,
                    quantity,
                    unitPrice,
                    subtotal
                ]
            );

        }


        // -----------------------------
        // UPDATE TOTAL
        // -----------------------------

        const updatedOrder =
            await client.query(
                `
                UPDATE orders

                SET
                    total_amount = $1,
                    updated_at = CURRENT_TIMESTAMP

                WHERE id = $2

                RETURNING
                    id,
                    order_number,
                    total_amount,
                    status,
                    payment_status
                `,
                [
                    total,
                    order.id
                ]
            );


        await client.query("COMMIT");


        res.status(201).json({

            success: true,

            message:
                "Order created successfully",

            order:
                updatedOrder.rows[0]

        });


    } catch (error) {

        await client.query("ROLLBACK");

        console.error(
            "CREATE ORDER ERROR:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Failed to create order",

            error:
                error.message

        });

    } finally {

        client.release();

    }

});


// ==========================================
// GET ORDER
// GET /api/orders/:id
// ==========================================

router.get("/:id", async (req, res) => {

    try {

        const id =
            Number(req.params.id);


        if (!Number.isInteger(id)) {

            return res.status(400).json({
                success: false,
                message: "Invalid order ID"
            });

        }


        const orderResult =
            await pool.query(
                `
                SELECT
                    o.id,
                    o.order_number,
                    o.total_amount,
                    o.status,
                    o.payment_status,
                    o.notes,
                    o.created_at,

                    c.name AS customer_name,
                    c.phone AS customer_phone,
                    c.address AS customer_address

                FROM orders o

                LEFT JOIN customers c
                    ON c.id = o.customer_id

                WHERE o.id = $1
                `,
                [id]
            );


        if (
            orderResult.rows.length === 0
        ) {

            return res.status(404).json({
                success: false,
                message: "Order not found"
            });

        }


        const itemsResult =
            await pool.query(
                `
                SELECT
                    oi.id,
                    oi.product_id,
                    oi.quantity,
                    oi.unit_price,
                    oi.subtotal,
                    p.name AS product_name

                FROM order_items oi

                JOIN products p
                    ON p.id = oi.product_id

                WHERE oi.order_id = $1

                ORDER BY oi.id ASC
                `,
                [id]
            );


        res.json({

            success: true,

            order: {
                ...orderResult.rows[0],
                items: itemsResult.rows
            }

        });


    } catch (error) {

        console.error(
            "GET ORDER ERROR:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Failed to get order",

            error:
                error.message

        });

    }

});


module.exports = router;
