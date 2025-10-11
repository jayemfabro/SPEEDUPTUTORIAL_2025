<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;
use App\Events\NotificationBroadcast;

class NotificationService
{
    public static function createClassAssignedNotification($teacherId, $classData)
    {
        $teacher = User::find($teacherId);
        if (!$teacher) return;

        $notification = Notification::create([
            'user_id' => $teacherId,
            'type' => 'class_assigned',
            'title' => 'New Class Assigned',
            'message' => "You have been assigned a new class with {$classData['student_name']} on " . 
                        date('M j, Y \a\t g:i A', strtotime($classData['start_time'])),
            'data' => [
                'class_id' => $classData['id'] ?? null,
                'student_name' => $classData['student_name'],
                'class_type' => $classData['class_type'],
                'start_time' => $classData['start_time'],
                'end_time' => $classData['end_time'],
            ],
        ]);

        // Broadcast the notification
        broadcast(new NotificationBroadcast($notification, $teacherId));
    }

    public static function createClassUpdatedNotification($teacherId, $classData, $changes = [])
    {
        $teacher = User::find($teacherId);
        if (!$teacher) return;

        $changeText = '';
        if (!empty($changes)) {
            $changesList = [];
            foreach ($changes as $field => $value) {
                $changesList[] = ucfirst(str_replace('_', ' ', $field));
            }
            $changeText = ' (' . implode(', ', $changesList) . ' updated)';
        }

        $notification = Notification::create([
            'user_id' => $teacherId,
            'type' => 'class_updated',
            'title' => 'Class Schedule Updated',
            'message' => "Your class with {$classData['student_name']} has been updated{$changeText}",
            'data' => [
                'class_id' => $classData['id'] ?? null,
                'student_name' => $classData['student_name'],
                'class_type' => $classData['class_type'],
                'start_time' => $classData['start_time'],
                'end_time' => $classData['end_time'],
                'changes' => $changes,
            ],
        ]);

        // Broadcast the notification
        broadcast(new NotificationBroadcast($notification, $teacherId));
    }

    public static function createClassCancelledNotification($teacherId, $classData)
    {
        $teacher = User::find($teacherId);
        if (!$teacher) return;

        $notification = Notification::create([
            'user_id' => $teacherId,
            'type' => 'class_cancelled',
            'title' => 'Class Cancelled',
            'message' => "Your class with {$classData['student_name']} on " . 
                        date('M j, Y \a\t g:i A', strtotime($classData['start_time'])) . " has been cancelled",
            'data' => [
                'class_id' => $classData['id'] ?? null,
                'student_name' => $classData['student_name'],
                'class_type' => $classData['class_type'],
                'start_time' => $classData['start_time'],
                'end_time' => $classData['end_time'],
            ],
        ]);

        // Broadcast the notification
        broadcast(new NotificationBroadcast($notification, $teacherId));
    }

    public static function createAdminNotification($adminId, $title, $message, $type = 'admin_notification', $data = [])
    {
        $admin = User::find($adminId);
        if (!$admin) return;

        $notification = Notification::create([
            'user_id' => $adminId,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'data' => $data,
        ]);

        // Broadcast the notification
        broadcast(new NotificationBroadcast($notification, $adminId));
    }

    public static function createGeneralNotification($userId, $title, $message, $type = 'general', $data = [])
    {
        $user = User::find($userId);
        if (!$user) return;

        $notification = Notification::create([
            'user_id' => $userId,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'data' => $data,
        ]);

        // Broadcast the notification
        broadcast(new NotificationBroadcast($notification, $userId));
    }
}
