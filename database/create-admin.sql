INSERT INTO admin_users
    (username, password_hash)
VALUES
    (
        'admin',
        '$2b$12$tsIDTGTt8ng6cKWmeFYdc.Xo/SuZ.LhXS2jBrAGv.f/esjO5DS48m'
    )
ON CONFLICT (username)
DO UPDATE SET
    password_hash = EXCLUDED.password_hash;
