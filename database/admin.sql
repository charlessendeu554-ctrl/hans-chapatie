-- =====================================================
-- HANS CHAPATIE CENTRE
-- ADMIN AUTHENTICATION
-- =====================================================

CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,

    username VARCHAR(100)
        UNIQUE NOT NULL,

    password_hash TEXT
        NOT NULL,

    created_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP
);
