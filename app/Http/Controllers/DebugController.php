<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class DebugController extends Controller
{
    public function checkProfilePhoto()
    {
        $user = Auth::user();
        
        return [
            'user_id' => $user->id,
            'name' => $user->name,
            'profile_photo_path' => $user->profile_photo_path,
            'profile_photo_url' => $user->profile_photo_url,
            'image' => $user->image,
            'storage_exists' => $user->profile_photo_path ? Storage::disk('public')->exists($user->profile_photo_path) : false,
            'full_path' => $user->profile_photo_path ? Storage::disk('public')->path($user->profile_photo_path) : null,
        ];
    }
}