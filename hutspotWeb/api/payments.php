<?php
/**
 * HutSpot Payments API
 * Handles all payment operations
 */

require_once 'config.php';
setCorsHeaders();

$conn = getConnection();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        if (isset($_GET['id'])) {
            $stmt = $conn->prepare("SELECT * FROM payments WHERE id = ?");
            $stmt->execute([$_GET['id']]);
            $payment = $stmt->fetch();
            
            if ($payment) {
                jsonResponse($payment);
            } else {
                jsonResponse(['error' => 'Payment not found'], 404);
            }
        } else {
            $sql = "SELECT p.*, b.customer_name, b.email 
                    FROM payments p 
                    LEFT JOIN bookings b ON p.booking_id = b.id 
                    WHERE 1=1";
            $params = [];
            
            if (isset($_GET['status'])) {
                $sql .= " AND p.status = ?";
                $params[] = $_GET['status'];
            }
            if (isset($_GET['booking_id'])) {
                $sql .= " AND p.booking_id = ?";
                $params[] = $_GET['booking_id'];
            }
            
            $sql .= " ORDER BY p.created_at DESC";
            
            $stmt = $conn->prepare($sql);
            $stmt->execute($params);
            jsonResponse($stmt->fetchAll());
        }
        break;
        
    case 'POST':
        $data = getJsonInput();
        
        if (!$data) {
            jsonResponse(['error' => 'Invalid JSON data'], 400);
        }
        
        // Use provided ID or generate new one
        $id = $data['id'] ?? ('PAY' . time());
        
        // Check if payment already exists
        $checkStmt = $conn->prepare("SELECT id FROM payments WHERE id = ?");
        $checkStmt->execute([$id]);
        if ($checkStmt->fetch()) {
            jsonResponse(['success' => true, 'message' => 'Payment already exists', 'id' => $id]);
        }
        
        $sql = "INSERT INTO payments (
            id, booking_id, amount, down_payment, remaining_balance,
            payment_method, payment_proof, payment_proof_image, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        $stmt = $conn->prepare($sql);
        $result = $stmt->execute([
            $id,
            $data['bookingId'] ?? '',
            $data['amount'] ?? 0,
            $data['downPayment'] ?? 0,
            $data['remainingBalance'] ?? 0,
            $data['paymentMethod'] ?? 'GCash',
            $data['paymentProof'] ?? '',
            $data['paymentProofImage'] ?? '',
            'pending'
        ]);
        
        if ($result) {
            jsonResponse(['success' => true, 'id' => $id], 201);
        } else {
            jsonResponse(['error' => 'Failed to create payment'], 500);
        }
        break;
        
    case 'PUT':
        $data = getJsonInput();
        
        if (!isset($_GET['id'])) {
            jsonResponse(['error' => 'Payment ID required'], 400);
        }
        
        $id = $_GET['id'];
        
        // Update payment status
        if (isset($data['status'])) {
            $sql = "UPDATE payments SET status = ?, payment_date = NOW() WHERE id = ?";
            $stmt = $conn->prepare($sql);
            $result = $stmt->execute([$data['status'], $id]);
            
            if ($result) {
                jsonResponse(['success' => true, 'message' => 'Payment updated successfully']);
            } else {
                jsonResponse(['error' => 'Failed to update payment'], 500);
            }
        } else {
            jsonResponse(['error' => 'Status field required'], 400);
        }
        break;
        
    default:
        jsonResponse(['error' => 'Method not allowed'], 405);
}
?>
