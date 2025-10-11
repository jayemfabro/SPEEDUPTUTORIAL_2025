<?php
require_once 'vendor/autoload.php';

// Test script to simulate browser bulk delete request exactly as the frontend would send it
$baseUrl = 'http://127.0.0.1:8000';

echo "=== Testing Bulk Delete with Browser-like Request ===\n\n";

// First, let's get a session and CSRF token by visiting the login page
echo "1. Getting session and CSRF token...\n";
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $baseUrl . '/login');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HEADER, true);
curl_setopt($ch, CURLOPT_COOKIEJAR, 'cookies.txt'); // Save cookies to file
curl_setopt($ch, CURLOPT_COOKIEFILE, 'cookies.txt'); // Load cookies from file
$loginPage = curl_exec($ch);
$loginHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "Login page HTTP Code: $loginHttpCode\n";

// Extract CSRF token from the login page
preg_match('/<meta name="csrf-token" content="([^"]+)"/', $loginPage, $matches);
$csrfToken = $matches[1] ?? '';
echo "CSRF Token: $csrfToken\n";

if (empty($csrfToken)) {
    echo "Could not get CSRF token, trying alternative method...\n";
    // Try the API endpoint
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $baseUrl . '/csrf-token');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HEADER, true);
    curl_setopt($ch, CURLOPT_COOKIEJAR, 'cookies.txt');
    curl_setopt($ch, CURLOPT_COOKIEFILE, 'cookies.txt');
    $response = curl_exec($ch);
    curl_close($ch);
    
    preg_match('/\{.*\}/', $response, $matches);
    $tokenData = json_decode($matches[0] ?? '{}', true);
    $csrfToken = $tokenData['csrf_token'] ?? '';
    echo "API CSRF Token: $csrfToken\n";
}

// Now try to login as admin (we need to be authenticated)
echo "\n2. Attempting to login as admin...\n";
$loginData = [
    'email' => 'admin@example.com', // Adjust this to your admin email
    'password' => 'password', // Adjust this to your admin password
    '_token' => $csrfToken
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $baseUrl . '/login');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HEADER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($loginData));
curl_setopt($ch, CURLOPT_COOKIEJAR, 'cookies.txt');
curl_setopt($ch, CURLOPT_COOKIEFILE, 'cookies.txt');
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, false); // Don't follow redirects
$loginResponse = curl_exec($ch);
$loginHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "Login HTTP Code: $loginHttpCode\n";

// Try the bulk delete request with existing class IDs
echo "\n3. Testing bulk delete API call...\n";
$bulkDeleteData = [
    'class_ids' => [11, 12, 13] // Using actual existing IDs
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $baseUrl . '/api/admin/classes/bulk-delete');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HEADER, true);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'DELETE');
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($bulkDeleteData));
curl_setopt($ch, CURLOPT_COOKIEJAR, 'cookies.txt');
curl_setopt($ch, CURLOPT_COOKIEFILE, 'cookies.txt');
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json',
    'X-CSRF-TOKEN: ' . $csrfToken,
    'X-Requested-With: XMLHttpRequest',
]);

$bulkResponse = curl_exec($ch);
$bulkHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

echo "Bulk Delete HTTP Code: $bulkHttpCode\n";
if ($curlError) {
    echo "CURL Error: $curlError\n";
}
echo "Response:\n$bulkResponse\n\n";

// Clean up
if (file_exists('cookies.txt')) {
    unlink('cookies.txt');
}

echo "Now check storage/logs/laravel.log for detailed error information.\n";