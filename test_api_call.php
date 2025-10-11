<?php
require_once 'vendor/autoload.php';

// Test script to reproduce bulk delete API call
$baseUrl = 'http://127.0.0.1:8000';

// Get CSRF token
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $baseUrl . '/csrf-token');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HEADER, true);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "CSRF Token Request:\n";
echo "HTTP Code: $httpCode\n";
echo "Response:\n$response\n\n";

// Extract CSRF token and cookies
preg_match('/\{.*\}/', $response, $matches);
$tokenData = json_decode($matches[0] ?? '{}', true);
$csrfToken = $tokenData['csrf_token'] ?? '';

preg_match_all('/Set-Cookie: ([^;]+)/', $response, $cookieMatches);
$cookies = implode('; ', $cookieMatches[1] ?? []);

echo "CSRF Token: $csrfToken\n";
echo "Cookies: $cookies\n\n";

// Test bulk delete API call (this should trigger the 500 error)
$bulkDeleteData = [
    'ids' => [1, 2, 3] // Some test IDs
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $baseUrl . '/api/admin/classes/bulk-delete');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HEADER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($bulkDeleteData));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json',
    'X-CSRF-TOKEN: ' . $csrfToken,
    'X-Requested-With: XMLHttpRequest',
    'Cookie: ' . $cookies
]);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'DELETE');

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "Bulk Delete Request:\n";
echo "HTTP Code: $httpCode\n";
echo "Response:\n$response\n\n";

echo "Now check storage/logs/laravel.log for error details.\n";