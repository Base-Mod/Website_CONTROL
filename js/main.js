// Hàm gọi API
async function callAPI(action, data = {}, method = 'GET') {
    try {
        const url = method === 'GET' 
            ? `api.php?action=${action}&${new URLSearchParams(data).toString()}`
            : `api.php?action=${action}`;
        
        const options = {
            method: method,
            headers: method === 'POST' ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}
        };
        
        if (method === 'POST') {
            options.body = new URLSearchParams(data).toString();
        }
        
        const response = await fetch(url, options);
        const result = await response.json();
        
        return result;
    } catch (error) {
        console.error('API Error:', error);
        return { success: false, message: 'Lỗi kết nối' };
    }
}

// Format số
function formatNumber(num, decimals = 2) {
    return parseFloat(num).toFixed(decimals);
}

// Format thời gian
function formatTime(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    
    if (diff < 60) return 'Vừa xong';
    if (diff < 3600) return Math.floor(diff / 60) + ' phút trước';
    if (diff < 86400) return Math.floor(diff / 3600) + ' giờ trước';
    
    return date.toLocaleString('vi-VN');
}

// Cập nhật thời gian
function updateLastUpdate() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('vi-VN');
    const elem = document.getElementById('lastUpdate');
    if (elem) elem.textContent = timeStr;
}

// Hiển thị thông báo
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Lấy icon thiết bị
function getDeviceIcon(type) {
    const icons = {
        'light': '💡',
        'ac': '❄️',
        'fan': '🌀',
        'heater': '🔥',
        'socket': '🔌',
        'other': '⚙️'
    };
    return icons[type] || icons.other;
}

// Lấy màu severity
function getSeverityClass(severity) {
    const classes = {
        'low': 'severity-low',
        'medium': 'severity-medium',
        'high': 'severity-high',
        'critical': 'severity-critical'
    };
    return classes[severity] || classes.medium;
}

// Tự động làm mới số cảnh báo
async function updateAlertBadge() {
    const result = await callAPI('get_alerts', { limit: 100 });
    if (result.success) {
        const unreadCount = result.data.filter(alert => !alert.is_read).length;
        const badges = document.querySelectorAll('#alertBadge');
        badges.forEach(badge => {
            badge.textContent = unreadCount;
            badge.style.display = unreadCount > 0 ? 'inline-block' : 'none';
        });
    }
}

// Khởi tạo
document.addEventListener('DOMContentLoaded', () => {
    updateLastUpdate();
    updateAlertBadge();
    
    // Cập nhật thời gian mỗi giây
    setInterval(updateLastUpdate, 1000);
    
    // Cập nhật số cảnh báo mỗi 30 giây
    setInterval(updateAlertBadge, 30000);
});
