<?php
require_once 'vendor/autoload.php';

use Illuminate\Http\Request;
use App\Http\Controllers\Admin\AdminClassController;
use Illuminate\Support\Facades\DB;

// Create a simple test to debug the bulk delete issue
echo "Testing Bulk Delete Functionality\n";

// Test 1: Check if we can create a request
$request = new Request();
$request->merge(['class_ids' => [1, 2, 3]]);

echo "Request created with class_ids: " . json_encode($request->get('class_ids')) . "\n";

// Test 2: Check if validation passes
try {
    $validated = $request->validate([
        'class_ids' => ['required', 'array', 'min:1'],
        'class_ids.*' => ['integer'],
    ]);
    echo "Validation passed\n";
} catch (Exception $e) {
    echo "Validation failed: " . $e->getMessage() . "\n";
}

echo "Test completed\n";
?>