<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Disable preload tags to prevent browser warnings
        Vite::usePreloadTagAttributes(false);
        
        // Set a reasonable prefetch concurrency
        Vite::prefetch(concurrency: 2);
    }
}
