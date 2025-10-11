<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;

class UpdateTeacherPhotos extends Command
{
    protected $signature = 'photos:update-teachers';
    protected $description = 'Update teacher profile photos to use profile_photo_path';

    public function handle()
    {
        $this->info('Updating teacher profile photos...');
        
        $teachers = User::where('role', 'teacher')
            ->whereNotNull('image')
            ->whereNull('profile_photo_path')
            ->get();
            
        $count = 0;
        
        foreach ($teachers as $teacher) {
            $teacher->profile_photo_path = $teacher->image;
            $teacher->save();
            $count++;
            
            $this->info("Updated photo for teacher: {$teacher->name}");
        }
        
        $this->info("Updated {$count} teacher profile photos.");
        
        return Command::SUCCESS;
    }
}