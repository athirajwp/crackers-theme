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

        // 2. Set SMTP mail config fallback if environment variables are not defined (e.g. on Render)
        if (empty(config('mail.mailers.smtp.username')) || config('mail.mailers.smtp.username') === 'null') {
            config([
                'mail.default' => 'smtp',
                'mail.mailers.smtp.transport' => 'smtp',
                'mail.mailers.smtp.host' => 'smtp.gmail.com',
                'mail.mailers.smtp.port' => 587,
                'mail.mailers.smtp.encryption' => 'tls',
                'mail.mailers.smtp.username' => 'athiraj.vnr@gmail.com',
                'mail.mailers.smtp.password' => 'qbvg pfmj urol tsvv',
                'mail.from.address' => 'athiraj.vnr@gmail.com',
                'mail.from.name' => 'Athiraj',
            ]);
        }

        // 3. Auto-correct Gmail SMTP settings for port 587/TLS compatibility (especially for Render)
        if (config('mail.mailers.smtp.host') === 'smtp.gmail.com') {
            if (config('mail.mailers.smtp.port') == 465 || empty(config('mail.mailers.smtp.encryption')) || config('mail.mailers.smtp.encryption') === 'ssl') {
                config([
                    'mail.mailers.smtp.port' => 587,
                    'mail.mailers.smtp.encryption' => 'tls',
                ]);
            }
        }
    }

}
