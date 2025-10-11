<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Admin\ClassModel;
use App\Services\NotificationService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class AdminClassController extends Controller
{
    /**
     * Display a listing of the classes.
     */
    public function index()
    {
        $classes = ClassModel::with('teacher')->get()->map(function ($class) {
            return [
                'id' => $class->id,
                'teacher_id' => $class->teacher_id,
                'teacher_name' => $class->teacher ? $class->teacher->name : null,
                'student_name' => $class->student_name,
                'class_type' => $class->class_type,
                'schedule' => $class->schedule,
                'time' => $class->time,
                'status' => $class->status,
                'created_at' => $class->created_at,
                'updated_at' => $class->updated_at
            ];
        });
        
        return response()->json($classes);
    }

    /**
     * Store a newly created class in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'teacher_id' => 'required|exists:users,id',
            'student_name' => 'required|string|max:255',
            'class_type' => 'required|string|max:50',
            'schedule' => 'required|date',
            'time' => 'required|string|max:50',
            'status' => 'required|string|max:50'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Check for time conflicts for Regular and Premium classes
        if (in_array(strtolower($request->class_type), ['regular', 'premium'])) {
            $existingClass = ClassModel::where('teacher_id', $request->teacher_id)
                ->where('schedule', $request->schedule)
                ->where('time', $request->time)
                ->where('status', '!=', 'Cancelled')
                ->first();

            if ($existingClass) {
                return response()->json([
                    'error' => 'Time slot unavailable',
                    'message' => "The selected time slot is already occupied by {$existingClass->student_name} for a {$existingClass->class_type} class. Please choose a different time or convert to a Group class if multiple students are intended.",
                    'conflicting_class' => [
                        'student_name' => $existingClass->student_name,
                        'class_type' => $existingClass->class_type,
                        'time' => $existingClass->time,
                        'schedule' => $existingClass->schedule
                    ]
                ], 409); // 409 Conflict status code
            }
        }
        // Note: Group classes are allowed to have multiple students at the same time slot

        $class = ClassModel::create($request->all());

        // Automatically update student statistics in database
        $this->updateStudentStatsInDatabase($class->student_name);

        // Send notification to the assigned teacher
        NotificationService::createClassAssignedNotification($request->teacher_id, [
            'id' => $class->id,
            'student_name' => $class->student_name,
            'class_type' => $class->class_type,
            'start_time' => $class->schedule . ' ' . $class->time,
            'end_time' => $class->schedule . ' ' . $class->time, // You may want to calculate actual end time
        ]);

        // Determine success message based on class type
        $message = 'Class created successfully';
        if (strtolower($request->class_type) === 'group') {
            $message = 'Group class created successfully - multiple students can be added to this time slot';
        }

        return response()->json([
            'message' => $message,
            'class' => $class
        ], 201);
    }

    /**
     * Display the specified class.
     */
    public function show($id)
    {
        $class = ClassModel::with('teacher')->findOrFail($id);
        
        return response()->json([
            'id' => $class->id,
            'teacher_id' => $class->teacher_id,
            'teacher_name' => $class->teacher ? $class->teacher->name : null,
            'student_name' => $class->student_name,
            'class_type' => $class->class_type,
            'schedule' => $class->schedule,
            'time' => $class->time,
            'status' => $class->status,
            'created_at' => $class->created_at,
            'updated_at' => $class->updated_at
        ]);
    }

    /**
     * Update the specified class in storage.
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'teacher_id' => 'required|exists:users,id',
            'student_name' => 'required|string|max:255',
            'class_type' => 'required|string|max:50',
            'schedule' => 'required|date',
            'time' => 'required|string|max:50',
            'status' => 'required|string|max:50'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $class = ClassModel::findOrFail($id);
        $originalData = $class->toArray(); // Store original data

        // Check for time conflicts for Regular and Premium classes (excluding current class)
        if (in_array(strtolower($request->class_type), ['regular', 'premium'])) {
            $existingClass = ClassModel::where('teacher_id', $request->teacher_id)
                ->where('schedule', $request->schedule)
                ->where('time', $request->time)
                ->where('status', '!=', 'Cancelled')
                ->where('id', '!=', $id) // Exclude current class from conflict check
                ->first();

            if ($existingClass) {
                return response()->json([
                    'error' => 'Time slot unavailable',
                    'message' => "The selected time slot is already occupied by {$existingClass->student_name} for a {$existingClass->class_type} class. Please choose a different time or convert to a Group class if multiple students are intended.",
                    'conflicting_class' => [
                        'student_name' => $existingClass->student_name,
                        'class_type' => $existingClass->class_type,
                        'time' => $existingClass->time,
                        'schedule' => $existingClass->schedule
                    ]
                ], 409); // 409 Conflict status code
            }
        }

        $class->update($request->all());

        // Add this line to trigger stats recalculation
        $this->updateStudentStatsInDatabase($class->student_name);

        // Send notification to the teacher if the class was updated
        $changes = array_diff_assoc($request->all(), $originalData);
        if (!empty($changes)) {
            NotificationService::createClassUpdatedNotification($request->teacher_id, [
                'id' => $class->id,
                'student_name' => $class->student_name,
                'class_type' => $class->class_type,
                'start_time' => $class->schedule . ' ' . $class->time,
                'end_time' => $class->schedule . ' ' . $class->time,
            ], $changes);
        }

        // Determine success message based on class type
        $message = 'Class updated successfully';
        if (strtolower($request->class_type) === 'group') {
            $message = 'Group class updated successfully - multiple students can be added to this time slot';
        }

        return response()->json([
            'message' => $message,
            'class' => $class
        ]);
    }

    /**
     * Remove the specified class from storage.
     */
    public function destroy($id)
    {
        try {
            $class = ClassModel::findOrFail($id);
            $studentName = $class->student_name; // Store student name before deletion
            $class->delete();

            // Automatically update student statistics in database after deletion
            $this->updateStudentStatsInDatabase($studentName);

            return response()->json([
                'message' => 'Class deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete class',
                'error' => $e->getMessage()
            ], 500);
        }
    }



    /**
     * Get classes for calendar view with optional teacher filter
     */
    public function getCalendarClasses(Request $request)
    {
        try {
            $query = ClassModel::with('teacher');
            
            // Filter by teacher if provided
            if ($request->has('teacher_id') && $request->teacher_id !== 'all') {
                $query->where('teacher_id', $request->teacher_id);
            }
            
            // Filter by date range if provided
            if ($request->has('start_date') && $request->has('end_date')) {
                $query->whereBetween('schedule', [$request->start_date, $request->end_date]);
            }
            
            $classes = $query->get()->map(function ($class) {
                // Transform the data to match calendar format
                $schedule = \Carbon\Carbon::parse($class->schedule);
                $dayName = $schedule->format('l'); // Monday, Tuesday, etc.
                
                return [
                    'id' => $class->id,
                    'student_name' => $class->student_name,
                    'teacher_id' => $class->teacher_id,
                    'teacher_name' => $class->teacher ? $class->teacher->name : null,
                    'day' => $dayName,
                    'time' => $class->time,
                    'duration' => 30, // Default duration, could be added to database
                    'class_type' => $class->class_type,
                    'status' => $class->status,
                    'date' => $schedule->toDateString(),
                    'schedule' => $class->schedule,
                ];
            });
            
            return response()->json($classes);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch classes', 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Update student statistics in database based on class records
     *
     * @param string|null $studentName
     * @return void
     */
    private function updateStudentStatsInDatabase($studentName)
    {
        if (empty($studentName)) {
            \Log::warning("Empty student name provided for stats update");
            return;
        }

        try {
            // Clean the student name by removing surrounding quotes if they exist
            $cleanStudentName = trim($studentName, '"');
            \Log::info("Looking up student", ['original_name' => $studentName, 'cleaned_name' => $cleanStudentName]);
            
            // Get the student record using cleaned name
            $student = \App\Models\Admin\Student::where('name', $cleanStudentName)->first();
            
            if (!$student) {
                \Log::warning("Student not found for auto-update", ['original_name' => $studentName, 'cleaned_name' => $cleanStudentName]);
                return;
            }

            // Use the AdminStudentController's calculation method with cleaned name
            $adminController = new \App\Http\Controllers\Admin\AdminStudentController();
            $calculatedStats = $adminController->calculateStudentStats($cleanStudentName);

            // Check if we have valid stats before updating
            if (!is_array($calculatedStats)) {
                \Log::warning("Invalid stats returned for student", ['student_name' => $cleanStudentName, 'original_name' => $studentName]);
                return;
            }

            // Ensure all required keys exist in the array to prevent null reference errors
            $requiredKeys = ['completed', 'cancelled', 'free_classes', 'free_class_consumed', 'absent_w_ntc_counted', 'class_left'];
            foreach ($requiredKeys as $key) {
                if (!isset($calculatedStats[$key])) {
                    $calculatedStats[$key] = 0;
                    \Log::warning("Missing stat key '{$key}' for student {$cleanStudentName}, defaulting to 0");
                }
            }

            // Update the student record with calculated values
            $student->update([
                'completed' => $calculatedStats['completed'],
                'cancelled' => $calculatedStats['cancelled'],
                'free_classes' => $calculatedStats['free_classes'],
                'free_class_consumed' => $calculatedStats['free_class_consumed'],
                'absent_w_ntc_counted' => $calculatedStats['absent_w_ntc_counted'],
                'class_left' => $calculatedStats['class_left']
            ]);

            \Log::info("Student stats automatically updated in database", [
                'student_name' => $studentName,
                'updated_stats' => $calculatedStats
            ]);

        } catch (\Exception $e) {
            \Log::error("Failed to auto-update student stats in database: " . $e->getMessage(), [
                'student_name' => $studentName,
                'exception_trace' => $e->getTraceAsString()
            ]);
        }
    }
}