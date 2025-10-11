<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Create admin user if it doesn't exist
        if (!User::where('email', 'admin@speeduptutorial.com')->exists()) {
            User::create([
                'name' => 'Admin User',
                'first_name' => 'Admin',
                'last_name' => 'User',
                'email' => 'admin@speeduptutorial.com',
                'username' => 'admin',
                'password' => Hash::make('Admin123!'), // Default password, should be changed after first login
                'email_verified_at' => now(),
                'role' => 'admin',
                'status' => 'active',
            ]);

            $this->command->info('Admin user created: admin@speeduptutorial.com / Admin123!');
        } else {
            $this->command->info('Admin user already exists.');
        }
    }
}