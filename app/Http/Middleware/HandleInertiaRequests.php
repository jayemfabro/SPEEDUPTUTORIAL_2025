<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $parentShare = parent::share($request);
        
        // Ensure parent::share returns an array
        if (!is_array($parentShare)) {
            // Log the issue or handle it appropriately
            \Log::error('Parent share is not an array', ['type' => gettype($parentShare)]);
            $parentShare = []; // Default to empty array to prevent errors
        }
        
        return [
            ...$parentShare,
            'auth' => [
                'user' => $request->user(),
            ],
        ];
    }
}
