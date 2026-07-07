<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Company;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Artisan;

$defaultConn = config('database.default');

foreach (Company::all() as $company) {
    echo "=====================================\n";
    echo "Migrating Company: {$company->name} ({$company->code})\n";
    
    $tenantDb = 'crackers2_' . strtolower(preg_replace('/[^a-zA-Z0-9_]/', '', $company->code));
    echo "Database: {$tenantDb}\n";
    
    // Check if database exists
    $existsQuery = DB::select("SELECT 1 FROM information_schema.schemata WHERE schema_name = ?", [$tenantDb]);
    if (empty($existsQuery)) {
        echo "Database {$tenantDb} does not exist. Skipping.\n";
        continue;
    }
    
    // Switch connection database
    config(["database.connections.{$defaultConn}.database" => $tenantDb]);
    DB::purge($defaultConn);
    DB::reconnect($defaultConn);
    
    try {
        Artisan::call('migrate', [
            '--force' => true,
        ]);
        echo "Migrations output:\n" . Artisan::output() . "\n";
    } catch (\Exception $e) {
        echo "Error migrating {$tenantDb}: " . $e->getMessage() . "\n";
    }
}

// Restore default connection
config(["database.connections.{$defaultConn}.database" => 'railway']);
DB::purge($defaultConn);
DB::reconnect($defaultConn);

echo "Finished tenant migrations.\n";
