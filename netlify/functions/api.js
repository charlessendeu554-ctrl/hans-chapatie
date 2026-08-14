const serverless = require("serverless-http");
const express = require("express");

const app = express();

app.use(express.json());

/*
 * HANS CHAPATIE PRODUCTS
 * These are available immediately without Render/PostgreSQL.
 */
const products = [
    {
        id: 1,
        name: "Plain Chapati",
        description: "Freshly prepared soft chapati.",
        price: 1000,
        image: "/images/plain-chapati.jpg",
        available: true
    },
    {
        id: 2,
        name: "Chapati & Beans",
        description: "Fresh chapati served with delicious beans.",
        price: 2500,
        image: "/images/chapati-beans.jpg",
        available: true
    },
    {
        id: 3,
        name: "Chapati & Beef",
        description: "Fresh chapati served with beef.",
        price: 5000,
        image: "/images/chapati-beef.jpg",
        available: true
    },
    {
        id: 4,
        name: "Chapati & Chicken",
        description: "Fresh chapati served with chicken.",
        price: 6000,
        image: "/images/chapati-chicken.jpg",
        available: true
    },
    {
        id: 5,
        name: "Beans",
        description: "Freshly cooked beans.",
        price: 1500,
        image: "/images/beans.jpg",
        available: true
    }
];

/* Health */
app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        service: "Hans Chapatie API",
        status: "online"
    });
});

/* Products */
app.get("/api/products", (req, res) => {
    res.status(200).json({
        success: true,
        products
    });
});

/* Single product */
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

/* Orders */
app.post("/api/orders", (req, res) => {
    const order = req.body || {};

    res.status(201).json({
        success: true,
        message: "Order received",
        order
    });
});

module.exports.handler = serverless(app);
