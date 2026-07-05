<?php

namespace App\Providers;

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
        // 1. Clone the default connection config to 'central'
        try {
            $defaultConn = config('database.default');
            $connConfig = config("database.connections.{$defaultConn}");
            config(["database.connections.central" => $connConfig]);
        } catch (\Exception $e) {
            // Config not set up
        }

        // Share null as default to prevent view variable errors
        view()->share('currentCompany', null);


    }

}
