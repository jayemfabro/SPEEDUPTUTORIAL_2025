<?php

namespace App\Models\Admin;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'purchased_class_regular',
        'purchased_class_premium',
        'purchased_class_group',
        'completed',
        'cancelled',
        'free_classes',
        'free_class_consumed',
        'absent_w_ntc_counted',
        'absent_w_ntc_not_counted',
        'absent_without_notice',
        'class_left',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'purchased_class_regular' => 'integer',
        'purchased_class_premium' => 'integer',
        'purchased_class_group' => 'integer',
        'completed' => 'integer',
        'cancelled' => 'integer',
        'free_classes' => 'integer',
        'free_class_consumed' => 'integer',
        'absent_w_ntc_counted' => 'integer',
        'absent_w_ntc_not_counted' => 'integer',
        'absent_without_notice' => 'integer',
        'class_left' => 'integer',
    ];

    /**
     * The model's default values for attributes.
     *
     * @var array
     */
    protected $attributes = [
        'purchased_class_regular' => 0,
        'purchased_class_premium' => 0,
        'purchased_class_group' => 0,
        'completed' => 0,
        'cancelled' => 0,
        'free_classes' => 0,
        'free_class_consumed' => 0,
        'absent_w_ntc_counted' => 0,
        'absent_w_ntc_not_counted' => 0,
        'absent_without_notice' => 0,
        'class_left' => 0,
    ];
    
    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();
    }

    /**
     * Scope a query to filter students.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  string  $search
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeSearch($query, $search)
    {
        return $query->where(function ($query) use ($search) {
            $query->where('name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%")
                ->orWhere('phone', 'like', "%{$search}%")
                ->orWhere('grade', 'like', "%{$search}%");
        });
    }
}
