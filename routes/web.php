<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Admin\TeachersController;
use App\Http\Controllers\Admin\StudentController;
use App\Http\Controllers\Admin\ClassController;
use App\Http\Controllers\Admin\SettingsController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

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
    // Announcement data based on ID
    $announcements = [
        '1' => [
            'id' => 1,
            'title' => 'Summer Learning Program Registration Open!',
            'badge' => 'Featured',
            'date' => 'June 28, 2025',
            'location' => 'Speed Up Tutorial Center - Main Campus',
            'time' => '9:00 AM - 5:00 PM',
            'image' => 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=1050&q=80',
            'tags' => ['summer', 'learning', 'enrollment'],
            'content' => [
                'Enroll your child in our intensive summer learning program designed to bridge learning gaps and prepare them for the upcoming school year. Limited slots available!',
                'Our summer program offers a comprehensive curriculum covering mathematics, science, language arts, and critical thinking skills. Each student receives personalized attention with small class sizes and experienced instructors.',
                'The program runs for 8 weeks from July 1 to August 25, with flexible scheduling options to accommodate your family\'s summer plans. Students can attend 2-5 days per week, with morning or afternoon sessions available.',
                'Early registration discounts are available until June 30th. Secure your child\'s spot today and give them the academic advantage they deserve this summer!'
            ],
            'callToAction' => [
                'title' => 'Register for the Summer Learning Program',
                'description' => 'Spaces are limited and filling up quickly. Contact us today to secure your child\'s spot in our summer learning program.',
                'buttonText' => 'Register Now'
            ]
        ],
        '2' => [
            'id' => 2,
            'title' => 'New Premium Math Tutoring Package Available',
            'badge' => 'New',
            'date' => 'July 15, 2025',
            'image' => 'https://images.unsplash.com/photo-1577896851231-70ef18881754?ixlib=rb-4.0.3&auto=format&fit=crop&w=1050&q=80',
            'tags' => ['premium', 'math', 'tutoring'],
            'content' => [
                'Introducing our new Premium Math Tutoring Package with specialized instructors for advanced mathematics. Perfect for students aiming for excellence in competitive exams.',
                'Our premium package includes one-on-one sessions with expert math tutors who specialize in advanced topics including calculus, statistics, and competitive math preparation. Each tutor has extensive experience preparing students for math competitions and college entrance exams.',
                'Students will receive personalized learning plans, regular progress assessments, and access to our exclusive online math resources. The package also includes practice tests and targeted preparation for specific exams like SAT, ACT, or AP Mathematics.',
                'Whether your child is struggling with complex math concepts or looking to excel beyond the standard curriculum, our Premium Math Tutoring Package provides the specialized support they need to succeed.'
            ],
            'callToAction' => [
                'title' => 'Upgrade to Premium Math Tutoring',
                'description' => 'Give your child the advantage of specialized math instruction with our premium tutoring package.',
                'buttonText' => 'Learn More & Enroll'
            ]
        ],
        '3' => [
            'id' => 3,
            'title' => 'Back to School Special Discount',
            'badge' => 'Discount',
            'date' => 'August 5, 2025',
            'image' => 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?ixlib=rb-4.0.3&auto=format&fit=crop&w=1050&q=80',
            'tags' => ['discount', 'back-to-school', 'special'],
            'content' => [
                'Get 20% off on all tutoring packages when you register before September 1st. Prepare your child for academic success with our expert tutors.',
                'The new school year brings new challenges and opportunities. Our Back to School Special helps families prepare their children for success with discounted rates on all our regular tutoring services.',
                'This limited-time offer applies to all subject areas including mathematics, science, language arts, social studies, and foreign languages. Both individual and group tutoring sessions are eligible for the discount.',
                'In addition to the 20% discount, families who register for a full semester will receive a free academic assessment and personalized study plan to target their child\'s specific needs and goals.',
                'Don\'t miss this opportunity to invest in your child\'s education at a reduced rate. Contact us today to schedule a free consultation and learn how our tutoring services can support your child\'s academic journey.'
            ],
            'callToAction' => [
                'title' => 'Claim Your 20% Discount',
                'description' => 'Register before September 1st to take advantage of our Back to School Special offer.',
                'buttonText' => 'Claim Discount'
            ]
        ]
    ];
    
    // Return 404 if announcement not found
    if (!isset($announcements[$id])) {
        abort(404);
    }
    
    return Inertia::render('Announcement', [
        'announcement' => $announcements[$id]
    ]);
})->name('announcement.show');

    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

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
Route::middleware(['auth', 'verified'])->prefix('teacher')->name('teacher.')->group(function () {
    Route::get('/calendar', fn() => Inertia::render('Teacher/TeacherCalendar'))->name('calendar');
    Route::get('/daily-calendar', fn() => Inertia::render('Teacher/TeachersDailyCalendar'))->name('daily-calendar');
    Route::get('/classes', fn() => Inertia::render('Teacher/TeacherClasses'))->name('classes');
});

/*
|--------------------------------------------------------------------------
| Admin Web Routes
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', fn() => Inertia::render('Dashboard'))->name('dashboard');
    Route::get('/teachers', fn() => Inertia::render('Admin/Teachers'))->name('teachers');
    Route::get('/students', fn() => Inertia::render('Admin/Students'))->name('students');
    Route::get('/classes', fn() => Inertia::render('Admin/AdminClasses'))->name('classes');
    Route::get('/calendar', fn() => Inertia::render('Admin/AdminCalendar'))->name('calendar');
    Route::get('/daily-calendar', fn() => Inertia::render('Admin/AdminDailyCalendar'))->name('daily-calendar');
    Route::get('/promotional', fn() => Inertia::render('Admin/Promotional'))->name('promotional');
});

/*
|--------------------------------------------------------------------------
| Admin API Routes
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified'])->group(function () {
    Route::apiResource('/api/admin/teachers', TeachersController::class);
    Route::apiResource('/api/admin/students', StudentController::class);
    Route::apiResource('/api/admin/classes', ClassController::class);
    Route::apiResource('/api/admin/settings', SettingsController::class);
});

/*
|--------------------------------------------------------------------------
| Teacher API Routes
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified'])->group(function () {
    Route::apiResource('/api/teacher/calendar', 'TeacherCalendarController');
    Route::apiResource('/api/teacher/daily-calendar', 'TeacherDailyCalendarController');
    Route::apiResource('/api/teacher/classes', 'TeacherClassesController');
});
