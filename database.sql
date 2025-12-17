-- Database cho hệ thống giám sát và điều khiển điện năng
CREATE DATABASE IF NOT EXISTS energy_monitoring CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE energy_monitoring;

-- Bảng người dùng
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    full_name VARCHAR(100),
    role ENUM('admin', 'user') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng thiết bị
CREATE TABLE IF NOT EXISTS devices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    device_name VARCHAR(100) NOT NULL,
    device_type ENUM('light', 'ac', 'fan', 'heater', 'socket', 'other') DEFAULT 'other',
    location VARCHAR(100),
    status ENUM('on', 'off') DEFAULT 'off',
    power_rating DECIMAL(10, 2) DEFAULT 0.00, -- Công suất định mức (W)
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Bảng dữ liệu điện năng
CREATE TABLE IF NOT EXISTS power_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    device_id INT,
    voltage DECIMAL(10, 2) DEFAULT 0.00, -- Điện áp (V)
    current DECIMAL(10, 3) DEFAULT 0.000, -- Dòng điện (A)
    power DECIMAL(10, 2) DEFAULT 0.00, -- Công suất (W)
    energy DECIMAL(10, 3) DEFAULT 0.000, -- Năng lượng tiêu thụ (kWh)
    power_factor DECIMAL(5, 2) DEFAULT 1.00, -- Hệ số công suất
    frequency DECIMAL(5, 2) DEFAULT 50.00, -- Tần số (Hz)
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE,
    INDEX idx_device_time (device_id, recorded_at)
);

-- Bảng cảnh báo
CREATE TABLE IF NOT EXISTS alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    device_id INT,
    alert_type ENUM('overvoltage', 'undervoltage', 'overcurrent', 'overpower', 'general') DEFAULT 'general',
    message TEXT,
    severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE,
    INDEX idx_alert_time (created_at)
);

-- Bảng cấu hình hệ thống
CREATE TABLE IF NOT EXISTS system_config (
    id INT AUTO_INCREMENT PRIMARY KEY,
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value TEXT,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Bảng lịch sử điều khiển
CREATE TABLE IF NOT EXISTS control_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    device_id INT,
    user_id INT,
    action ENUM('turn_on', 'turn_off', 'adjust') DEFAULT 'turn_on',
    previous_status VARCHAR(50),
    new_status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_control_time (created_at)
);

-- Dữ liệu mẫu
INSERT INTO users (username, password, email, full_name, role) VALUES
('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@example.com', 'Administrator', 'admin'), -- password: password
('user1', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user1@example.com', 'User One', 'user');

INSERT INTO devices (device_name, device_type, location, status, power_rating) VALUES
('Đèn phòng khách', 'light', 'Phòng khách', 'off', 60.00),
('Điều hòa phòng ngủ', 'ac', 'Phòng ngủ', 'off', 1500.00),
('Quạt trần', 'fan', 'Phòng ăn', 'off', 75.00),
('Máy nước nóng', 'heater', 'Nhà tắm', 'off', 2500.00),
('Ổ cắm đa năng 1', 'socket', 'Văn phòng', 'on', 250.00),
('Đèn sân vườn', 'light', 'Sân vườn', 'off', 100.00);

INSERT INTO system_config (config_key, config_value, description) VALUES
('max_voltage', '250', 'Điện áp tối đa cho phép (V)'),
('min_voltage', '200', 'Điện áp tối thiểu cho phép (V)'),
('max_current', '16', 'Dòng điện tối đa cho phép (A)'),
('alert_email', 'alerts@example.com', 'Email nhận cảnh báo'),
('data_retention_days', '90', 'Số ngày lưu trữ dữ liệu');
