<?php

namespace App\Http\Controllers;

use App\Models\Admin\Student;
use App\Models\Admin\ClassModel;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Display the dashboard with real statistics
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $stats = $user && $user->role === 'teacher' 
            ? $this->getDashboardStats($user->id)
            : $this->getDashboardStats();
        
        return Inertia::render('Dashboard', [
            'stats' => $stats
        ]);
    }

    /**
     * Get dashboard statistics API endpoint
     */
    public function getStats()
    {
        return response()->json($this->getDashboardStats());
    }

    /**
     * Get dashboard statistics for a specific teacher
     */
    public function getTeacherStats($teacherId)
    {
        $stats = $this->getDashboardStats($teacherId);
        
        return response()->json($stats);
    }

    /**
     * Calculate and return dashboard statistics
     */
    private function getDashboardStats($teacherId = null)
    {
        $currentMonth = Carbon::now()->month;
        $currentYear = Carbon::now()->year;
        $lastMonth = Carbon::now()->subMonth();

        if ($teacherId && $teacherId !== 'all') {
            // Get stats for specific teacher
            $totalStudents = $this->getStudentCountForTeacher($teacherId);
            $totalClasses = ClassModel::where('teacher_id', $teacherId)->count();
            $totalTeachers = 1; // Just the selected teacher
            
            $lastMonthStudents = $this->getStudentCountForTeacher($teacherId, $lastMonth);
            $lastMonthClasses = ClassModel::where('teacher_id', $teacherId)
                ->whereMonth('created_at', $lastMonth->month)
                ->whereYear('created_at', $lastMonth->year)
                ->count();
            
            $thisMonthClasses = ClassModel::where('teacher_id', $teacherId)
                ->whereMonth('created_at', $currentMonth)
                ->whereYear('created_at', $currentYear)
                ->count();
                
        } else {
            // Get overall stats
            $totalStudents = Student::count();
            $totalClasses = ClassModel::count();
            $totalTeachers = User::where('role', 'teacher')->count();
            
            $lastMonthStudents = Student::whereMonth('created_at', $lastMonth->month)
                ->whereYear('created_at', $lastMonth->year)
                ->count();
            
            $lastMonthClasses = ClassModel::whereMonth('created_at', $lastMonth->month)
                ->whereYear('created_at', $lastMonth->year)
                ->count();
            
            $thisMonthClasses = ClassModel::whereMonth('created_at', $currentMonth)
                ->whereYear('created_at', $currentYear)
                ->count();
        }
        
        // Count teacher absences based on cancelled classes
        $teacherAbsences = $this->getTeacherAbsences($teacherId);

        // Calculate percentage changes
        $studentGrowthPercentage = $this->calculateGrowthPercentage($totalStudents, $lastMonthStudents);
        
        // Get today's class statistics
        $todayCompleted = $this->getTodayClassStats($teacherId, 'completed');
        $todayAbsent = $this->getTodayClassStats($teacherId, 'absent');
        $todayWithNotice = $this->getTodayClassStats($teacherId, 'with_notice');
        $todayTotal = $todayCompleted + $todayAbsent + $todayWithNotice;

        // Get monthly class statistics
        $monthlyCompleted = $this->getMonthlyClassStats($teacherId, 'completed');
        $monthlyAbsent = $this->getMonthlyClassStats($teacherId, 'absent');
        $monthlyWithNotice = $this->getMonthlyClassStats($teacherId, 'with_notice');
        $monthlyNotCounted = $this->getMonthlyClassStats($teacherId, 'not_counted');
        $monthlyCancelled = $this->getMonthlyClassStats($teacherId, 'cancelled');
        $monthlyFreeClassNotConsumed = $this->getMonthlyClassStats($teacherId, 'free_class_not_consumed');
        $monthlyFreeClassConsumed = $this->getMonthlyClassStats($teacherId, 'free_class_consumed');
        $monthlyValidForCancellation = $this->getMonthlyClassStats($teacherId, 'valid_for_cancellation');

        return [
            'totalStudents' => $totalStudents,
            'totalClasses' => $totalClasses,
            'totalTeachers' => $totalTeachers,
            'studentGrowthPercentage' => $studentGrowthPercentage,
            'thisMonthClasses' => $thisMonthClasses,
            'lastMonthClasses' => $lastMonthClasses,
            'classesThisMonth' => $thisMonthClasses,
            'todayCompleted' => $todayCompleted,
            'todayAbsent' => $todayAbsent,
            'todayWithNotice' => $todayWithNotice,
            'todayTotal' => $todayTotal,
            'monthlyCompleted' => $monthlyCompleted,
            'monthlyAbsent' => $monthlyAbsent,
            'monthlyWithNotice' => $monthlyWithNotice,
            'monthlyNotCounted' => $monthlyNotCounted,
            'monthlyCancelled' => $monthlyCancelled,
            'monthlyFreeClassNotConsumed' => $monthlyFreeClassNotConsumed,
            'monthlyFreeClassConsumed' => $monthlyFreeClassConsumed,
            'monthlyValidForCancellation' => $monthlyValidForCancellation,
            'teacherAbsences' => $teacherAbsences,
        ];
    }

    /**
     * Get student count for a specific teacher
     * This is a rough estimation based on classes since we don't have a direct teacher-student relationship
     */
    private function getStudentCountForTeacher($teacherId, $date = null)
    {
        $query = ClassModel::where('teacher_id', $teacherId);
        
        if ($date) {
            $query = $query->whereMonth('created_at', $date->month)
                          ->whereYear('created_at', $date->year);
        }
        
        // Count unique students by name for this teacher
        return $query->distinct('student_name')->count('student_name');
    }

    /**
     * Get today's class statistics by status based on actual class data
     */
    private function getTodayClassStats($teacherId = null, $status = null)
    {
        $query = ClassModel::whereDate('schedule', Carbon::today());
        
        if ($teacherId && $teacherId !== 'all') {
            $query = $query->where('teacher_id', $teacherId);
        }
        
        if ($status === 'completed') {
            return $query->where('status', 'like', '%Completed%')->count();
        } elseif ($status === 'absent') {
            return $query->where('status', 'like', '%Absent%')->count();
        } elseif ($status === 'with_notice') {
            return $query->where('status', 'like', '%Absent w/ntc%')->count();
        }
        
        return $query->count();
    }

    /**
     * Get monthly class statistics by status based on actual class data
     */
    private function getMonthlyClassStats($teacherId = null, $status = null)
    {
        $currentMonth = Carbon::now()->month;
        $currentYear = Carbon::now()->year;
        
        $query = ClassModel::whereMonth('schedule', $currentMonth)
                          ->whereYear('schedule', $currentYear);
        
        if ($teacherId && $teacherId !== 'all') {
            $query = $query->where('teacher_id', $teacherId);
        }
        
        if ($status === 'completed') {
            return $query->where('status', 'like', '%Completed%')->count();
        } elseif ($status === 'absent') {
            return $query->where(function($q) {
                $q->where('status', 'like', '%Absent without notice%')
                  ->orWhere('status', 'like', '%Absent w/ntc-not counted%');
            })->count();
        } elseif ($status === 'with_notice') {
            return $query->where('status', 'like', '%Absent w/ntc counted%')->count();
        } elseif ($status === 'not_counted') {
            return $query->where('status', 'like', '%not counted%')->count();
        } elseif ($status === 'cancelled') {
            return $query->where('status', 'like', '%Cancelled%')->count();
        } elseif ($status === 'free_class_not_consumed') {
            return $query->where(function($q) {
                $q->where('status', 'like', '%FC not consumed%')
                  ->orWhere('status', 'like', '%Free Class%');
            })->count();
        } elseif ($status === 'free_class_consumed') {
            return $query->where('status', 'like', '%FC consumed%')->count();
        } elseif ($status === 'valid_for_cancellation') {
            return $query->where('status', 'like', '%Valid for Cancellation%')->count();
        }
        
        return $query->count();
    }

    /**
     * Calculate growth percentage
     */
    private function calculateGrowthPercentage($current, $previous)
    {
        if ($previous == 0) {
            return $current > 0 ? 100 : 0;
        }
        
        return round((($current - $previous) / $previous) * 100, 1);
    }
    
    /**
     * Count teacher absences based on cancelled classes
     * This method counts all classes with "Cancelled" status for the current month
     */
    private function getTeacherAbsences($teacherId = null)
    {
        $currentMonth = Carbon::now()->month;
        $currentYear = Carbon::now()->year;
        
        $query = ClassModel::whereMonth('schedule', $currentMonth)
                          ->whereYear('schedule', $currentYear)
                          ->where('status', 'like', '%Cancelled%');
                          
        if ($teacherId && $teacherId !== 'all') {
            $query->where('teacher_id', $teacherId);
        }
        
        return $query->count();
    }
}
