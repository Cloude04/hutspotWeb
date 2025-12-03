<?php
/**
 * HutSpot Bookings API
 * Handles all booking operations
 */

require_once 'config.php';
setCorsHeaders();

$conn = getConnection();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Get all bookings or single booking
        if (isset($_GET['id'])) {
            $stmt = $conn->prepare("SELECT * FROM bookings WHERE id = ?");
            $stmt->execute([$_GET['id']]);
            $booking = $stmt->fetch();
            
            if ($booking) {
                jsonResponse($booking);
            } else {
                jsonResponse(['error' => 'Booking not found'], 404);
            }
        } else {
            // Get all bookings with optional filters
            $sql = "SELECT * FROM bookings WHERE 1=1";
            $params = [];
            
            if (isset($_GET['status'])) {
                $sql .= " AND status = ?";
                $params[] = $_GET['status'];
            }
            if (isset($_GET['date'])) {
                $sql .= " AND event_date = ?";
                $params[] = $_GET['date'];
            }
            if (isset($_GET['email'])) {
                $sql .= " AND email = ?";
                $params[] = $_GET['email'];
            }
            
            $sql .= " ORDER BY created_at DESC";
            
            $stmt = $conn->prepare($sql);
            $stmt->execute($params);
            $bookings = $stmt->fetchAll();
            
            jsonResponse($bookings);
        }
        break;
        
    case 'POST':
        // Create new booking
        $data = getJsonInput();
        
        if (!$data) {
            jsonResponse(['error' => 'Invalid JSON data'], 400);
        }
        
        // Use provided ID or generate new one
        $id = $data['id'] ?? ('BK' . time());
        
        // Check if booking already exists
        $checkStmt = $conn->prepare("SELECT id FROM bookings WHERE id = ?");
        $checkStmt->execute([$id]);
        if ($checkStmt->fetch()) {
            jsonResponse(['success' => true, 'message' => 'Booking already exists', 'id' => $id]);
        }
        
        $sql = "INSERT INTO bookings (
            id, customer_name, email, phone, event_package, package_name,
            event_type, event_date, event_time, venue_name, number_of_guests,
            special_request, total_amount, down_payment, balance, status,
            payment_proof, payment_proof_image
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        $stmt = $conn->prepare($sql);
        $result = $stmt->execute([
            $id,
            $data['customerName'] ?? '',
            $data['email'] ?? '',
            $data['phone'] ?? '',
            $data['eventPackage'] ?? '',
            $data['packageName'] ?? '',
            $data['eventType'] ?? '',
            $data['eventDate'] ?? null,
            $data['eventTime'] ?? null,
            $data['venueName'] ?? '',
            $data['numberOfGuests'] ?? 0,
            $data['specialRequest'] ?? '',
            $data['totalAmount'] ?? 0,
            $data['downPayment'] ?? 0,
            $data['balance'] ?? 0,
            'pending',
            $data['paymentProof'] ?? '',
            $data['paymentProofImage'] ?? ''
        ]);
        
        if ($result) {
            jsonResponse(['success' => true, 'id' => $id, 'message' => 'Booking created successfully'], 201);
        } else {
            jsonResponse(['error' => 'Failed to create booking'], 500);
        }
        break;
        
    case 'PUT':
        // Update booking
        $data = getJsonInput();
        
        if (!isset($_GET['id'])) {
            jsonResponse(['error' => 'Booking ID required'], 400);
        }
        
        $id = $_GET['id'];
        $updates = [];
        $params = [];
        
        $allowedFields = [
            'customer_name' => 'customerName',
            'email' => 'email',
            'phone' => 'phone',
            'event_type' => 'eventType',
            'event_date' => 'eventDate',
            'event_time' => 'eventTime',
            'venue_name' => 'venueName',
            'number_of_guests' => 'numberOfGuests',
            'special_request' => 'specialRequest',
            'status' => 'status'
        ];
        
        foreach ($allowedFields as $dbField => $jsonField) {
            if (isset($data[$jsonField])) {
                $updates[] = "$dbField = ?";
                $params[] = $data[$jsonField];
            }
        }
        
        if (empty($updates)) {
            jsonResponse(['error' => 'No fields to update'], 400);
        }
        
        $params[] = $id;
        $sql = "UPDATE bookings SET " . implode(', ', $updates) . " WHERE id = ?";
        
        $stmt = $conn->prepare($sql);
        $result = $stmt->execute($params);
        
        if ($result) {
            jsonResponse(['success' => true, 'message' => 'Booking updated successfully']);
        } else {
            jsonResponse(['error' => 'Failed to update booking'], 500);
        }
        break;
        
    case 'DELETE':
        // Delete booking
        if (!isset($_GET['id'])) {
            jsonResponse(['error' => 'Booking ID required'], 400);
        }
        
        $stmt = $conn->prepare("DELETE FROM bookings WHERE id = ?");
        $result = $stmt->execute([$_GET['id']]);
        
        if ($result) {
            jsonResponse(['success' => true, 'message' => 'Booking deleted successfully']);
        } else {
            jsonResponse(['error' => 'Failed to delete booking'], 500);
        }
        break;
        
    default:
        jsonResponse(['error' => 'Method not allowed'], 405);
}
?>
