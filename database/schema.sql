-- ==========================================
-- HANS CHAPATIE CENTRE
-- DATABASE SCHEMA
-- ==========================================


-- CUSTOMERS
CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- PRODUCTS
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    price NUMERIC(12,2) NOT NULL CHECK (price >= 0),
    image_url TEXT,
    available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ORDERS
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,

    order_number VARCHAR(50)
        UNIQUE NOT NULL,

    customer_id INTEGER
        REFERENCES customers(id)
        ON DELETE SET NULL,

    total_amount NUMERIC(12,2)
        NOT NULL DEFAULT 0,

    status VARCHAR(30)
        NOT NULL DEFAULT 'NEW',

    payment_status VARCHAR(30)
        NOT NULL DEFAULT 'PENDING',

    notes TEXT,

    created_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP
);


-- ORDER ITEMS
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,

    order_id INTEGER
        NOT NULL
        REFERENCES orders(id)
        ON DELETE CASCADE,

    product_id INTEGER
        NOT NULL
        REFERENCES products(id)
        ON DELETE RESTRICT,

    quantity INTEGER
        NOT NULL
        CHECK (quantity > 0),

    unit_price NUMERIC(12,2)
        NOT NULL,

    subtotal NUMERIC(12,2)
        NOT NULL
);


-- ==========================================
-- SAMPLE PRODUCTS
-- ==========================================

INSERT INTO products
    (name, description, price, image_url, available)

SELECT
    'Plain Chapati',
    'Fresh plain chapati',
    500,
    NULL,
    TRUE

WHERE NOT EXISTS (
    SELECT 1
    FROM products
    WHERE name = 'Plain Chapati'
);


INSERT INTO products
    (name, description, price, image_url, available)

SELECT
    'Chapati Special',
    'Fresh special chapati',
    700,
    NULL,
    TRUE

WHERE NOT EXISTS (
    SELECT 1
    FROM products
    WHERE name = 'Chapati Special'
);


INSERT INTO products
    (name, description, price, image_url, available)

SELECT
    'Chapati Family Pack',
    'Pack of 10 fresh chapati',
    5000,
    NULL,
    TRUE

WHERE NOT EXISTS (
    SELECT 1
    FROM products
    WHERE name = 'Chapati Family Pack'
);


-- ==========================================
-- INDEXES
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_orders_status
ON orders(status);

CREATE INDEX IF NOT EXISTS idx_orders_created_at
ON orders(created_at);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id
ON order_items(order_id);
