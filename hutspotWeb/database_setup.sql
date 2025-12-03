-- =====================================================
-- HutSpot Event Booking System - Database Setup
-- Run this in phpMyAdmin SQL tab after creating 'hutspot_db'
-- =====================================================

-- Create database (if not exists)
CREATE DATABASE IF NOT EXISTS hutspot_db;
USE hutspot_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    mobile VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id VARCHAR(50) PRIMARY KEY,
    user_id INT,
    customer_name VARCHAR(200) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    event_package VARCHAR(50),
    package_name VARCHAR(100),
    event_type VARCHAR(50),
    event_date DATE NOT NULL,
    event_time TIME,
    venue_name VARCHAR(100),
    number_of_guests INT,
    special_request TEXT,
    total_amount DECIMAL(10,2),
    down_payment DECIMAL(10,2),
    balance DECIMAL(10,2),
    status ENUM('pending', 'confirmed', 'completed', 'cancelled', 'rejected') DEFAULT 'pending',
    payment_proof VARCHAR(255),
    payment_proof_image LONGTEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(50) PRIMARY KEY,
    booking_id VARCHAR(50),
    amount DECIMAL(10,2),
    down_payment DECIMAL(10,2),
    remaining_balance DECIMAL(10,2),
    payment_method VARCHAR(50),
    payment_proof VARCHAR(255),
    payment_proof_image LONGTEXT,
    status ENUM('pending', 'paid', 'partial', 'failed') DEFAULT 'pending',
    payment_date DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin user
INSERT INTO admin_users (username, password, email) 
VALUES ('admin', 'password123', 'admin@hutspot.com')
ON DUPLICATE KEY UPDATE username = username;

-- Show success message
SELECT 'Database setup complete!' AS Status;
