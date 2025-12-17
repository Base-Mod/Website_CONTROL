// Load danh sách cảnh báo
async function loadAlerts() {
    const result = await callAPI('get_alerts', { limit: 100 });
    
    if (result.success) {
        const container = document.getElementById('alertsContainer');
        
        if (result.data.length === 0) {
            container.innerHTML = '<p class="text-muted text-center">Không có cảnh báo nào</p>';
            return;
        }
        
        container.innerHTML = result.data.map(alert => `
            <div class="alert-card ${getSeverityClass(alert.severity)} ${alert.is_read ? 'alert-read' : ''}">
                <div class="alert-card-header">
                    <div class="alert-severity">
                        <span class="severity-badge ${getSeverityClass(alert.severity)}">
                            ${getSeverityLabel(alert.severity)}
                        </span>
                        <span class="alert-type">${getAlertTypeLabel(alert.alert_type)}</span>
                    </div>
                    <div class="alert-time">${formatTime(alert.created_at)}</div>
                </div>
                
                <div class="alert-card-body">
                    <div class="alert-device">
                        <strong>${alert.device_name || 'Hệ thống'}</strong>
                    </div>
                    <div class="alert-message">${alert.message}</div>
                </div>
                
                <div class="alert-card-footer">
                    ${!alert.is_read ? `
                        <button class="btn btn-sm" onclick="markAlertRead(${alert.id})">
                            ✓ Đánh dấu đã đọc
                        </button>
                    ` : `
                        <span class="text-muted">✓ Đã đọc</span>
                    `}
                </div>
            </div>
        `).join('');
    }
}

// Đánh dấu cảnh báo đã đọc
async function markAlertRead(alertId) {
    const result = await callAPI('mark_alert_read', { alert_id: alertId }, 'POST');
    
    if (result.success) {
        await loadAlerts();
        updateAlertBadge();
    }
}

// Đánh dấu tất cả đã đọc
async function markAllRead() {
    const result = await callAPI('mark_alert_read', { alert_id: 0 }, 'POST');
    
    if (result.success) {
        showNotification('Đã đánh dấu tất cả cảnh báo đã đọc', 'success');
        await loadAlerts();
        updateAlertBadge();
    }
}

// Lấy nhãn mức độ nghiêm trọng
function getSeverityLabel(severity) {
    const labels = {
        'low': 'Thấp',
        'medium': 'Trung bình',
        'high': 'Cao',
        'critical': 'Nghiêm trọng'
    };
    return labels[severity] || severity;
}

// Lấy nhãn loại cảnh báo
function getAlertTypeLabel(type) {
    const labels = {
        'overvoltage': 'Điện áp cao',
        'undervoltage': 'Điện áp thấp',
        'overcurrent': 'Dòng điện cao',
        'overpower': 'Công suất cao',
        'general': 'Chung'
    };
    return labels[type] || type;
}

// Khởi tạo
document.addEventListener('DOMContentLoaded', () => {
    loadAlerts();
    
    // Tự động làm mới mỗi 30 giây
    setInterval(loadAlerts, 30000);
});
