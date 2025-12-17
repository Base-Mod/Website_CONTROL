<?php
// Cấu hình kết nối database
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'energy_monitoring');

// Múi giờ
date_default_timezone_set('Asia/Ho_Chi_Minh');

// Kết nối database
function getDBConnection() {
    try {
        $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
        
        if ($conn->connect_error) {
            throw new Exception("Kết nối thất bại: " . $conn->connect_error);
        }
        
        $conn->set_charset("utf8mb4");
        return $conn;
    } catch (Exception $e) {
        die("Lỗi database: " . $e->getMessage());
    }
}

// Hàm kiểm tra đăng nhập
function isLoggedIn() {
    session_start();
    return isset($_SESSION['user_id']);
}

// Hàm kiểm tra quyền admin
function isAdmin() {
    session_start();
    return isset($_SESSION['role']) && $_SESSION['role'] === 'admin';
}

// Hàm bảo mật output
function h($str) {
    return htmlspecialchars($str, ENT_QUOTES, 'UTF-8');
}

// Hàm format số
function formatNumber($number, $decimals = 2) {
    return number_format($number, $decimals, '.', ',');
}
?>
