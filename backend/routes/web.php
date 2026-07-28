<?php

use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\StorefrontApiController;
use App\Http\Controllers\AdminApiController;
use App\Http\Controllers\OrderTrackingController;
use App\Http\Controllers\Admin\AuthController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\Admin\BrandingController;
use App\Http\Controllers\Admin\ProfileController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

// 1. API Route Group
Route::prefix('api')->group(function () {
    Route::get('/storefront', [StorefrontApiController::class, 'index']);
    Route::get('/track', [StorefrontApiController::class, 'track']);
    Route::get('/checkout/success/{order_number}', [StorefrontApiController::class, 'successDetails']);
    Route::post('/checkout', [CheckoutController::class, 'store']);
    Route::get('/test-email', function (\Illuminate\Http\Request $request) {
        try {
            $orderId = $request->query('order_id');
            $order = $orderId ? \App\Models\Order::find($orderId) : \App\Models\Order::orderBy('id', 'desc')->first();
            if (!$order) {
                return response("No orders found to test with.", 404)->header('Content-Type', 'text/plain');
            }
            
            $adminEmail = \App\Models\Setting::get('store_email', config('mail.from.address'));
            $output = "Starting email test for order ID {$order->id} (Number: {$order->order_number})...\n";
            $output .= "SMTP Host: " . config('mail.mailers.smtp.host') . "\n";
            $output .= "SMTP Port: " . config('mail.mailers.smtp.port') . "\n";
            $output .= "SMTP Username: " . config('mail.mailers.smtp.username') . "\n";
            $output .= "Admin Email: {$adminEmail}\n";
            
            if (!empty($adminEmail)) {
                $output .= "Sending Admin Invoice Mail...\n";
                \Illuminate\Support\Facades\Mail::to($adminEmail)->send(new \App\Mail\AdminInvoiceMail($order));
                $output .= "SUCCESS: Admin email sent!\n";
            }
            
            if (!empty($order->email)) {
                $output .= "Sending Customer Order Mail to {$order->email}...\n";
                \Illuminate\Support\Facades\Mail::to($order->email)->send(new \App\Mail\CustomerOrderMail($order));
                $output .= "SUCCESS: Customer email sent!\n";
            } else {
                $output .= "Skipped Customer Mail (No email provided for this order).\n";
            }
            
            return response($output)->header('Content-Type', 'text/plain');
        } catch (\Exception $e) {
            return response("ERROR ENCOUNTERED:\n" . $e->getMessage() . "\n\nTrace:\n" . $e->getTraceAsString(), 500)->header('Content-Type', 'text/plain');
        }
    });
    Route::get('/checkout/invoice/{order_number}', [CheckoutController::class, 'downloadInvoice'])->name('checkout.invoice');
    Route::get('/view-logs', function () {
        try {
            $logFile = storage_path('logs/email_background.log');
            $laravelLog = storage_path('logs/laravel.log');
            
            $output = "=== ACTIVE MAIL CONFIG ===\n";
            $output .= "Default: " . config('mail.default') . "\n";
            $output .= "Host: " . config('mail.mailers.smtp.host') . "\n";
            $output .= "Port: " . config('mail.mailers.smtp.port') . "\n";
            $output .= "Encryption: " . config('mail.mailers.smtp.encryption') . "\n";
            $output .= "Username: " . config('mail.mailers.smtp.username') . "\n";
            $output .= "From Address: " . config('mail.from.address') . "\n\n";
            
            $output = $output . "=== EMAIL BACKGROUND LOG (storage/logs/email_background.log) ===\n";
            if (file_exists($logFile)) {
                $output .= file_get_contents($logFile) . "\n";
            } else {
                $output .= "File does not exist.\n";
            }
            
            $output .= "\n=== LARAVEL LOG LAST 50 LINES (storage/logs/laravel.log) ===\n";
            if (file_exists($laravelLog)) {
                $lines = file($laravelLog);
                $lastLines = array_slice($lines, -50);
                $output .= implode("", $lastLines) . "\n";
            } else {
                $output .= "File does not exist.\n";
            }
            
            return response($output)->header('Content-Type', 'text/plain');
        } catch (\Exception $e) {
            return response("Error reading logs: " . $e->getMessage(), 500)->header('Content-Type', 'text/plain');
        }
    });

    Route::get('/test-aisensy', function () {
        try {
            $enable = \App\Models\Setting::get('enable_aisensy', 'no');
            $apiKey = trim(\App\Models\Setting::get('aisensy_api_key', ''));
            $campaign = trim(\App\Models\Setting::get('aisensy_campaign_name', ''));
            $shopPhone = preg_replace('/[^0-9]/', '', \App\Models\Setting::get('store_whatsapp', '919998887776'));
            if (strlen($shopPhone) === 10) $shopPhone = '91' . $shopPhone;

            $output = "=== AISENSY WHATSAPP API DIAGNOSTIC TEST ===\n";
            $output .= "Enabled: {$enable}\n";
            $output .= "API Key Present: " . (empty($apiKey) ? "NO (NOT SET)" : "YES (Key Starts with: " . substr($apiKey, 0, 15) . "...)") . "\n";
            $output .= "Campaign Name: " . (empty($campaign) ? "NOT SET" : $campaign) . "\n";
            $output .= "Destination Phone: {$shopPhone}\n\n";

            if ($enable !== 'yes') {
                $output .= "WARNING: AiSensy is currently DISABLED in Admin Settings. (Check the 'Enable AiSensy API' box in Admin > Settings)\n\n";
            }

            if (empty($apiKey)) {
                $output .= "ERROR: AiSensy API Key is empty! Please paste your key in Admin > Settings.\n";
                return response($output, 200)->header('Content-Type', 'text/plain');
            }

            if (empty($campaign)) {
                $output .= "ERROR: AiSensy Campaign Name is empty! Please enter your approved campaign name in Admin > Settings.\n";
                return response($output, 200)->header('Content-Type', 'text/plain');
            }

            $output .= "Sending test API POST request to https://backend.aisensy.com/campaign/t1/api/v2 ...\n\n";

            $response = \Illuminate\Support\Facades\Http::post('https://backend.aisensy.com/campaign/t1/api/v2', [
                'apiKey' => $apiKey,
                'campaignName' => $campaign,
                'destination' => $shopPhone,
                'userName' => 'Test Customer',
                'templateParams' => [
                    'TEST-1001',
                    '₹1,500',
                    'Test Customer'
                ]
            ]);

            $output .= "HTTP Status Code: " . $response->status() . "\n";
            $output .= "AiSensy Response Raw Body:\n" . $response->body() . "\n";

            return response($output, 200)->header('Content-Type', 'text/plain');
        } catch (\Throwable $e) {
            return response("TEST EXCEPTION ENCOUNTERED:\n" . $e->getMessage() . "\n\nTrace:\n" . $e->getTraceAsString(), 200)->header('Content-Type', 'text/plain');
        }
    });
});

Route::get('/view-logs', function () {
    try {
        $laravelLog = storage_path('logs/laravel.log');
        $output = "=== LARAVEL LOG LAST 100 LINES (storage/logs/laravel.log) ===\n";
        if (file_exists($laravelLog)) {
            $lines = file($laravelLog);
            $lastLines = array_slice($lines, -100);
            $output .= implode("", $lastLines) . "\n";
        } else {
            $output .= "File does not exist.\n";
        }
        return response($output)->header('Content-Type', 'text/plain');
    } catch (\Exception $e) {
        return response("Error reading logs: " . $e->getMessage(), 500)->header('Content-Type', 'text/plain');
    }
});

// 3. Public Storefront & Booking Routes (handled by React Client-side routing)
Route::get('/', function () { return view('react'); })->name('home');
Route::get('/checkout/success/{order_number}', function () { return view('react'); })->name('checkout.success');
Route::get('/about', function () { return view('react'); })->name('about');
Route::get('/terms', function () { return view('react'); })->name('terms');
Route::get('/contact', function () { return view('react'); })->name('contact');
Route::get('/price_list', function () { return view('react'); })->name('price_list');
Route::get('/price-list', function () { return view('react'); });
Route::get('/track', function () { return view('react'); })->name('track.index');

// 3. Admin Authentication & API Entries
Route::prefix('api/admin')->group(function () {
    Route::post('/auth/login', [AdminApiController::class, 'login']);
    Route::post('/auth/logout', [AdminApiController::class, 'logout']);
    Route::get('/auth/check', [AdminApiController::class, 'authCheck']);

    Route::middleware([\App\Http\Middleware\AdminApiAuth::class])->group(function () {
        Route::get('/dashboard', [AdminApiController::class, 'dashboard']);
        Route::get('/categories', [AdminApiController::class, 'categories']);
        Route::post('/categories/store', [AdminApiController::class, 'storeCategory']);
        Route::post('/categories/{id}/update', [AdminApiController::class, 'updateCategory']);
        Route::delete('/categories/{id}/destroy', [AdminApiController::class, 'destroyCategory']);
        
        Route::get('/products', [AdminApiController::class, 'products']);
        Route::post('/products/store', [AdminApiController::class, 'storeProduct']);
        Route::post('/products/{id}/update', [AdminApiController::class, 'updateProduct']);
        Route::delete('/products/{id}/destroy', [AdminApiController::class, 'destroyProduct']);
        Route::post('/products/import', [AdminApiController::class, 'importProducts']);
        Route::get('/products/export', [AdminApiController::class, 'exportProductTemplate']);
        
        Route::get('/orders', [AdminApiController::class, 'orders']);
        Route::get('/orders/{id}', [AdminApiController::class, 'order']);
        Route::post('/orders/{id}/status', [AdminApiController::class, 'updateOrderStatus']);
        Route::post('/orders/{id}/items', [AdminApiController::class, 'updateOrderItems']);
        
        Route::get('/settings', [AdminApiController::class, 'settings']);
        Route::post('/settings/update', [AdminApiController::class, 'updateSettings']);
        
        Route::get('/branding', [AdminApiController::class, 'branding']);
        Route::post('/branding/update', [AdminApiController::class, 'updateBranding']);
        
        Route::get('/reports/sales', [AdminApiController::class, 'reportsSales']);
        Route::get('/customers', [AdminApiController::class, 'customers']);
        
        Route::post('/profile/update', [AdminApiController::class, 'updateProfile']);
    });
});

// React routing fallback for Admin panel UI
Route::get('/admin/{any?}', function () {
    return view('react');
})->where('any', '.*');

// 4. Super Admin API Routes & React Fallback
Route::prefix('api/admin_sys')->group(function () {
    Route::post('/auth/login', [\App\Http\Controllers\AdminSysApiController::class, 'login']);
    Route::post('/auth/logout', [\App\Http\Controllers\AdminSysApiController::class, 'logout']);
    Route::get('/auth/check', [\App\Http\Controllers\AdminSysApiController::class, 'checkAuth']);

    Route::middleware([\App\Http\Middleware\SuperAdminAuth::class])->group(function () {
        Route::get('/companies', [\App\Http\Controllers\AdminSysApiController::class, 'companies']);
        Route::post('/companies/store', [\App\Http\Controllers\AdminSysApiController::class, 'storeCompany']);
        Route::post('/companies/{id}/update', [\App\Http\Controllers\AdminSysApiController::class, 'updateCompany']);
        Route::post('/companies/{id}/toggle-status', [\App\Http\Controllers\AdminSysApiController::class, 'toggleCompanyStatus']);
        Route::delete('/companies/{id}/destroy', [\App\Http\Controllers\AdminSysApiController::class, 'destroyCompany']);

        Route::get('/profile', [\App\Http\Controllers\AdminSysApiController::class, 'profile']);
        Route::post('/profile/update', [\App\Http\Controllers\AdminSysApiController::class, 'updateProfile']);
    });
});

// React routing fallback for Super Admin panel UI
Route::get('/admin_sys/{any?}', function () {
    return view('react');
})->where('any', '.*');
