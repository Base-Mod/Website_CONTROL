<?php
require_once 'config.php';

if (!isLoggedIn()) {
    header('Location: login.php');
    exit;
}
?>
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quản lý thiết bị - Hệ thống giám sát điện năng</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <div class="container">
        <!-- Sidebar -->
        <aside class="sidebar">
            <div class="sidebar-header">
                <h2>⚡ Energy Monitor</h2>
            </div>
            <nav class="sidebar-nav">
                <a href="index.php" class="nav-item">
                    <span class="icon">📊</span>
                    <span>Dashboard</span>
                </a>
                <a href="devices.php" class="nav-item active">
                    <span class="icon">🔌</span>
                    <span>Thiết bị</span>
                </a>
                <a href="history.php" class="nav-item">
                    <span class="icon">📈</span>
                    <span>Lịch sử</span>
                </a>
                <a href="alerts.php" class="nav-item">
                    <span class="icon">⚠️</span>
                    <span>Cảnh báo</span>
                    <span class="badge" id="alertBadge">0</span>
                </a>
            </nav>
            <div class="sidebar-footer">
                <div class="user-info">
                    <strong><?= h($_SESSION['full_name'] ?? $_SESSION['username']) ?></strong>
                    <small><?= h($_SESSION['role']) ?></small>
                </div>
                <a href="logout.php" class="btn btn-sm">Đăng xuất</a>
            </div>
        </aside>

        <!-- Main Content -->
        <main class="main-content">
            <header class="page-header">
                <h1>Quản lý thiết bị</h1>
                <div class="header-actions">
                    <button class="btn btn-sm" onclick="refreshDevices()">🔄 Làm mới</button>
                    <button class="btn btn-sm" onclick="simulateData()">🎲 Tạo dữ liệu mẫu</button>
                </div>
            </header>

            <div class="devices-list" id="devicesList">
                <!-- Devices will be loaded here -->
            </div>
        </main>
    </div>

    <script src="js/main.js"></script>
    <script src="js/devices.js"></script>
</body>
</html>
