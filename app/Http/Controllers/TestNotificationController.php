<?php

namespace App\Http\Controllers;

use App\Services\NotificationService;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TestNotificationController extends Controller
{
    public function createTestNotification(Request $request)
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json(['error' => 'User not authenticated'], 401);
        }

        // Get the user role to determine what type of notification to send
        $role = $request->input('role', $user->role);
        
        if ($role === 'teacher') {
            // Create a test class assignment notification for teacher
            NotificationService::createClassAssignedNotification($user->id, [
                'id' => 999,
                'student_name' => 'Test Student',
                'class_type' => 'Regular',
                'start_time' => now()->addHour()->format('Y-m-d H:i:s'),
                'end_time' => now()->addHour()->addMinutes(30)->format('Y-m-d H:i:s'),
            ]);
            
            return response()->json([
                'message' => 'Test class assignment notification created for teacher',
                'type' => 'class_assigned'
            ]);
        } else {
            // Create a test admin notification
            NotificationService::createAdminNotification($user->id, 
                'Test Admin Notification',
                'This is a test notification for admin users to verify the notification system is working properly.',
                'test_notification',
                ['test' => true]
            );
            
            return response()->json([
                'message' => 'Test admin notification created',
                'type' => 'admin_notification'
            ]);
        }
    }

    public function createTeacherUpdateNotification(Request $request)
    {
        // Find all admin users
        $admins = User::where('role', 'admin')->get();
        $user = Auth::user();
        
        if (!$user) {
            return response()->json(['error' => 'User not authenticated'], 401);
        }

        foreach ($admins as $admin) {
            NotificationService::createAdminNotification(
                $admin->id,
                'Test: Teacher Updated Class',
                "Teacher {$user->name} updated a class status (this is a test notification)",
                'teacher_class_update',
                [
                    'class_id' => 999,
                    'teacher_name' => $user->name,
                    'teacher_id' => $user->id,
                    'student_name' => 'Test Student',
                    'old_status' => 'Valid for cancellation',
                    'new_status' => 'Completed',
                    'update_type' => 'status'
                ]
            );
        }

        return response()->json([
            'message' => 'Test teacher update notifications sent to all admins',
            'admin_count' => $admins->count()
        ]);
    }
}
