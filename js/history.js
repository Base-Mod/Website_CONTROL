// Biểu đồ
let historyPowerChart, historyVoltageChart, historyCurrentChart, historyEnergyChart;

// Load dữ liệu lịch sử
async function loadHistoryData() {
    const hours = document.getElementById('timeRange').value;
    const result = await callAPI('get_power_data', { hours: hours });
    
    if (result.success && result.data.length > 0) {
        const labels = result.data.map(d => d.time);
        const powerData = result.data.map(d => parseFloat(d.avg_power));
        const voltageData = result.data.map(d => parseFloat(d.avg_voltage));
        const currentData = result.data.map(d => parseFloat(d.avg_current));
        const energyData = result.data.map(d => parseFloat(d.total_energy));
        
        // Biểu đồ công suất
        const powerCtx = document.getElementById('historyPowerChart');
        if (historyPowerChart) historyPowerChart.destroy();
        
        historyPowerChart = new Chart(powerCtx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Công suất trung bình (W)',
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
        const voltageCtx = document.getElementById('historyVoltageChart');
        if (historyVoltageChart) historyVoltageChart.destroy();
        
        historyVoltageChart = new Chart(voltageCtx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Điện áp trung bình (V)',
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
        
        // Biểu đồ dòng điện
        const currentCtx = document.getElementById('historyCurrentChart');
        if (historyCurrentChart) historyCurrentChart.destroy();
        
        historyCurrentChart = new Chart(currentCtx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Dòng điện trung bình (A)',
                    data: currentData,
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
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
        
        // Biểu đồ năng lượng
        const energyCtx = document.getElementById('historyEnergyChart');
        if (historyEnergyChart) historyEnergyChart.destroy();
        
        historyEnergyChart = new Chart(energyCtx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Năng lượng tiêu thụ (kWh)',
                    data: energyData,
                    backgroundColor: 'rgba(139, 92, 246, 0.6)',
                    borderColor: '#8b5cf6',
                    borderWidth: 1
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
        
        showNotification('Đã cập nhật dữ liệu lịch sử', 'success');
    } else {
        showNotification('Chưa có dữ liệu lịch sử', 'warning');
    }
}

// Khởi tạo
document.addEventListener('DOMContentLoaded', () => {
    loadHistoryData();
});
