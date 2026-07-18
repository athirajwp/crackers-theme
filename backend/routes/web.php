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
});

// 2. Public Storefront & Booking Routes (handled by React Client-side routing)
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
        
        Route::get('/orders', [AdminApiController::class, 'orders']);
        Route::get('/orders/{id}', [AdminApiController::class, 'order']);
        Route::post('/orders/{id}/status', [AdminApiController::class, 'updateOrderStatus']);
        Route::post('/orders/{id}/items', [AdminApiController::class, 'updateOrderItems']);
        
        Route::get('/settings', [AdminApiController::class, 'settings']);
        Route::post('/settings/update', [AdminApiController::class, 'updateSettings']);
        
        Route::get('/branding', [AdminApiController::class, 'branding']);
        Route::post('/branding/update', [AdminApiController::class, 'updateBranding']);
        
        Route::post('/profile/update', [AdminApiController::class, 'updateProfile']);
    });
});

// React routing fallback for Admin panel UI
Route::get('/admin/{any?}', function () {
    return view('react');
})->where('any', '.*');

// 4. Super Admin Multi-Domain Panel Routing Group
Route::prefix('admin_sys')->name('admin_sys.')->group(function () {
    // Auth routes
    Route::get('/login', [\App\Http\Controllers\AdminSys\AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [\App\Http\Controllers\AdminSys\AuthController::class, 'login'])->name('login.post');
    Route::post('/logout', [\App\Http\Controllers\AdminSys\AuthController::class, 'logout'])->name('logout');

    // Protected routes
    Route::middleware(['super_admin.auth'])->group(function () {
        Route::get('/company', [\App\Http\Controllers\AdminSys\CompanyController::class, 'index'])->name('company.index');
        Route::post('/company', [\App\Http\Controllers\AdminSys\CompanyController::class, 'store'])->name('company.store');
        Route::post('/company/{id}/update', [\App\Http\Controllers\AdminSys\CompanyController::class, 'update'])->name('company.update');
        Route::post('/company/{id}/toggle-status', [\App\Http\Controllers\AdminSys\CompanyController::class, 'toggleStatus'])->name('company.toggle_status');
        Route::delete('/company/{id}', [\App\Http\Controllers\AdminSys\CompanyController::class, 'destroy'])->name('company.destroy');

        // Super Admin Profile Management
        Route::get('/profile', [\App\Http\Controllers\AdminSys\ProfileController::class, 'edit'])->name('profile');
        Route::post('/profile', [\App\Http\Controllers\AdminSys\ProfileController::class, 'update'])->name('profile.update');
    });
});
