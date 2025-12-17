// API Base URL
const API_BASE = window.location.origin;
const WS_URL = `ws://${window.location.host}/ws`;

// WebSocket connection
let ws = null;
let reconnectInterval = null;

// Authentication token
let authToken = localStorage.getItem('token');

// Connect to WebSocket
function connectWebSocket() {
    if (ws && ws.readyState === WebSocket.OPEN) {
        return;
    }
    
    ws = new WebSocket(WS_URL);
    
    ws.onopen = () => {
        console.log('WebSocket connected');
        if (reconnectInterval) {
            clearInterval(reconnectInterval);
            reconnectInterval = null;
        }
    };
    
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
    };
    
    ws.onclose = () => {
        console.log('WebSocket disconnected');
        // Reconnect after 5 seconds
        if (!reconnectInterval) {
            reconnectInterval = setInterval(() => {
                connectWebSocket();
            }, 5000);
        }
    };
    
    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
    };
}

// Handle WebSocket messages
function handleWebSocketMessage(data) {
    switch (data.type) {
        case 'device_update':
            if (typeof onDeviceUpdate === 'function') {
                onDeviceUpdate(data);
            }
            break;
        case 'power_data':
            if (typeof onPowerData === 'function') {
                onPowerData(data);
            }
            break;
        case 'alert':
            if (typeof onAlert === 'function') {
                onAlert(data);
            }
            break;
    }
}

// API call helper
async function apiCall(endpoint, options = {}) {
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        }
    };
    
    if (authToken) {
        defaultOptions.headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    const finalOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };
    
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, finalOptions);
        
        if (response.status === 401) {
            // Unauthorized - redirect to login
            logout();
            return null;
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API Error:', error);
        showNotification('Lỗi kết nối', 'error');
        return null;
    }
}

// Authentication
async function login(username, password) {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    
    const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        body: formData
    });
    
    if (response.ok) {
        const data = await response.json();
        authToken = data.access_token;
        localStorage.setItem('token', authToken);
        return true;
    }
    
    return false;
}

function logout() {
    authToken = null;
    localStorage.removeItem('token');
    window.location.href = '/static/login.html';
}

function isLoggedIn() {
    return authToken !== null;
}

// Format helpers
function formatNumber(num, decimals = 2) {
    return parseFloat(num).toFixed(decimals);
}

function formatTime(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    
    if (diff < 60) return 'Vừa xong';
    if (diff < 3600) return Math.floor(diff / 60) + ' phút trước';
    if (diff < 86400) return Math.floor(diff / 3600) + ' giờ trước';
    
    return date.toLocaleString('vi-VN');
}

function updateLastUpdate() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('vi-VN');
    const elem = document.getElementById('lastUpdate');
    if (elem) elem.textContent = timeStr;
}

// Notifications
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

// Device icon helper
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

// Alert severity helper
function getSeverityClass(severity) {
    const classes = {
        'low': 'severity-low',
        'medium': 'severity-medium',
        'high': 'severity-high',
        'critical': 'severity-critical'
    };
    return classes[severity] || classes.medium;
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    // Check if logged in
    if (!isLoggedIn() && !window.location.pathname.includes('login.html')) {
        window.location.href = '/static/login.html';
        return;
    }
    
    // Connect WebSocket
    if (isLoggedIn()) {
        connectWebSocket();
    }
    
    // Update time
    updateLastUpdate();
    setInterval(updateLastUpdate, 1000);
});
