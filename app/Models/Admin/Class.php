<?php

namespace App\Models\Admin;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class ClassModel extends Model
{
    use HasFactory;
    
    protected $table = 'classes';
    
    protected $fillable = [
        'teacher_id',
        'student_name',
        'class_type',
        'schedule',
        'time',
        'status',
        'completed',
        'cancelled',
        'class_left',
        'free_classes',
        'free_class_consumed',
        'absent_w_ntc_counted'
    ];
    
    public function teacher()
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }
}