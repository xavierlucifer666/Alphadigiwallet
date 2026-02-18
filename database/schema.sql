-- Alpha Digiwallet Database Schema
-- SQL Server

-- Users Table
CREATE TABLE Users (
    user_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user', -- user, merchant, admin
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- active, suspended, closed
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME NOT NULL DEFAULT GETDATE(),
    last_login DATETIME
);

-- Wallets Table
CREATE TABLE Wallets (
    wallet_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id UNIQUEIDENTIFIER NOT NULL,
    balance DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- active, frozen, closed
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    CONSTRAINT CHK_Balance CHECK (balance >= 0)
);

-- Transactions Table
CREATE TABLE Transactions (
    transaction_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    from_wallet_id UNIQUEIDENTIFIER,
    to_wallet_id UNIQUEIDENTIFIER,
    amount DECIMAL(18, 2) NOT NULL,
    type VARCHAR(20) NOT NULL, -- topup, transfer, payment, refund, withdrawal
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, completed, failed, cancelled
    reference VARCHAR(255) NOT NULL,
    description VARCHAR(500),
    error_message VARCHAR(500),
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (from_wallet_id) REFERENCES Wallets(wallet_id),
    FOREIGN KEY (to_wallet_id) REFERENCES Wallets(wallet_id),
    CONSTRAINT CHK_Amount CHECK (amount > 0)
);

-- Merchants Table
CREATE TABLE Merchants (
    merchant_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id UNIQUEIDENTIFIER NOT NULL,
    business_name VARCHAR(255) NOT NULL,
    business_type VARCHAR(100) NOT NULL,
    registration_number VARCHAR(100) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, active, suspended, rejected
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

-- Create indexes for better performance
CREATE INDEX IDX_Users_Email ON Users(email);
CREATE INDEX IDX_Wallets_UserId ON Wallets(user_id);
CREATE INDEX IDX_Transactions_FromWallet ON Transactions(from_wallet_id);
CREATE INDEX IDX_Transactions_ToWallet ON Transactions(to_wallet_id);
CREATE INDEX IDX_Transactions_Status ON Transactions(status);
CREATE INDEX IDX_Transactions_CreatedAt ON Transactions(created_at DESC);
CREATE INDEX IDX_Merchants_UserId ON Merchants(user_id);
CREATE INDEX IDX_Merchants_Status ON Merchants(status);

-- Create logs directory trigger (optional - for audit trail)
-- You can add audit logging tables here if needed

-- Insert default admin user (password: Admin@123)
INSERT INTO Users (email, password, first_name, last_name, phone, role, status)
VALUES (
    'admin@alphadigiwallet.com',
    '$2a$10$XxXxXxXxXxXxXxXxXxXxXuYrE8h3E7K8h3E7K8h3E7K8h3E7K8h3E7', -- bcrypt hash of 'Admin@123'
    'System',
    'Administrator',
    '+971501234567',
    'admin',
    'active'
);

PRINT 'Database schema created successfully';