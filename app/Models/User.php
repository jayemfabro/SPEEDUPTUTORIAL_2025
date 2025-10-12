<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

enum UserRole: string
{
    case ADMIN = 'admin';
    case TEACHER = 'teacher';

    /**
     * Get role label for display
     */
    public function label(): string
    {
        return match($this) {
            self::ADMIN => 'Administrator',
            self::TEACHER => 'Teacher',
        };
    }

    /**
     * Get permissions for the role
     */
    public function permissions(): array
    {
        return match($this) {
            self::ADMIN => [
                'manage_teachers',
                'manage_students',
                'manage_classes',
                'manage_system',
                'view_reports',
            ],
            self::TEACHER => [
                'manage_own_classes',
                'view_students',
                'manage_grades',
                'view_calendar',
            ],
        };
    }

    /**
     * Get all role values
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'first_name',
        'middle_name', 
        'last_name',
        'username',
        'email',
        'phone',
        'birthdate',
        'image',
        'password',
        'role',
        'status',
        'profile_photo_path',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];
    
    /**
     * The accessors to append to the model's array form.
     *
     * @var array<string>
     */
    protected $appends = [
        'profile_photo_url',
        'role_label',
        'permissions',
    ];

    /**
     * The model's default values for attributes.
     *
     * @var array
     */
    protected $attributes = [
        'status' => 'active',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'birthdate' => 'date',
            // 'role' => UserRole::class, // Temporarily commented out to fix data
        ];
    }

    /**
     * Get the user's full name.
     */
    public function getFullNameAttribute()
    {
        return trim($this->first_name . ' ' . $this->middle_name . ' ' . $this->last_name);
    }

    /**
     * Check if user is an admin.
     */
    public function isAdmin()
    {
        return $this->role === 'admin';
    }

    /**
     * Check if user is a teacher.
     */
    public function isTeacher()
    {
        return $this->role === 'teacher';
    }

    /**
     * Scope to get only teachers.
     */
    public function scopeTeachers($query)
    {
        return $query->where('role', 'teacher');
    }

    /**
     * Scope to get only admins.
     */
    public function scopeAdmins($query)
    {
        return $query->where('role', 'admin');
    }

    /**
     * Get user's role label
     */
    public function getRoleLabelAttribute()
    {
        return match($this->role) {
            'admin' => 'Administrator',
            'teacher' => 'Teacher',
            default => 'Unknown',
        };
    }

    /**
     * Get user's permissions
     */
    public function getPermissionsAttribute()
    {
        return match($this->role) {
            'admin' => [
                'manage_teachers',
                'manage_students',
                'manage_classes',
                'manage_system',
                'view_reports',
            ],
            'teacher' => [
                'manage_own_classes',
                'view_students',
                'manage_grades',
                'view_calendar',
            ],
            default => [],
        };
    }

    /**
     * Get all available roles
     */
    public static function getRoles()
    {
        return [
            'admin' => 'Administrator',
            'teacher' => 'Teacher',
        ];
    }
    
    /**
     * Get the URL for the user's profile photo.
     *
     * @return string
     */
    public function getProfilePhotoUrlAttribute()
    {
        if ($this->profile_photo_path) {
            return asset('storage/' . $this->profile_photo_path);
        }
        
        if ($this->image) {
            // Check if the image starts with 'http' or already contains 'storage'
            if (str_starts_with($this->image, 'http') || str_starts_with($this->image, '/')) {
                return asset($this->image);
            }
            
            // Otherwise, prepend 'storage/' to the path
            return asset('storage/' . $this->image);
        }
        
        // Default placeholder image
        return asset('Logo/SpeedUp.png');
    }
    
    /**
     * Get teacher's classes based on various filters
     *
     * @param string|null $status Optional status filter (Completed, Upcoming, Cancelled, etc.)
     * @param string|null $date Optional specific date filter (YYYY-MM-DD)
     * @param bool $includeStats Include statistical data in the response
     * @return \Illuminate\Database\Eloquent\Collection|\Illuminate\Support\Collection|array
     */
    public function getTeacherClasses($status = null, $date = null, $includeStats = false)
    {
        if (!$this->isTeacher()) {
            return collect();
        }
        
        // Base query to get the teacher's classes
        $query = \App\Models\Admin\ClassModel::where('teacher_id', $this->id);
        
        // Apply status filter if provided
        if ($status) {
            if ($status === 'Upcoming') {
                $query->whereDate('schedule', '>=', now()->format('Y-m-d'))
                      ->where(function($q) {
                          $q->where('status', '!=', 'Completed')
                            ->where('status', '!=', 'Cancelled');
                      });
            } else {
                $query->where('status', $status);
            }
        }
        
        // Apply date filter if provided
        if ($date) {
            $query->whereDate('schedule', $date);
        }
        
        // Get upcoming classes for statistics (separate query)
        $upcomingClassesQuery = \App\Models\Admin\ClassModel::where('teacher_id', $this->id)
            ->whereDate('schedule', '>=', now()->format('Y-m-d'))
            ->where(function($q) {
                $q->where('status', '!=', 'Completed')
                  ->where('status', '!=', 'Cancelled');
            });
        
        // Get the classes
        $classes = $query->with('student')->get();
        
        // Include statistics if requested
        if ($includeStats) {
            $totalClasses = $classes->count();
            $completedClasses = $classes->where('status', 'Completed')->count();
            $cancelledClasses = $classes->where('status', 'Cancelled')->count();
            
            // Count upcoming classes with separate query to catch future classes
            $upcomingClasses = $upcomingClassesQuery->count();
            
            $absences = $classes->filter(function($class) {
                return str_contains(strtolower($class->status), 'absent');
            })->count();
            
            // Get unique students - if no classes, return 0
            $uniqueStudents = $classes->isEmpty() ? 0 : $classes->pluck('student_name')->unique()->count();
            
            // For debugging purposes - log information
            \Illuminate\Support\Facades\Log::info('Teacher class stats', [
                'teacher_id' => $this->id,
                'teacher_name' => $this->name,
                'total_classes' => $totalClasses,
                'upcoming_classes' => $upcomingClasses,
                'unique_students' => $uniqueStudents,
                'absences' => $absences
            ]);
            
            return [
                'classes' => $classes,
                'stats' => [
                    'total_classes' => $totalClasses,
                    'completed_classes' => $completedClasses,
                    'cancelled_classes' => $cancelledClasses,
                    'upcoming_classes' => $upcomingClasses,
                    'absences' => $absences,
                    'unique_students' => $uniqueStudents
                ]
            ];
        }
        
        return $classes;
    }
    
    /**
     * Get teacher's dashboard statistics
     * 
     * @return array
     */
    public function getTeacherDashboardStats()
    {
        // Default values
        $defaultStats = [
            'total_students' => 0,
            'total_classes' => 0,
            'upcoming_classes' => 0,
            'total_absences' => 0,
            'totalStudents' => 0,
            'totalClasses' => 0,
            'teacherAbsences' => 0,
            'classesThisMonth' => 0
        ];
        
        if (!$this->isTeacher()) {
            return $defaultStats;
        }
        
        try {
            // Get unique students who have classes with this teacher
            $uniqueStudentsCount = \App\Models\Admin\ClassModel::where('teacher_id', $this->id)
                ->distinct('student_name')
                ->count('student_name');
            
            // Get total classes for this teacher
            $totalClasses = \App\Models\Admin\ClassModel::where('teacher_id', $this->id)
                ->count();
            
            // Get upcoming classes
            $upcomingClasses = \App\Models\Admin\ClassModel::where('teacher_id', $this->id)
                ->whereDate('schedule', '>=', now()->format('Y-m-d'))
                ->where(function($q) {
                    $q->where('status', '!=', 'Completed')
                      ->where('status', '!=', 'Cancelled');
                })
                ->count();
            
            // Get absences
            $absences = \App\Models\Admin\ClassModel::where('teacher_id', $this->id)
                ->where('status', 'like', '%Absent%')
                ->count();
            
            // Get this month's classes
            $currentMonth = \Carbon\Carbon::now()->month;
            $currentYear = \Carbon\Carbon::now()->year;
            $thisMonthClasses = \App\Models\Admin\ClassModel::where('teacher_id', $this->id)
                ->whereMonth('created_at', $currentMonth)
                ->whereYear('created_at', $currentYear)
                ->count();
            
            // Prepare return array with explicit integer conversion
            $stats = [
                // Use both naming conventions to ensure compatibility with both components
                'total_students' => (int) $uniqueStudentsCount,
                'total_classes' => (int) $totalClasses,
                'upcoming_classes' => (int) $upcomingClasses,
                'total_absences' => (int) $absences,
                
                // Dashboard.jsx format
                'totalStudents' => (int) $uniqueStudentsCount,
                'totalClasses' => (int) $totalClasses,
                'classesThisMonth' => (int) $thisMonthClasses,
                'teacherAbsences' => (int) $absences
            ];
            
            // Log the data we're returning for debugging
            \Illuminate\Support\Facades\Log::info('Teacher dashboard stats', [
                'teacher_id' => $this->id,
                'teacher_name' => $this->name,
                'stats' => $stats
            ]);
            
            return $stats;
            
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error calculating teacher stats: ' . $e->getMessage(), [
                'teacher_id' => $this->id,
                'teacher_name' => $this->name,
                'trace' => $e->getTraceAsString()
            ]);
            
            return $defaultStats;
        }
    }
}
