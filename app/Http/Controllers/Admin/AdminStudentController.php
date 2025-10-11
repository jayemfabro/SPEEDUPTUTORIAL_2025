<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Admin\ClassModel;
use App\Models\Admin\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AdminStudentController extends Controller
{
    /**
     * Display a listing of the students.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        try {
            $students = Student::all();
            return response()->json($students);
        } catch (\Exception $e) {
            Log::error('Error fetching students: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to fetch students',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Store a newly created student in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        try {
            $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:students,email',    
                'purchased_class_regular' => 'nullable|integer|min:0',
                'purchased_class_premium' => 'nullable|integer|min:0',
                'purchased_class_group' => 'nullable|integer|min:0',
                'class_left' => 'nullable|integer|min:0',
                'completed' => 'nullable|integer|min:0',
                'cancelled' => 'nullable|integer|min:0',
                'free_classes' => 'nullable|integer|min:0',
                'free_class_consumed' => 'nullable|integer|min:0',
                'absent_w_ntc_counted' => 'nullable|integer|min:0',
                'absent_w_ntc_not_counted' => 'nullable|integer|min:0',
                'absent_without_notice' => 'nullable|integer|min:0',
            ]);

            $studentData = [
                'name' => $request->input('name'),
                'email' => $request->input('email'),
                'purchased_class_regular' => (int) $request->input('purchased_class_regular', 0),
                'purchased_class_premium' => (int) $request->input('purchased_class_premium', 0),
                'purchased_class_group' => (int) $request->input('purchased_class_group', 0),
                'completed' => (int) $request->input('completed', 0),
                'cancelled' => 0, // Always start with 0
                'free_classes' => (int) $request->input('free_classes', 0),
                'free_class_consumed' => (int) $request->input('free_class_consumed', 0),
                'absent_w_ntc_counted' => (int) $request->input('absent_w_ntc_counted', 0),
                'absent_w_ntc_not_counted' => (int) $request->input('absent_w_ntc_not_counted', 0),
                'absent_without_notice' => (int) $request->input('absent_without_notice', 0),
            ];
            $totalPurchased = $studentData['purchased_class_regular'] + $studentData['purchased_class_premium'] + $studentData['purchased_class_group'];
            $studentData['class_left'] = max(0, $totalPurchased - $studentData['completed'] - $studentData['cancelled'] - $studentData['absent_w_ntc_counted']);

            $student = Student::create($studentData);
            return response()->json($student, 201);
        } catch (\Exception $e) {
            Log::error('Error creating student: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to create student',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified student in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        try {
            $student = Student::findOrFail($id);
            $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:students,email,' . $student->id,
                'purchased_class_regular' => 'nullable|integer|min:0',
                'purchased_class_premium' => 'nullable|integer|min:0',
                'purchased_class_group' => 'nullable|integer|min:0',
                'class_left' => 'nullable|integer|min:0',
                'completed' => 'nullable|integer|min:0',
                'cancelled' => 'nullable|integer|min:0',
                'free_classes' => 'nullable|integer|min:0',
                'free_class_consumed' => 'nullable|integer|min:0',
                'absent_w_ntc_counted' => 'nullable|integer|min:0',
                'absent_w_ntc_not_counted' => 'nullable|integer|min:0',
                'absent_without_notice' => 'nullable|integer|min:0',
            ]);

            $student->update($request->all());
            return response()->json($student);
        } catch (\Exception $e) {
            Log::error('Error updating student: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to update student',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified student from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        try {
            $student = Student::findOrFail($id);
            $student->delete();
            return response()->json(['message' => 'Student deleted successfully']);
        } catch (\Exception $e) {
            Log::error('Error deleting student: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to delete student',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update student stats based on class status (complete, cancelled, free class consumed)
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function updateClassStatus(Request $request, $id)
{
    try {
        $student = Student::findOrFail($id);
        $request->validate([
            'action' => 'required|in:complete,cancelled,free_class_consumed',
        ]);

        // Ensure all stats fields exist
        $student->class_left = $student->class_left ?? (int) $student->purchased_class;
        $student->completed = $student->completed ?? 0;
        $student->cancelled = $student->cancelled ?? 0;
        $student->free_classes = $student->free_classes ?? 0;
        $student->free_class_consumed = $student->free_class_consumed ?? 0;

        switch ($request->action) {
            case 'complete':
                if ($student->class_left > 0) {
                    $student->completed += 1;
                    $student->class_left -= 1;
                }
                break;

            case 'cancelled':
                // ❗ Do NOT subtract from class_left here
                $student->cancelled += 1;
                $student->free_classes += 1; // ✅ Earn free class
                break;

            case 'free_class_consumed':
                if ($student->free_classes > 0 && $student->class_left > 0) {
                    $student->free_class_consumed += 1;
                    $student->free_classes -= 1;
                    $student->class_left -= 1; // ✅ Consume a slot
                }
                break;
        }

        $student->save();
        return response()->json($student);
    } catch (\Exception $e) {
        Log::error('Error updating class status for student: ' . $e->getMessage());
        return response()->json([
            'error' => 'Failed to update class status',
            'message' => $e->getMessage()
        ], 500);
    }
}


    /**
     * Calculate student statistics dynamically based on class records.
     *
     * @param  string  $studentName
     * @return array
     */
    public function calculateStudentStats($studentName)
    {
        $decodedStudentName = urldecode($studentName);
        
        // Get the student record to get purchased_class amounts
        $student = Student::where('name', $decodedStudentName)->first();
        $purchasedClass = $student ? $student->purchased_class : 0;
        
        // Get all class records for this student
        $classes = ClassModel::where('student_name', $decodedStudentName)->get();
        
        $stats = [
            'purchased_class' => $purchasedClass,
            'purchased_class_regular' => $student ? $student->purchased_class_regular : 0,
            'purchased_class_premium' => $student ? $student->purchased_class_premium : 0,
            'purchased_class_group' => $student ? $student->purchased_class_group : 0,
            'completed' => 0,
            'cancelled' => 0,
            'absent_w_ntc_counted' => 0,
            'absent_w_ntc_not_counted' => 0,
            'absent_without_notice' => 0,
            'free_classes' => 0,
            'free_class_consumed' => 0,
            'class_left' => $purchasedClass
        ];
        
        // First pass: Count all the class statuses
        foreach ($classes as $class) {
            $status = strtolower((string) ($class->status ?? ''));
            
            // Debug logging to see what statuses we're processing
                Log::info('Processing class status', [
                    'student_name' => $decodedStudentName,
                    'original_status' => $class->status,
                    'lowercase_status' => $status,
                    'class_id' => $class->id
                ]);
            
            // Additional specific logging for absent statuses
            if ($status !== '' && strpos($status, 'absent') !== false) {
                Log::info('Found absent status', [
                    'student_name' => $decodedStudentName,
                    'original_status' => $class->status,
                    'lowercase_status' => $status,
                    'contains_not_counted' => strpos($status, 'not counted') !== false ? 'YES' : 'NO'
                ]);
            }
            
            if ($status === '') {
                Log::warning('Encountered class with empty status while calculating stats', [
                    'student' => $decodedStudentName,
                    'class_id' => $class->id,
                ]);
                continue;
            }

            switch ($status) {
                case 'completed':
                case 'completed (rg)':
                case 'completed (prm)':
                    $stats['completed']++;
                    Log::info('Incrementing completed', ['student' => $decodedStudentName, 'new_count' => $stats['completed']]);
                    break;
                    
                case 'cancelled':
                case 'cancelled (rg)':
                case 'cancelled (prm)':
                    $stats['cancelled']++; 
                    // Cancelled classes become free classes
                    $stats['free_classes']++; 
                    Log::info('Incrementing cancelled and free_classes', [
                        'student' => $decodedStudentName, 
                        'cancelled_count' => $stats['cancelled'],
                        'free_classes_count' => $stats['free_classes']
                    ]);
                    break;
                    
                //case 'valid for cancellation':
                   // $stats['cancelled']++; 
                    // Valid for cancellation does NOT give free classes yet
                    Log::info('Incrementing cancelled (valid for cancellation)', [
                        'student' => $decodedStudentName, 
                        'cancelled_count' => $stats['cancelled'],
                        'note' => 'No free class added - only valid for cancellation'
                    ]);
                    //break;
                    
                case 'absent with notice':
                case 'absent w/ntc counted':
                case 'absent w/ notice':
                    $stats['absent_w_ntc_counted']++;
                    Log::info('Incrementing absent_w_ntc_counted', ['student' => $decodedStudentName, 'new_count' => $stats['absent_w_ntc_counted']]);
                    break;
                    
                case 'absent w/ntc-not counted':
                case 'absent w/o notice':
                case 'absent w/ntc - not counted':
                case 'absent w/ntc not counted':
                case 'absent w/ ntc - not counted':
                case 'absent w/ ntc not counted':
                    $stats['absent_w_ntc_not_counted']++;
                    // Absent w/ntc-not counted classes become free classes
                    $stats['free_classes']++;
                    Log::info('Incrementing absent_w_ntc_not_counted and free_classes', [
                        'student' => $decodedStudentName, 
                        'matched_status' => $status,
                        'absent_w_ntc_not_counted_count' => $stats['absent_w_ntc_not_counted'],
                        'free_classes_count' => $stats['free_classes']
                    ]);
                    break;
                    
                case 'absent without notice':
                case 'absent without notice (rg)':
                case 'absent without notice (prm)':
                case 'Absent Without Notice':
                    $stats['absent_without_notice']++;
                    
                    // Decrement from the specific class type based on the class record
                    $classType = strtolower((string) ($class->class_type ?? ''));
                    if ($classType === 'regular') {
                        $stats['purchased_class_regular']--;
                    } elseif ($classType === 'premium') {
                        $stats['purchased_class_premium']--;
                    } elseif ($classType === 'group') {
                        $stats['purchased_class_group']--;
                    }
                    
                    Log::info('Processing absent without notice', [
                        'student' => $decodedStudentName, 
                        'matched_status' => $status,
                        'class_type' => $class->class_type,
                        'absent_without_notice_count' => $stats['absent_without_notice'],
                        'regular_count' => $stats['purchased_class_regular'],
                        'premium_count' => $stats['purchased_class_premium'],
                        'group_count' => $stats['purchased_class_group']
                    ]);
                    break;
                    
                case 'fc consumed':
                case 'free class consumed':
                case 'free class':
                    $stats['free_class_consumed']++;
                    Log::info('Incrementing free_class_consumed', ['student' => $decodedStudentName, 'new_count' => $stats['free_class_consumed']]);
                    break;
                    
                default:
                    Log::warning('Unhandled class status', [
                        'student' => $decodedStudentName,
                        'status' => $status,
                        'original_status' => $class->status
                    ]);
                    break;
            }
        }
        
        // Recalculate total purchased classes based on updated individual counts
        $totalPurchased = $stats['purchased_class_regular'] + $stats['purchased_class_premium'] + $stats['purchased_class_group'];
        $stats['purchased_class'] = $totalPurchased;
        
        // Calculate class_left = total_purchased - completed - free_class_consumed - absent_w_ntc_counted - absent_without_notice
        // absent_w_ntc_counted reduces class_left because it counts against purchased classes
        // absent_without_notice also reduces class_left because it consumes purchased classes
        $stats['class_left'] = $totalPurchased - $stats['completed'] - $stats['free_class_consumed'] - $stats['absent_w_ntc_counted'] - $stats['absent_without_notice'];
        
        // Calculate net remaining free classes = total earned - consumed
        // free_classes shows remaining available free classes (earned minus consumed)
        // free_class_consumed shows total free classes used
        $totalFreeClassesEarned = $stats['free_classes'];
        $stats['free_classes'] = max(0, $totalFreeClassesEarned - $stats['free_class_consumed']);
        
        Log::info('Final free class calculation', [
            'student' => $decodedStudentName,
            'total_earned' => $totalFreeClassesEarned,
            'consumed' => $stats['free_class_consumed'],
            'net_remaining' => $stats['free_classes']
        ]);
        
        // Ensure no negative values
        foreach ($stats as $key => $value) {
            $stats[$key] = max(0, $value);
        }
        
        return $stats;
    }

    /**
     * Get student statistics (calculates dynamically, doesn't save to database)
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  string  $studentName
     * @return \Illuminate\Http\Response
     */
    public function updateFromClassStatus(Request $request, $studentName)
    {
        try {
            $decodedStudentName = urldecode($studentName);
            
            Log::info('Calculating statistics for student', [
                'student_name' => $decodedStudentName
            ]);

            // Calculate statistics dynamically
            $stats = $this->calculateStudentStats($studentName);
            
            Log::info('Student statistics calculated', [
                'student_name' => $decodedStudentName,
                'stats' => $stats
            ]);
            
            // Update the student record in the database
            $student = Student::where('name', $decodedStudentName)->first();
            
            if ($student) {
                $student->update([
                    'purchased_class_regular' => $stats['purchased_class_regular'],
                    'purchased_class_premium' => $stats['purchased_class_premium'],
                    'purchased_class_group' => $stats['purchased_class_group'],
                    'completed' => $stats['completed'],
                    'cancelled' => $stats['cancelled'],
                    'free_classes' => $stats['free_classes'],
                    'free_class_consumed' => $stats['free_class_consumed'],
                    'absent_w_ntc_counted' => $stats['absent_w_ntc_counted'],
                    'absent_w_ntc_not_counted' => $stats['absent_w_ntc_not_counted'],
                    'absent_without_notice' => $stats['absent_without_notice'],
                    'class_left' => $stats['class_left'],
                    // Note: purchased_class total is calculated from the individual counts
                ]);
                
                Log::info('Student record updated in database', [
                    'student_name' => $decodedStudentName,
                    'student_id' => $student->id,
                    'updated_stats' => $stats
                ]);
            } else {
                Log::warning('Student not found for update', [
                    'student_name' => $decodedStudentName
                ]);
            }
            
            return response()->json([
                'success' => true,
                'student_name' => $decodedStudentName,
                'data' => $stats,
                'message' => 'Statistics calculated and student record updated successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error calculating student statistics: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to calculate student statistics',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all students with their calculated statistics
     *
     * @return \Illuminate\Http\Response
     */
    public function getStudentStats()
    {
        try {
            Log::info('Starting getStudentStats method');
            
            // Get all students from the students table to include basic info
            $students = Student::all();
            Log::info('Found students: ' . $students->count());

            $studentsWithStats = [];

            foreach ($students as $student) {
                Log::info('Processing student: ' . $student->name);
                
                try {
                    $stats = $this->calculateStudentStats($student->name);
                    Log::info('Stats calculated for ' . $student->name . ': ' . json_encode($stats));
                    
                    $studentsWithStats[] = [
                        'id' => $student->id,
                        'name' => $student->name,
                        'email' => $student->email,
                        'purchased_class' => $stats['purchased_class'],
                        'purchased_class_regular' => $stats['purchased_class_regular'],
                        'purchased_class_premium' => $stats['purchased_class_premium'],
                        'purchased_class_group' => $stats['purchased_class_group'],
                        'completed' => $stats['completed'],
                        'cancelled' => $stats['cancelled'],
                        'absent_w_ntc_counted' => $stats['absent_w_ntc_counted'],
                        'absent_w_ntc_not_counted' => $stats['absent_w_ntc_not_counted'],
                        'absent_without_notice' => $stats['absent_without_notice'],
                        'free_classes' => $stats['free_classes'],
                        'free_class_consumed' => $stats['free_class_consumed'],
                        'class_left' => $stats['class_left']
                    ];
                } catch (\Exception $e) {
                    Log::error('Error calculating stats for student ' . $student->name . ': ' . $e->getMessage());
                    // Continue with next student instead of failing completely
                    continue;
                }
            }

            Log::info('Returning ' . count($studentsWithStats) . ' students with stats');
            return response()->json($studentsWithStats);
        } catch (\Exception $e) {
            Log::error('Error fetching student statistics: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json([
                'error' => 'Failed to fetch student statistics',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
