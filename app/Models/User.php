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
}
