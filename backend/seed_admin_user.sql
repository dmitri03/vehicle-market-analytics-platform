-- Seed an admin user (manual).
-- Update email + password_hash before running.
-- Generate bcrypt hash: node -e "console.log(require('bcryptjs').hashSync('YourPasswordHere', 10))"

-- Ensure roles exist.
INSERT IGNORE INTO roles (role_name) VALUES ('admin'), ('user');

-- Create user.
INSERT INTO users (email, password_hash, is_active)
VALUES ('admin@example.com', '$2a$10$REPLACE_WITH_BCRYPT_HASH', 1);

SET @new_user_id = LAST_INSERT_ID();

-- Attach admin role.
INSERT INTO user_roles (user_id, role_id)
SELECT @new_user_id, role_id FROM roles WHERE role_name='admin';
