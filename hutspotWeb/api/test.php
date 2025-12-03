<?php
/**
 * Database Connection Test
 * Run this file to check if database is working
 * URL: http://localhost/testoutUI/api/test.php
 */

header('Content-Type: application/json');

echo "<h1>HutSpot Database Connection Test</h1>";
echo "<hr>";

// Test 1: Check if PDO MySQL extension is loaded
echo "<h2>1. PHP PDO MySQL Extension</h2>";
if (extension_loaded('pdo_mysql')) {
    echo "<p style='color: green;'>✅ PDO MySQL extension is loaded</p>";
} else {
    echo "<p style='color: red;'>❌ PDO MySQL extension is NOT loaded</p>";
    exit;
}

// Test 2: Try to connect to database
echo "<h2>2. Database Connection</h2>";
try {
    $conn = new PDO(
        "mysql:host=localhost;dbname=hutspot_db;charset=utf8mb4",
        "root",
        "",
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    echo "<p style='color: green;'>✅ Successfully connected to 'hutspot_db' database</p>";
} catch(PDOException $e) {
    echo "<p style='color: red;'>❌ Connection failed: " . $e->getMessage() . "</p>";
    echo "<p><strong>Make sure you have:</strong></p>";
    echo "<ol>";
    echo "<li>Started MySQL in XAMPP Control Panel</li>";
    echo "<li>Created 'hutspot_db' database in phpMyAdmin</li>";
    echo "</ol>";
    exit;
}

// Test 3: Check if tables exist
echo "<h2>3. Database Tables</h2>";
$tables = ['users', 'bookings', 'payments', 'admin_users'];
$stmt = $conn->query("SHOW TABLES");
$existingTables = $stmt->fetchAll(PDO::FETCH_COLUMN);

foreach ($tables as $table) {
    if (in_array($table, $existingTables)) {
        echo "<p style='color: green;'>✅ Table '$table' exists</p>";
    } else {
        echo "<p style='color: orange;'>⚠️ Table '$table' not found - run the SQL setup script</p>";
    }
}

// Test 4: Check admin user
echo "<h2>4. Admin User</h2>";
try {
    $stmt = $conn->query("SELECT username FROM admin_users LIMIT 1");
    $admin = $stmt->fetch();
    if ($admin) {
        echo "<p style='color: green;'>✅ Admin user exists: " . $admin['username'] . "</p>";
    } else {
        echo "<p style='color: orange;'>⚠️ No admin user found</p>";
    }
} catch(Exception $e) {
    echo "<p style='color: orange;'>⚠️ Could not check admin user</p>";
}

// Test 5: Count records
echo "<h2>5. Record Counts</h2>";
try {
    foreach (['bookings', 'payments', 'users'] as $table) {
        if (in_array($table, $existingTables)) {
            $count = $conn->query("SELECT COUNT(*) FROM $table")->fetchColumn();
            echo "<p>📊 $table: $count records</p>";
        }
    }
} catch(Exception $e) {
    echo "<p style='color: orange;'>Could not count records</p>";
}

echo "<hr>";
echo "<h2>✅ All Tests Complete!</h2>";
echo "<p>Your database is ready to use.</p>";
echo "<h3>API Endpoints:</h3>";
echo "<ul>";
echo "<li><strong>Bookings:</strong> /api/bookings.php</li>";
echo "<li><strong>Payments:</strong> /api/payments.php</li>";
echo "<li><strong>Auth:</strong> /api/auth.php?action=login|register|admin-login</li>";

echo "</ul>";
?>
