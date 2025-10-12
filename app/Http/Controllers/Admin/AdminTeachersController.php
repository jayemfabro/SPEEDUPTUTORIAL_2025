<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\Rule;

class AdminTeachersController extends Controller
{
    /**
     * Display a listing of the teachers.
     */
    public function index()
    {
        try {
            Log::info('Fetching teachers from database');
            
            $teachers = User::teachers()
                ->select('id', 'first_name', 'middle_name', 'last_name', 'username', 'email', 'phone', 'birthdate', 'image', 'status', 'created_at')
                ->get()
                ->map(function ($teacher) {
                    $name = trim(($teacher->first_name ?? '') . ' ' . ($teacher->middle_name ?? '') . ' ' . ($teacher->last_name ?? ''));
                    
                    // Fetch class stats for this teacher
                    $classStats = \App\Models\Admin\ClassModel::where('teacher_id', $teacher->id)
                        ->selectRaw('
                            COUNT(*) as total_classes,
                            SUM(status = "Completed") as completed_classes,
                            SUM(status = "Cancelled") as cancelled_classes,
                            SUM(status = "FC consumed") as fc_consumed_classes,
                            SUM(status = "Absent w/ntc counted") as absent_w_ntc_counted,
                            SUM(status = "Absent w/ntc-not counted") as absent_w_ntc_not_counted
                        ')
                        ->first();
                    
                    return [
                        'id' => $teacher->id,
                        'name' => $name ?: 'Unknown',
                        'firstName' => $teacher->first_name,
                        'middleName' => $teacher->middle_name,
                        'lastName' => $teacher->last_name,
                        'username' => $teacher->username,
                        'email' => $teacher->email,
                        'phone' => $teacher->phone,
                        'birthdate' => $teacher->birthdate ? $teacher->birthdate->format('m/d/Y') : null,
                        'birthdateRaw' => $teacher->birthdate ? $teacher->birthdate->format('Y-m-d') : null,
                        'image' => $teacher->image ? asset('storage/' . $teacher->image) : null,
                        'status' => $teacher->status ?? 'active',
                        'total_classes' => $classStats->total_classes ?? 0,
                        'completed_classes' => $classStats->completed_classes ?? 0,
                        'cancelled_classes' => $classStats->cancelled_classes ?? 0,
                        'fc_consumed_classes' => $classStats->fc_consumed_classes ?? 0,
                        'absent_w_ntc_counted' => $classStats->absent_w_ntc_counted ?? 0,
                        'absent_w_ntc_not_counted' => $classStats->absent_w_ntc_not_counted ?? 0,
                    ];
                });

            Log::info('Found ' . $teachers->count() . ' teachers');
            
            return response()->json($teachers);
        } catch (\Exception $e) {
            Log::error('Error fetching teachers: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json(['error' => 'Failed to fetch teachers', 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Store a newly created teacher.
     */
    public function store(Request $request)
    {
        try {
            Log::info('Creating new teacher', $request->all());
            
            $validated = $request->validate([
                'firstName' => 'required|string|max:255',
                'middleName' => 'nullable|string|max:255',
                'lastName' => 'required|string|max:255',
                'username' => 'required|string|max:255|unique:users,username',
                'email' => 'required|email|max:255|unique:users,email',
                'phone' => 'nullable|string|max:20',
                'birthdate' => 'nullable|date',
                'password' => 'required|string|min:8',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
                'role' => 'nullable|in:admin,teacher',
            ]);

            Log::info('Validation passed', $validated);

            // Handle image upload
            if ($request->hasFile('image')) {
                $imagePath = $request->file('image')->store('teachers', 'public');
                $validated['image'] = $imagePath;
                $validated['profile_photo_path'] = $imagePath; // Also set profile_photo_path
            }

            // Hash the password
            $validated['password'] = Hash::make($validated['password']);

            // Map the frontend field names to database column names
            $name = trim(($validated['firstName'] ?? '') . ' ' . ($validated['middleName'] ?? '') . ' ' . ($validated['lastName'] ?? ''));
            $dbData = [
                'name' => $name ?: 'Unknown',
                'first_name' => $validated['firstName'],
                'middle_name' => $validated['middleName'] ?? null,
                'last_name' => $validated['lastName'],
                'username' => $validated['username'],
                'email' => $validated['email'],
                'phone' => $validated['phone'] ?? null,
                'birthdate' => $validated['birthdate'] ?? null,
                'password' => $validated['password'],
                'image' => $validated['image'] ?? null,
                'role' => 'teacher', // Set role as teacher
            ];

            Log::info('Creating user with data', $dbData);
            $teacher = User::create($dbData);
            Log::info('User created successfully', ['id' => $teacher->id]);
            
            Log::info('Teacher created successfully', ['id' => $teacher->id]);

            // Format response to match frontend expectations
            $name = trim(($teacher->first_name ?? '') . ' ' . ($teacher->middle_name ?? '') . ' ' . ($teacher->last_name ?? ''));
            
            $formattedTeacher = [
                'id' => $teacher->id,
                'name' => $name ?: 'Unknown',
                'firstName' => $teacher->first_name,
                'middleName' => $teacher->middle_name,
                'lastName' => $teacher->last_name,
                'username' => $teacher->username,
                'email' => $teacher->email,
                'phone' => $teacher->phone,
                'birthdate' => $teacher->birthdate ? $teacher->birthdate->format('m/d/Y') : null,
                'image' => $teacher->image ? asset('storage/' . $teacher->image) : null,
                'status' => 'active', // For status filtering
                // Note: password is intentionally excluded for security
            ];

            return response()->json([
                'message' => 'Teacher added successfully!',
                'teacher' => $formattedTeacher
            ], 201);
            
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation error creating teacher', [
                'errors' => $e->errors(),
                'input' => $request->all()
            ]);
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error creating teacher: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json([
                'message' => 'Failed to create teacher', 
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified teacher.
     */
    public function show(User $teacher)
    {
        if (!$teacher->isTeacher()) {
            return response()->json(['error' => 'User is not a teacher'], 404);
        }
        
        try {
            // Get teacher dashboard stats
            $dashboardStats = $teacher->getTeacherDashboardStats();
            
            // Get upcoming classes
            $upcomingClasses = \App\Models\Admin\ClassModel::where('teacher_id', $teacher->id)
                ->whereDate('schedule', '>=', now()->format('Y-m-d'))
                ->where(function($q) {
                    $q->where('status', '!=', 'Completed')
                    ->where('status', '!=', 'Cancelled');
                })
                ->with('student') // Include student relationship if needed
                ->orderBy('schedule')
                ->orderBy('time')
                ->limit(5)
                ->get()
                ->map(function($class) {
                    return [
                        'id' => $class->id,
                        'student_name' => $class->student_name,
                        'class_type' => $class->class_type,
                        'schedule' => $class->schedule,
                        'time' => $class->time,
                        'status' => $class->status,
                    ];
                });
            
            // Format the response to include both teacher details, stats and upcoming classes
            $teacherData = [
                'id' => $teacher->id,
                'name' => $teacher->getFullNameAttribute() ?: 'Unknown',
                'firstName' => $teacher->first_name,
                'middleName' => $teacher->middle_name,
                'lastName' => $teacher->last_name,
                'username' => $teacher->username,
                'email' => $teacher->email,
                'phone' => $teacher->phone,
                'birthdate' => $teacher->birthdate ? $teacher->birthdate->format('m/d/Y') : null,
                'birthdateRaw' => $teacher->birthdate ? $teacher->birthdate->format('Y-m-d') : null,
                'image' => $teacher->profile_photo_url,
                'status' => $teacher->status ?? 'active',
                'dashboardStats' => $dashboardStats,
                'upcomingClasses' => $upcomingClasses
            ];
            
            return response()->json($teacherData);
        } catch (\Exception $e) {
            \Log::error('Error getting teacher details: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to retrieve teacher details',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified teacher.
     */
    public function update(Request $request, User $teacher)
    {
        try {
            Log::info('Updating teacher', ['id' => $teacher->id, 'input' => $request->all()]);
            
            $validated = $request->validate([
                'firstName' => 'required|string|max:255',
                'middleName' => 'nullable|string|max:255',
                'lastName' => 'required|string|max:255',
                'username' => ['required', 'string', 'max:255', Rule::unique('users')->ignore($teacher->id)],
                'email' => ['required', 'email', Rule::unique('users')->ignore($teacher->id)],
                'phone' => 'nullable|string|max:20',
                'birthdate' => 'required|date',
                'password' => 'nullable|string|min:8',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
                'role' => 'nullable|in:admin,teacher',
            ]);

            Log::info('Validation passed', $validated);

            // Handle image upload
            if ($request->hasFile('image')) {
                // Delete old image if exists
                if ($teacher->image) {
                    Storage::disk('public')->delete($teacher->image);
                }
                // Delete old profile photo if exists
                if ($teacher->profile_photo_path) {
                    Storage::disk('public')->delete($teacher->profile_photo_path);
                }
                
                $imagePath = $request->file('image')->store('teachers', 'public');
                $validated['image'] = $imagePath;
                $validated['profile_photo_path'] = $imagePath; // Also set profile_photo_path
            }

            // Map the frontend field names to database column names
            $name = trim(($validated['firstName'] ?? '') . ' ' . ($validated['middleName'] ?? '') . ' ' . ($validated['lastName'] ?? ''));
            $dbData = [
                'name' => $name ?: 'Unknown',
                'first_name' => $validated['firstName'],
                'middle_name' => $validated['middleName'] ?? null,
                'last_name' => $validated['lastName'],
                'username' => $validated['username'],
                'email' => $validated['email'],
                'phone' => $validated['phone'] ?? null,
                'birthdate' => $validated['birthdate'] ?? null,
                'role' => $validated['role'] ?? 'teacher',
                'status' => $teacher->status ?? 'active', // Keep existing status
            ];

            // Handle image if uploaded
            if (isset($validated['image'])) {
                $dbData['image'] = $validated['image'];
                $dbData['profile_photo_path'] = $validated['profile_photo_path']; // Also set profile_photo_path
            }

            // Hash password if provided
            if (!empty($validated['password'])) {
                $dbData['password'] = Hash::make($validated['password']);
            }

            $teacher->update($dbData);

            Log::info('Teacher updated successfully', ['id' => $teacher->id, 'name' => $teacher->name]);

            // Format response to match frontend expectations
            $teacher->fresh();
            $name = trim(($teacher->first_name ?? '') . ' ' . ($teacher->middle_name ?? '') . ' ' . ($teacher->last_name ?? ''));
            
            $formattedTeacher = [
                'id' => $teacher->id,
                'name' => $name ?: 'Unknown',
                'firstName' => $teacher->first_name,
                'middleName' => $teacher->middle_name,
                'lastName' => $teacher->last_name,
                'username' => $teacher->username,
                'email' => $teacher->email,
                'phone' => $teacher->phone,
                'birthdate' => $teacher->birthdate ? $teacher->birthdate->format('m/d/Y') : null,
                'birthdateRaw' => $teacher->birthdate ? $teacher->birthdate->format('Y-m-d') : null,
                'image' => $teacher->image ? asset('storage/' . $teacher->image) : null,
                'status' => $teacher->status ?? 'active',
            ];

            return response()->json([
                'message' => 'Teacher updated successfully!',
                'teacher' => $formattedTeacher
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation error updating teacher', [
                'teacher_id' => $teacher->id,
                'errors' => $e->errors(),
                'input' => $request->all()
            ]);
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error updating teacher: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json([
                'message' => 'Failed to update teacher', 
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified teacher.
     */
    public function destroy(User $teacher)
    {
        try {
            Log::info('Deleting teacher', ['id' => $teacher->id, 'name' => $teacher->name]);
            
            // Ensure we're only deleting teachers
            if (!$teacher->isTeacher()) {
                Log::warning('Attempted to delete non-teacher user', ['id' => $teacher->id, 'role' => $teacher->role]);
                return response()->json([
                    'message' => 'Can only delete teacher accounts'
                ], 403);
            }

            // Delete image if exists
            if ($teacher->image) {
                $imagePath = $teacher->image;
                if (Storage::disk('public')->exists($imagePath)) {
                    Storage::disk('public')->delete($imagePath);
                    Log::info('Deleted teacher image', ['path' => $imagePath]);
                }
            }

            // Delete the teacher record
            $teacherName = $teacher->name;
            $teacher->delete();
            
            Log::info('Teacher deleted successfully', ['name' => $teacherName]);

            return response()->json([
                'message' => 'Teacher deleted successfully!'
            ], 200);
            
        } catch (\Exception $e) {
            Log::error('Error deleting teacher: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json([
                'message' => 'Failed to delete teacher',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the status of a teacher (activate/deactivate).
     */
    public function updateStatus(Request $request, User $teacher)
    {
        try {
            Log::info('Updating teacher status', [
                'teacher_id' => $teacher->id,
                'current_status' => $teacher->status ?? 'active',
                'new_status' => $request->status,
                'request_data' => $request->all()
            ]);
            
            // Ensure we're only updating teachers
            if (!$teacher->isTeacher()) {
                Log::warning('Attempted to update status of non-teacher user', [
                    'id' => $teacher->id, 
                    'role' => $teacher->role
                ]);
                return response()->json([
                    'message' => 'Can only update teacher accounts'
                ], 403);
            }

            $validated = $request->validate([
                'status' => 'required|in:active,inactive',
            ]);

            // Check if status column exists in the table
            if (!Schema::hasColumn('users', 'status')) {
                Log::error('Status column does not exist in users table');
                return response()->json([
                    'message' => 'Status column not found. Please run migrations.',
                    'error' => 'Database schema not up to date'
                ], 500);
            }

            try {
                $teacher->update([
                    'status' => $validated['status']
                ]);
                
                Log::info('Teacher status updated successfully', [
                    'teacher_id' => $teacher->id,
                    'new_status' => $validated['status']
                ]);

                return response()->json([
                    'message' => "Teacher account {$validated['status']}d successfully!",
                    'teacher' => [
                        'id' => $teacher->id,
                        'status' => $teacher->status
                    ]
                ], 200);
            } catch (\Exception $e) {
                Log::error('Database error updating teacher status: ' . $e->getMessage());
                Log::error('Stack trace: ' . $e->getTraceAsString());
                return response()->json([
                    'message' => 'Failed to update teacher status in database',
                    'error' => $e->getMessage()
                ], 500);
            }
            
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation error updating teacher status', [
                'errors' => $e->errors(),
                'input' => $request->all()
            ]);
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error updating teacher status: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json([
                'message' => 'Failed to update teacher status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get active teachers for dropdown.
     */
    public function getActiveTeachers()
    {
        try {
            Log::info('Fetching active teachers for dropdown');
            
            $teachers = User::teachers()
                ->where('status', 'active')
                ->select('id', 'first_name', 'middle_name', 'last_name', 'image', 'email')
                ->get()
                ->map(function ($teacher) {
                    $name = trim(($teacher->first_name ?? '') . ' ' . ($teacher->middle_name ?? '') . ' ' . ($teacher->last_name ?? ''));
                    
                    return [
                        'id' => $teacher->id,
                        'name' => $name ?: 'Unknown',
                        'image' => $teacher->image ? asset('storage/' . $teacher->image) : null,
                        'email' => $teacher->email,
                    ];
                });

            Log::info('Found ' . $teachers->count() . ' active teachers');
            
            return response()->json($teachers);
        } catch (\Exception $e) {
            Log::error('Error fetching active teachers: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json(['error' => 'Failed to fetch teachers', 'message' => $e->getMessage()], 500);
        }
    }
}
