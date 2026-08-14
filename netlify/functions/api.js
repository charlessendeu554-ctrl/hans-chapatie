const serverless = require("serverless-http");
const express = require("express");

const app = express();

app.use(express.json());

/*
 * HANS CHAPATIE PRODUCT CATALOG
 *
 * Prices are kept here centrally so they can be changed later.
 */
let products = [
    {
        id: 1,
        name: "Plain Chapati",
        description: "Fresh plain chapati",
        price: 500,
        image: "",
        available: true
    },
    {
        id: 2,
        name: "Beans",
        description: "Freshly cooked beans",
        price: 500,
        image: "",
        available: true
    },
    {
        id: 3,
        name: "Egg Chapati",
        description: "Chapati prepared with egg",
        price: 1000,
        image: "",
        available: true
    },
    {
        id: 4,
        name: "Special Chapati",
        description: "Special freshly prepared chapati",
        price: 800,
        image: "",
        available: true
    }
];

/* =========================
   HEALTH
========================= */

app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        service: "Hans Chapatie API",
        status: "online"
    });
});

/* =========================
   PRODUCTS
========================= */

app.get("/api/products", (req, res) => {
    res.json({
        success: true,
        products: products.filter(p => p.available)
    });
});

/* =========================
   SINGLE PRODUCT
========================= */

app.get("/api/products/:id", (req, res) => {
    const product = products.find(
        p => String(p.id) === String(req.params.id)
    );

    if (!product) {
        return res.status(404).json({
            success: false,
            error: "Product not found"
        });
    }

    res.json({
        success: true,
        product
    });
});

/* =========================
   PLACE ORDER
========================= */

app.post("/api/orders", (req, res) => {
    try {
        const {
            productId,
            quantity = 1,
            customerName,
            phone,
            address,
            notes
        } = req.body;

        const product = products.find(
            p => String(p.id) === String(productId)
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                error: "Product not found"
            });
        }

        const qty = Number(quantity);

        if (!Number.isInteger(qty) || qty < 1) {
            return res.status(400).json({
                success: false,
                error: "Invalid quantity"
            });
        }

        const total = product.price * qty;

        const order = {
            id: Date.now(),
            productId: product.id,
            productName: product.name,
            price: product.price,
            quantity: qty,
            total,
            customerName: customerName || "",
            phone: phone || "",
            address: address || "",
            notes: notes || "",
            status: "pending",
            createdAt: new Date().toISOString()
        };

        console.log("NEW ORDER:", order);

        res.status(201).json({
            success: true,
            message: "Order placed successfully",
            order
        });

    } catch (error) {
        console.error("ORDER ERROR:", error);

        res.status(500).json({
            success: false,
            error: "Unable to place order"
        });
    }
});

/* =========================
   ADMIN: UPDATE PRICE
========================= */

app.put("/api/products/:id", (req, res) => {
    const product = products.find(
        p => String(p.id) === String(req.params.id)
    );

    if (!product) {
        return res.status(404).json({
            success: false,
            error: "Product not found"
        });
    }

    if (req.body.name !== undefined) {
        product.name = String(req.body.name);
    }

    if (req.body.description !== undefined) {
        product.description = String(req.body.description);
    }

    if (req.body.price !== undefined) {
        const price = Number(req.body.price);

        if (!Number.isFinite(price) || price < 0) {
            return res.status(400).json({
                success: false,
                error: "Invalid price"
            });
        }

        product.price = price;
    }

    if (req.body.available !== undefined) {
        product.available = Boolean(req.body.available);
    }

    res.json({
        success: true,
        product
    });
});

module.exports.handler = serverless(app);
