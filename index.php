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
    <title>Dashboard - Hệ thống giám sát điện năng</title>
    <link rel="stylesheet" href="css/style.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
</head>
<body>
    <div class="container">
        <!-- Sidebar -->
        <aside class="sidebar">
            <div class="sidebar-header">
                <h2>⚡ Energy Monitor</h2>
            </div>
            <nav class="sidebar-nav">
                <a href="index.php" class="nav-item active">
                    <span class="icon">📊</span>
                    <span>Dashboard</span>
                </a>
                <a href="devices.php" class="nav-item">
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
                <h1>Dashboard</h1>
                <div class="header-actions">
                    <span class="last-update">Cập nhật: <span id="lastUpdate">--:--</span></span>
                    <button class="btn btn-sm" onclick="refreshData()">🔄 Làm mới</button>
                </div>
            </header>

            <!-- Stats Cards -->
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon blue">🔌</div>
                    <div class="stat-content">
                        <div class="stat-label">Tổng thiết bị</div>
                        <div class="stat-value" id="totalDevices">0</div>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon green">✅</div>
                    <div class="stat-content">
                        <div class="stat-label">Đang hoạt động</div>
                        <div class="stat-value" id="devicesOn">0</div>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon orange">⚡</div>
                    <div class="stat-content">
                        <div class="stat-label">Công suất hiện tại</div>
                        <div class="stat-value" id="currentPower">0 W</div>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon purple">📊</div>
                    <div class="stat-content">
                        <div class="stat-label">Năng lượng hôm nay</div>
                        <div class="stat-value" id="todayEnergy">0 kWh</div>
                    </div>
                </div>
            </div>

            <!-- Charts -->
            <div class="charts-grid">
                <div class="chart-card">
                    <h3>Công suất theo thời gian</h3>
                    <canvas id="powerChart"></canvas>
                </div>
                
                <div class="chart-card">
                    <h3>Điện áp theo thời gian</h3>
                    <canvas id="voltageChart"></canvas>
                </div>
            </div>

            <!-- Devices Quick View -->
            <div class="section">
                <div class="section-header">
                    <h2>Thiết bị</h2>
                    <a href="devices.php" class="btn btn-sm">Xem tất cả</a>
                </div>
                
                <div class="devices-grid" id="devicesGrid">
                    <!-- Devices will be loaded here -->
                </div>
            </div>

            <!-- Recent Alerts -->
            <div class="section">
                <div class="section-header">
                    <h2>Cảnh báo gần đây</h2>
                    <a href="alerts.php" class="btn btn-sm">Xem tất cả</a>
                </div>
                
                <div class="alerts-list" id="alertsList">
                    <!-- Alerts will be loaded here -->
                </div>
            </div>
        </main>
    </div>

    <script src="js/main.js"></script>
    <script src="js/dashboard.js"></script>
</body>
</html>
