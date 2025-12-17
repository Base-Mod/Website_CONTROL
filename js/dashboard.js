// Biểu đồ
let powerChart, voltageChart;

// Load dữ liệu dashboard
async function loadDashboard() {
    await Promise.all([
        loadStats(),
        loadDevices(),
        loadAlerts(),
        loadChartData()
    ]);
}

// Load thống kê
async function loadStats() {
    const result = await callAPI('get_dashboard_stats');
    
    if (result.success) {
        const stats = result.data;
        
        document.getElementById('totalDevices').textContent = stats.total_devices;
        document.getElementById('devicesOn').textContent = stats.devices_on;
        document.getElementById('currentPower').textContent = formatNumber(stats.current_power, 0) + ' W';
        document.getElementById('todayEnergy').textContent = formatNumber(stats.today_energy, 2) + ' kWh';
    }
}

// Load thiết bị
async function loadDevices() {
    const result = await callAPI('get_devices');
    
    if (result.success) {
        const grid = document.getElementById('devicesGrid');
        
        if (result.data.length === 0) {
            grid.innerHTML = '<p class="text-muted">Chưa có thiết bị nào</p>';
            return;
        }
        
        // Chỉ hiển thị 6 thiết bị đầu tiên
        const devices = result.data.slice(0, 6);
        
        grid.innerHTML = devices.map(device => `
            <div class="device-card ${device.status === 'on' ? 'device-on' : 'device-off'}">
                <div class="device-icon">${getDeviceIcon(device.device_type)}</div>
                <div class="device-info">
                    <h4>${device.device_name}</h4>
                    <p class="device-location">${device.location}</p>
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

// Load cảnh báo
async function loadAlerts() {
    const result = await callAPI('get_alerts', { limit: 5 });
    
    if (result.success) {
        const list = document.getElementById('alertsList');
        
        if (result.data.length === 0) {
            list.innerHTML = '<p class="text-muted">Không có cảnh báo</p>';
            return;
        }
        
        list.innerHTML = result.data.map(alert => `
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

// Load dữ liệu biểu đồ
async function loadChartData() {
    const result = await callAPI('get_power_data', { hours: 24 });
    
    if (result.success && result.data.length > 0) {
        const labels = result.data.map(d => d.time);
        const powerData = result.data.map(d => parseFloat(d.avg_power));
        const voltageData = result.data.map(d => parseFloat(d.avg_voltage));
        
        // Biểu đồ công suất
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
        
        // Biểu đồ điện áp
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

// Bật/tắt thiết bị
async function toggleDevice(deviceId) {
    const result = await callAPI('toggle_device', { device_id: deviceId }, 'POST');
    
    if (result.success) {
        showNotification(result.message, 'success');
        await loadDashboard();
    } else {
        showNotification(result.message, 'error');
    }
}

// Làm mới dữ liệu
async function refreshData() {
    showNotification('Đang cập nhật...', 'info');
    await loadDashboard();
}

// Khởi tạo
document.addEventListener('DOMContentLoaded', () => {
    loadDashboard();
    
    // Tự động làm mới mỗi 10 giây
    setInterval(async () => {
        await loadStats();
        await loadDevices();
    }, 10000);
    
    // Cập nhật biểu đồ mỗi 30 giây
    setInterval(loadChartData, 30000);
});
