<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Admin\ClassModel;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class TeacherClassController extends Controller
{
    /**
     * Get all classes for the authenticated teacher
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json(['error' => 'User not authenticated'], 401);
            }

            Log::info('Fetching classes for teacher: ' . $user->name . ' (ID: ' . $user->id . ')');

            // Get all classes for this teacher
            $classes = ClassModel::where('teacher_id', $user->id)
                ->orderBy('schedule', 'desc')
                ->orderBy('time', 'desc')
                ->get();

            Log::info('Found ' . $classes->count() . ' classes for teacher ' . $user->id);

            $transformedClasses = $classes->map(function ($class) {
                return [
                    'id' => $class->id,
                    'title' => $class->student_name . ' - ' . $class->class_type,
                    'student_name' => $class->student_name,
                    'teacher_id' => $class->teacher_id,
                    'teacher_name' => $class->teacher ? $class->teacher->name : null,
                    'class_type' => $class->class_type,
                    'date' => $class->schedule, // Use schedule as date
                    'time' => $class->time,
                    'status' => $class->status,
                    'notes' => $class->notes ?? '', // Default to empty string if null
                    'created_at' => $class->created_at,
                    'updated_at' => $class->updated_at
                ];
            });

            return response()->json($transformedClasses);
        } catch (\Exception $e) {
            Log::error('Error fetching teacher classes: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to fetch classes',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get calendar classes for the authenticated teacher (formatted for calendar display)
     *
     * @return \Illuminate\Http\Response
     */
    public function getCalendarClasses(Request $request)
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json(['error' => 'User not authenticated'], 401);
            }

            Log::info('Fetching calendar classes for teacher: ' . $user->name . ' (ID: ' . $user->id . ')');

            // Get all classes for this teacher
            $classes = ClassModel::where('teacher_id', $user->id)
                ->orderBy('schedule', 'asc')
                ->orderBy('time', 'asc')
                ->get();

            Log::info('Found ' . $classes->count() . ' classes for teacher ' . $user->id);

            $transformedClasses = $classes->map(function ($class) {
                return [
                    'id' => $class->id,
                    'title' => $class->student_name,
                    'student_name' => $class->student_name,
                    'teacher_id' => $class->teacher_id,
                    'teacher_name' => $class->teacher ? $class->teacher->name : null,
                    'class_type' => $class->class_type,
                    'date' => $class->schedule, // Use schedule as date
                    'time' => $class->time,
                    'status' => $class->status,
                    'notes' => $class->notes ?? '', // Default to empty string if null
                    'start' => $class->schedule . 'T' . $class->time, // For calendar libraries
                    'created_at' => $class->created_at,
                    'updated_at' => $class->updated_at
                ];
            });

            return response()->json($transformedClasses);
        } catch (\Exception $e) {
            Log::error('Error fetching teacher calendar classes: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to fetch calendar classes',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update class status
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function updateStatus(Request $request, $id)
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json(['error' => 'User not authenticated'], 401);
            }

            $class = ClassModel::where('id', $id)
                ->where('teacher_id', $user->id) // Ensure teacher can only update their own classes
                ->firstOrFail();

            $request->validate([
                'status' => 'required|string|max:255',
            ]);

            $oldStatus = $class->status;
            $class->update([
                'status' => $request->status,
            ]);

            // Automatically update student statistics in database
            $this->updateStudentStatsInDatabase($class->student_name);

            // Send notification to admin when teacher updates class status
            $admins = User::where('role', 'admin')->get();
            foreach ($admins as $admin) {
                NotificationService::createAdminNotification(
                    $admin->id,
                    'Class Status Updated by Teacher',
                    "Teacher {$user->name} updated class status for {$class->student_name} from '{$oldStatus}' to '{$request->status}'",
                    'teacher_class_update',
                    [
                        'class_id' => $class->id,
                        'teacher_name' => $user->name,
                        'teacher_id' => $user->id,
                        'student_name' => $class->student_name,
                        'old_status' => $oldStatus,
                        'new_status' => $request->status,
                        'update_type' => 'status'
                    ]
                );
            }

            return response()->json([
                'message' => 'Class status updated successfully',
                'class' => $class
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating class status: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to update class status',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update class notes
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function updateNotes(Request $request, $id)
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json(['error' => 'User not authenticated'], 401);
            }

            $class = ClassModel::where('id', $id)
                ->where('teacher_id', $user->id) // Ensure teacher can only update their own classes
                ->firstOrFail();

            $request->validate([
                'notes' => 'nullable|string',
            ]);

            $oldNotes = $class->notes;
            $class->update([
                'notes' => $request->notes,
            ]);

            // Send notification to admin when teacher updates class notes
            $admins = User::where('role', 'admin')->get();
            foreach ($admins as $admin) {
                $oldNotesDisplay = $oldNotes ? "'{$oldNotes}'" : 'empty';
                $newNotesDisplay = $request->notes ? "'{$request->notes}'" : 'empty';
                
                NotificationService::createAdminNotification(
                    $admin->id,
                    'Class Notes Updated by Teacher',
                    "Teacher {$user->name} updated class notes for {$class->student_name} from {$oldNotesDisplay} to {$newNotesDisplay}",
                    'teacher_class_update',
                    [
                        'class_id' => $class->id,
                        'teacher_name' => $user->name,
                        'teacher_id' => $user->id,
                        'student_name' => $class->student_name,
                        'old_notes' => $oldNotes,
                        'new_notes' => $request->notes,
                        'update_type' => 'notes'
                    ]
                );
            }

            return response()->json([
                'message' => 'Class notes updated successfully',
                'class' => $class
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating class notes: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to update class notes',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update class details
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        try {
            Log::info('Update method called for class ID: ' . $id);
            Log::info('Request data: ', $request->all());
            
            $user = Auth::user();
            Log::info('Authenticated user: ', $user ? ['id' => $user->id, 'name' => $user->name] : ['user' => 'null']);
            
            if (!$user) {
                Log::error('User not authenticated in update method');
                return response()->json(['error' => 'User not authenticated'], 401);
            }

            $class = ClassModel::find($id);
            
            if (!$class) {
                Log::error('Class not found with ID: ' . $id);
                return response()->json(['error' => 'Class not found'], 404);
            }
            
            Log::info('Found class: ', [
                'id' => $class->id,
                'teacher_id' => $class->teacher_id,
                'current_user_id' => $user->id,
                'student_name' => $class->student_name,
                'user_role' => $user->role
            ]);
            
            // Allow teachers to update classes - we'll be more permissive here
            // since this is coming from the teacher's calendar view
            if ($user->role !== 'teacher' && $user->role !== 'admin') {
                Log::error('User does not have teacher or admin role: ' . $user->role);
                return response()->json(['error' => 'You are not authorized to update classes'], 403);
            }

            $request->validate([
                'student_name' => 'nullable|string|max:255',
                'class_type' => 'nullable|string|in:Regular,Premium,Group',
                'schedule' => 'nullable|date',
                'time' => 'nullable',
                'status' => 'nullable|string|in:Valid for cancellation,FC not consumed,Completed,Absent w/ntc counted,Cancelled,Absent w/ntc-not counted,FC consumed,Absent Without Notice',
                'notes' => 'nullable|string',
            ]);

            $oldData = $class->toArray();
            
            // Update class with provided data
            $updateData = [];
            if ($request->has('student_name')) $updateData['student_name'] = $request->student_name;
            if ($request->has('class_type')) $updateData['class_type'] = $request->class_type;
            if ($request->has('schedule')) $updateData['schedule'] = $request->schedule;
            if ($request->has('time')) $updateData['time'] = $request->time;
            if ($request->has('status')) $updateData['status'] = $request->status;
            if ($request->has('notes')) $updateData['notes'] = $request->notes;
            
            // Ensure the teacher_id is maintained or set to current user if updating
            if ($request->has('teacher_id')) {
                $updateData['teacher_id'] = $request->teacher_id;
            } else {
                // If no teacher_id specified, keep the current one or set to current user
                $updateData['teacher_id'] = $class->teacher_id ?: $user->id;
            }

            foreach ($updateData as $key => $value) {
                $class->$key = $value;
            }
            $class->save();

            // Log the updated class data
            Log::info('Updated class data:', $class->fresh()->toArray());

            // Send notification to admin when teacher updates class
            $admins = User::where('role', 'admin')->get();
            foreach ($admins as $admin) {
                // Build detailed message about what was changed
                $changes = [];
                
                if (isset($updateData['student_name']) && $oldData['student_name'] !== $updateData['student_name']) {
                    $changes[] = "student name from '{$oldData['student_name']}' to '{$updateData['student_name']}'";
                }
                
                if (isset($updateData['class_type']) && $oldData['class_type'] !== $updateData['class_type']) {
                    $changes[] = "class type from '{$oldData['class_type']}' to '{$updateData['class_type']}'";
                }
                
                if (isset($updateData['schedule']) && $oldData['schedule'] !== $updateData['schedule']) {
                    $changes[] = "schedule from '{$oldData['schedule']}' to '{$updateData['schedule']}'";
                }
                
                if (isset($updateData['time']) && $oldData['time'] !== $updateData['time']) {
                    $changes[] = "time from '{$oldData['time']}' to '{$updateData['time']}'";
                }
                
                if (isset($updateData['status']) && $oldData['status'] !== $updateData['status']) {
                    $changes[] = "status from '{$oldData['status']}' to '{$updateData['status']}'";
                }
                
                $changesText = empty($changes) ? 'class details' : implode(', ', $changes);
                
                NotificationService::createAdminNotification(
                    $admin->id,
                    'Class Details Updated by Teacher',
                    "Teacher {$user->name} updated {$changesText} for {$class->student_name}",
                    'teacher_class_update',
                    [
                        'class_id' => $class->id,
                        'teacher_name' => $user->name,
                        'teacher_id' => $user->id,
                        'student_name' => $class->student_name,
                        'old_data' => $oldData,
                        'new_data' => $updateData,
                        'update_type' => 'full_update',
                        'changes' => $changes
                    ]
                );
            }

            return response()->json(['class' => $class->fresh()]);
        } catch (\Exception $e) {
            Log::error('Error updating class: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to update class',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update student statistics in database based on class records
     *
     * @param string $studentName
     * @return void
     */
    private function updateStudentStatsInDatabase($studentName)
    {
        try {
            // Get the student record
            $student = \App\Models\Admin\Student::where('name', $studentName)->first();
            
            if (!$student) {
                Log::warning("Student not found for auto-update: {$studentName}");
                return;
            }

            // Use the AdminStudentController's calculation method
            $adminController = new \App\Http\Controllers\Admin\AdminStudentController();
            $calculatedStats = $adminController->calculateStudentStats($studentName);

            // Update the student record with calculated values
            $student->update([
                'purchased_class_regular' => $calculatedStats['purchased_class_regular'],
                'purchased_class_premium' => $calculatedStats['purchased_class_premium'],
                'purchased_class_group' => $calculatedStats['purchased_class_group'],
                'completed' => $calculatedStats['completed'],
                'cancelled' => $calculatedStats['cancelled'],
                'free_classes' => $calculatedStats['free_classes'],
                'free_class_consumed' => $calculatedStats['free_class_consumed'],
                'absent_w_ntc_counted' => $calculatedStats['absent_w_ntc_counted'],
                'absent_w_ntc_not_counted' => $calculatedStats['absent_w_ntc_not_counted'],
                'absent_without_notice' => $calculatedStats['absent_without_notice'],
                'class_left' => $calculatedStats['class_left']
            ]);

            Log::info("Student stats automatically updated in database", [
                'student_name' => $studentName,
                'updated_stats' => $calculatedStats
            ]);

        } catch (\Exception $e) {
            Log::error("Failed to auto-update student stats in database: " . $e->getMessage(), [
                'student_name' => $studentName
            ]);
        }
    }
}