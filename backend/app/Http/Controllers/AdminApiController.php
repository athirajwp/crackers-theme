<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AdminApiController extends Controller
{
    /**
     * Check if admin is authenticated.
     */
    public function authCheck()
    {
        $company = view()->shared('currentCompany');
        $companyCode = $company ? $company->code : 'default';

        if (session()->has('admin_logged_in_' . $companyCode)) {
            return response()->json(['logged_in' => true]);
        }
        return response()->json(['logged_in' => false], 401);
    }

    /**
     * Handle login authentication.
     */
    public function login(Request $request)
    {
        $request->validate([
            'password' => 'required|string',
        ]);

        $adminPassword = Setting::get('admin_password');
        if (!$adminPassword) {
            $adminPassword = env('ADMIN_PASSWORD', 'admin123');
        }

        $isMatch = false;
        if (str_starts_with($adminPassword, '$2y$') || str_starts_with($adminPassword, '$2a$')) {
            $isMatch = Hash::check($request->password, $adminPassword);
        } else {
            $isMatch = ($request->password === $adminPassword);
        }

        if ($isMatch) {
            $company = view()->shared('currentCompany');
            $companyCode = $company ? $company->code : 'default';
            session(['admin_logged_in_' . $companyCode => true]);
            return response()->json(['success' => true]);
        }

        return response()->json(['error' => 'Invalid password!'], 422);
    }

    /**
     * Handle logout.
     */
    public function logout()
    {
        $company = view()->shared('currentCompany');
        $companyCode = $company ? $company->code : 'default';
        session()->forget('admin_logged_in_' . $companyCode);
        return response()->json(['success' => true]);
    }

    /**
     * Admin Dashboard Statistics.
     */
    public function dashboard()
    {
        $stats = [
            'total_orders' => Order::count(),
            'pending_orders' => Order::where('order_status', 'pending')->count(),
            'shipped_orders' => Order::where('order_status', 'shipped')->count(),
            'total_revenue' => Order::where('payment_status', 'paid')->sum('net_amount'),
            'pending_revenue' => Order::where('payment_status', 'pending')->sum('net_amount'),
            'total_products' => Product::count(),
            'total_categories' => Category::count(),
        ];

        $recentOrders = Order::orderBy('created_at', 'desc')->limit(5)->get();

        return response()->json([
            'stats' => $stats,
            'recentOrders' => $recentOrders,
        ]);
    }

    /**
     * Categories API list & CRUD.
     */
    public function categories()
    {
        $categories = Category::orderBy('sort_order', 'asc')->get();
        return response()->json(['categories' => $categories]);
    }

    public function storeCategory(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:categories,name',
            'sort_order' => 'nullable|integer',
            'status' => 'required|in:active,inactive',
        ]);

        $category = Category::create([
            'name' => $request->name,
            'slug' => Str::slug($request->name),
            'sort_order' => $request->sort_order ?? 0,
            'status' => $request->status,
        ]);

        return response()->json(['success' => true, 'category' => $category]);
    }

    public function updateCategory(Request $request, $id)
    {
        $category = Category::findOrFail($id);
        $request->validate([
            'name' => 'required|string|max:255|unique:categories,name,' . $category->id,
            'sort_order' => 'nullable|integer',
            'status' => 'required|in:active,inactive',
        ]);

        $category->update([
            'name' => $request->name,
            'slug' => Str::slug($request->name),
            'sort_order' => $request->sort_order ?? 0,
            'status' => $request->status,
        ]);

        return response()->json(['success' => true, 'category' => $category]);
    }

    public function destroyCategory($id)
    {
        $category = Category::findOrFail($id);
        $category->delete();
        return response()->json(['success' => true]);
    }

    /**
     * Products API list & CRUD.
     */
    public function products()
    {
        $products = Product::with('category')
            ->join('categories', 'products.category_id', '=', 'categories.id')
            ->orderBy('categories.sort_order', 'asc')
            ->orderBy('products.name', 'asc')
            ->select('products.*')
            ->get();
        $categories = Category::all();

        return response()->json([
            'products' => $products,
            'categories' => $categories,
        ]);
    }

    public function storeProduct(Request $request)
    {
        $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'pack_size' => 'required|string|max:255',
            'mrp' => 'required|numeric|min:0',
            'selling_price' => 'required|numeric|min:0',
            'sort_order' => 'required|integer|min:0',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'status' => 'required|in:active,inactive',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $company = view()->shared('currentCompany');
            $companyCode = $company ? $company->code : 'default';
            $companyCodeClean = strtolower(preg_replace('/[^a-zA-Z0-9_]/', '', $companyCode));
            $uploadDir = "uploads/companies/{$companyCodeClean}/products";
            if (!is_dir(public_path($uploadDir))) mkdir(public_path($uploadDir), 0755, true);

            $imageName = time() . '_' . uniqid() . '.' . $request->image->extension();
            $request->image->move(public_path($uploadDir), $imageName);
            $imagePath = $uploadDir . '/' . $imageName;
        }

        $product = Product::create([
            'category_id' => $request->category_id,
            'name' => $request->name,
            'pack_size' => $request->pack_size,
            'mrp' => $request->mrp,
            'selling_price' => $request->selling_price,
            'sort_order' => $request->sort_order,
            'image' => $imagePath,
            'status' => $request->status,
        ]);

        return response()->json(['success' => true, 'product' => $product]);
    }

    public function updateProduct(Request $request, $id)
    {
        $product = Product::findOrFail($id);
        $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'pack_size' => 'required|string|max:255',
            'mrp' => 'required|numeric|min:0',
            'selling_price' => 'required|numeric|min:0',
            'sort_order' => 'required|integer|min:0',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'status' => 'required|in:active,inactive',
        ]);

        $imagePath = $product->image;
        if ($request->hasFile('image')) {
            if ($product->image && file_exists(public_path($product->image))) {
                @unlink(public_path($product->image));
            }

            $company = view()->shared('currentCompany');
            $companyCode = $company ? $company->code : 'default';
            $companyCodeClean = strtolower(preg_replace('/[^a-zA-Z0-9_]/', '', $companyCode));
            $uploadDir = "uploads/companies/{$companyCodeClean}/products";
            if (!is_dir(public_path($uploadDir))) mkdir(public_path($uploadDir), 0755, true);

            $imageName = time() . '_' . uniqid() . '.' . $request->image->extension();
            $request->image->move(public_path($uploadDir), $imageName);
            $imagePath = $uploadDir . '/' . $imageName;
        }

        $product->update([
            'category_id' => $request->category_id,
            'name' => $request->name,
            'pack_size' => $request->pack_size,
            'mrp' => $request->mrp,
            'selling_price' => $request->selling_price,
            'sort_order' => $request->sort_order,
            'image' => $imagePath,
            'status' => $request->status,
        ]);

        return response()->json(['success' => true, 'product' => $product]);
    }

    public function destroyProduct($id)
    {
        $product = Product::findOrFail($id);
        if ($product->image && file_exists(public_path($product->image))) {
            @unlink(public_path($product->image));
        }
        $product->delete();
        return response()->json(['success' => true]);
    }

    /**
     * Orders API list & CRUD.
     */
    public function orders(Request $request)
    {
        $status = $request->input('status');
        $query = Order::orderBy('created_at', 'desc');

        if ($status) {
            $query->where('order_status', $status);
        }

        $orders = $query->get();
        return response()->json(['orders' => $orders]);
    }

    public function order($id)
    {
        $order = Order::with('items')->findOrFail($id);
        
        $categories = Category::active()
            ->with(['products' => function ($query) {
                $query->active()->orderBy('sort_order', 'asc');
            }])
            ->orderBy('sort_order', 'asc')
            ->get();

        $settings = [
            'store_name' => Setting::get('store_name', 'Cracker Demo'),
            'store_address' => Setting::get('store_address', 'Virudhunagar to Sivakasi Main Road, Sivakasi'),
            'store_phone' => Setting::get('store_phone', '+91 9998887776'),
            'store_email' => Setting::get('store_email', 'store@example.com'),
        ];

        return response()->json([
            'order' => $order,
            'categories' => $categories,
            'settings' => $settings
        ]);
    }

    public function updateOrderStatus(Request $request, $id)
    {
        $order = Order::findOrFail($id);
        $request->validate([
            'order_status' => 'required|in:pending,approved,processing,shipped,delivered,cancelled',
            'payment_status' => 'required|in:pending,paid,verified',
            'transport_name' => 'nullable|string|max:255',
            'lr_number' => 'nullable|string|max:255',
        ]);

        $order->update([
            'order_status' => $request->order_status,
            'payment_status' => $request->payment_status,
            'transport_name' => $request->transport_name,
            'lr_number' => $request->lr_number,
        ]);

        return response()->json(['success' => true, 'order' => $order]);
    }

    public function updateOrderItems(Request $request, $id)
    {
        $order = Order::findOrFail($id);
        $request->validate([
            'items' => 'required|array',
            'items.*' => 'required|integer|min:0',
        ]);

        $submittedItems = $request->input('items');
        $subtotal = 0;
        $netAmount = 0;
        $validatedItems = [];

        foreach ($submittedItems as $productId => $qty) {
            $qty = (int) $qty;
            if ($qty <= 0) continue;

            $product = Product::find($productId);
            if (!$product) {
                return response()->json(['error' => "Product #{$productId} not found."], 422);
            }

            $itemSubtotal = $product->mrp * $qty;
            $itemNet = $product->selling_price * $qty;

            $subtotal += $itemSubtotal;
            $netAmount += $itemNet;

            $validatedItems[] = [
                'product' => $product,
                'qty' => $qty,
                'price' => $product->selling_price,
                'total_price' => $itemNet,
            ];
        }

        if (empty($validatedItems)) {
            return response()->json(['error' => 'The order must contain at least one item.'], 422);
        }

        $enableTaxDelivery = Setting::get('enable_tax_delivery', 'no') === 'yes';
        $taxPercent = (float) Setting::get('tax_percent', 18);
        $deliveryCharge = (float) Setting::get('delivery_charge', 150);

        $taxAmount = 0;
        $deliveryChargeVal = 0;
        if ($enableTaxDelivery) {
            $taxAmount = $netAmount * ($taxPercent / 100);
            $deliveryChargeVal = $deliveryCharge;
        }

        $finalNet = $netAmount + $taxAmount + $deliveryChargeVal;
        $discountAmount = $subtotal - $netAmount;

        try {
            DB::beginTransaction();
            $order->items()->delete();

            foreach ($validatedItems as $vItem) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $vItem['product']->id,
                    'product_name' => $vItem['product']->name,
                    'pack_size' => $vItem['product']->pack_size,
                    'price' => $vItem['price'],
                    'quantity' => $vItem['qty'],
                    'total_price' => $vItem['total_price'],
                ]);
            }

            $order->update([
                'subtotal' => $subtotal,
                'discount_amount' => $discountAmount,
                'net_amount' => $finalNet,
            ]);

            DB::commit();
            return response()->json(['success' => true]);
        } catch (\Exception $exception) {
            DB::rollBack();
            Log::error('Admin Order Update Items API failed: ' . $exception->getMessage());
            return response()->json(['error' => 'Something went wrong: ' . $exception->getMessage()], 500);
        }
    }

    /**
     * Settings configuration APIs.
     */
    public function settings()
    {
        $settings = [
            'store_name' => Setting::get('store_name', 'Cracker Demo'),
            'min_order_value' => Setting::get('min_order_value', 3800),
            'discount_percent' => Setting::get('discount_percent', 60),
            'store_whatsapp' => Setting::get('store_whatsapp', '919998887776'),
            'store_phone' => Setting::get('store_phone', '+91 9998887776'),
            'store_email' => Setting::get('store_email', 'crackerdemo@gmail.com'),
            'store_address' => Setting::get('store_address', 'Virudhunagar to Sivakasi Main Road, Sivakasi'),
            'store_upi' => Setting::get('store_upi', 'aathishacrackers@okaxis'),
            'store_upi_qr' => Setting::get('store_upi_qr', ''),
            'bank_name' => Setting::get('bank_name', 'State Bank of India'),
            'bank_acc_no' => Setting::get('bank_acc_no', '1234567890'),
            'bank_ifsc' => Setting::get('bank_ifsc', 'SBIN0000123'),
            'bank_holder' => Setting::get('bank_holder', 'Cracker Demo'),
            
            // Feature flags
            'enable_min_order' => Setting::get('enable_min_order', 'yes'),
            'enable_promo_codes' => Setting::get('enable_promo_codes', 'yes'),
            'enable_tax_delivery' => Setting::get('enable_tax_delivery', 'no'),
            'enable_fireworks' => Setting::get('enable_fireworks', 'yes'),
            'tax_percent' => Setting::get('tax_percent', 18),
            'delivery_charge' => Setting::get('delivery_charge', 150),
        ];

        return response()->json(['settings' => $settings]);
    }

    public function updateSettings(Request $request)
    {
        $request->validate([
            'store_name' => 'required|string|max:255',
            'min_order_value' => 'required|numeric|min:0',
            'discount_percent' => 'required|numeric|min:0|max:100',
            'store_whatsapp' => 'required|string|max:20',
            'store_phone' => 'required|string|max:20',
            'store_email' => 'required|email|max:255',
            'store_address' => 'required|string',
            'store_upi' => 'nullable|string|max:255',
            'bank_name' => 'nullable|string|max:255',
            'bank_acc_no' => 'nullable|string|max:255',
            'bank_ifsc' => 'nullable|string|max:255',
            'bank_holder' => 'nullable|string|max:255',
            'enable_min_order' => 'required|in:yes,no',
            'enable_promo_codes' => 'required|in:yes,no',
            'enable_tax_delivery' => 'required|in:yes,no',
            'enable_fireworks' => 'required|in:yes,no',
            'tax_percent' => 'required|numeric|min:0|max:100',
            'delivery_charge' => 'required|numeric|min:0',
            'store_upi_qr' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:3072',
        ]);

        Setting::set('store_name', $request->store_name, 'text');
        Setting::set('min_order_value', $request->min_order_value, 'number');
        Setting::set('discount_percent', $request->discount_percent, 'number');
        Setting::set('store_whatsapp', $request->store_whatsapp, 'text');
        Setting::set('store_phone', $request->store_phone, 'text');
        Setting::set('store_email', $request->store_email, 'text');
        Setting::set('store_address', $request->store_address, 'textarea');
        Setting::set('store_upi', $request->store_upi ?? '', 'text');
        Setting::set('bank_name', $request->bank_name ?? '', 'text');
        Setting::set('bank_acc_no', $request->bank_acc_no ?? '', 'text');
        Setting::set('bank_ifsc', $request->bank_ifsc ?? '', 'text');
        Setting::set('bank_holder', $request->bank_holder ?? '', 'text');
        Setting::set('enable_min_order', $request->enable_min_order, 'text');
        Setting::set('enable_promo_codes', $request->enable_promo_codes, 'text');
        Setting::set('enable_tax_delivery', $request->enable_tax_delivery, 'text');
        Setting::set('enable_fireworks', $request->enable_fireworks, 'text');
        Setting::set('tax_percent', $request->tax_percent, 'number');
        Setting::set('delivery_charge', $request->delivery_charge, 'number');

        if ($request->hasFile('store_upi_qr')) {
            $company = view()->shared('currentCompany');
            $companyCode = $company ? $company->code : 'default';
            $companyCodeClean = strtolower(preg_replace('/[^a-zA-Z0-9_]/', '', $companyCode));
            $uploadDir = "uploads/companies/{$companyCodeClean}/settings";
            if (!is_dir(public_path($uploadDir))) mkdir(public_path($uploadDir), 0755, true);

            $oldPath = Setting::get('store_upi_qr');
            if ($oldPath && file_exists(public_path($oldPath))) {
                @unlink(public_path($oldPath));
            }

            $fileName = time() . '_store_upi_qr_' . uniqid() . '.' . $request->file('store_upi_qr')->extension();
            $request->file('store_upi_qr')->move(public_path($uploadDir), $fileName);
            Setting::set('store_upi_qr', $uploadDir . '/' . $fileName, 'text');
        }

        return response()->json(['success' => true]);
    }

    /**
     * Branding configuration APIs.
     */
    public function branding()
    {
        $keys = [
            'instagram_link', 'whatsapp_link', 'youtube_link', 'twitter_link', 'facebook_link',
            'promo_code_1', 'promo_value_1',
            'promo_code_2', 'promo_value_2',
            'promo_code_3', 'promo_value_3',
            'promo_code_4', 'promo_value_4',
            'promo_code_5', 'promo_value_5',
            'admin_theme', 'banner_scroller',
            'terms_conditions', 'about_us',
            'about_us_badge', 'about_us_title',
            'slider_image_1', 'slider_image_2', 'slider_image_3',
            'aboutus_image_1',
            'store_logo', 'store_favicon',
            'license_name', 'license_no', 'store_map_iframe',
            'marquee_alert_1', 'marquee_alert_2', 'marquee_alert_3', 'marquee_alert_4', 'marquee_alert_5', 'marquee_alert_6',
        ];

        for ($i = 1; $i <= 10; $i++) {
            $keys[] = "gallery_image_{$i}";
        }

        $settings = [];
        foreach ($keys as $key) {
            $settings[$key] = Setting::get($key, '');
        }

        if (empty($settings['admin_theme'])) $settings['admin_theme'] = 'gold';
        if (empty($settings['about_us_badge'])) $settings['about_us_badge'] = 'A Decade of Quality';
        if (empty($settings['about_us_title'])) $settings['about_us_title'] = 'We Provide Premium Quality Fireworks';

        return response()->json(['settings' => $settings]);
    }

    public function updateBranding(Request $request)
    {
        $imageFields = ['store_logo', 'store_favicon', 'slider_image_1', 'slider_image_2', 'slider_image_3', 'aboutus_image_1'];
        for ($i = 1; $i <= 10; $i++) {
            $imageFields[] = "gallery_image_{$i}";
        }

        // Handle removing image slots
        if ($request->has('remove_image_key')) {
            $removeKey = $request->input('remove_image_key');
            if (in_array($removeKey, $imageFields)) {
                $oldPath = Setting::get($removeKey);
                if ($oldPath && !str_starts_with($oldPath, 'data:') && file_exists(public_path($oldPath))) {
                    @unlink(public_path($oldPath));
                }
                Setting::set($removeKey, '', 'text');
                return response()->json(['success' => true, 'removed' => $removeKey]);
            }
        }

        $excludeFields = [
            'store_logo', 'store_favicon', 'slider_image_1', 'slider_image_2', 'slider_image_3', 'aboutus_image_1'
        ];
        for ($i = 1; $i <= 10; $i++) {
            $excludeFields[] = "gallery_image_{$i}";
        }

        $fields = $request->except($excludeFields);

        foreach ($fields as $key => $value) {
            $type = 'text';
            if (in_array($key, ['terms_conditions', 'about_us', 'store_map_iframe'])) {
                $type = 'textarea';
            }
            Setting::set($key, $value ?? '', $type);
        }

        if ($request->has('admin_theme')) {
            $company = view()->shared('currentCompany');
            if ($company) {
                $company->update(['theme' => $request->admin_theme]);
            }
        }

        $imageFields = ['store_logo', 'store_favicon', 'slider_image_1', 'slider_image_2', 'slider_image_3', 'aboutus_image_1'];
        for ($i = 1; $i <= 10; $i++) {
            $imageFields[] = "gallery_image_{$i}";
        }
        $company = view()->shared('currentCompany');
        $companyCode = $company ? $company->code : 'default';
        $companyCodeClean = strtolower(preg_replace('/[^a-zA-Z0-9_]/', '', $companyCode));
        $uploadDir = "uploads/companies/{$companyCodeClean}/branding";
        if (!is_dir(public_path($uploadDir))) mkdir(public_path($uploadDir), 0755, true);

        foreach ($imageFields as $field) {
            if ($request->hasFile($field)) {
                $request->validate([
                    $field => 'image|mimes:jpeg,png,jpg,webp|max:3072'
                ]);

                // Read file contents and convert to Base64
                $file = $request->file($field);
                $fileData = file_get_contents($file->getRealPath());
                $base64 = 'data:' . $file->getMimeType() . ';base64,' . base64_encode($fileData);

                // Clean up old file from disk if it was a legacy file
                $oldPath = Setting::get($field);
                if ($oldPath && !str_starts_with($oldPath, 'data:') && file_exists(public_path($oldPath))) {
                    @unlink(public_path($oldPath));
                }

                Setting::set($field, $base64, 'text');
            }
        }

        return response()->json(['success' => true]);
    }

    /**
     * Update admin profile credentials/password.
     */
    public function updateProfile(Request $request)
    {
        $request->validate([
            'current_password' => 'required|string',
            'password' => 'required|string|min:6|confirmed|different:current_password',
        ]);

        $currentActivePassword = Setting::get('admin_password');
        if (!$currentActivePassword) {
            $currentActivePassword = env('ADMIN_PASSWORD', 'admin123');
        }

        $isMatch = false;
        if (str_starts_with($currentActivePassword, '$2y$') || str_starts_with($currentActivePassword, '$2a$')) {
            $isMatch = Hash::check($request->current_password, $currentActivePassword);
        } else {
            $isMatch = ($request->current_password === $currentActivePassword);
        }

        if (!$isMatch) {
            return response()->json(['error' => 'The provided current password does not match our records.'], 422);
        }

        Setting::set('admin_password', Hash::make($request->password), 'text');
        return response()->json(['success' => true]);
    }
}
