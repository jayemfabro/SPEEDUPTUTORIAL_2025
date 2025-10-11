<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Admin\Student;
use App\Models\Admin\ClassModel;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class ResetMonthlyStats extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'stats:reset-monthly';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Reset monthly statistics on the first day of each month';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting monthly statistics reset...');
        
        try {
            // Archive current month's data before reset
            $this->archiveCurrentMonthData();
            
            // Reset student statistics that are month-specific
            $this->resetStudentMonthlyStats();
            
            // Reset class statistics that are month-specific
            $this->resetClassMonthlyStats();
            
            // Log the reset activity
            Log::info('Monthly statistics reset completed successfully', [
                'date' => Carbon::now()->toDateTimeString(),
                'month' => Carbon::now()->format('Y-m')
            ]);
            
            $this->info('Monthly statistics reset completed successfully!');
            
        } catch (\Exception $e) {
            Log::error('Monthly statistics reset failed', [
                'error' => $e->getMessage(),
                'date' => Carbon::now()->toDateTimeString()
            ]);
            
            $this->error('Monthly statistics reset failed: ' . $e->getMessage());
            return 1;
        }
        
        return 0;
    }
    
    /**
     * Archive current month's data for historical reference
     */
    private function archiveCurrentMonthData()
    {
        $this->info('Archiving current month data...');
        
        // Create archive table if it doesn't exist
        \DB::statement('CREATE TABLE IF NOT EXISTS monthly_stats_archive (
            id INT AUTO_INCREMENT PRIMARY KEY,
            month VARCHAR(7) NOT NULL,
            total_students INT DEFAULT 0,
            total_classes INT DEFAULT 0,
            total_teachers INT DEFAULT 0,
            completed_classes INT DEFAULT 0,
            cancelled_classes INT DEFAULT 0,
            absent_classes INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )');
        
        $currentMonth = Carbon::now()->subMonth()->format('Y-m');
        $lastMonth = Carbon::now()->subMonth();
        
        // Calculate last month's statistics
        $totalStudents = Student::whereMonth('created_at', $lastMonth->month)
                               ->whereYear('created_at', $lastMonth->year)
                               ->count();
        
        $totalClasses = ClassModel::whereMonth('schedule', $lastMonth->month)
                                 ->whereYear('schedule', $lastMonth->year)
                                 ->count();
        
        $completedClasses = ClassModel::whereMonth('schedule', $lastMonth->month)
                                    ->whereYear('schedule', $lastMonth->year)
                                    ->where('status', 'like', '%Completed%')
                                    ->count();
        
        $cancelledClasses = ClassModel::whereMonth('schedule', $lastMonth->month)
                                    ->whereYear('schedule', $lastMonth->year)
                                    ->where('status', 'like', '%Cancelled%')
                                    ->count();
        
        $absentClasses = ClassModel::whereMonth('schedule', $lastMonth->month)
                                  ->whereYear('schedule', $lastMonth->year)
                                  ->where('status', 'like', '%Absent%')
                                  ->count();
        
        // Insert archive record
        \DB::table('monthly_stats_archive')->insert([
            'month' => $currentMonth,
            'total_students' => $totalStudents,
            'total_classes' => $totalClasses,
            'completed_classes' => $completedClasses,
            'cancelled_classes' => $cancelledClasses,
            'absent_classes' => $absentClasses,
            'created_at' => Carbon::now()
        ]);
        
        $this->info("Archived data for {$currentMonth}");
    }
    
    /**
     * Reset student monthly statistics
     */
    private function resetStudentMonthlyStats()
    {
        $this->info('Resetting student monthly statistics...');
        
        // Reset monthly counters for all students
        // Note: We're keeping cumulative data but resetting monthly-specific counters
        Student::query()->update([
            'completed' => 0,
            'cancelled' => 0,
            'absent_w_ntc_counted' => 0,
            'absent_w_ntc_not_counted' => 0,
            'absent_without_notice' => 0,
            'free_class_consumed' => 0,
        ]);
        
        $studentCount = Student::count();
        $this->info("Reset monthly stats for {$studentCount} students");
    }
    
    /**
     * Reset class monthly statistics
     */
    private function resetClassMonthlyStats()
    {
        $this->info('Resetting class monthly statistics...');
        
        // Option 1: Archive old classes and start fresh
        // Move classes older than current month to archive
        $currentMonth = Carbon::now()->month;
        $currentYear = Carbon::now()->year;
        
        $oldClasses = ClassModel::where(function($query) use ($currentMonth, $currentYear) {
            $query->whereMonth('schedule', '<', $currentMonth)
                  ->orWhere(function($q) use ($currentYear) {
                      $q->whereYear('schedule', '<', $currentYear);
                  });
        })->get();
        
        if ($oldClasses->count() > 0) {
            // Create archive table for classes if it doesn't exist
            \DB::statement('CREATE TABLE IF NOT EXISTS classes_archive (
                id INT AUTO_INCREMENT PRIMARY KEY,
                original_id INT,
                teacher_id BIGINT UNSIGNED,
                student_name VARCHAR(255),
                class_type VARCHAR(255),
                schedule DATE,
                time VARCHAR(255),
                status VARCHAR(255),
                completed INT DEFAULT 0,
                cancelled INT DEFAULT 0,
                class_left INT DEFAULT 0,
                free_classes INT DEFAULT 0,
                free_class_consumed INT DEFAULT 0,
                absent_w_ntc_counted INT DEFAULT 0,
                absent_w_ntc_not_counted INT DEFAULT 0,
                absent_without_notice INT DEFAULT 0,
                notes TEXT,
                original_created_at TIMESTAMP,
                original_updated_at TIMESTAMP,
                archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )');
            
            // Move old classes to archive
            foreach ($oldClasses as $class) {
                \DB::table('classes_archive')->insert([
                    'original_id' => $class->id,
                    'teacher_id' => $class->teacher_id,
                    'student_name' => $class->student_name,
                    'class_type' => $class->class_type,
                    'schedule' => $class->schedule,
                    'time' => $class->time,
                    'status' => $class->status,
                    'completed' => $class->completed,
                    'cancelled' => $class->cancelled,
                    'class_left' => $class->class_left,
                    'free_classes' => $class->free_classes,
                    'free_class_consumed' => $class->free_class_consumed,
                    'absent_w_ntc_counted' => $class->absent_w_ntc_counted,
                    'absent_w_ntc_not_counted' => $class->absent_w_ntc_not_counted,
                    'absent_without_notice' => $class->absent_without_notice,
                    'notes' => $class->notes,
                    'original_created_at' => $class->created_at,
                    'original_updated_at' => $class->updated_at,
                    'archived_at' => Carbon::now()
                ]);
            }
            
            // Delete archived classes from main table
            ClassModel::where(function($query) use ($currentMonth, $currentYear) {
                $query->whereMonth('schedule', '<', $currentMonth)
                      ->orWhere(function($q) use ($currentYear) {
                          $q->whereYear('schedule', '<', $currentYear);
                      });
            })->delete();
            
            $this->info("Archived and removed {$oldClasses->count()} old classes");
        }
    }
}