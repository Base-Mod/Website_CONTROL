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
    <title>Lịch sử - Hệ thống giám sát điện năng</title>
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
                <a href="index.php" class="nav-item">
                    <span class="icon">📊</span>
                    <span>Dashboard</span>
                </a>
                <a href="devices.php" class="nav-item">
                    <span class="icon">🔌</span>
                    <span>Thiết bị</span>
                </a>
                <a href="history.php" class="nav-item active">
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
                <h1>Lịch sử dữ liệu</h1>
                <div class="header-actions">
                    <select id="timeRange" onchange="loadHistoryData()">
                        <option value="6">6 giờ qua</option>
                        <option value="12">12 giờ qua</option>
                        <option value="24" selected>24 giờ qua</option>
                        <option value="48">48 giờ qua</option>
                        <option value="168">7 ngày qua</option>
                    </select>
                </div>
            </header>

            <div class="charts-grid">
                <div class="chart-card">
                    <h3>Công suất tiêu thụ</h3>
                    <canvas id="historyPowerChart"></canvas>
                </div>
                
                <div class="chart-card">
                    <h3>Điện áp</h3>
                    <canvas id="historyVoltageChart"></canvas>
                </div>
                
                <div class="chart-card">
                    <h3>Dòng điện</h3>
                    <canvas id="historyCurrentChart"></canvas>
                </div>
                
                <div class="chart-card">
                    <h3>Năng lượng tích lũy</h3>
                    <canvas id="historyEnergyChart"></canvas>
                </div>
            </div>
        </main>
    </div>

    <script src="js/main.js"></script>
    <script src="js/history.js"></script>
</body>
</html>
