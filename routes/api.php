<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\AdminStudentController;
use App\Http\Controllers\Teacher\TeacherClassController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

/*
|--------------------------------------------------------------------------
| Teacher API Routes  
|--------------------------------------------------------------------------
*/
/*
|--------------------------------------------------------------------------
| Admin API Routes  
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    // Dashboard stats routes
    Route::get('dashboard/stats', [App\Http\Controllers\DashboardController::class, 'getStats'])->name('dashboard.stats');
    Route::get('dashboard/stats/teacher/{teacherId}', [App\Http\Controllers\DashboardController::class, 'getTeacherStats'])->name('dashboard.teacher-stats');
    Route::get('teachers', [App\Http\Controllers\Admin\AdminTeachersController::class, 'index'])->name('teachers.api');
});

/*
|--------------------------------------------------------------------------
| Teacher API Routes  
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified', 'role:teacher'])->prefix('teacher')->name('teacher.')->group(function () {
    Route::get('classes', [TeacherClassController::class, 'index'])->name('classes.index');
    Route::get('classes/calendar', [TeacherClassController::class, 'getCalendarClasses'])->name('classes.calendar');
    Route::patch('classes/{id}/status', [TeacherClassController::class, 'updateStatus'])->name('classes.status');
    Route::patch('classes/{id}/notes', [TeacherClassController::class, 'updateNotes'])->name('classes.notes');
    Route::patch('classes/{id}/update', [TeacherClassController::class, 'update'])->name('classes.update');
    
    // Share the same update method with the admin route
    Route::post('students/update-from-class/{studentName}', [AdminStudentController::class, 'updateFromClassStatus']);
});
