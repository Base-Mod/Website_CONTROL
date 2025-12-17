// Load danh sách thiết bị
async function loadDevices() {
    const result = await callAPI('get_devices');
    
    if (result.success) {
        const list = document.getElementById('devicesList');
        
        if (result.data.length === 0) {
            list.innerHTML = '<p class="text-muted text-center">Chưa có thiết bị nào</p>';
            return;
        }
        
        list.innerHTML = result.data.map(device => `
            <div class="device-item ${device.status === 'on' ? 'device-active' : ''}">
                <div class="device-item-header">
                    <div class="device-item-icon">${getDeviceIcon(device.device_type)}</div>
                    <div class="device-item-info">
                        <h3>${device.device_name}</h3>
                        <p class="text-muted">${device.location}</p>
                    </div>
                    <div class="device-item-status">
                        <span class="status-badge ${device.status === 'on' ? 'status-on' : 'status-off'}">
                            ${device.status === 'on' ? 'ĐANG BẬT' : 'TẮT'}
                        </span>
                    </div>
                </div>
                
                <div class="device-item-body">
                    <div class="device-readings">
                        <div class="reading">
                            <span class="reading-label">Điện áp</span>
                            <span class="reading-value">${formatNumber(device.current_voltage, 1)} V</span>
                        </div>
                        <div class="reading">
                            <span class="reading-label">Dòng điện</span>
                            <span class="reading-value">${formatNumber(device.current_current, 2)} A</span>
                        </div>
                        <div class="reading">
                            <span class="reading-label">Công suất</span>
                            <span class="reading-value">${formatNumber(device.current_power, 1)} W</span>
                        </div>
                        <div class="reading">
                            <span class="reading-label">Công suất định mức</span>
                            <span class="reading-value">${formatNumber(device.power_rating, 0)} W</span>
                        </div>
                    </div>
                </div>
                
                <div class="device-item-footer">
                    <button class="btn ${device.status === 'on' ? 'btn-danger' : 'btn-success'}" 
                            onclick="toggleDevice(${device.id})">
                        ${device.status === 'on' ? '⏸ Tắt thiết bị' : '▶ Bật thiết bị'}
                    </button>
                    <small class="text-muted">Cập nhật: ${formatTime(device.updated_at)}</small>
                </div>
            </div>
        `).join('');
    }
}

// Bật/tắt thiết bị
async function toggleDevice(deviceId) {
    const result = await callAPI('toggle_device', { device_id: deviceId }, 'POST');
    
    if (result.success) {
        showNotification(result.message, 'success');
        await loadDevices();
    } else {
        showNotification(result.message, 'error');
    }
}

// Làm mới danh sách
async function refreshDevices() {
    showNotification('Đang cập nhật...', 'info');
    await loadDevices();
}

// Tạo dữ liệu mẫu cho tất cả thiết bị đang bật
async function simulateData() {
    const result = await callAPI('get_devices');
    
    if (result.success) {
        const onDevices = result.data.filter(d => d.status === 'on');
        
        if (onDevices.length === 0) {
            showNotification('Không có thiết bị nào đang bật. Vui lòng bật ít nhất 1 thiết bị.', 'warning');
            return;
        }
        
        showNotification(`Đang tạo dữ liệu mẫu cho ${onDevices.length} thiết bị...`, 'info');
        
        for (const device of onDevices) {
            await callAPI('add_simulated_data', { device_id: device.id }, 'POST');
        }
        
        setTimeout(async () => {
            await loadDevices();
            showNotification('Đã tạo dữ liệu mẫu thành công!', 'success');
        }, 500);
    }
}

// Khởi tạo
document.addEventListener('DOMContentLoaded', () => {
    loadDevices();
    
    // Tự động làm mới mỗi 15 giây
    setInterval(loadDevices, 15000);
});
