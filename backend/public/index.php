<?php

if (strpos($_SERVER['REQUEST_URI'] ?? '', 'admin_sys/login') !== false) {
    $logData = sprintf(
        "[%s] %s %s\nCOOKIES: %s\nPOST: %s\n\n",
        date('Y-m-d H:i:s'),
        $_SERVER['REQUEST_METHOD'] ?? '',
        $_SERVER['REQUEST_URI'] ?? '',
        json_encode($_COOKIE),
        json_encode($_POST)
    );
    file_put_contents(__DIR__ . '/../storage/logs/csrf_debug.log', $logData, FILE_APPEND);
}

use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Determine if the application is in maintenance mode...
if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

// Register the Composer autoloader...
require __DIR__.'/../vendor/autoload.php';

// Bootstrap Laravel and handle the request...
(require_once __DIR__.'/../bootstrap/app.php')
    ->handleRequest(Request::capture());
