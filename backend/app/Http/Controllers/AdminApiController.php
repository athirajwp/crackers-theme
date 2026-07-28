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
     * Import products from an Excel file (.xlsx, .xls, .csv).
     * Expected columns: Category, Product Name, Pack Size, MRP, Selling Price, Sort Order, Status
     */
    public function importProducts(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv|max:10240',
        ]);

        try {
            $file = $request->file('file');
            $spreadsheet = \PhpOffice\PhpSpreadsheet\IOFactory::load($file->getRealPath());
            $worksheet = $spreadsheet->getActiveSheet();
            $rows = $worksheet->toArray(null, true, true, true);

            if (count($rows) < 2) {
                return response()->json(['error' => 'The file appears to be empty or has no data rows.'], 422);
            }

            // Parse header row (first row)
            $headerRow = array_shift($rows);
            $headerMap = [];
            foreach ($headerRow as $col => $value) {
                if ($value !== null) {
                    $headerMap[strtolower(trim($value))] = $col;
                }
            }

            // Validate required columns
            $requiredColumns = ['category', 'product name', 'pack size', 'mrp', 'selling price'];
            $missingColumns = [];
            foreach ($requiredColumns as $col) {
                if (!isset($headerMap[$col])) {
                    $missingColumns[] = ucwords($col);
                }
            }

            if (!empty($missingColumns)) {
                return response()->json([
                    'error' => 'Missing required columns: ' . implode(', ', $missingColumns) . '. Required columns are: Category, Product Name, Pack Size, MRP, Selling Price.'
                ], 422);
            }

            // Pre-load existing categories (case-insensitive lookup)
            $categoryCache = [];
            foreach (Category::all() as $cat) {
                $categoryCache[strtolower(trim($cat->name))] = $cat;
            }

            $imported = 0;
            $updated = 0;
            $skipped = 0;
            $errors = [];

            foreach ($rows as $rowIndex => $row) {
                $rowNum = $rowIndex + 1; // 1-based for user-friendly error messages (header was row 1)

                $categoryName = trim($row[$headerMap['category']] ?? '');
                $productName = trim($row[$headerMap['product name']] ?? '');
                $packSize = trim($row[$headerMap['pack size']] ?? '');
                $mrp = $row[$headerMap['mrp']] ?? 0;
                $sellingPrice = $row[$headerMap['selling price']] ?? 0;
                $sortOrder = isset($headerMap['sort order']) ? ($row[$headerMap['sort order']] ?? 0) : 0;
                $status = isset($headerMap['status']) ? strtolower(trim($row[$headerMap['status']] ?? 'active')) : 'active';

                // Skip completely empty rows
                if (empty($categoryName) && empty($productName)) {
                    continue;
                }

                // Validate row data
                if (empty($categoryName)) {
                    $errors[] = "Row {$rowNum}: Category is empty, skipped.";
                    $skipped++;
                    continue;
                }
                if (empty($productName)) {
                    $errors[] = "Row {$rowNum}: Product Name is empty, skipped.";
                    $skipped++;
                    continue;
                }
                if (!is_numeric($mrp) || $mrp < 0) {
                    $errors[] = "Row {$rowNum}: Invalid MRP value '{$mrp}', skipped.";
                    $skipped++;
                    continue;
                }
                if (!is_numeric($sellingPrice) || $sellingPrice < 0) {
                    $errors[] = "Row {$rowNum}: Invalid Selling Price value '{$sellingPrice}', skipped.";
                    $skipped++;
                    continue;
                }

                // Normalize status
                if (!in_array($status, ['active', 'inactive'])) {
                    $status = 'active';
                }

                // Find or create category
                $catKey = strtolower($categoryName);
                if (!isset($categoryCache[$catKey])) {
                    $newCat = Category::create([
                        'name' => $categoryName,
                        'slug' => \Illuminate\Support\Str::slug($categoryName),
                        'sort_order' => 0,
                        'status' => 'active',
                    ]);
                    $categoryCache[$catKey] = $newCat;
                }
                $category = $categoryCache[$catKey];

                // Check if product already exists in same category with same name
                $existingProduct = Product::where('name', $productName)
                    ->where('category_id', $category->id)
                    ->first();

                if ($existingProduct) {
                    $existingProduct->update([
                        'pack_size' => $packSize ?: $existingProduct->pack_size,
                        'mrp' => (float) $mrp,
                        'selling_price' => (float) $sellingPrice,
                        'sort_order' => (int) $sortOrder,
                        'status' => $status,
                    ]);
                    $updated++;
                } else {
                    Product::create([
                        'category_id' => $category->id,
                        'name' => $productName,
                        'pack_size' => $packSize ?: '-',
                        'mrp' => (float) $mrp,
                        'selling_price' => (float) $sellingPrice,
                        'sort_order' => (int) $sortOrder,
                        'status' => $status,
                    ]);
                    $imported++;
                }
            }

            return response()->json([
                'success' => true,
                'imported' => $imported,
                'updated' => $updated,
                'skipped' => $skipped,
                'errors' => $errors,
            ]);
        } catch (\Exception $e) {
            Log::error('Product Import Error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to process file: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Export current products as an Excel file (also serves as a template).
     */
    public function exportProductTemplate(Request $request)
    {
        try {
            $spreadsheet = new \PhpOffice\PhpSpreadsheet\Spreadsheet();
            $sheet = $spreadsheet->getActiveSheet();
            $sheet->setTitle('Products');

            // Set headers
            $headers = ['Category', 'Product Name', 'Pack Size', 'MRP', 'Selling Price', 'Sort Order', 'Status'];
            foreach ($headers as $colIndex => $header) {
                $colLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($colIndex + 1);
                $sheet->setCellValue($colLetter . '1', $header);

                // Style the header row
                $sheet->getStyle($colLetter . '1')->getFont()->setBold(true);
                $sheet->getStyle($colLetter . '1')->getFill()
                    ->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)
                    ->getStartColor()->setARGB('FFE8532A');
                $sheet->getStyle($colLetter . '1')->getFont()->getColor()->setARGB('FFFFFFFF');
                $sheet->getColumnDimension($colLetter)->setAutoSize(true);
            }

            $includeData = $request->query('include_data', 'false') === 'true';

            if ($includeData) {
                // Export existing products
                $products = Product::with('category')
                    ->join('categories', 'products.category_id', '=', 'categories.id')
                    ->orderBy('categories.sort_order', 'asc')
                    ->orderBy('products.name', 'asc')
                    ->select('products.*')
                    ->get();

                $row = 2;
                foreach ($products as $product) {
                    $sheet->setCellValue('A' . $row, $product->category->name ?? 'Uncategorized');
                    $sheet->setCellValue('B' . $row, $product->name);
                    $sheet->setCellValue('C' . $row, $product->pack_size);
                    $sheet->setCellValue('D' . $row, (float) $product->mrp);
                    $sheet->setCellValue('E' . $row, (float) $product->selling_price);
                    $sheet->setCellValue('F' . $row, (int) $product->sort_order);
                    $sheet->setCellValue('G' . $row, $product->status);
                    $row++;
                }
            } else {
                // Add sample rows for template
                $sampleData = [
                    ['Ground Chakkars', 'Big Ground Chakkars', '1 Box (10 Pcs)', 500, 200, 1, 'active'],
                    ['Sparklers', '10cm Green Sparklers', '1 Box (10 Pcs)', 100, 40, 1, 'active'],
                ];
                $row = 2;
                foreach ($sampleData as $sample) {
                    foreach ($sample as $colIndex => $value) {
                        $colLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($colIndex + 1);
                        $sheet->setCellValue($colLetter . $row, $value);
                    }
                    $row++;
                }
            }

            // Add a Categories reference sheet
            $catSheet = $spreadsheet->createSheet();
            $catSheet->setTitle('Categories (Reference)');
            $catSheet->setCellValue('A1', 'Existing Categories');
            $catSheet->getStyle('A1')->getFont()->setBold(true);
            $catSheet->getStyle('A1')->getFill()
                ->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)
                ->getStartColor()->setARGB('FF4CAF50');
            $catSheet->getStyle('A1')->getFont()->getColor()->setARGB('FFFFFFFF');
            $catSheet->getColumnDimension('A')->setAutoSize(true);

            $categories = Category::orderBy('sort_order', 'asc')->get();
            $catRow = 2;
            foreach ($categories as $cat) {
                $catSheet->setCellValue('A' . $catRow, $cat->name);
                $catRow++;
            }

            $catSheet->setCellValue('B1', 'Note');
            $catSheet->setCellValue('B2', 'Use these exact category names in the Products sheet.');
            $catSheet->setCellValue('B3', 'New category names will be auto-created during import.');
            $catSheet->getColumnDimension('B')->setAutoSize(true);
            $catSheet->getStyle('B1')->getFont()->setBold(true);

            // Set the active sheet back to Products
            $spreadsheet->setActiveSheetIndex(0);

            $fileName = $includeData ? 'products_export.xlsx' : 'products_template.xlsx';

            $writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($spreadsheet);
            $tempFile = tempnam(sys_get_temp_dir(), 'products_') . '.xlsx';
            $writer->save($tempFile);

            return response()->download($tempFile, $fileName, [
                'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            ])->deleteFileAfterSend(true);
        } catch (\Exception $e) {
            Log::error('Product Export Error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to generate file: ' . $e->getMessage()], 500);
        }
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
            'show_mrp' => Setting::get('show_mrp', 'yes'),
            'card_bg_color' => Setting::get('card_bg_color', '#EFEBE8'),
            'default_view_mode' => Setting::get('default_view_mode', 'flex'),
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
            'show_mrp' => 'nullable|in:yes,no',
            'card_bg_color' => 'nullable|string|max:50',
            'default_view_mode' => 'nullable|in:flex,grid',
            'tax_percent' => 'required|numeric|min:0|max:100',
            'delivery_charge' => 'required|numeric|min:0',
            'store_upi_qr' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:20480',
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
        Setting::set('show_mrp', $request->show_mrp ?? 'yes', 'text');
        Setting::set('card_bg_color', $request->card_bg_color ?? '#EFEBE8', 'text');
        Setting::set('default_view_mode', $request->default_view_mode ?? 'flex', 'text');
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
                    $field => 'image|mimes:jpeg,png,jpg,webp|max:20480'
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

    /**
     * Sales Reports API (Specific Day, Daily, Monthly, Yearly).
     */
    public function reportsSales(Request $request)
    {
        $period = $request->query('period', 'monthly'); // 'specific_date', 'daily', 'monthly', 'yearly'
        $reqDate = $request->query('date'); // 'YYYY-MM-DD'
        $reqYear = $request->query('year');
        $reqMonth = $request->query('month');
        $status = $request->query('status', 'all'); // 'all', 'paid', 'pending'

        // 1. Get available years in DB
        $availableYears = Order::select(DB::raw('YEAR(created_at) as yr'))
            ->whereNotNull('created_at')
            ->distinct()
            ->orderBy('yr', 'desc')
            ->pluck('yr')
            ->filter()
            ->map(fn($y) => (int)$y)
            ->values()
            ->toArray();

        if (empty($availableYears)) {
            $availableYears = [(int)date('Y')];
        }

        // Determine active year filter
        $year = null;
        if ($reqYear === 'all') {
            $year = 'all';
        } elseif ($reqYear && in_array((int)$reqYear, $availableYears)) {
            $year = (int)$reqYear;
        } else {
            // Default to most recent year with orders
            $year = reset($availableYears);
        }

        // Determine active month filter
        $month = $reqMonth ? (int)$reqMonth : (int)date('m');

        // 2. Fetch Base Orders
        $ordersQuery = Order::query()->with('items');
        if ($status === 'paid') {
            $ordersQuery->where('payment_status', 'paid');
        } elseif ($status === 'pending') {
            $ordersQuery->where('payment_status', 'pending');
        }

        if ($period === 'specific_date' && !empty($reqDate)) {
            $ordersQuery->whereDate('created_at', $reqDate);
        } elseif ($period === 'daily') {
            if ($year !== 'all') {
                $ordersQuery->whereYear('created_at', $year);
            }
            if ($month) {
                $ordersQuery->whereMonth('created_at', $month);
            }
        } elseif ($period === 'monthly') {
            if ($year !== 'all') {
                $ordersQuery->whereYear('created_at', $year);
            }
        }

        $orders = $ordersQuery->orderBy('created_at', 'asc')->get();

        // 3. Process Breakdown Grouping in PHP for 100% database compatibility
        $grouped = [];

        foreach ($orders as $o) {
            if (!$o->created_at) continue;

            if ($period === 'specific_date') {
                $key = $o->created_at->format('Y-m-d H:00');
                $label = $o->created_at->format('h:00 A');
            } elseif ($period === 'daily') {
                $key = $o->created_at->format('Y-m-d');
                $label = $o->created_at->format('d M Y (D)');
            } elseif ($period === 'yearly') {
                $key = $o->created_at->format('Y');
                $label = 'Year ' . $o->created_at->format('Y');
            } else {
                // monthly
                $key = $o->created_at->format('Y-m');
                $label = $o->created_at->format('F Y');
            }

            if (!isset($grouped[$key])) {
                $grouped[$key] = [
                    'label' => $label,
                    'raw_key' => $key,
                    'total_orders' => 0,
                    'total_revenue' => 0.0,
                    'verified_revenue' => 0.0,
                    'pending_revenue' => 0.0,
                ];
            }

            $amount = (float)$o->net_amount;
            $grouped[$key]['total_orders'] += 1;
            $grouped[$key]['total_revenue'] += $amount;
            if ($o->payment_status === 'paid') {
                $grouped[$key]['verified_revenue'] += $amount;
            } else {
                $grouped[$key]['pending_revenue'] += $amount;
            }
        }

        $breakdown = array_values($grouped);

        // 4. Compute Overall Summary
        $totalOrdersCount = count($orders);
        $totalRev = $orders->sum('net_amount');
        $verifiedRev = $orders->where('payment_status', 'paid')->sum('net_amount');
        $pendingRev = $orders->where('payment_status', 'pending')->sum('net_amount');

        $summary = [
            'total_orders' => $totalOrdersCount,
            'total_revenue' => (float)$totalRev,
            'verified_revenue' => (float)$verifiedRev,
            'pending_revenue' => (float)$pendingRev,
            'avg_order_value' => $totalOrdersCount > 0 ? round((float)$totalRev / $totalOrdersCount, 2) : 0,
        ];

        // 5. Compute Top Products
        $productSales = [];
        foreach ($orders as $o) {
            foreach ($o->items as $item) {
                $pName = $item->product_name ?: 'Unnamed Product';
                if (!isset($productSales[$pName])) {
                    $productSales[$pName] = [
                        'product_name' => $pName,
                        'total_qty' => 0,
                        'total_sales' => 0.0,
                    ];
                }
                $productSales[$pName]['total_qty'] += (int)$item->qty;
                $productSales[$pName]['total_sales'] += (float)$item->total_price;
            }
        }

        usort($productSales, fn($a, $b) => $b['total_sales'] <=> $a['total_sales']);
        $topProducts = array_slice($productSales, 0, 5);

        return response()->json([
            'period' => $period,
            'date' => $reqDate,
            'year' => $year,
            'month' => $month,
            'summary' => $summary,
            'breakdown' => $breakdown,
            'top_products' => $topProducts,
            'available_years' => $availableYears,
            'orders' => $orders->map(function ($o) {
                return [
                    'id' => $o->id,
                    'order_number' => $o->order_number,
                    'name' => $o->name,
                    'phone' => $o->phone,
                    'net_amount' => (float)$o->net_amount,
                    'payment_status' => $o->payment_status,
                    'order_status' => $o->order_status,
                    'created_at' => $o->created_at ? $o->created_at->format('d M Y, h:i A') : '',
                ];
            }),
        ]);
    }

    /**
     * Customer Directory & Order History Insights.
     */
    public function customers(Request $request)
    {
        $search = trim($request->query('search', ''));

        $orders = Order::orderBy('created_at', 'desc')->get();

        $grouped = [];
        foreach ($orders as $o) {
            $phoneKey = trim($o->phone ?: ($o->email ?: ('id_' . $o->id)));
            
            if (!isset($grouped[$phoneKey])) {
                $grouped[$phoneKey] = [
                    'customer_key' => $phoneKey,
                    'name' => $o->name,
                    'phone' => $o->phone,
                    'email' => $o->email,
                    'city' => $o->city ?: ($o->town ?: 'N/A'),
                    'district' => $o->district,
                    'state' => $o->state,
                    'address' => $o->address,
                    'total_orders' => 0,
                    'total_spent' => 0,
                    'verified_spent' => 0,
                    'last_order_date' => $o->created_at ? $o->created_at->format('Y-m-d H:i') : 'N/A',
                    'last_order_number' => $o->order_number,
                    'orders' => [],
                ];
            }

            $grouped[$phoneKey]['total_orders'] += 1;
            $grouped[$phoneKey]['total_spent'] += (float)$o->net_amount;
            if ($o->payment_status === 'paid') {
                $grouped[$phoneKey]['verified_spent'] += (float)$o->net_amount;
            }

            $grouped[$phoneKey]['orders'][] = [
                'id' => $o->id,
                'order_number' => $o->order_number,
                'created_at' => $o->created_at ? $o->created_at->format('d M Y, h:i A') : 'N/A',
                'net_amount' => (float)$o->net_amount,
                'order_status' => $o->order_status,
                'payment_status' => $o->payment_status,
            ];
        }

        $customersList = array_values($grouped);

        if (!empty($search)) {
            $searchLower = mb_strtolower($search);
            $customersList = array_filter($customersList, function ($cust) use ($searchLower) {
                return str_contains(mb_strtolower($cust['name'] ?? ''), $searchLower) ||
                       str_contains(mb_strtolower($cust['phone'] ?? ''), $searchLower) ||
                       str_contains(mb_strtolower($cust['email'] ?? ''), $searchLower) ||
                       str_contains(mb_strtolower($cust['city'] ?? ''), $searchLower);
            });
            $customersList = array_values($customersList);
        }

        $totalCustomers = count($grouped);
        $repeatCustomers = count(array_filter($grouped, fn($c) => $c['total_orders'] > 1));
        $totalCustomerSpent = array_sum(array_column($grouped, 'total_spent'));

        return response()->json([
            'customers' => $customersList,
            'metrics' => [
                'total_customers' => $totalCustomers,
                'repeat_customers' => $repeatCustomers,
                'total_lifetime_spent' => $totalCustomerSpent,
                'avg_spent_per_customer' => $totalCustomers > 0 ? round($totalCustomerSpent / $totalCustomers, 2) : 0,
            ],
        ]);
    }
}
