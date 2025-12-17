let powerChart, voltageChart;

// Load dashboard data
async function loadDashboard() {
    await Promise.all([
        loadStats(),
        loadDevices(),
        loadAlerts(),
        loadChartData()
    ]);
}

// Load statistics
async function loadStats() {
    const data = await apiCall('/api/devices/stats');
    
    if (data) {
        document.getElementById('totalDevices').textContent = data.total_devices;
        document.getElementById('devicesOn').textContent = data.devices_on;
        document.getElementById('currentPower').textContent = formatNumber(data.current_power, 0) + ' W';
        document.getElementById('todayEnergy').textContent = formatNumber(data.today_energy, 2) + ' kWh';
    }
}

// Load devices
async function loadDevices() {
    const devices = await apiCall('/api/devices/');
    
    if (devices) {
        const grid = document.getElementById('devicesGrid');
        
        if (devices.length === 0) {
            grid.innerHTML = '<p class="text-muted">Chưa có thiết bị nào</p>';
            return;
        }
        
        // Show first 6 devices
        const displayDevices = devices.slice(0, 6);
        
        grid.innerHTML = displayDevices.map(device => `
            <div class="device-card ${device.status === 'on' ? 'device-on' : 'device-off'}">
                <div class="device-icon">${getDeviceIcon(device.device_type)}</div>
                <div class="device-info">
                    <h4>${device.device_name}</h4>
                    <p class="device-location">${device.location || ''}</p>
                    <p class="device-power">${formatNumber(device.current_power, 0)} W</p>
                </div>
                <div class="device-actions">
                    <button class="btn-toggle ${device.status === 'on' ? 'btn-on' : 'btn-off'}" 
                            onclick="toggleDevice(${device.id})">
                        ${device.status === 'on' ? 'BẬT' : 'TẮT'}
                    </button>
                </div>
            </div>
        `).join('');
    }
}

// Load alerts
async function loadAlerts() {
    const alerts = await apiCall('/api/alerts/?limit=5');
    
    if (alerts) {
        const list = document.getElementById('alertsList');
        const badge = document.getElementById('alertBadge');
        
        const unreadCount = alerts.filter(a => !a.is_read).length;
        badge.textContent = unreadCount;
        badge.style.display = unreadCount > 0 ? 'inline-block' : 'none';
        
        if (alerts.length === 0) {
            list.innerHTML = '<p class="text-muted">Không có cảnh báo</p>';
            return;
        }
        
        list.innerHTML = alerts.map(alert => `
            <div class="alert-item ${getSeverityClass(alert.severity)} ${alert.is_read ? 'alert-read' : ''}">
                <div class="alert-header">
                    <span class="alert-device">${alert.device_name || 'Hệ thống'}</span>
                    <span class="alert-time">${formatTime(alert.created_at)}</span>
                </div>
                <div class="alert-message">${alert.message}</div>
            </div>
        `).join('');
    }
}

// Load chart data
async function loadChartData() {
    const data = await apiCall('/api/power/history?hours=24');
    
    if (data && data.length > 0) {
        const labels = data.map(d => d.time);
        const powerData = data.map(d => d.avg_power);
        const voltageData = data.map(d => d.avg_voltage);
        
        // Power chart
        const powerCtx = document.getElementById('powerChart');
        if (powerChart) powerChart.destroy();
        
        powerChart = new Chart(powerCtx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Công suất (W)',
                    data: powerData,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: true }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
        
        // Voltage chart
        const voltageCtx = document.getElementById('voltageChart');
        if (voltageChart) voltageChart.destroy();
        
        voltageChart = new Chart(voltageCtx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Điện áp (V)',
                    data: voltageData,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: true }
                },
                scales: {
                    y: { 
                        beginAtZero: false,
                        min: 200,
                        max: 250
                    }
                }
            }
        });
    }
}

// Toggle device
async function toggleDevice(deviceId) {
    const data = await apiCall(`/api/devices/${deviceId}/toggle`, {
        method: 'POST'
    });
    
    if (data && data.success) {
        showNotification(data.message, 'success');
        await loadDashboard();
    }
}

// Refresh data
async function refreshData() {
    showNotification('Đang cập nhật...', 'info');
    await loadDashboard();
}

// WebSocket handlers
function onDeviceUpdate(data) {
    loadDevices();
    loadStats();
}

function onPowerData(data) {
    loadChartData();
}

function onAlert(data) {
    loadAlerts();
    showNotification('Có cảnh báo mới!', 'warning');
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadDashboard();
    
    // Auto refresh
    setInterval(() => {
        loadStats();
        loadDevices();
    }, 10000);
    
    setInterval(loadChartData, 30000);
});
