const express = require("express");
const router = express.Router();
const pool = require("../config/database");

// =====================================================
// GET ALL ORDERS
// GET /api/admin/orders
// =====================================================
router.get("/orders", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        o.id,
        o.order_number,
        o.customer_name,
        o.phone AS customer_phone,
        o.address AS customer_address,
        o.notes,
        o.total_amount,
        o.status,
        o.payment_status,
        o.created_at
      FROM orders o
      ORDER BY o.created_at DESC
    `);

    return res.json({
      success: true,
      orders: result.rows
    });

  } catch (error) {
    console.error("GET ADMIN ORDERS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get orders",
      error: error.message
    });
  }
});

// =====================================================
// GET SINGLE ORDER
// GET /api/admin/orders/:id
// =====================================================
router.get("/orders/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const orderResult = await pool.query(
      `
      SELECT
        o.id,
        o.order_number,
        o.customer_name,
        o.phone AS customer_phone,
        o.address AS customer_address,
        o.notes,
        o.total_amount,
        o.status,
        o.payment_status,
        o.created_at
      FROM orders o
      WHERE o.id = $1
      `,
      [id]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    let items = [];

    try {
      const itemsResult = await pool.query(
        `
        SELECT
          oi.id,
          oi.product_id,
          oi.quantity,
          oi.unit_price,
          oi.subtotal,
          p.name AS product_name
        FROM order_items oi
        LEFT JOIN products p
          ON p.id = oi.product_id
        WHERE oi.order_id = $1
        ORDER BY oi.id ASC
        `,
        [id]
      );

      items = itemsResult.rows;
    } catch (itemError) {
      console.error("ORDER ITEMS ERROR:", itemError);
    }

    return res.json({
      success: true,
      order: orderResult.rows[0],
      items
    });

  } catch (error) {
    console.error("GET SINGLE ORDER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get order",
      error: error.message
    });
  }
});

// =====================================================
// UPDATE ORDER STATUS
// PUT /api/admin/orders/:id/status
// =====================================================
router.put("/orders/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "NEW",
      "CONFIRMED",
      "PREPARING",
      "READY",
      "DELIVERED",
      "CANCELLED"
    ];

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required"
      });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
        allowedStatuses
      });
    }

    const result = await pool.query(
      `
      UPDATE orders
      SET status = $1
      WHERE id = $2
      RETURNING
        id,
        order_number,
        customer_name,
        phone,
        address,
        total_amount,
        status,
        payment_status,
        created_at
      `,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    return res.json({
      success: true,
      message: "Order status updated successfully",
      order: result.rows[0]
    });

  } catch (error) {
    console.error("UPDATE ORDER STATUS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update order status",
      error: error.message
    });
  }
});

// =====================================================
// DASHBOARD SUMMARY
// GET /api/admin/dashboard
// =====================================================
router.get("/dashboard", async (req, res) => {
  try {
    const ordersResult = await pool.query(`
      SELECT COUNT(*) AS total_orders
      FROM orders
    `);

    const salesResult = await pool.query(`
      SELECT COALESCE(SUM(total_amount), 0) AS total_sales
      FROM orders
      WHERE status != 'CANCELLED'
    `);

    const newOrdersResult = await pool.query(`
      SELECT COUNT(*) AS new_orders
      FROM orders
      WHERE status = 'NEW'
    `);

    const pendingPaymentResult = await pool.query(`
      SELECT COUNT(*) AS pending_payments
      FROM orders
      WHERE payment_status = 'PENDING'
    `);

    return res.json({
      success: true,
      dashboard: {
        total_orders: Number(ordersResult.rows[0].total_orders),
        total_sales: Number(salesResult.rows[0].total_sales),
        new_orders: Number(newOrdersResult.rows[0].new_orders),
        pending_payments: Number(
          pendingPaymentResult.rows[0].pending_payments
        )
      }
    });

  } catch (error) {
    console.error("DASHBOARD ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load dashboard",
      error: error.message
    });
  }
});

module.exports = router;
