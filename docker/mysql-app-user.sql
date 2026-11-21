CREATE USER IF NOT EXISTS 'marketplace_app'@'%' IDENTIFIED BY 'local_app_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON food_marketplace.* TO 'marketplace_app'@'%';
FLUSH PRIVILEGES;
