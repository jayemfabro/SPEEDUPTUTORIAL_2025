<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class SelectivePreloadAssets
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);

        if (! $request->isMethod('GET') || ! $response->isSuccessful()) {
            return $response;
        }

        // Check the current route and only preload relevant assets
        $routeName = $request->route()->getName() ?? '';
        
        // Get preloaded assets from Vite manifest
        $preloadedAssets = $this->selectAssetsForRoute($routeName);

        if ($preloadedAssets->isNotEmpty()) {
            $this->addPreloadHeaders($response, $preloadedAssets);
        }

        return $response;
    }

    /**
     * Select which assets should be preloaded based on the current route.
     *
     * @param string $routeName
     * @return \Illuminate\Support\Collection
     */
    protected function selectAssetsForRoute($routeName)
    {
        // This is just the Vite manifest - we'll filter it based on the route
        $manifest = $this->getViteManifest();
        
        // If manifest can't be found, return empty collection
        if (!$manifest) {
            return collect();
        }

        // Get entry points based on the route
        $entryPoints = $this->getEntryPointsForRoute($routeName);

        // Filter manifest to only include assets we want to preload for this route
        return collect($manifest)
            ->filter(function ($asset, $file) use ($entryPoints) {
                // Only preload CSS files
                if (!Str::endsWith($file, '.css')) {
                    return false;
                }

                // Check if this asset belongs to one of our entry points
                foreach ($entryPoints as $entry) {
                    if (Str::contains($file, $entry)) {
                        return true;
                    }
                }

                return false;
            })
            ->map(function ($asset) {
                return asset('build/'.$asset['file']);
            });
    }

    /**
     * Get the entry points that should be preloaded for the current route.
     * 
     * @param string $routeName
     * @return array
     */
    protected function getEntryPointsForRoute($routeName)
    {
        // Get the current URL path to help determine what page we're on
        $path = request()->path();
        
        // Default to only loading core assets for all routes
        $entryPoints = ['vendor-ui', 'vendor-utils'];
        
        // Only preload admin-calendar assets when we're actually on the calendar page
        if ($routeName === 'admin.calendar' || $routeName === 'admin.daily-calendar' || Str::contains($path, 'admin/calendar') || Str::contains($path, 'admin/daily-calendar')) {
            $entryPoints[] = 'admin-core';
            // Only add admin-calendar if we're actually viewing the calendar page
            // This prevents unnecessary preloading when navigating to other pages
            if (request()->headers->get('Referer') && Str::contains(request()->headers->get('Referer'), 'admin/calendar')) {
                $entryPoints[] = 'admin-calendar';
            }
        } elseif ($routeName === 'admin.students' || $routeName === 'admin.teachers' || Str::contains($path, 'admin/students') || Str::contains($path, 'admin/teachers')) {
            $entryPoints[] = 'admin-core';
            $entryPoints[] = 'admin-users';
        } elseif ($routeName === 'teacher.calendar' || $routeName === 'teacher.daily-calendar' || Str::contains($path, 'teacher/calendar') || Str::contains($path, 'teacher/daily-calendar')) {
            $entryPoints[] = 'teacher-core';
            $entryPoints[] = 'teacher-calendar';
        }

        return $entryPoints;
    }

    /**
     * Get the Vite manifest.
     *
     * @return array|null
     */
    protected function getViteManifest()
    {
        $manifestPath = public_path('build/manifest.json');

        if (! file_exists($manifestPath)) {
            return null;
        }

        return json_decode(file_get_contents($manifestPath), true);
    }

    /**
     * Add preload headers to the response.
     *
     * @param \Symfony\Component\HttpFoundation\Response $response
     * @param \Illuminate\Support\Collection $preloadedAssets
     * @return void
     */
    protected function addPreloadHeaders($response, $preloadedAssets)
    {
        $preloadLinks = $preloadedAssets
            ->map(function ($url) {
                $type = Str::endsWith($url, '.css') ? 'style' : 'script';
                return "<{$url}>; rel=preload; as={$type}";
            })
            ->implode(',');

        if ($preloadLinks !== '') {
            $response->header('Link', $preloadLinks);
        }
    }
}