<?php
require_once 'config.php';

header('Content-Type: application/json');
session_start();

$conn = getDBConnection();
$response = ['success' => false, 'message' => '', 'data' => null];

// Lấy action từ request
$action = $_GET['action'] ?? $_POST['action'] ?? '';

try {
    switch ($action) {
        case 'get_dashboard_stats':
            // Lấy thống kê tổng quan
            $stats = [];
            
            // Tổng số thiết bị
            $result = $conn->query("SELECT COUNT(*) as total FROM devices WHERE is_active = 1");
            $stats['total_devices'] = $result->fetch_assoc()['total'];
            
            // Thiết bị đang bật
            $result = $conn->query("SELECT COUNT(*) as total FROM devices WHERE status = 'on' AND is_active = 1");
            $stats['devices_on'] = $result->fetch_assoc()['total'];
            
            // Tổng công suất hiện tại
            $result = $conn->query("SELECT SUM(d.power_rating) as total_power 
                                   FROM devices d 
                                   WHERE d.status = 'on' AND d.is_active = 1");
            $stats['current_power'] = $result->fetch_assoc()['total_power'] ?? 0;
            
            // Năng lượng tiêu thụ hôm nay
            $result = $conn->query("SELECT SUM(energy) as total_energy 
                                   FROM power_data 
                                   WHERE DATE(recorded_at) = CURDATE()");
            $stats['today_energy'] = $result->fetch_assoc()['total_energy'] ?? 0;
            
            // Cảnh báo chưa đọc
            $result = $conn->query("SELECT COUNT(*) as total FROM alerts WHERE is_read = 0");
            $stats['unread_alerts'] = $result->fetch_assoc()['total'];
            
            $response['success'] = true;
            $response['data'] = $stats;
            break;
            
        case 'get_devices':
            // Lấy danh sách thiết bị
            $result = $conn->query("SELECT d.*, 
                                   COALESCE(pd.power, 0) as current_power,
                                   COALESCE(pd.voltage, 0) as current_voltage,
                                   COALESCE(pd.current, 0) as current_current
                                   FROM devices d
                                   LEFT JOIN (
                                       SELECT device_id, power, voltage, current
                                       FROM power_data
                                       WHERE (device_id, recorded_at) IN (
                                           SELECT device_id, MAX(recorded_at)
                                           FROM power_data
                                           GROUP BY device_id
                                       )
                                   ) pd ON d.id = pd.device_id
                                   WHERE d.is_active = 1
                                   ORDER BY d.id");
            
            $devices = [];
            while ($row = $result->fetch_assoc()) {
                $devices[] = $row;
            }
            
            $response['success'] = true;
            $response['data'] = $devices;
            break;
            
        case 'toggle_device':
            // Bật/tắt thiết bị
            $device_id = $_POST['device_id'] ?? 0;
            
            if (!$device_id) {
                throw new Exception('ID thiết bị không hợp lệ');
            }
            
            // Lấy trạng thái hiện tại
            $result = $conn->query("SELECT status FROM devices WHERE id = $device_id");
            if ($result->num_rows === 0) {
                throw new Exception('Thiết bị không tồn tại');
            }
            
            $current_status = $result->fetch_assoc()['status'];
            $new_status = $current_status === 'on' ? 'off' : 'on';
            
            // Cập nhật trạng thái
            $conn->query("UPDATE devices SET status = '$new_status', updated_at = NOW() WHERE id = $device_id");
            
            // Lưu lịch sử
            $user_id = $_SESSION['user_id'] ?? 0;
            $action_type = $new_status === 'on' ? 'turn_on' : 'turn_off';
            $conn->query("INSERT INTO control_history (device_id, user_id, action, previous_status, new_status) 
                         VALUES ($device_id, $user_id, '$action_type', '$current_status', '$new_status')");
            
            $response['success'] = true;
            $response['message'] = 'Đã ' . ($new_status === 'on' ? 'bật' : 'tắt') . ' thiết bị';
            $response['data'] = ['new_status' => $new_status];
            break;
            
        case 'get_power_data':
            // Lấy dữ liệu điện năng theo thời gian
            $device_id = $_GET['device_id'] ?? 0;
            $hours = $_GET['hours'] ?? 24;
            
            $where = $device_id > 0 ? "WHERE device_id = $device_id" : "";
            
            $result = $conn->query("SELECT 
                                   DATE_FORMAT(recorded_at, '%Y-%m-%d %H:%i') as time,
                                   AVG(voltage) as avg_voltage,
                                   AVG(current) as avg_current,
                                   AVG(power) as avg_power,
                                   SUM(energy) as total_energy
                                   FROM power_data
                                   $where
                                   AND recorded_at >= DATE_SUB(NOW(), INTERVAL $hours HOUR)
                                   GROUP BY DATE_FORMAT(recorded_at, '%Y-%m-%d %H:%i')
                                   ORDER BY recorded_at DESC
                                   LIMIT 100");
            
            $data = [];
            while ($row = $result->fetch_assoc()) {
                $data[] = $row;
            }
            
            $response['success'] = true;
            $response['data'] = array_reverse($data);
            break;
            
        case 'get_alerts':
            // Lấy danh sách cảnh báo
            $limit = $_GET['limit'] ?? 50;
            
            $result = $conn->query("SELECT a.*, d.device_name 
                                   FROM alerts a
                                   LEFT JOIN devices d ON a.device_id = d.id
                                   ORDER BY a.created_at DESC
                                   LIMIT $limit");
            
            $alerts = [];
            while ($row = $result->fetch_assoc()) {
                $alerts[] = $row;
            }
            
            $response['success'] = true;
            $response['data'] = $alerts;
            break;
            
        case 'mark_alert_read':
            // Đánh dấu cảnh báo đã đọc
            $alert_id = $_POST['alert_id'] ?? 0;
            
            if ($alert_id > 0) {
                $conn->query("UPDATE alerts SET is_read = 1 WHERE id = $alert_id");
            } else {
                // Đánh dấu tất cả
                $conn->query("UPDATE alerts SET is_read = 1");
            }
            
            $response['success'] = true;
            $response['message'] = 'Đã cập nhật';
            break;
            
        case 'get_latest_readings':
            // Lấy số liệu mới nhất (cho real-time update)
            $result = $conn->query("SELECT pd.*, d.device_name, d.device_type, d.location
                                   FROM power_data pd
                                   JOIN devices d ON pd.device_id = d.id
                                   WHERE (pd.device_id, pd.recorded_at) IN (
                                       SELECT device_id, MAX(recorded_at)
                                       FROM power_data
                                       GROUP BY device_id
                                   )
                                   ORDER BY d.id");
            
            $readings = [];
            while ($row = $result->fetch_assoc()) {
                $readings[] = $row;
            }
            
            $response['success'] = true;
            $response['data'] = $readings;
            break;
            
        case 'add_simulated_data':
            // Thêm dữ liệu mô phỏng (để test)
            $device_id = $_POST['device_id'] ?? 1;
            
            // Kiểm tra thiết bị có đang bật không
            $result = $conn->query("SELECT status, power_rating FROM devices WHERE id = $device_id");
            if ($result->num_rows > 0) {
                $device = $result->fetch_assoc();
                
                if ($device['status'] === 'on') {
                    $voltage = 220 + rand(-5, 5);
                    $power = $device['power_rating'] * (0.8 + rand(0, 20) / 100);
                    $current = $power / $voltage;
                    $energy = $power / 1000 / 60; // kWh cho 1 phút
                    
                    $stmt = $conn->prepare("INSERT INTO power_data (device_id, voltage, current, power, energy, power_factor, frequency) 
                                           VALUES (?, ?, ?, ?, ?, ?, ?)");
                    $pf = 0.95;
                    $freq = 50.0;
                    $stmt->bind_param("idddddd", $device_id, $voltage, $current, $power, $energy, $pf, $freq);
                    $stmt->execute();
                    
                    // Kiểm tra cảnh báo
                    if ($voltage > 250) {
                        $conn->query("INSERT INTO alerts (device_id, alert_type, message, severity) 
                                     VALUES ($device_id, 'overvoltage', 'Điện áp vượt quá mức cho phép: {$voltage}V', 'high')");
                    }
                }
            }
            
            $response['success'] = true;
            $response['message'] = 'Đã thêm dữ liệu';
            break;
            
        default:
            throw new Exception('Action không hợp lệ');
    }
    
} catch (Exception $e) {
    $response['success'] = false;
    $response['message'] = $e->getMessage();
}

$conn->close();
echo json_encode($response);
?>
