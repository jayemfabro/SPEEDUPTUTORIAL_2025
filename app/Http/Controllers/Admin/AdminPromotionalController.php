<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Admin\Promotional;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class AdminPromotionalController extends Controller
{
    public function index()
    {
        $posts = Promotional::latest()->get();
        
        return Inertia::render('Admin/Promotional', [
            'posts' => $posts
        ]);
    }

    public function store(Request $request)
    {
        try {
            $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'required|string',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
                'status' => 'required|in:active,inactive,draft',
                'expires_at' => 'nullable|date|after_or_equal:today',
            ]);

            $data = $request->only(['title', 'description', 'status', 'expires_at']);

            if ($request->hasFile('image')) {
                $image = $request->file('image');
                $filename = time() . '.' . $image->getClientOriginalExtension();
                $path = $image->storeAs('promotional', $filename, 'public');
                $data['image'] = '/storage/' . $path;
            }

            $post = Promotional::create($data);

            return response()->json([
                'message' => 'Promotional post created successfully!',
                'post' => $post
            ], 201);

        } catch (\Exception $e) {
            \Log::error('Error creating promotional post: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error creating promotional post: ' . $e->getMessage(),
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, Promotional $promotional)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'status' => 'required|in:active,inactive,draft',
            'expires_at' => 'nullable|date|after_or_equal:today',
        ]);

        $data = $request->only(['title', 'description', 'status', 'expires_at']);

        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($promotional->image && Storage::disk('public')->exists(str_replace('/storage/', '', $promotional->image))) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $promotional->image));
            }

            $image = $request->file('image');
            $filename = time() . '.' . $image->getClientOriginalExtension();
            $path = $image->storeAs('promotional', $filename, 'public');
            $data['image'] = '/storage/' . $path;
        }

        $promotional->update($data);

        return response()->json([
            'message' => 'Promotional post updated successfully!',
            'post' => $promotional
        ]);
    }

    public function destroy(Promotional $promotional)
    {
        // Delete image if exists
        if ($promotional->image && Storage::disk('public')->exists(str_replace('/storage/', '', $promotional->image))) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $promotional->image));
        }

        $promotional->delete();

        return response()->json([
            'message' => 'Promotional post deleted successfully!'
        ]);
    }

    public function toggleStatus(Request $request, Promotional $promotional)
    {
        $promotional->update([
            'status' => $promotional->status === 'active' ? 'inactive' : 'active'
        ]);

        return response()->json([
            'message' => 'Status updated successfully!',
            'post' => $promotional
        ]);
    }

    // Public method to get active posts for landing page
    public function getActivePosts()
    {
        try {
            $posts = Promotional::active()->notExpired()->latest()->get();
            
            // Add formatted date for each post
            $posts->transform(function($post) {
                // Format date as "Month DD, YYYY"
                $post->formatted_date = $post->created_at->format('F d, Y');
                
                // Add a badge based on content/type (you can customize this logic)
                // In your screenshot, you have FEATURED, NEW, and DISCOUNT badges
                if (stripos($post->title, 'discount') !== false) {
                    $post->badge = 'DISCOUNT';
                } elseif (stripos($post->title, 'new') !== false || $post->created_at->diffInDays(now()) < 14) {
                    $post->badge = 'NEW';
                } else {
                    $post->badge = 'FEATURED';
                }
                
                // Add tags based on title keywords (could be extended with a proper tag system)
                $post->tags = ['announcement'];
                
                return $post;
            });
            
            return response()->json($posts);
        } catch (\Exception $e) {
            \Log::error('Error fetching active promotional posts: ' . $e->getMessage());
            return response()->json([], 500);
        }
    }
}
