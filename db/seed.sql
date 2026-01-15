USE marketplace_analytics;

INSERT IGNORE INTO roles (role_name) VALUES ('admin'), ('user');

-- Placeholder admin user; update password_hash.
INSERT IGNORE INTO users (email, password_hash, is_active)
VALUES ('admin@example.com', '$2b$10$REPLACE_ME_WITH_REAL_BCRYPT_HASH', 1);

INSERT IGNORE INTO user_roles (user_id, role_id)
SELECT u.user_id, r.role_id
FROM users u
JOIN roles r ON r.role_name='admin'
WHERE u.email='admin@example.com';
