<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\Process;

$orderId = 3;
$tenantDb = 'crackers2_crackersdemo';

// Laravel's Process facade automatically resolves spaces in paths and runs cross-platform
$cmd = "php artisan order:send-email {$orderId} --tenant-db={$tenantDb}";
echo "Running via Process facade: $cmd\n";

try {
    $process = Process::path(base_path())
        ->start($cmd);
        
    echo "Process started in background. PID: " . $process->id() . "\n";
    
    // Wait a brief moment to see if it starts successfully
    usleep(500000); 
    
    if ($process->running()) {
        echo "Process is running successfully in the background!\n";
    } else {
        echo "Process stopped. Exit code: " . $process->latestOutput() . $process->latestErrorOutput() . "\n";
    }
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
