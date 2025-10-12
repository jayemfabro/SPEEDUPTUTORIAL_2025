<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Admin\AdminTeachersController;
use App\Http\Controllers\Admin\AdminStudentController;
use App\Http\Controllers\Admin\AdminClassController;
use App\Http\Controllers\Admin\StudentController;
use App\Http\Controllers\Admin\ClassController;
use App\Http\Controllers\Admin\AdminPromotionalController;
use Illuminate\Foundation\Application;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Broadcast;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Broadcasting Channels
|--------------------------------------------------------------------------
*/
// Broadcasting auth route
Broadcast::routes(['middleware' => ['web', 'auth']]);

// Broadcast channels
Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('notifications.{userId}', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

Route::get('/csrf-token', function () {
    return response()->json(['csrf_token' => csrf_token()]);
})->middleware(['web']);

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/inquiry', function () {
    return Inertia::render('Inquiry');
})->name('inquiry');

Route::get('/announcement/{id}', function ($id) {
    // Get the promotional post from database
    $promotional = \App\Models\Admin\Promotional::findOrFail($id);
    
    // Format data to match Announcement component expectations
    $announcement = [
        'id' => $promotional->id,
        'title' => $promotional->title,
        'badge' => 'Promotion',
        'date' => $promotional->created_at->format('F d, Y'),
        'image' => $promotional->image ?? 'https://placehold.co/600x400?text=No+Image',
        'tags' => ['promotion'],
        // Split description into paragraphs
        'content' => preg_split('/\r\n|\r|\n/', $promotional->description)
    ];
    
    if ($promotional->expires_at) {
        $announcement['badge'] = 'Limited Time';
        $announcement['expires_at'] = $promotional->expires_at->format('F d, Y');
        $announcement['tags'][] = 'limited-time';
    }
    
    return Inertia::render('Announcement', [
        'announcement' => $announcement
    ]);
})->name('announcement.show');

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

/*
|--------------------------------------------------------------------------
| Profile Routes
|--------------------------------------------------------------------------
*/
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';

/*
|--------------------------------------------------------------------------
| Teacher Web Routes
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified', 'role:teacher'])->prefix('teacher')->name('teacher.')->group(function () {
    Route::get('/calendar', fn() => Inertia::render('Teacher/TeacherCalendar'))->name('calendar');
    Route::get('/daily-calendar', fn() => Inertia::render('Teacher/TeachersDailyCalendar'))->name('daily-calendar');
});

/*
|--------------------------------------------------------------------------
| Teacher API Routes (CSRF Exempt)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified', 'role:teacher'])->prefix('api/teacher')->name('api.teacher.')->group(function () {
    Route::get('classes', [\App\Http\Controllers\Teacher\TeacherClassController::class, 'index'])->name('classes.index');
    Route::get('classes/calendar', [\App\Http\Controllers\Teacher\TeacherClassController::class, 'getCalendarClasses'])->name('classes.calendar');
    Route::patch('classes/{id}/status', [\App\Http\Controllers\Teacher\TeacherClassController::class, 'updateStatus'])->name('classes.status');
    Route::patch('classes/{id}/notes', [\App\Http\Controllers\Teacher\TeacherClassController::class, 'updateNotes'])->name('classes.notes');
    Route::patch('classes/{id}/update', [\App\Http\Controllers\Teacher\TeacherClassController::class, 'update'])->name('classes.update');
    
    // Share the same update method with the admin route
    Route::post('students/update-from-class/{studentName}', [AdminStudentController::class, 'updateFromClassStatus']);
});

/*
|--------------------------------------------------------------------------
| Admin Web Routes
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/teachers', fn() => Inertia::render('Admin/Teachers'))->name('teachers');
    Route::get('/teacher/{id}/overview', fn($id) => Inertia::render('Admin/TeacherOverview', ['teacherId' => $id]))->name('teacher.overview');
    Route::get('/students', fn() => Inertia::render('Admin/Students'))->name('students');
    Route::get('/classes', fn() => Inertia::render('Admin/AdminClasses'))->name('classes');
    Route::get('/calendar', fn() => Inertia::render('Admin/AdminCalendar'))->name('calendar');
    Route::get('/daily-calendar', fn() => Inertia::render('Admin/AdminDailyCalendar'))->name('daily-calendar');
    Route::get('/promotional', [AdminPromotionalController::class, 'index'])->name('promotional');
});

/*
|--------------------------------------------------------------------------
| Admin API Routes (Consolidated)
|--------------------------------------------------------------------------
*/
Route::middleware(['web', 'auth', 'verified', 'role:admin'])->prefix('api/admin')->name('api.admin.')->group(function () {
    // Teacher routes
    Route::apiResource('teachers', AdminTeachersController::class);
    Route::patch('teachers/{teacher}/status', [AdminTeachersController::class, 'updateStatus'])->name('teachers.status');
    Route::get('active-teachers', [AdminTeachersController::class, 'getActiveTeachers'])->name('teachers.active');
    Route::get('teachers/{id}/classes', function($id) {
        $teacher = \App\Models\User::findOrFail($id);
        if (!$teacher->isTeacher()) {
            return response()->json(['error' => 'User is not a teacher'], 404);
        }
        
        $classesWithStats = $teacher->getTeacherClasses(null, null, true);
        return response()->json($classesWithStats);
    })->name('teachers.classes');
    
    // Classes routes
    Route::apiResource('classes', AdminClassController::class);

    Route::get('calendar-classes', [AdminClassController::class, 'getCalendarClasses'])->name('classes.calendar');
    
    // Student routes - specific routes must come before apiResource
    Route::get('students/stats', function() {
        try {
            $students = \App\Models\Admin\Student::all();
            
            // Return database values since they're now automatically kept in sync
            return response()->json($students->map(function($student) {
                return [
                    'id' => $student->id,
                    'name' => $student->name,
                    'email' => $student->email,
                    'purchased_class' => $student->purchased_class ?? 0,
                    'completed' => $student->completed ?? 0,
                    'cancelled' => $student->cancelled ?? 0,
                    'free_classes' => $student->free_classes ?? 0,
                    'free_class_consumed' => $student->free_class_consumed ?? 0,
                    'absent_w_ntc_counted' => $student->absent_w_ntc_counted ?? 0,
                    'class_left' => $student->class_left ?? 0
                ];
            }));
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch student statistics',
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], 500);
        }
    })->name('students.stats');
    Route::post('students/{studentName}/update-stats', [AdminStudentController::class, 'updateFromClassStatus'])->name('students.update-stats');
    Route::post('students/update-from-class/{studentName}', [AdminStudentController::class, 'updateFromClassStatus']);
    Route::apiResource('students', AdminStudentController::class);
    
    // Dashboard stats routes
    Route::get('dashboard/stats', [DashboardController::class, 'getStats'])->name('dashboard.stats');
    Route::get('dashboard/stats/teacher/{teacherId}', [DashboardController::class, 'getTeacherStats'])->name('dashboard.teacher-stats');
    
    // Promotional posts routes
    Route::apiResource('promotional', AdminPromotionalController::class);
    Route::patch('promotional/{promotional}/toggle-status', [AdminPromotionalController::class, 'toggleStatus'])->name('promotional.toggle-status');
});

// Public API for promotional posts
Route::get('/api/promotional/active', [AdminPromotionalController::class, 'getActivePosts'])->name('api.promotional.active');

// Public announcements view route
Route::get('/announcements', function () {
    return Inertia::render('Announcements');
})->name('announcements');

// Redirect old route to new one
Route::get('/promotions', function () {
    return redirect()->route('announcements');
})->name('promotions');

/*
|--------------------------------------------------------------------------
| API Routes (Other)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->get('/api/user', function (Request $request) {
    return $request->user();
});

/*
|--------------------------------------------------------------------------
| Notification API Routes
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified'])->prefix('api/notifications')->name('api.notifications.')->group(function () {
    Route::get('/', [App\Http\Controllers\NotificationController::class, 'index'])->name('index');
    Route::post('{id}/read', [App\Http\Controllers\NotificationController::class, 'markAsRead'])->name('read');
    Route::post('read-all', [App\Http\Controllers\NotificationController::class, 'markAllAsRead'])->name('read-all');
    Route::get('unread-count', [App\Http\Controllers\NotificationController::class, 'getUnreadCount'])->name('unread-count');
    Route::delete('{id}', [App\Http\Controllers\NotificationController::class, 'destroy'])->name('delete');
});

/*
|--------------------------------------------------------------------------
| Additional Student API Routes
|--------------------------------------------------------------------------
*/
Route::middleware(['web', 'auth'])->prefix('api')->group(function () {
    Route::apiResource('students', \App\Http\Controllers\Admin\AdminStudentController::class);
});

