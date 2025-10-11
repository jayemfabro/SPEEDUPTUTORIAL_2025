<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Http\Controllers\Admin\AdminClassController;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class TestBulkDelete extends Command
{
    protected $signature = 'test:bulk-delete';
    protected $description = 'Test the bulk delete functionality to reproduce errors';

    public function handle()
    {
        $this->info('Testing bulk delete functionality...');

        try {
            // Create a mock admin user for testing
            $adminUser = User::where('role', 'admin')->first();
            if (!$adminUser) {
                $this->error('No admin user found in database');
                return;
            }

            // Set up authentication context
            Auth::login($adminUser);
            $this->info("Authenticated as admin: {$adminUser->name}");

            // Create a mock request
            $request = new Request();
            $request->setMethod('DELETE');
            $request->headers->set('Content-Type', 'application/json');
            $request->headers->set('Accept', 'application/json');
            
            // Add some test IDs (using actual existing IDs)
            $testIds = [20, 21]; // Using existing class IDs from database
            $request->merge(['class_ids' => $testIds]);

            $this->info("Testing bulk delete with IDs: " . implode(', ', $testIds));

            // Instantiate the controller
            $controller = new AdminClassController();

            // Call the bulk delete method
            $response = $controller->bulkDestroy($request);

            $this->info('Bulk delete completed successfully');
            $this->info('Response: ' . $response->getContent());

        } catch (\Exception $e) {
            $this->error('Exception occurred during bulk delete:');
            $this->error('Message: ' . $e->getMessage());
            $this->error('File: ' . $e->getFile());
            $this->error('Line: ' . $e->getLine());
            $this->error('Trace: ' . $e->getTraceAsString());
        }
    }
}