<?php
/**
 * HutSpot Authentication API
 * Handles user login/register
 */

require_once 'config.php';
setCorsHeaders();

$conn = getConnection();
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

if ($method !== 'POST') {
    jsonResponse(['error' => 'Method not allowed'], 405);
}

$data = getJsonInput();

switch ($action) {
    case 'register':
        // Register new user
        if (!isset($data['email']) || !isset($data['password'])) {
            jsonResponse(['error' => 'Email and password required'], 400);
        }
        
        // Check if email exists
        $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$data['email']]);
        if ($stmt->fetch()) {
            jsonResponse(['error' => 'Email already registered'], 400);
        }
        
        // Hash password
        $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);
        
        $sql = "INSERT INTO users (first_name, last_name, email, mobile, password) VALUES (?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $result = $stmt->execute([
            $data['firstName'] ?? '',
            $data['lastName'] ?? '',
            $data['email'],
            $data['mobile'] ?? '',
            $hashedPassword
        ]);
        
        if ($result) {
            $userId = $conn->lastInsertId();
            jsonResponse([
                'success' => true,
                'message' => 'Registration successful',
                'user' => [
                    'id' => $userId,
                    'email' => $data['email'],
                    'firstName' => $data['firstName'] ?? '',
                    'lastName' => $data['lastName'] ?? ''
                ]
            ], 201);
        } else {
            jsonResponse(['error' => 'Registration failed'], 500);
        }
        break;
        
    case 'login':
        // User login
        if (!isset($data['email']) || !isset($data['password'])) {
            jsonResponse(['error' => 'Email and password required'], 400);
        }
        
        $stmt = $conn->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$data['email']]);
        $user = $stmt->fetch();
        
        if ($user && password_verify($data['password'], $user['password'])) {
            unset($user['password']); // Don't send password back
            jsonResponse([
                'success' => true,
                'message' => 'Login successful',
                'user' => $user
            ]);
        } else {
            jsonResponse(['error' => 'Invalid email or password'], 401);
        }
        break;
        
    case 'admin-login':
        // Admin login
        if (!isset($data['username']) || !isset($data['password'])) {
            jsonResponse(['error' => 'Username and password required'], 400);
        }
        
        $stmt = $conn->prepare("SELECT * FROM admin_users WHERE username = ?");
        $stmt->execute([$data['username']]);
        $admin = $stmt->fetch();
        
        // For demo, check plain password (in production, use password_verify)
        if ($admin && $admin['password'] === $data['password']) {
            unset($admin['password']);
            jsonResponse([
                'success' => true,
                'message' => 'Admin login successful',
                'admin' => $admin
            ]);
        } else {
            jsonResponse(['error' => 'Invalid credentials'], 401);
        }
        break;
        
    default:
        jsonResponse(['error' => 'Invalid action. Use: register, login, or admin-login'], 400);
}
?>
